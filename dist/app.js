const $ = s => document.querySelector(s);
const KEY = 'sesgoteca.collection.v1';
let items = [], active = null, category = 'Todos', query = '', editId = null;
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
function persist(next) {
  const clean=validate(next);
  localStorage.setItem(KEY,JSON.stringify(clean));
  items=clean;
}
function filtered(){ return items.filter(i=>(category==='Todos'||i.category===category) && (i.title+' '+i.definition).toLocaleLowerCase('es').normalize('NFD').replace(/[\u0300-\u036f]/g,'').includes(query)); }
function render() {
  $('#filters').replaceChildren();
  ['Todos',...categories].forEach(c=>{const b=el('button','filter'+(c===category?' active':''),c);b.setAttribute('aria-pressed',String(c===category));b.onclick=()=>{category=c;render();};$('#filters').append(b);});
  const list=filtered();$('#count').textContent=`${String(list.length).padStart(2,'0')} CONCEPTOS PARA MIRAR DE OTRA MANERA`;$('#empty').hidden=!!list.length;$('#grid').replaceChildren();
  list.forEach(item=>{
    const index=items.indexOf(item);const open=active===item.id;
    const card=el('article','card'+(open?' open':''));card.dataset.color=item.color;card.id='card-'+item.id;
    const toggle=el('button','card-toggle');toggle.setAttribute('aria-expanded',String(open));toggle.setAttribute('aria-controls','panel-'+item.id);
    const meta=el('span','card-meta');meta.append(el('span','',item.category),el('span','',String(index+1).padStart(2,'0')));
    const bottom=el('span','card-bottom');bottom.append(el('span','',item.videos.length?`${item.videos.length} VIDEO${item.videos.length===1?'':'S'} · ABRIR`:'DESCUBRÍ EL CONCEPTO'),el('b','','↗'));
    toggle.append(meta,el('h3','',item.title),bottom);
    if(open){const close=el('span','','−');close.style.cssText='position:absolute;right:16px;bottom:15px;font-size:24px';toggle.append(close);}
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
  }else{const p=el('div','video-placeholder');p.append(el('span','play-circle','▶'),el('p','','Este concepto espera su meme.'),el('small','','Sumá un video desde «Editar colección».'));shell.append(p);}
  const nav=el('div','video-nav');const prev=el('button','icon','←');prev.setAttribute('aria-label','Video anterior');prev.disabled=total<2;const next=el('button','icon','→');next.setAttribute('aria-label','Video siguiente');next.disabled=total<2;
  function move(delta){positions.set(item.id,(n+delta+total)%total);panel.replaceChildren();populatePanel(panel,item);panel.querySelector(delta>0?'button[aria-label="Video siguiente"]':'button[aria-label="Video anterior"]')?.focus({preventScroll:true});}
  prev.onclick=()=>move(-1);next.onclick=()=>move(1);nav.append(prev,el('span','',total?`VIDEO ${String(n+1).padStart(2,'0')} / ${String(total).padStart(2,'0')}`:'VIDEO PENDIENTE'),next);
  const definition=el('div','definition');definition.append(el('span','eyebrow','DE QUÉ ESTAMOS HABLANDO'),el('p','',item.definition));
  if(source){const a=el('a','source-link','Abrir video original ↗');a.href=source.original;a.target='_blank';a.rel='noopener noreferrer';definition.append(a);}
  panel.append(shell,nav,definition);
}
$('#search').oninput=e=>{query=e.target.value.toLocaleLowerCase('es').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim();render();};
$('#random').onclick=()=>{const list=filtered();if(!list.length)return notify('Probá con otro filtro para descubrir conceptos.');const choices=list.filter(i=>i.id!==active);const pool=choices.length?choices:list;active=pool[Math.floor(Math.random()*pool.length)].id;render();const card=document.getElementById('card-'+active);card.scrollIntoView({behavior:'smooth',block:'center'});card.querySelector('button').focus({preventScroll:true});};
function editorOptions(){const select=$('#edit-select');select.replaceChildren();items.forEach(i=>{const opt=el('option','',i.title);opt.value=i.id;select.append(opt);});}
function fillEditor(id){editId=id;const item=items.find(i=>i.id===id);const f=$('#edit-form');f.reset();if(item){$('#edit-select').value=id;['title','category','color','definition'].forEach(k=>f.elements[k].value=item[k]);f.elements.videos.value=item.videos.join('\n');}$('#delete').hidden=!item;$('#editor-status').textContent=item?'Editando un concepto existente.':'Nuevo concepto. Completá los campos y guardalo.';}
$('#manage').onclick=()=>{editorOptions();fillEditor(active||items[0]?.id||null);$('#editor').showModal();};
$('#guide').onclick=()=>$('#help').showModal();
document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>document.getElementById(b.dataset.close).close());
$('#new').onclick=()=>{fillEditor(null);$('#edit-select').selectedIndex=-1;$('#edit-form').elements.title.focus();};
$('#edit-select').onchange=e=>fillEditor(e.target.value);
$('#edit-form').onsubmit=e=>{e.preventDefault();const f=new FormData(e.target);const item={id:editId||crypto.randomUUID(),title:f.get('title'),definition:f.get('definition'),category:f.get('category'),color:f.get('color'),videos:f.get('videos').split('\n').map(s=>s.trim()).filter(Boolean)};
  try{persist(editId?items.map(i=>i.id===editId?item:i):[...items,item]);positions.delete(item.id);editorOptions();fillEditor(item.id);render();$('#editor-status').textContent='Guardado en este navegador. Exportá el JSON para publicar estos cambios.';}catch(err){$('#editor-status').textContent=err.message;}
};
$('#delete').onclick=()=>{if(!editId||!confirm('¿Eliminar este concepto de tu copia local?'))return;try{persist(items.filter(i=>i.id!==editId));if(active===editId)active=null;editorOptions();fillEditor(items[0]?.id||null);render();}catch(err){notify(err.message);}};
$('#export').onclick=()=>{const blob=new Blob([JSON.stringify(items,null,2)+'\n'],{type:'application/json'});const url=URL.createObjectURL(blob);const a=el('a');a.href=url;a.download='conceptos.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);notify('JSON exportado. Reemplazá dist/conceptos.json para publicarlo.');};
$('#import').onchange=async e=>{const file=e.target.files[0];if(!file)return;try{if(file.size>2_000_000)throw Error('El archivo debe pesar menos de 2 MB.');const data=validate(JSON.parse(await file.text()));if(!confirm(`¿Reemplazar tu colección local por ${data.length} conceptos del archivo?`))return;persist(data);active=null;positions.clear();editorOptions();fillEditor(items[0]?.id||null);render();notify('Colección importada en este navegador.');}catch(err){notify('No se pudo importar: '+err.message);}finally{e.target.value='';}};
async function init(){
  try{const response=await fetch('conceptos.json');if(!response.ok)throw Error('No se pudo cargar la colección.');const defaults=validate(await response.json());items=defaults;
    try{const saved=localStorage.getItem(KEY);if(saved)items=validate(JSON.parse(saved));}catch{notify('No se pudo leer la copia local. Se muestra la colección publicada.');}
    render();
  }catch(err){$('#empty').hidden=false;$('#empty').textContent='No se pudo cargar la colección. Abrí la página desde un servidor web y volvé a intentar.';notify(err.message);}
}
init();
