"use strict";
// Versioned, validated backups stay on the user's device. No upload endpoint.
(() => {
  const slug=KEY.replace(/^kavin-/,'').replace(/-v1$/,'');
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
  function valid(data){
    if(!object(data))return false;
    switch(slug){
      case 'campus-pulse': return list(data.events,e=>text(e.title,90)&&text(e.venue,80)&&text(e.description,240)&&['Workshop','Hackathon','Talk','Community'].includes(e.category)&&date(e.date)&&time(e.time)&&int(e.capacity,1,10000)&&int(e.booked,0,e.capacity)&&bool(e.saved)&&bool(e.registered)&&(!e.registered||e.booked>=1));
      case 'focus-orbit': return list(data.tasks,t=>text(t.title,120)&&['High','Medium','Low'].includes(t.energy)&&int(t.minutes,1,480)&&bool(t.done))&&list(data.sessions,s=>Number.isFinite(s.minutes)&&s.minutes>0&&s.minutes<=120&&int(s.finishedAt,0,8640000000000000))&&object(data.timer)&&int(data.timer.duration,60,7200)&&data.timer.duration%60===0&&int(data.timer.remaining,0,data.timer.duration)&&data.timer.running===false&&data.timer.endsAt===null;
      case 'contrast-studio': return hex(data.foreground)&&hex(data.background)&&list(data.pairs,p=>text(p.name,45)&&hex(p.foreground)&&hex(p.background));
      case 'snippet-atlas': return list(data.snippets,s=>text(s.title,90)&&['JavaScript','HTML','CSS','Python','SQL','Other'].includes(s.language)&&text(s.code,20000)&&bool(s.favorite)&&Array.isArray(s.tags)&&s.tags.length<=8&&s.tags.every(t=>text(t,160)));
      case 'apply-flow': return list(data.applications,a=>text(a.company,65)&&text(a.role,80)&&['Saved','Applied','Interview','Offer'].includes(a.stage)&&(a.followUp===''||date(a.followUp))&&url(a.url)&&str(a.notes,1000));
      case 'split-trail': return list(data.members,m=>text(m.name,30),20)&&new Set(data.members.map(m=>m.name.toLowerCase())).size===data.members.length&&list(data.expenses,e=>text(e.title,90)&&int(e.paise,1,100000000)&&date(e.date)&&data.members.some(m=>m.id===e.payer)&&Array.isArray(e.participants)&&e.participants.length>0&&e.participants.length<=20&&new Set(e.participants).size===e.participants.length&&e.participants.every(p=>data.members.some(m=>m.id===p)),1000);
      default: return false;
    }
  }
  function snapshot(){
    if(slug==='focus-orbit')tick();
    const data=structuredClone(state);
    if(slug==='focus-orbit')data.timer={...data.timer,remaining:remaining(),endsAt:null,running:false};
    return {app:slug,version:1,exportedAt:new Date().toISOString(),data};
  }
  function exportBackup(){UI.exportJSON(slug+'-backup-'+UI.today()+'.json',snapshot());UI.toast('Backup downloaded. Keep it somewhere you can find again.');}
  const footer=document.querySelector('.footer-inner');
  const tools=document.createElement('div');tools.className='row data-actions';
  tools.innerHTML='<span class="fine muted" id="offline-status">Browser storage</span><button type="button" id="data-tools">Your data ↗</button>';
  footer.append(tools);
  document.body.insertAdjacentHTML('beforeend',UI.dialog('data-dialog','Your data, in your hands',`<p>Everything you enter stays in this browser. Download a backup to move it to another device or keep a copy before clearing browser data.</p><button type="button" class="btn" id="backup-data">Download backup</button><div class="divider"></div><label for="restore-file">Restore a ${UI.escape(META.name)} JSON backup (up to 2 MB)</label><input type="file" id="restore-file" accept=".json,application/json"><p id="restore-preview" class="fine muted" role="status">Choose a backup to check it before replacing your current data.</p><p id="restore-error" class="error" role="alert"></p><button type="button" class="btn secondary" id="restore-data" disabled>Replace current data</button><p class="fine muted">Restore replaces this app’s local data after confirmation. Backups from other apps are rejected. Focus timers restore paused.</p>`));
  document.getElementById('data-tools').onclick=()=>document.getElementById('data-dialog').showModal();
  document.getElementById('backup-data').onclick=exportBackup;
  if(['snippet-atlas','apply-flow','split-trail'].includes(slug))document.getElementById('export').onclick=exportBackup;
  let pending=null,selection=0;
  document.getElementById('restore-file').onchange=async e=>{
    const current=++selection,file=e.target.files[0];pending=null;
    const button=document.getElementById('restore-data'),preview=document.getElementById('restore-preview'),error=document.getElementById('restore-error');
    button.disabled=true;error.textContent='';preview.textContent='Choose a backup to check it.';if(!file)return;
    try{
      if(file.size>2*1024*1024)throw Error('Choose a backup smaller than 2 MB.');
      const backup=JSON.parse(await file.text());if(current!==selection)return;
      if(!object(backup)||backup.app!==slug||backup.version!==1||!valid(backup.data))throw Error('This is not a valid '+META.name+' version 1 backup. Your current data has not changed.');
      pending=backup.data;const count=Object.values(pending).filter(Array.isArray).reduce((n,a)=>n+a.length,0);
      preview.textContent='Ready: '+count+' saved records. Download your current backup before replacing it.';button.disabled=false;
    }catch(ex){if(current!==selection)return;error.textContent=ex instanceof SyntaxError?'The file is not valid JSON. Your current data has not changed.':ex.message;}
  };
  document.getElementById('restore-data').onclick=()=>{
    if(!pending||!confirm('Replace all current '+META.name+' data with this checked backup? This cannot be undone unless you downloaded your current backup.'))return;
    if(UI.save(KEY,pending))location.reload();
    else document.getElementById('restore-error').textContent='The browser could not save the restore. Current data has not been replaced.';
  };
  if('serviceWorker' in navigator&&['http:','https:'].includes(location.protocol)){
    navigator.serviceWorker.register('./sw.js',{scope:'./'}).then(()=>navigator.serviceWorker.ready).then(()=>{document.getElementById('offline-status').textContent='Offline ready';}).catch(()=>{document.getElementById('offline-status').textContent='Online access';});
  }
})();
