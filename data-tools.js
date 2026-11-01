"use strict";
// Versioned, validated backups stay on the user's device. No upload endpoint.
(() => {
  const slug=KEY.replace(/^kavin-/,'').replace(/-v1$/,'');
  const object=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
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
      if(!object(backup)||backup.app!==slug||backup.version!==1||!DataSchema.valid(slug,backup.data,{backup:true}))throw Error('This is not a valid '+META.name+' version 1 backup. Your current data has not changed.');
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
