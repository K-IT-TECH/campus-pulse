
"use strict";
// Shared primitives are copied into each repository so it is self-contained.
const UI = (() => {
  const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const uid = () => (globalThis.crypto?.randomUUID?.() || Date.now().toString(36)+'-'+Math.random().toString(36).slice(2));
  const today = () => { const d=new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; };
  const after = days => { const d = new Date(); d.setDate(d.getDate()+days); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; };
  const date = value => new Date(value+'T12:00:00').toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'});
  let toastTimer;
  function toast(message) { const el=document.getElementById('toast'); el.textContent=message; clearTimeout(toastTimer); toastTimer=setTimeout(()=>{el.textContent='';},4500); }
  function load(key, fallback, valid) { try { const raw=localStorage.getItem(key); if(!raw)return structuredClone(fallback); const data=JSON.parse(raw); if(valid && !valid(data))throw Error('Invalid saved data'); return data; } catch { setTimeout(()=>toast('Saved data could not be read. Demo data is shown; export anything you need before saving.'),500); return structuredClone(fallback); } }
  function save(key,data) { try { localStorage.setItem(key,JSON.stringify(data)); return true; } catch { toast('This browser could not save. Your changes last only while this page stays open.'); return false; } }
  function download(name,text,type='application/json') { const blob=new Blob([text],{type});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000); }
  function exportJSON(name,data) { download(name,JSON.stringify(data,null,2)); }
  async function copy(text) { try { if(!navigator.clipboard)throw Error('Unavailable');await navigator.clipboard.writeText(text);toast('Copied to clipboard.'); } catch { const area=document.createElement('textarea');area.value=text;document.body.append(area);area.select();const ok=document.execCommand('copy');area.remove();toast(ok?'Copied to clipboard.':'Clipboard unavailable. Select the code and copy manually.'); } }
  function shell(meta,subtitle,number) { document.title=meta.name+' — '+meta.tag;document.body.innerHTML=`<a href="#main" class="skip">Skip to content</a><header><div class="wrap nav"><a class="brand" href="./index.html"><span class="brand-mark" aria-hidden="true">${meta.symbol}</span>${meta.name}</a><div class="nav-note"><span class="dot"></span>Local-first · your browser</div></div></header><main id="main" class="wrap"><section class="hero"><div><div class="eyebrow">${subtitle}</div><h1>${meta.tag}</h1><p>${meta.short}</p></div><div class="hero-number" aria-hidden="true">${number}</div></section><div id="app"></div></main><footer><div class="wrap footer-inner"><span>${meta.name} / Fictional starting data. Your changes stay in this browser.</span><button type="button" id="reset-demo">Reset demo</button></div></footer><div id="toast" role="status" aria-live="polite"></div>`; }
  function dialog(id,title,content) { return `<dialog id="${id}" aria-labelledby="${id}-title"><div class="dialog-head"><h2 id="${id}-title">${title}</h2><button type="button" class="icon-btn" aria-label="Close dialog" data-close="${id}">×</button></div>${content}</dialog>`; }
  document.addEventListener('click',event=>{const close=event.target.closest('[data-close]');if(close)document.getElementById(close.dataset.close).close();});
  function stats(values) { return `<div class="stats">${values.map(([n,label])=>`<div class="stat"><strong>${escape(n)}</strong><span>${escape(label)}</span></div>`).join('')}</div>`; }
  return {escape,uid,today,after,date,toast,load,save,download,exportJSON,copy,shell,dialog,stats};
})();
