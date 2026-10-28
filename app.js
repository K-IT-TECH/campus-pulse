"use strict";
// This is a local registration demo, not a shared ticketing backend.
const KEY='kavin-campus-pulse-v1';
const E=UI.escape;
const categories=['Workshop','Hackathon','Talk','Community'];
const seed={events:[
 {id:'cp-1',title:'Build Night: ship something small',category:'Hackathon',date:UI.after(4),time:'16:00',venue:'Innovation Lab',capacity:40,booked:28,saved:true,registered:false,description:'Bring an idea. Leave with a tiny app you can demo.'},
 {id:'cp-2',title:'The interface design playground',category:'Workshop',date:UI.after(7),time:'14:00',venue:'Design Studio',capacity:25,booked:17,saved:false,registered:false,description:'Turn rough sketches into interfaces people enjoy using.'},
 {id:'cp-3',title:'Your first open-source contribution',category:'Talk',date:UI.after(11),time:'11:00',venue:'Seminar Hall',capacity:60,booked:32,saved:false,registered:false,description:'Find an issue, make a change, and write a clear pull request.'}
]};
let state=UI.load(KEY,seed,x=>Array.isArray(x.events)&&x.events.every(e=>e&&typeof e.id==='string'&&Number.isInteger(e.capacity)&&Number.isInteger(e.booked)&&e.capacity>0&&e.booked>=0&&e.booked<=e.capacity));
let query='',category='All',savedOnly=false;
UI.shell(META,'01 / Campus & community','01');
document.getElementById('app').innerHTML=`<div id="stats"></div><div class="toolbar"><label class="sr-only" for="search">Search events</label><input id="search" type="search" placeholder="Search events, venues, dates…"><label class="sr-only" for="category">Event category</label><select id="category"><option>All</option>${categories.map(c=>`<option>${c}</option>`).join('')}</select><label class="check-label"><input type="checkbox" id="saved-only">Saved</label><button class="btn" id="new-event">+ Create event</button></div><div class="section-line"><h2>The campus calendar</h2><span id="count"></span></div><div id="events" class="grid"></div>${UI.dialog('event-dialog','Create an event',`<form id="event-form"><div class="form-grid"><div class="field full"><label for="title">Event title</label><input id="title" name="title" required maxlength="90" placeholder="What are we bringing people together for?"></div><div class="field"><label for="event-category">Category</label><select id="event-category" name="category">${categories.map(c=>`<option>${c}</option>`).join('')}</select></div><div class="field"><label for="capacity">Capacity</label><input id="capacity" name="capacity" type="number" min="1" max="10000" step="1" value="30" required></div><div class="field"><label for="date">Date</label><input id="date" name="date" type="date" min="${UI.today()}" value="${UI.after(1)}" required></div><div class="field"><label for="time">Time</label><input id="time" name="time" type="time" value="14:00" required></div><div class="field full"><label for="venue">Venue</label><input id="venue" name="venue" maxlength="80" required placeholder="Innovation Lab"></div><div class="field full"><label for="description">Short description</label><textarea id="description" name="description" maxlength="240" required></textarea></div></div><p class="error" id="form-error" role="alert"></p><button class="btn" type="submit">Add to calendar</button></form>`)}`;
function persist(){UI.save(KEY,state);render();}
function isPast(event){return new Date(`${event.date}T${event.time}:00`).getTime()<Date.now();}
function render(){
 document.getElementById('stats').innerHTML=UI.stats([[state.events.filter(e=>!isPast(e)).length,'Upcoming events'],[state.events.filter(e=>e.saved).length,'Your saved events'],[state.events.filter(e=>e.registered).length,'Your local registrations']]);
 const list=state.events.filter(e=>(category==='All'||e.category===category)&&(!savedOnly||e.saved)&&`${e.title} ${e.venue} ${e.date} ${e.category}`.toLowerCase().includes(query)).sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time));
 document.getElementById('count').textContent=`${list.length} event${list.length===1?'':'s'}`;
 document.getElementById('events').innerHTML=list.length?list.map((event,index)=>{
 const full=event.booked>=event.capacity,past=isPast(event),spots=event.capacity-event.booked;
 return `<article class="card"><div class="card-top"><div><span class="pill">${E(event.category)}</span><div class="fine top-space">${E(UI.date(event.date))} / ${E(event.time)}</div></div><span class="shape" aria-hidden="true">${['↗','✳','◎','✦'][categories.indexOf(event.category)]||'↗'}</span></div><div class="card-body"><div class="row between"><span class="muted fine">${E(event.venue)}</span><button type="button" class="icon-btn ${event.saved?'active':''}" data-action="save" data-id="${E(event.id)}" aria-pressed="${event.saved}" aria-label="${event.saved?'Unsave':'Save'} ${E(event.title)}">${event.saved?'★':'☆'}</button></div><h3>${E(event.title)}</h3><p>${E(event.description)}</p><div class="progress" aria-hidden="true"><span style="width:${Math.min(100,event.booked/event.capacity*100)}%"></span></div><div class="row between fine muted" style="margin-top:7px"><span>${event.booked} / ${event.capacity} seats</span><span>${past?'Event ended':spots+' left'}</span></div><div class="actions"><button class="btn small ${event.registered?'secondary':''}" data-action="register" data-id="${E(event.id)}" ${(full||past)&&!event.registered?'disabled':''}>${event.registered?'Cancel registration':past?'Event ended':full?'Fully booked':'Register locally ↗'}</button><button class="btn secondary small" data-action="calendar" data-id="${E(event.id)}">Calendar ↗</button><button class="btn ghost small" data-action="delete" data-id="${E(event.id)}" aria-label="Delete ${E(event.title)}">Delete</button></div></div></article>`;
 }).join(''):'<div class="empty">No events here yet. Try another filter or create your own.</div>';
}
document.getElementById('search').addEventListener('input',e=>{query=e.target.value.trim().toLowerCase();render();});
document.getElementById('category').addEventListener('change',e=>{category=e.target.value;render();});
document.getElementById('saved-only').addEventListener('change',e=>{savedOnly=e.target.checked;render();});
document.getElementById('new-event').onclick=()=>document.getElementById('event-dialog').showModal();
document.getElementById('events').addEventListener('click',e=>{
 const b=e.target.closest('[data-action]');if(!b)return;const event=state.events.find(x=>x.id===b.dataset.id);if(!event)return;
 if(b.dataset.action==='calendar'){exportCalendar(event);return;}
 if(b.dataset.action==='save')event.saved=!event.saved;
 if(b.dataset.action==='register'){if(!event.registered&&(event.booked>=event.capacity||isPast(event)))return;event.booked+=event.registered?-1:1;event.registered=!event.registered;UI.toast(event.registered?'Local demo seat reserved. No real booking was sent.':'Local demo registration cancelled.');}
 if(b.dataset.action==='delete'){if(!confirm('Delete this local event?'))return;state.events=state.events.filter(x=>x.id!==event.id);}
 persist();
});
document.getElementById('event-form').addEventListener('submit',e=>{
 e.preventDefault();const f=new FormData(e.target);const title=f.get('title').trim(),venue=f.get('venue').trim(),description=f.get('description').trim(),capacity=Number(f.get('capacity'));
 if(!title||!venue||!description||!Number.isInteger(capacity)||capacity<1||capacity>10000||new Date(`${f.get('date')}T${f.get('time')}:00`).getTime()<=Date.now()){document.getElementById('form-error').textContent='Enter all details, a whole-number capacity and a future time.';return;}
 state.events.push({id:UI.uid(),title,venue,description,category:f.get('category'),date:f.get('date'),time:f.get('time'),capacity,booked:0,saved:false,registered:false});persist();document.getElementById('event-dialog').close();e.target.reset();document.getElementById('form-error').textContent='';UI.toast('Event added to your local calendar.');
});
document.getElementById('reset-demo').onclick=()=>{if(confirm('Replace all local events with the demo events?')){state=structuredClone(seed);persist();UI.toast('Demo events restored.');}};
render();

// Floating local calendar time: the event uses the reader's calendar timezone.
function exportCalendar(event){
 const escapeICS=s=>String(s).replace(/\\/g,'\\\\').replace(/\r?\n/g,'\\n').replace(/;/g,'\\;').replace(/,/g,'\\,');
 const localStamp=d=>`${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}T${String(d.getHours()).padStart(2,'0')}${String(d.getMinutes()).padStart(2,'0')}00`;
 const start=new Date(`${event.date}T${event.time}:00`),end=new Date(start.getTime()+60*60000);
 const lines=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//CampusPulse//Event Calendar//EN','CALSCALE:GREGORIAN','BEGIN:VEVENT',`UID:${event.id}@campus-pulse`,'DTSTAMP:'+new Date().toISOString().replace(/[-:]/g,'').replace(/\.\d{3}Z$/,'Z'),'DTSTART:'+localStamp(start),'DTEND:'+localStamp(end),'SUMMARY:'+escapeICS(event.title),'LOCATION:'+escapeICS(event.venue),'DESCRIPTION:'+escapeICS(event.description+'\nCalendar reminder only. One-hour placeholder duration; confirm details with the organizer.'),'END:VEVENT','END:VCALENDAR'];
 // RFC 5545 line folding at 75 UTF-8 octets, preserving whole code points.
 const fold=line=>{let out='',size=0;for(const c of line){const bytes=new TextEncoder().encode(c).length;if(size+bytes>75){out+='\r\n ';size=1;}out+=c;size+=bytes;}return out;};
 UI.download('campus-event.ics',lines.map(fold).join('\r\n')+'\r\n','text/calendar;charset=utf-8');
 UI.toast('Calendar file downloaded. It uses local time and a one-hour duration.');
}
