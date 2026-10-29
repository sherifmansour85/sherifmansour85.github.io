const fs=require('fs');const [name,...files]=process.argv.slice(2);
const rows=[];
for(const f of files){let j;try{j=JSON.parse(fs.readFileSync(f))}catch(e){continue}
 const a=j.audits,v=k=>a[k]&&a[k].numericValue;
 rows.push({s:Math.round(j.categories.performance.score*100),fcp:v('first-contentful-paint'),lcp:v('largest-contentful-paint'),tbt:v('total-blocking-time'),j});}
if(!rows.length){console.log(name,'no result');process.exit()}
rows.sort((x,y)=>x.s-y.s);const m=rows[Math.floor(rows.length/2)],a=m.j.audits;
console.log(`\n### ${name} scores ${rows.map(r=>r.s).join('/')} | median: FCP ${(m.fcp/1000).toFixed(1)}s LCP ${(m.lcp/1000).toFixed(1)}s TBT ${Math.round(m.tbt)}ms CLS ${a['cumulative-layout-shift'].displayValue} SI ${a['speed-index'].displayValue}`);
const walk=(o,f)=>{if(!o||typeof o!=='object')return;f(o);for(const k in o)walk(o[k],f)};
for(const k of ['largest-contentful-paint-element','lcp-breakdown-insight','lcp-discovery-insight','render-blocking-insight','network-dependency-tree-insight']){const x=a[k];if(!x)continue;
 const bits=[];walk(x.details,o=>{if(o.snippet)bits.push('EL '+o.snippet.slice(0,160));if(o.phase&&o.timing!=null)bits.push(o.phase+' '+Math.round(o.timing));if(o.subpart&&o.duration!=null)bits.push(o.subpart+' '+Math.round(o.duration));if(o.label&&o.duration!=null)bits.push(o.label+' '+Math.round(o.duration))});
 console.log('  '+k+': '+(x.displayValue||'')+' '+[...new Set(bits)].slice(0,8).join(' | '))}
const bt=a['bootup-time'];if(bt&&bt.details)console.log('  cpu by script: '+bt.details.items.slice(0,6).map(i=>i.url.split('/').pop().slice(0,40)+' '+Math.round(i.total)).join(' | '));
const tw=a['total-byte-weight'];if(tw&&tw.details)console.log('  bytes '+tw.displayValue+': '+tw.details.items.slice(0,6).map(i=>i.url.replace(/^https?:\/\/[^/]+/,'').slice(0,50)+' '+Math.round(i.totalBytes/1024)+'K').join(' | '));
