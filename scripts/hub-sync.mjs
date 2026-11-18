#!/usr/bin/env node
// Hayakkom Hub shared-state tool, run by the hourly Hub refresh.
//
// The Hub (partners-desk-7xk2q9/) is a static page, so each browser posts its changes,
// encrypted with the Hub password, to a private Jotform "relay" form. This script folds
// those changes into partners-desk-7xk2q9/shared.enc.json, which every browser loads.
// The password is never stored here: the job passes it on the command line.
//
//   node scripts/hub-sync.mjs apply      <pw> <submissions.json> [sends-out.json]
//        submissions.json: [{ "id": "<jotform submission id>", "payload": "<payload answer text>" }, ...]
//        Applies new actions; writes the emails approved for sending to sends-out.json.
//   node scripts/hub-sync.mjs mark-sent  <pw> <results.json>
//        results.json: [{ "uid": "<send uid>", "ok": true, "sent_at": "<ISO>" } | { "uid", "ok": false, "error" }]
//   node scripts/hub-sync.mjs add-drafts <pw> <drafts.json>
//        drafts.json: [{ id, kind, record_id, to, subject, body, reason, plan: [..], label?, rank? }]
//   node scripts/hub-sync.mjs decrypt    <pw> <file.enc.json>   |   encrypt <pw> <plain.json> <out.enc.json>
//   node scripts/hub-sync.mjs dump       <pw>
//        Prints a short JSON summary (pending drafts, pending sends, per-record contact state).
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const FILE = path.join(ROOT, "partners-desk-7xk2q9", "shared.enc.json");

function decrypt(pw, enc) {
  const key = crypto.pbkdf2Sync(pw, Buffer.from(enc.salt, "base64"), 200000, 32, "sha256");
  const buf = Buffer.from(enc.data, "base64");
  const d = crypto.createDecipheriv("aes-256-gcm", key, Buffer.from(enc.iv, "base64"));
  d.setAuthTag(buf.subarray(buf.length - 16));
  return JSON.parse(Buffer.concat([d.update(buf.subarray(0, buf.length - 16)), d.final()]).toString("utf8"));
}
function encrypt(pw, obj) {
  const salt = crypto.randomBytes(16), iv = crypto.randomBytes(12);
  const key = crypto.pbkdf2Sync(pw, salt, 200000, 32, "sha256");
  const c = crypto.createCipheriv("aes-256-gcm", key, iv);
  const ct = Buffer.concat([c.update(Buffer.from(JSON.stringify(obj), "utf8")), c.final(), c.getAuthTag()]);
  return { v: 1, kdf: "PBKDF2-SHA256-200000", salt: salt.toString("base64"), iv: iv.toString("base64"), data: ct.toString("base64") };
}
function empty() {
  return { synced_at: null, state: {}, custom: { partner: [], customer: [] }, history: [], outbox: [], applied: [], relay_seen: [], pending_sends: [], sent: [] };
}
function load(pw) {
  if (!fs.existsSync(FILE)) return empty();
  return Object.assign(empty(), decrypt(pw, JSON.parse(fs.readFileSync(FILE, "utf8"))));
}
function save(pw, sh) {
  sh.synced_at = new Date().toISOString();
  sh.applied = sh.applied.slice(-5000);
  sh.relay_seen = sh.relay_seen.slice(-5000);
  sh.history = sh.history.slice(-2000);
  sh.sent = sh.sent.slice(-1000);
  fs.writeFileSync(FILE, JSON.stringify(encrypt(pw, sh)));
}
const isEmail = (s) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(String(s || ""));
function hist(sh, a, what) {
  sh.history.push({ uid: a.uid, at: a.at || new Date().toISOString(), by: a.by || "", kind: a.kind || "other", id: a.id || null, name: a.name || "", what: what || a.what || "" });
}
function patch(sh, id, set) {
  sh.state[id] = sh.state[id] || {};
  for (const [k, v] of Object.entries(set || {})) {
    if (v === null) delete sh.state[id][k];
    else sh.state[id][k] = v;
  }
}

const [cmd, pw, arg1, arg2] = process.argv.slice(2);
if (!cmd || !pw) { console.error("usage: hub-sync.mjs <apply|mark-sent|add-drafts|dump|decrypt|encrypt> <password> [file]"); process.exit(2); }
// Generic helpers for the other Hub data files (data/customers/helpers/calendar .enc.json):
//   decrypt <pw> <file.enc.json>            → prints the JSON
//   encrypt <pw> <plain.json> <file.enc.json> (fresh random salt + iv)
if (cmd === "decrypt") { process.stdout.write(JSON.stringify(decrypt(pw, JSON.parse(fs.readFileSync(arg1, "utf8"))), null, 1)); process.exit(0); }
if (cmd === "encrypt") { fs.writeFileSync(arg2, JSON.stringify(encrypt(pw, JSON.parse(fs.readFileSync(arg1, "utf8"))))); console.log("wrote " + arg2); process.exit(0); }
const sh = load(pw);
const read = (f) => JSON.parse(fs.readFileSync(f, "utf8"));

if (cmd === "apply") {
  const subs = arg1 ? read(arg1) : [];
  const seen = new Set(sh.relay_seen), applied = new Set(sh.applied);
  let actions = [], bad = 0, newSubs = 0;
  for (const s of subs) {
    if (!s || !s.id || seen.has(String(s.id))) continue;
    newSubs++; sh.relay_seen.push(String(s.id));
    try {
      const list = decrypt(pw, JSON.parse(s.payload));
      if (Array.isArray(list)) actions.push(...list);
    } catch { bad++; }  // not made by the Hub (wrong password / not encrypted): ignored
  }
  actions = actions.filter((a) => a && a.uid && !applied.has(a.uid)).sort((x, y) => String(x.at).localeCompare(String(y.at)));
  const counts = {};
  for (const a of actions) {
    sh.applied.push(a.uid); applied.add(a.uid);
    counts[a.t] = (counts[a.t] || 0) + 1;
    if (a.t === "patch" && a.id) {
      patch(sh, a.id, a.set);
      if (!a.silent) hist(sh, a);
    } else if (a.t === "add" && a.rec && a.rec.id && (a.kind === "partner" || a.kind === "customer")) {
      const list = sh.custom[a.kind];
      const i = list.findIndex((r) => r.id === a.rec.id);
      if (i >= 0) list[i] = a.rec; else list.push(a.rec);
      if (!a.silent) hist(sh, a);
    } else if (a.t === "log") {
      hist(sh, a);
    } else if (a.t === "send") {
      if (isEmail(a.to) && a.subject && a.body) {
        sh.pending_sends.push({ uid: a.uid, kind: a.kind, id: a.id || null, name: a.name || "", to: a.to, subject: String(a.subject).slice(0, 250), body: a.body, signer: a.signer || "Hayakkom team", title: a.title || "", key: a.key || null, by: a.by || "", approved_at: a.at });
        hist(sh, a);
      } else hist(sh, a, "Could not send (missing or invalid email address): " + (a.subject || ""));
    }
  }
  // drafts the team dismissed or approved in the Hub
  const dec = sh.state._decisions || {};
  for (const o of sh.outbox) {
    if (o.status === "pending" && dec[o.id]) o.status = String(dec[o.id]).startsWith("dismissed") ? "rejected" : "approved";
  }
  save(pw, sh);
  const out = arg2 || "hub-sends.json";
  fs.writeFileSync(out, JSON.stringify(sh.pending_sends, null, 2));
  console.log(JSON.stringify({ new_submissions: newSubs, unreadable: bad, actions: counts, sends_to_do: sh.pending_sends.length, sends_file: out }));
} else if (cmd === "mark-sent") {
  const results = read(arg1);
  let ok = 0, fail = 0;
  for (const r of results) {
    const i = sh.pending_sends.findIndex((p) => p.uid === r.uid);
    if (i < 0) continue;
    const p = sh.pending_sends[i];
    const at = r.sent_at || new Date().toISOString();
    if (r.ok) {
      ok++;
      sh.pending_sends.splice(i, 1);
      sh.sent.push({ uid: p.uid, at, to: p.to, subject: p.subject, signer: p.signer, id: p.id });
      if (p.id) patch(sh, p.id, { lastContacted: at });
      if (p.key) { const o = sh.outbox.find((x) => x.id === p.key); if (o) o.status = "sent"; }
      hist(sh, { uid: p.uid + "-sent", at, by: "Hayakkom (automatic)", kind: p.kind, id: p.id, name: p.name },
        "Sent from support@hayakkom.com: “" + p.subject + "” to " + p.to + " — signed " + p.signer + (p.title ? " (" + p.title + ")" : "") + ", approved by " + p.by);
    } else {
      fail++;
      p.attempts = (p.attempts || 0) + 1;
      if (p.attempts >= 3) {
        sh.pending_sends.splice(i, 1);
        hist(sh, { uid: p.uid + "-fail", at, by: "Hayakkom (automatic)", kind: p.kind, id: p.id, name: p.name },
          "Sending failed 3 times, stopped trying: “" + p.subject + "” — " + (r.error || "unknown error") + ". Please send it from Outlook.");
      }
    }
  }
  save(pw, sh);
  console.log(JSON.stringify({ sent: ok, failed: fail, still_pending: sh.pending_sends.length }));
} else if (cmd === "add-drafts") {
  const drafts = read(arg1);
  let added = 0;
  for (const d of drafts) {
    if (!d || !d.id || !d.kind || !isEmail(d.to) || !d.subject || !d.body) continue;
    if (sh.outbox.some((o) => o.id === d.id)) continue;
    if (d.record_id && sh.outbox.some((o) => o.record_id === d.record_id && o.status === "pending")) continue;
    sh.outbox.push({ id: d.id, kind: d.kind, record_id: d.record_id || null, to: d.to, subject: d.subject, body: d.body, reason: d.reason || "", plan: d.plan || [], label: d.label || "Drafted by Claude", rank: d.rank != null ? d.rank : 1, created: new Date().toISOString(), status: "pending" });
    added++;
  }
  sh.outbox = sh.outbox.filter((o) => o.status === "pending" || (Date.now() - new Date(o.created).getTime()) < 60 * 864e5);
  save(pw, sh);
  console.log(JSON.stringify({ drafts_added: added, pending_drafts: sh.outbox.filter((o) => o.status === "pending").length }));
} else if (cmd === "dump") {
  const rec = {};
  for (const [id, st] of Object.entries(sh.state)) if (st && (st.lastContacted || st.done || st.deleted || st.removed)) rec[id] = { lastContacted: st.lastContacted || null, done: !!st.done, archived: !!st.deleted, deleted: !!st.removed };
  console.log(JSON.stringify({
    synced_at: sh.synced_at,
    pending_drafts: sh.outbox.filter((o) => o.status === "pending").map((o) => ({ id: o.id, kind: o.kind, record_id: o.record_id, subject: o.subject })),
    pending_sends: sh.pending_sends.length,
    custom: { partner: sh.custom.partner.length, customer: sh.custom.customer.length },
    history_entries: sh.history.length,
    relay_seen: sh.relay_seen.length,
    record_state: rec
  }, null, 2));
} else { console.error("unknown command " + cmd); process.exit(2); }
