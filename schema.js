"use strict";
// One schema protects both startup storage and imported backups.
const DataSchema = (() => {
  const object=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
  const str=(x,max=20000)=>typeof x==='string'&&x.length<=max;
  const text=(x,max=20000)=>str(x,max)&&x.trim().length>0;
  const int=(x,min,max)=>Number.isSafeInteger(x)&&x>=min&&x<=max;
  const bool=x=>typeof x==='boolean';
  const hex=x=>str(x,7)&&/^#[0-9a-f]{6}$/i.test(x);
  const date=x=>str(x,10)&&/^\d{4}-\d{2}-\d{2}$/.test(x)&&!Number.isNaN(Date.parse(x+'T12:00:00Z'))&&new Date(x+'T12:00:00Z').toISOString().slice(0,10)===x;
  const time=x=>str(x,5)&&/^([01]\d|2[0-3]):[0-5]\d$/.test(x);
  const id=x=>text(x,100)&&/^[a-zA-Z0-9_-]+$/.test(x);
  const list=(xs,check,max=10000)=>Array.isArray(xs)&&xs.length<=max&&xs.every(x=>object(x)&&id(x.id)&&check(x))&&new Set(xs.map(x=>x.id)).size===xs.length;
  const url=x=>{if(x==='')return true;if(!str(x,1500))return false;try{return ['http:','https:'].includes(new URL(x).protocol);}catch{return false;}};
  function valid(slug,data,{backup=false}={}){
    if(!object(data))return false;
    switch(slug){
      case 'campus-pulse': return list(data.events,e=>text(e.title,90)&&text(e.venue,80)&&text(e.description,240)&&['Workshop','Hackathon','Talk','Community'].includes(e.category)&&date(e.date)&&time(e.time)&&int(e.capacity,1,10000)&&int(e.booked,0,e.capacity)&&bool(e.saved)&&bool(e.registered)&&(!e.registered||e.booked>=1));
      case 'focus-orbit': return list(data.tasks,t=>text(t.title,120)&&['High','Medium','Low'].includes(t.energy)&&int(t.minutes,1,480)&&bool(t.done))&&list(data.sessions,s=>Number.isFinite(s.minutes)&&s.minutes>0&&s.minutes<=120&&int(s.finishedAt,0,8640000000000000))&&object(data.timer)&&int(data.timer.duration,60,7200)&&data.timer.duration%60===0&&int(data.timer.remaining,0,data.timer.duration)&&((data.timer.running===false&&data.timer.endsAt===null)||(!backup&&data.timer.running===true&&int(data.timer.endsAt,0,8640000000000000)));
      case 'contrast-studio': return hex(data.foreground)&&hex(data.background)&&list(data.pairs,p=>text(p.name,45)&&hex(p.foreground)&&hex(p.background));
      case 'snippet-atlas': return list(data.snippets,s=>text(s.title,90)&&['JavaScript','HTML','CSS','Python','SQL','Other'].includes(s.language)&&text(s.code,20000)&&bool(s.favorite)&&Array.isArray(s.tags)&&s.tags.length<=8&&s.tags.every(t=>text(t,160)));
      case 'apply-flow': return list(data.applications,a=>text(a.company,65)&&text(a.role,80)&&['Saved','Applied','Interview','Offer'].includes(a.stage)&&(a.followUp===''||date(a.followUp))&&url(a.url)&&str(a.notes,1000));
      case 'split-trail': return list(data.members,m=>text(m.name,30),20)&&new Set(data.members.map(m=>m.name.toLowerCase())).size===data.members.length&&list(data.expenses,e=>text(e.title,90)&&int(e.paise,1,100000000)&&date(e.date)&&data.members.some(m=>m.id===e.payer)&&Array.isArray(e.participants)&&e.participants.length>0&&e.participants.length<=20&&new Set(e.participants).size===e.participants.length&&e.participants.every(p=>data.members.some(m=>m.id===p)),1000);
      default: return false;
    }
  }
  return Object.freeze({valid});
})();
