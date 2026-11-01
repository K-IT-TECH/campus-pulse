const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
function worker(){
 const scope='https://example.test/app/',events={},stored=new Map(),removed=[],pending=[];
 let online=true,body='new shell';
 const cache={addAll:async files=>{for(const f of files)stored.set(new URL(f,scope).href,new Response('old shell'));},put:async(key,value)=>stored.set(typeof key==='string'?key:key.url,value)};
 const context={URL,Response,Set,Promise,self:{registration:{scope},location:{origin:'https://example.test'},addEventListener:(n,fn)=>events[n]=fn,skipWaiting:async()=>{},clients:{claim:async()=>{}}},caches:{open:async()=>cache,match:async key=>stored.get(typeof key==='string'?key:key.url)?.clone(),keys:async()=>['unrelated-cache',fs.readFileSync('sw.js','utf8').match(/const PREFIX="([^"]+)"/)[1]+'v1'],delete:async key=>{removed.push(key);return true;}},fetch:async()=>{if(!online)throw Error('offline');return new Response(body);}};
 vm.runInNewContext(fs.readFileSync('sw.js','utf8'),context);
 async function dispatch(type,url=scope){let response;events[type]({request:{method:'GET',mode:'navigate',url},waitUntil:p=>pending.push(p),respondWith:p=>response=p});const result=response?await response:null;await Promise.all(pending.splice(0));return result;}
 return {scope,stored,removed,dispatch,offline:()=>online=false,setBody:value=>body=value};
}
test('online navigation refreshes the shell used on the next offline visit',async()=>{const w=worker();await w.dispatch('install');assert.equal(await(await w.dispatch('fetch')).text(),'new shell');w.offline();assert.equal(await(await w.dispatch('fetch')).text(),'new shell');});
test('offline cache miss returns an explicit 503 response',async()=>{const w=worker();w.offline();const r=await w.dispatch('fetch');assert.equal(r.status,503);assert.match(await r.text(),/Offline copy unavailable/);});
test('activation leaves unrelated app caches intact',async()=>{const w=worker();await w.dispatch('activate');assert.equal(w.removed.length,1);assert.notEqual(w.removed[0],'unrelated-cache');});
