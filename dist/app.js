const $ = s => document.querySelector(s);
let items = [], active = null, category = 'Todos', query = '';
const positions = new Map();
const colors = ['red','yellow','green','blue'];
const categories = ['Sesgos','Conceptos','Heurísticas'];
function el(tag, cls, value) { const e = document.createElement(tag); if(cls) e.className=cls; if(value !== undefined) e.textContent=value; return e; }
function videoSource(raw) {
  if(typeof raw !== 'string' || !raw.trim()) throw Error('El enlace de video está vacío.');
  const url = new URL(raw, location.href);
  if(!['http:','https:'].includes(url.protocol)) throw Error('Usá enlaces HTTP o HTTPS para los videos.');
  const host=url.hostname.toLowerCase();
  if(host==='drive.google.com') {
    const id=url.pathname.match(/\/file\/d\/([\w-]+)/)?.[1] || url.searchParams.get('id');
    if(!id || !/^[\w-]+$/.test(id)) throw Error('Revisá el enlace de Drive. Copiá el enlace del archivo.');
    return {type:'embed',src:`https://drive.google.com/file/d/${id}/preview`,original:url.href};
  }
  if(['youtube.com','www.youtube.com','m.youtube.com','youtu.be','www.youtube-nocookie.com'].includes(host)) {
    const id=host==='youtu.be' ? url.pathname.slice(1) : url.searchParams.get('v') || url.pathname.match(/\/(?:embed|shorts)\/([\w-]+)/)?.[1];
    if(!id || !/^[\w-]{11}$/.test(id)) throw Error('Revisá el enlace de YouTube.');
    return {type:'embed',src:`https://www.youtube-nocookie.com/embed/${id}`,original:url.href};
  }
  if(!/\.(mp4|webm|ogg)$/i.test(url.pathname)) throw Error('Usá un enlace de Drive, YouTube o un archivo MP4, WebM u OGG.');
  return {type:'video',src:url.href,original:url.href};
}
function validate(data) {
  if(!Array.isArray(data) || data.length>1000) throw Error('El JSON debe contener una lista de hasta 1000 conceptos.');
  const ids=new Set();
  return data.map(item=>{
    if(!item || typeof item.id!=='string' || !/^[\w-]{1,100}$/.test(item.id) || ids.has(item.id)) throw Error('Cada concepto necesita un id único (letras, números o guiones).');
    ids.add(item.id);
    if(typeof item.title!=='string' || !item.title.trim() || item.title.length>100 || typeof item.definition!=='string' || !item.definition.trim() || item.definition.length>3000) throw Error('Revisá el nombre y la definición de cada concepto.');
    if(!categories.includes(item.category) || !colors.includes(item.color) || !Array.isArray(item.videos) || item.videos.length>100) throw Error('Revisá las categorías, colores y videos del JSON.');
    item.videos.forEach(videoSource);
    return {id:item.id,title:item.title.trim(),definition:item.definition.trim(),category:item.category,color:item.color,videos:item.videos.map(v=>v.trim())};
  });
}
function notify(message) { $('#toast').textContent=message; $('#toast').style.display='block'; clearTimeout(notify.timer); notify.timer=setTimeout(()=>$('#toast').style.display='none',4500); }

function filtered(){ return items.filter(i=>(category==='Todos'||i.category===category) && (i.title+' '+i.definition).toLocaleLowerCase('es').normalize('NFD').replace(/[\u0300-\u036f]/g,'').includes(query)); }
function render() {
  $('#filters').replaceChildren();
  ['Todos',...categories].forEach(c=>{const b=el('button','filter'+(c===category?' active':''),c);b.setAttribute('aria-pressed',String(c===category));b.onclick=()=>{category=c;render();};$('#filters').append(b);});
  const list=filtered();$('#grid').replaceChildren();
  list.forEach(item=>{
    const open=active===item.id;
    const card=el('article','card'+(open?' open':''));card.dataset.color=item.color;card.id='card-'+item.id;
    const toggle=el('button','card-toggle');toggle.setAttribute('aria-expanded',String(open));toggle.setAttribute('aria-controls','panel-'+item.id);
    toggle.append(el('h3','',item.title));
    toggle.onclick=()=>{active=open?null:item.id;render();document.querySelector(`#card-${CSS.escape(item.id)} .card-toggle`)?.focus({preventScroll:true});};
    card.append(toggle);
    const panel=el('div','card-panel');panel.id='panel-'+item.id;panel.hidden=!open;
    if(open) populatePanel(panel,item);
    card.append(panel);$('#grid').append(card);
  });
}
function populatePanel(panel,item){
  const total=item.videos.length;const n=Math.min(positions.get(item.id)||0,Math.max(total-1,0));
  const shell=el('div','video-shell');
  let source;
  if(total){source=videoSource(item.videos[n]);const media=document.createElement(source.type==='embed'?'iframe':'video');media.src=source.src;
    if(source.type==='embed'){media.title=`${item.title} — video ${n+1}`;media.allow='fullscreen; picture-in-picture';media.allowFullscreen=true;media.referrerPolicy='strict-origin-when-cross-origin';}
    else{media.controls=true;media.preload='metadata';media.playsInline=true;media.addEventListener('error',()=>notify('No se pudo cargar el video. Probá con el enlace original.'));}
    shell.append(media);
  }else{const p=el('div','video-placeholder');const mark=el('span','play-circle','▶');mark.setAttribute('aria-hidden','true');p.append(mark);shell.setAttribute('role','img');shell.setAttribute('aria-label','Sin video');shell.append(p);}
  const nav=el('div','video-nav');const prev=el('button','icon','←');prev.setAttribute('aria-label','Video anterior');prev.disabled=total<2;const next=el('button','icon','→');next.setAttribute('aria-label','Video siguiente');next.disabled=total<2;
  function move(delta){positions.set(item.id,(n+delta+total)%total);panel.replaceChildren();populatePanel(panel,item);panel.querySelector(delta>0?'button[aria-label="Video siguiente"]':'button[aria-label="Video anterior"]')?.focus({preventScroll:true});}
  prev.onclick=()=>move(-1);next.onclick=()=>move(1);nav.append(prev,el('span','',`${n+1} / ${total}`),next);
  const definition=el('div','definition');definition.append(el('p','',item.definition));
  if(source){const a=el('a','source-link','↗');a.setAttribute('aria-label','Abrir video original');a.href=source.original;a.target='_blank';a.rel='noopener noreferrer';definition.append(a);}
  panel.append(shell);if(total>1)panel.append(nav);panel.append(definition);
}
$('#search').oninput=e=>{query=e.target.value.toLocaleLowerCase('es').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim();render();};
async function init(){
  try{const response=await fetch('conceptos.json');if(!response.ok)throw Error('No se pudo cargar la colección.');const defaults=validate(await response.json());items=defaults;
    render();
  }catch(err){notify('No se pudo cargar el contenido.');}
}
init();
