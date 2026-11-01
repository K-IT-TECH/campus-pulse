"use strict";
const PREFIX="campus-pulse-shell-";
const CACHE=PREFIX+'v2';
const FILES=['./','./index.html','./common.js','./meta.js','./schema.js','./app.js','./data-tools.js','./styles.css','./favicon.svg','./manifest.webmanifest'];
const ASSETS=new Set(FILES.map(p=>new URL(p,self.registration.scope).href));
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(FILES)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith(PREFIX)&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
 const url=new URL(event.request.url);
 if(event.request.method!=='GET'||url.origin!==self.location.origin||!url.href.startsWith(self.registration.scope))return;
 if(event.request.mode==='navigate'){
  const index=new URL('./index.html',self.registration.scope).href;
  event.respondWith(fetch(event.request).then(response=>{if(response.ok&&ASSETS.has(url.href)){const copy=response.clone();event.waitUntil(caches.open(CACHE).then(cache=>cache.put(index,copy)));}return response;}).catch(async()=>await caches.match(index)||new Response('Offline copy unavailable. Open this app online once.',{status:503,headers:{'Content-Type':'text/plain'}})));return;
 }
 if(!ASSETS.has(url.href))return;
 event.respondWith(fetch(event.request).then(response=>{if(response.ok){const copy=response.clone();event.waitUntil(caches.open(CACHE).then(cache=>cache.put(event.request,copy)));}return response;}).catch(()=>caches.match(event.request)));
});
