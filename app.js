const WA_NUMBER='919370016727';
const seedProducts=[
 {id:'demo-1',name:'Apple',category:'fruits',emoji:'🍎',wholesale:100,retail:130,unit:'kg',available:true},
 {id:'demo-2',name:'Banana',category:'fruits',emoji:'🍌',wholesale:30,retail:40,unit:'dozen',available:true},
 {id:'demo-3',name:'Orange',category:'fruits',emoji:'🍊',wholesale:60,retail:75,unit:'kg',available:true},
 {id:'demo-4',name:'Grapes',category:'fruits',emoji:'🍇',wholesale:80,retail:100,unit:'kg',available:true},
 {id:'demo-5',name:'Eggs',category:'poultry',emoji:'🥚',wholesale:5,retail:7,unit:'piece',available:true},
 {id:'demo-6',name:'Broiler Chicken',category:'poultry',emoji:'🐓',wholesale:125,retail:150,unit:'kg',available:true},
 {id:'demo-7',name:'Onion',category:'vegetables',emoji:'🧅',wholesale:20,retail:25,unit:'kg',available:true},
 {id:'demo-8',name:'Tomato',category:'vegetables',emoji:'🍅',wholesale:25,retail:30,unit:'kg',available:true},
 {id:'demo-9',name:'Potato',category:'vegetables',emoji:'🥔',wholesale:22,retail:28,unit:'kg',available:true},
 {id:'demo-10',name:'Green Chilli',category:'vegetables',emoji:'🌶️',wholesale:40,retail:50,unit:'kg',available:true}
];
let products=[],filter='all',language='en',supabase=null;
const cfg=window.KAF_CONFIG||{};
if(cfg.SUPABASE_URL&&cfg.SUPABASE_ANON_KEY&&window.supabase){supabase=window.supabase.createClient(cfg.SUPABASE_URL,cfg.SUPABASE_ANON_KEY);}
const localLoad=()=>{try{return JSON.parse(localStorage.getItem('kaf_products'))||seedProducts}catch{return seedProducts}};
async function loadProducts(){
 const grid=document.getElementById('productGrid');
 const empty=document.getElementById('emptyState');
 if(grid) grid.innerHTML='<div class="empty-state">Loading products…</div>';
 if(empty) empty.hidden=true;
 if(!supabase){
   products=localLoad();
   if(grid && !products.length) grid.innerHTML='';
   return;
 }
 try{
   const {data,error}=await supabase.from('products').select('*');
   if(error) throw error;
   products=Array.isArray(data)?data:[];
   products.sort((a,b)=>String(a.name||'').localeCompare(String(b.name||'')));
   console.info('[KAF] Public products loaded:',products.length);
   const status=document.getElementById('productLoadStatus');
   if(status) status.textContent=products.length?`${products.length} products loaded`:'No products have been added yet.';
 }catch(error){
   console.error('[KAF] Could not load public products:',error);
   products=[];
   const status=document.getElementById('productLoadStatus');
   if(status) status.textContent='Products could not be loaded. Please refresh or contact the administrator.';
   if(grid) grid.innerHTML='';
 }
}
function money(v){return '₹'+Number(v||0).toLocaleString('en-IN')}
function categoryName(c){return ({fruits:'Fruits',poultry:'Poultry',vegetables:'Vegetables'})[c]||c}
function render(){
 const q=(document.getElementById('searchInput')?.value||'').toLowerCase();
 let list=products.filter(p=>(filter==='all'||p.category===filter)&&(`${p.name} ${p.category}`).toLowerCase().includes(q));
 const sort=document.getElementById('sortSelect')?.value;
 if(sort==='low')list.sort((a,b)=>Number(a.retail)-Number(b.retail));if(sort==='high')list.sort((a,b)=>Number(b.retail)-Number(a.retail));
 const grid=document.getElementById('productGrid');if(!grid)return;
 grid.innerHTML=list.map(p=>{const available=p.available!==false;const msg=encodeURIComponent(`Hello Kuttarmare Agro Farm, I am interested in ${p.name}. Please confirm ${p.name} availability and current wholesale/retail price.`);return `<article class="product-card"><div class="product-visual">${p.image_url?`<img src="${escapeHtml(p.image_url)}" alt="${escapeHtml(p.name)}">`:`<span>${p.emoji||'🌿'}</span>`}<span class="stock-badge ${available?'':'out'}">${available?'Available':'Out of stock'}</span></div><div class="product-info"><span class="product-category">${categoryName(p.category)}</span><h3>${escapeHtml(p.name)}</h3><div class="prices"><div class="price"><small>Wholesale</small><b>${money(p.wholesale)}</b><span class="unit">/ ${escapeHtml(p.unit||'kg')}</span></div><div class="price"><small>Retail</small><b>${money(p.retail)}</b><span class="unit">/ ${escapeHtml(p.unit||'kg')}</span></div></div><a class="product-wa ${available?'':'disabled'}" href="${available?`https://wa.me/${WA_NUMBER}?text=${msg}`:'#'}" target="_blank" rel="noopener">${available?'Enquire on WhatsApp':'Currently unavailable'} →</a></div></article>`}).join('');
 document.getElementById('emptyState').hidden=list.length!==0;
 const dates=products.map(p=>p.updated_at).filter(Boolean).sort().reverse();document.getElementById('lastUpdated').textContent=dates.length?'Updated: '+new Date(dates[0]).toLocaleDateString():'Rates shown are indicative — confirm on WhatsApp';
}
function escapeHtml(s=''){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
document.getElementById('searchInput').addEventListener('input',render);
document.getElementById('sortSelect').addEventListener('change',render);
document.getElementById('filterTabs').addEventListener('click',e=>{const b=e.target.closest('button[data-filter]');if(!b)return;filter=b.dataset.filter;document.querySelectorAll('#filterTabs button').forEach(x=>x.classList.toggle('active',x===b));render();});
document.querySelectorAll('.category-card').forEach(b=>b.addEventListener('click',()=>{filter=b.dataset.category;document.querySelectorAll('#filterTabs button').forEach(x=>x.classList.toggle('active',x.dataset.filter===filter));document.getElementById('products').scrollIntoView();render();}));
document.getElementById('langBtn').addEventListener('click',()=>{language=language==='en'?'hi':'en';document.documentElement.lang=language;document.querySelectorAll('[data-en][data-hi]').forEach(el=>el.innerHTML=el.dataset[language]);document.getElementById('langBtn').textContent=language==='en'?'हिंदी':'English';document.getElementById('searchInput').placeholder=language==='en'?'Search product...':'उत्पाद खोजें...';});
document.getElementById('menuBtn').addEventListener('click',()=>document.querySelector('nav').classList.toggle('open'));
document.getElementById('year').textContent=new Date().getFullYear();
document.addEventListener('DOMContentLoaded',()=>{});
loadProducts().then(()=>{render();});
if(supabase){
 supabase.channel('public-products-live')
  .on('postgres_changes',{event:'*',schema:'public',table:'products'},()=>loadProducts().then(render))
  .subscribe((status)=>console.info('[KAF] Live product updates:',status));
}

