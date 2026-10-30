const demo=[
{id:'demo-1',name:'Apple',category:'fruits',emoji:'🍎',wholesale:100,retail:130,unit:'kg',available:true},
{id:'demo-2',name:'Banana',category:'fruits',emoji:'🍌',wholesale:30,retail:40,unit:'dozen',available:true},
{id:'demo-3',name:'Orange',category:'fruits',emoji:'🍊',wholesale:60,retail:75,unit:'kg',available:true},
{id:'demo-4',name:'Grapes',category:'fruits',emoji:'🍇',wholesale:80,retail:100,unit:'kg',available:true},
{id:'demo-5',name:'Eggs',category:'poultry',emoji:'🥚',wholesale:5,retail:7,unit:'piece',available:true},
{id:'demo-6',name:'Broiler Chicken',category:'poultry',emoji:'🐓',wholesale:125,retail:150,unit:'kg',available:true},
{id:'demo-7',name:'Onion',category:'vegetables',emoji:'🧅',wholesale:20,retail:25,unit:'kg',available:true},
{id:'demo-8',name:'Tomato',category:'vegetables',emoji:'🍅',wholesale:25,retail:30,unit:'kg',available:true},
{id:'demo-9',name:'Potato',category:'vegetables',emoji:'🥔',wholesale:22,retail:28,unit:'kg',available:true},
{id:'demo-10',name:'Green Chilli',category:'vegetables',emoji:'🌶️',wholesale:40,retail:50,unit:'kg',available:true}];
let sb=null,items=[],adminId=(window.KAF_CONFIG||{}).ADMIN_USER_ID;
const cfg=window.KAF_CONFIG||{};
const $=id=>document.getElementById(id);
const manager=$('managerArea'),loginArea=$('loginArea');
if(cfg.SUPABASE_URL&&cfg.SUPABASE_ANON_KEY&&window.supabase)sb=window.supabase.createClient(cfg.SUPABASE_URL,cfg.SUPABASE_ANON_KEY);
function notice(message,isError=false){$('modeNotice').textContent=message;$('modeNotice').style.background=isError?'#fff0ef':'#edf8ef';$('modeNotice').style.color=isError?'#8b2d25':'#245b36';}
function safe(s=''){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function showLogin(){loginArea.classList.remove('hidden');manager.classList.add('hidden');$('logoutBtn').classList.add('hidden');}
function showManager(user){loginArea.classList.add('hidden');manager.classList.remove('hidden');$('logoutBtn').classList.remove('hidden');$('signedInAs').textContent='Signed in as '+user.email;}
async function verifySession(){
 if(!sb){showLogin();$('loginForm').classList.add('hidden');notice('Supabase configuration or library is missing. Admin panel is locked.',true);return;}
 const {data:{session},error}=await sb.auth.getSession();
 if(error){showLogin();notice(error.message,true);return;}
 if(session?.user?.id===adminId){showManager(session.user);await load();draw();notice('Securely connected to Supabase. Product changes are shared with all website visitors.');}
 else {if(session){await sb.auth.signOut();}showLogin();notice('Please sign in with the authorized administrator account.');}
}
async function load(){const {data,error}=await sb.from('products').select('*').order('name');if(error){notice('Could not load products: '+error.message,true);items=[];return;}items=data||[];}
function draw(){$('adminList').innerHTML=items.map(p=>`<div class="item-row"><span>${p.emoji||'🌿'} <b>${safe(p.name)}</b><br><small>${safe(p.category)} · W: ₹${p.wholesale}/${safe(p.unit)} · R: ₹${p.retail}/${safe(p.unit)} · ${p.available===false?'Out of stock':'Available'}</small></span><span><button class="admin-btn" data-edit="${safe(p.id)}">Edit</button><button class="admin-btn danger" data-del="${safe(p.id)}">Delete</button></span></div>`).join('')||'No products in database yet.';}
function clear(){$('productForm').reset();$('productId').value='';$('formTitle').textContent='Add a product';}
$('loginForm').addEventListener('submit',async e=>{e.preventDefault();if(!sb)return;const button=$('loginBtn');button.disabled=true;button.textContent='Signing in…';const {data,error}=await sb.auth.signInWithPassword({email:$('loginEmail').value.trim(),password:$('loginPassword').value});button.disabled=false;button.textContent='Sign in';if(error){notice('Login failed: '+error.message,true);return;}if(data.user?.id!==adminId){await sb.auth.signOut();notice('This account is not authorized as the website administrator.',true);return;}await verifySession();$('loginPassword').value='';});
$('logoutBtn').addEventListener('click',async()=>{await sb.auth.signOut();items=[];draw();showLogin();notice('You have been signed out.');});
$('productForm').addEventListener('submit',async e=>{e.preventDefault();const id=$('productId').value||('p-'+Date.now());const p={id,name:$('name').value.trim(),category:$('category').value,wholesale:Number($('wholesale').value),retail:Number($('retail').value),unit:$('unit').value,emoji:$('emoji').value||'🌿',image_url:$('image').value||null,available:$('available').value==='true',updated_at:new Date().toISOString()};const {error}=await sb.from('products').upsert(p);if(error){notice('Could not save to database: '+error.message,true);return;}await load();draw();clear();notice('Product saved successfully. Changes are now available on the public website.');});
$('adminList').addEventListener('click',async e=>{const edit=e.target.dataset.edit,del=e.target.dataset.del;if(edit){const p=items.find(x=>String(x.id)===edit);if(!p)return;$('productId').value=p.id;$('name').value=p.name;$('category').value=p.category;$('wholesale').value=p.wholesale;$('retail').value=p.retail;$('unit').value=p.unit||'kg';$('emoji').value=p.emoji||'';$('image').value=p.image_url||'';$('available').value=String(p.available!==false);$('formTitle').textContent='Edit product';window.scrollTo({top:0,behavior:'smooth'});}if(del&&confirm('Delete this product?')){const {error}=await sb.from('products').delete().eq('id',del);if(error){notice('Delete failed: '+error.message,true);return;}await load();draw();notice('Product deleted.');}});
$('resetBtn').addEventListener('click',clear);
sb?.auth.onAuthStateChange((_event,session)=>{if(!session){showLogin();}else if(session.user.id!==adminId){sb.auth.signOut();showLogin();}});
verifySession();
