// Post one clearly marked TEST submission to a Jotform form and show what the thank-you page returns.
const id='263103163535045';
const f=new URLSearchParams();
const add=(k,v)=>f.append(k,v);
add('formID',id); add('simple_spc',id+'-'+id);
add('q24_whichExcursions[]','Pyramids & Sphinx half day (160–360 SAR)');
add('q24_whichExcursions[]','Nile dinner cruise with show (190–270 SAR)');
add('q3_q3_radio1',"No — I'm planning a trip"); add('q6_q6_number4','4'); add('q8_q8_radio6','Couple');
add('q12_q12_radio10','4-star hotel'); add('q16_q16_checkbox14[]','Airport pick-up');
add('q19_q19_fullname17[first]','TEST'); add('q19_q19_fullname17[last]','Estimate check please delete');
add('q20_q20_phone18[full]','+20 100 000 0000'); add('q22_q22_checkbox20[]','I agree'); add('q26_sourcePage','test-estimate');
const r=await fetch('https://submit.jotform.com/submit/'+id+'/',{method:'POST',body:f,redirect:'manual',headers:{'content-type':'application/x-www-form-urlencoded','referer':'https://form.jotform.com/'+id}});
console.log('status',r.status,'location',r.headers.get('location'));
const t=await r.text();
const i=t.indexOf('estimate'); console.log('len',t.length,'has-estimate',i);
const m=t.match(/https?:\/\/www\.hayakkom\.com\/estimate\/[^"'<\s]*/g); console.log('links',JSON.stringify(m&&m.slice(0,3)));
console.log(t.replace(/\s+/g,' ').slice(0,1500));
