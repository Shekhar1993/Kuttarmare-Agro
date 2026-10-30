// Kuttarmare Agro Farm public website.
// Public catalogue uses Supabase REST directly; Admin Panel continues using supabase-js.
(function () {
'use strict';
const WA_NUMBER = '919370016727';
const cfg = window.KAF_CONFIG || {};
let products = [];
let filter = 'all';
let language = 'en';
const $ = id => document.getElementById(id);

const seedProducts = [
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
function setStatus(message, isError) {
 const el = $('productLoadStatus');
 if (el) { el.textContent = message || ''; el.style.color = isError ? '#b34b3b' : ''; }
}
function escapeHtml(value) {
 return String(value == null ? '' : value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
function money(value) { return '₹' + Number(value || 0).toLocaleString('en-IN'); }
function categoryName(category) { return ({fruits:'Fruits',poultry:'Poultry',vegetables:'Vegetables'})[String(category || '').toLowerCase()] || escapeHtml(category || ''); }
function localProducts() {
 try { const saved = JSON.parse(localStorage.getItem('kaf_products') || 'null'); return Array.isArray(saved) ? saved : seedProducts; }
 catch (_) { return seedProducts; }
}
async function loadProducts() {
 const grid = $('productGrid');
 const empty = $('emptyState');
 if (grid) grid.innerHTML = '<div class="empty-state">Loading products…</div>';
 if (empty) empty.hidden = true;
 const base = String(cfg.SUPABASE_URL || '').replace(/\/+$/, '');
 const key = String(cfg.SUPABASE_ANON_KEY || '').trim();
 if (!base || !key) {
   products = localProducts();
   setStatus('Showing locally saved catalogue. Supabase configuration is missing.', true);
   render();
   return;
 }
 try {
   const endpoint = base + '/rest/v1/products?select=*&order=name.asc';
   const response = await fetch(endpoint, {
     method: 'GET',
     mode: 'cors',
     headers: { 'apikey': key, 'Authorization': 'Bearer ' + key, 'Accept': 'application/json' },
     cache: 'no-store'
   });
   const bodyText = await response.text();
   let payload;
   try { payload = bodyText ? JSON.parse(bodyText) : []; }
   catch (_) { throw new Error('Supabase returned a non-JSON response (HTTP ' + response.status + ').'); }
   if (!response.ok) {
     const message = payload && (payload.message || payload.error_description || payload.error) || bodyText || response.statusText;
     throw new Error('Supabase HTTP ' + response.status + ': ' + message);
   }
   if (!Array.isArray(payload)) throw new Error('Supabase response is not a product list.');
   products = payload;
   try { localStorage.setItem('kaf_products', JSON.stringify(products)); } catch (_) {}
   setStatus(products.length ? products.length + ' products loaded.' : 'No products are currently listed by the database.', false);
   console.info('[KAF] Supabase REST products:', products.length);
 } catch (error) {
   console.error('[KAF] Product API error:', error);
   // Do not silently replace live data with demo products. Keep last successfully cached data if available.
   let cached = [];
   try { cached = JSON.parse(localStorage.getItem('kaf_products') || '[]'); } catch (_) {}
   products = Array.isArray(cached) ? cached : [];
   setStatus('Product connection failed: ' + (error && error.message ? error.message : String(error)), true);
 }
 render();
}
function render() {
 const search = $('searchInput');
 const query = (search ? search.value : '').trim().toLowerCase();
 let list = products.filter(p => {
   const category = String(p.category || '').toLowerCase();
   return (filter === 'all' || category === filter) && (String(p.name || '') + ' ' + category).toLowerCase().includes(query);
 });
 const sort = $('sortSelect') ? $('sortSelect').value : 'default';
 if (sort === 'low') list.sort((a,b) => Number(a.retail || 0) - Number(b.retail || 0));
 if (sort === 'high') list.sort((a,b) => Number(b.retail || 0) - Number(a.retail || 0));
 const grid = $('productGrid');
 if (!grid) return;
 grid.innerHTML = list.map(p => {
   const available = p.available !== false;
   const name = escapeHtml(p.name || 'Product');
   const unit = escapeHtml(p.unit || 'kg');
   const msg = encodeURIComponent('Hello Kuttarmare Agro Farm, I am interested in ' + (p.name || 'this product') + '. Please confirm availability and current wholesale/retail price.');
   const visual = p.image_url ? '<img src="' + escapeHtml(p.image_url) + '" alt="' + name + '" loading="lazy">' : '<span>' + escapeHtml(p.emoji || '🌿') + '</span>';
   return '<article class="product-card"><div class="product-visual">' + visual + '<span class="stock-badge ' + (available ? '' : 'out') + '">' + (available ? 'Available' : 'Out of stock') + '</span></div><div class="product-info"><span class="product-category">' + categoryName(p.category) + '</span><h3>' + name + '</h3><div class="prices"><div class="price"><small>Wholesale</small><b>' + money(p.wholesale) + '</b><span class="unit">/ ' + unit + '</span></div><div class="price"><small>Retail</small><b>' + money(p.retail) + '</b><span class="unit">/ ' + unit + '</span></div></div><a class="product-wa ' + (available ? '' : 'disabled') + '" href="' + (available ? 'https://wa.me/' + WA_NUMBER + '?text=' + msg : '#') + '" target="_blank" rel="noopener">' + (available ? 'Enquire on WhatsApp' : 'Currently unavailable') + ' →</a></div></article>';
 }).join('');
 const empty = $('emptyState');
 if (empty) { empty.hidden = list.length !== 0; empty.textContent = products.length ? 'No matching products. Please try another search or category.' : 'No products are available to display right now.'; }
 const dates = products.map(p => p.updated_at).filter(Boolean).sort().reverse();
 const updated = $('lastUpdated');
 if (updated) updated.textContent = dates.length ? 'Updated: ' + new Date(dates[0]).toLocaleDateString() : 'Rates subject to availability';
}
function setFilter(value) {
 filter = value;
 document.querySelectorAll('#filterTabs button').forEach(button => button.classList.toggle('active', button.dataset.filter === filter));
 render();
}
function init() {
 $('searchInput')?.addEventListener('input', render);
 $('sortSelect')?.addEventListener('change', render);
 $('filterTabs')?.addEventListener('click', event => { const button = event.target.closest('button[data-filter]'); if (button) setFilter(button.dataset.filter); });
 document.querySelectorAll('.category-card[data-category]').forEach(button => button.addEventListener('click', () => {
   setFilter(button.dataset.category);
   $('products')?.scrollIntoView({behavior:'smooth', block:'start'});
 }));
 $('langBtn')?.addEventListener('click', () => {
   language = language === 'en' ? 'hi' : 'en';
   document.documentElement.lang = language;
   document.querySelectorAll('[data-en][data-hi]').forEach(el => { el.innerHTML = el.dataset[language]; });
   const button = $('langBtn'); if (button) button.textContent = language === 'en' ? 'हिंदी' : 'English';
   const input = $('searchInput'); if (input) input.placeholder = language === 'en' ? 'Search product...' : 'उत्पाद खोजें...';
 });
 $('menuBtn')?.addEventListener('click', () => document.querySelector('nav')?.classList.toggle('open'));
 document.querySelectorAll('nav a[href^="#"]').forEach(link => link.addEventListener('click', () => document.querySelector('nav')?.classList.remove('open')));
 const year = $('year'); if (year) year.textContent = new Date().getFullYear();
 loadProducts();
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, {once:true});
else init();
})();
