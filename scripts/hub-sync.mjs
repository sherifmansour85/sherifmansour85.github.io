#!/usr/bin/env node
// Hayakkom Hub data-file tool, used by the hourly Hub refresh.
//
// The Hub's data files (partners-desk-7xk2q9/*.enc.json) are encrypted with the Hub password
// (AES-256-GCM, key from PBKDF2-SHA256, 200,000 rounds). Shared team state (approvals, sends,
// history) lives in the Google Drive "Hayakkom Hub" folder, handled by the Apps Script web app.
// The password is never stored here: the job passes it on the command line.
//
//   node scripts/hub-sync.mjs decrypt <pw> <file.enc.json>              → prints the JSON
//   node scripts/hub-sync.mjs encrypt <pw> <plain.json> <file.enc.json> (fresh random salt + iv)
import fs from "fs";
import crypto from "crypto";

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

const [cmd, pw, arg1, arg2] = process.argv.slice(2);
if (cmd === "decrypt" && pw && arg1) {
  process.stdout.write(JSON.stringify(decrypt(pw, JSON.parse(fs.readFileSync(arg1, "utf8"))), null, 1));
} else if (cmd === "encrypt" && pw && arg1 && arg2) {
  fs.writeFileSync(arg2, JSON.stringify(encrypt(pw, JSON.parse(fs.readFileSync(arg1, "utf8")))));
  console.log("wrote " + arg2);
} else {
  console.error("usage: hub-sync.mjs decrypt <password> <file.enc.json>\n       hub-sync.mjs encrypt <password> <plain.json> <file.enc.json>");
  process.exit(2);
}
