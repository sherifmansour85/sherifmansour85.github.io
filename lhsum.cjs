const fs=require('fs');const [name,...files]=process.argv.slice(2);
for(const f of files){let j;try{j=JSON.parse(fs.readFileSync(f))}catch(e){console.log(name,'no result');continue}
 const a=j.audits,n=k=>a[k]&&a[k].displayValue;
 console.log(`\n### ${name} score ${Math.round(j.categories.performance.score*100)} | FCP ${n('first-contentful-paint')} LCP ${n('largest-contentful-paint')} TBT ${n('total-blocking-time')} CLS ${n('cumulative-layout-shift')} SI ${n('speed-index')}`);
 const le=a['largest-contentful-paint-element'];if(le&&le.details){const it=JSON.stringify(le.details).slice(0,700);console.log('LCP element:',it)}
 for(const k of ['render-blocking-resources','bootup-time','mainthread-work-breakdown','total-byte-weight','unused-javascript','unused-css-rules','lcp-lazy-loaded','prioritize-lcp-image','third-party-summary','server-response-time','redirects']){
  const x=a[k];if(!x)continue;let s=`${k}: ${x.displayValue||''} score=${x.score}`;
  if(x.details&&x.details.items)s+=' :: '+x.details.items.slice(0,6).map(i=>(i.url||i.entity||i.groupLabel||i.node&&i.node.snippet||'').toString().slice(-70)+' '+Math.round(i.wastedMs||i.total||i.totalBytes||i.transferSize||i.scripting||i.blockingTime||0)).join(' | ');
  console.log(' ',s)}
 break}
