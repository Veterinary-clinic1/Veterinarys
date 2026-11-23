const demoProducts=[{id:'demo-1',name:'طعام جاف للقطط',category:'أغذية الحيوانات',description:'تركيبة يومية متوازنة للقطط البالغة.',price:18000,emoji:'🐈',tag:'الأكثر طلباً',image_url:null,in_stock:true,animal:'cats'},{id:'demo-2',name:'طعام جاف للكلاب',category:'أغذية الحيوانات',description:'وجبة متكاملة لدعم النشاط والحيوية.',price:22000,emoji:'🐕',tag:'مختار',image_url:null,in_stock:true,animal:'dogs'},{id:'demo-3',name:'شامبو للحيوانات',category:'العناية والنظافة',description:'للعناية بالفرو والتنظيف اللطيف.',price:7500,emoji:'🧴',tag:'',image_url:null,in_stock:true,animal:'all'},{id:'demo-4',name:'فرشاة تمشيط',category:'الإكسسوارات',description:'تساعد على ترتيب الفرو وتقليل التشابك.',price:6000,emoji:'🪮',tag:'',image_url:null,in_stock:true,animal:'all'},{id:'demo-5',name:'حامل طعام وماء',category:'الإكسسوارات',description:'وعاء عملي للاستخدام اليومي.',price:9000,emoji:'🥣',tag:'',image_url:null,in_stock:true,animal:'all'},{id:'demo-6',name:'قفازات تنظيف',category:'العناية والنظافة',description:'مناسبة للعناية اليومية بفرو الحيوان.',price:4500,emoji:'🧤',tag:'جديد',image_url:null,in_stock:true,animal:'all'},{id:'demo-7',name:'حقيبة إسعافات أولية',category:'المستلزمات البيطرية',description:'مستلزمات أساسية للعناية الأولية.',price:15000,emoji:'🩺',tag:'',image_url:null,in_stock:true,animal:'all'},{id:'demo-8',name:'لعبة تفاعلية',category:'الإكسسوارات',description:'وقت لعب ونشاط لصديقك الأليف.',price:5000,emoji:'🧶',tag:'',image_url:null,in_stock:true,animal:'all'}];

let products=[],activeCategory='الكل',activeAnimal='all',cart=[],currentScreen='welcome';

const money=n=>new Intl.NumberFormat('en-US').format(Number(n)||0)+' د.ع';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const productGrid=document.getElementById('productGrid');
const animalGrid=document.querySelector('.animal-grid');
const animalNames={cats:'القطط',dogs:'الكلاب',poultry:'الدواجن',birds:'الطيور',other:'أخرى'};
const screens={
 welcome:[document.querySelector('.hero'),document.querySelector('.trust-strip')],
 animals:[document.getElementById('animals')],
 store:[document.getElementById('categories'),document.querySelector('.products-section'),document.getElementById('about')]
};

const style=document.createElement('style');
style.textContent=`
.screen-back{display:inline-flex;align-items:center;gap:8px;border:0;border-radius:12px;padding:11px 18px;background:#eaf6fc;color:#0788c9;font:inherit;font-weight:700;cursor:pointer;margin-bottom:18px}
.screen-enter{animation:screenEnter .5s ease both}
@keyframes screenEnter{from{opacity:0;transform:translateY(22px)}to{opacity:1;transform:translateY(0)}}
.animal-card.selected{outline:3px solid #078dcc;outline-offset:3px}
body.screen-welcome .desktop-nav a,body.screen-animals .desktop-nav a{pointer-events:none}
`;
document.head.appendChild(style);

function showScreen(name){
 currentScreen=name;
 Object.entries(screens).forEach(([key,elements])=>elements.forEach(el=>{
  if(!el)return;
  el.style.display=key===name?'':'none';
  if(key===name){el.classList.remove('screen-enter');void el.offsetWidth;el.classList.add('screen-enter')}
 }));
 document.querySelector('footer').style.display=name==='store'?'':'none';
 document.body.classList.remove('screen-welcome','screen-animals','screen-store');
 document.body.classList.add('screen-'+name);
 window.scrollTo({top:0,behavior:'smooth'});
}

function addBackButton(container,label,action){
 if(!container)return;
 let btn=container.querySelector('.screen-back');
 if(!btn){btn=document.createElement('button');btn.className='screen-back';container.prepend(btn)}
 btn.type='button';btn.textContent='→ '+label;btn.onclick=action;
}

const animalHead=document.querySelector('#animals .section-head');
const categoryHead=document.querySelector('#categories .section-head');
addBackButton(animalHead,'رجوع للرئيسية',()=>showScreen('welcome'));
addBackButton(categoryHead,'رجوع لاختيار الحيوان',()=>showScreen('animals'));

function goAnimals(){if(currentScreen==='welcome')showScreen('animals')}
function goStore(animal){
 if(!animalNames[animal])return;
 activeAnimal=animal;
 activeCategory='الكل';
 document.querySelectorAll('[data-animal]').forEach(el=>el.classList.toggle('selected',el.dataset.animal===animal));
 setCategory('الكل');
 const heading=document.querySelector('#categories h2');
 if(heading)heading.textContent='أقسام '+animalNames[animal];
 showScreen('store');
 renderProducts();
}

if(animalGrid&&!animalGrid.querySelector('[data-animal="other"]')){
 animalGrid.insertAdjacentHTML('beforeend',`<button class="animal-card" type="button" data-animal="other"><div class="animal-image"><span style="font-size:65px;display:grid;place-items:center;height:100%">🐾</span></div><div class="animal-info"><b>أخرى</b><span>منتجات ومستلزمات أخرى ←</span></div></button>`);
}

document.querySelector('main').addEventListener('click',e=>{
 if(currentScreen!=='welcome')return;
 e.preventDefault();
 goAnimals();
});

document.querySelectorAll('.desktop-nav a').forEach(a=>a.addEventListener('click',e=>{
 if(currentScreen==='welcome'){e.preventDefault();goAnimals()}
 else if(currentScreen==='animals'){e.preventDefault()}
}));

animalGrid?.addEventListener('click',e=>{
 const card=e.target.closest('[data-animal]');
 if(card)goStore(card.dataset.animal);
});

function renderProducts(){
 const search=document.getElementById('searchInput').value.trim().toLocaleLowerCase('ar');
 let list=products.filter(p=>(activeAnimal==='all'||!p.animal||p.animal==='all'||p.animal===activeAnimal)&&(activeCategory==='الكل'||p.category===activeCategory)&&(`${p.name} ${p.category} ${p.description}`).toLocaleLowerCase('ar').includes(search));
 const sort=document.getElementById('sortSelect').value;
 if(sort==='low')list.sort((a,b)=>a.price-b.price);
 if(sort==='high')list.sort((a,b)=>b.price-a.price);
 productGrid.innerHTML=list.map(p=>`<article class="product-card"><div class="product-image">${p.image_url?`<img src="${esc(p.image_url)}" alt="${esc(p.name)}" loading="lazy" style="width:100%;height:100%;object-fit:contain;padding:8px">`:`<span class="product-placeholder">${p.emoji||'🐾'}</span>`}${p.tag?`<span class="product-tag">${esc(p.tag)}</span>`:''}</div><div class="product-info"><span class="product-category">${esc(p.category)}</span><h3>${esc(p.name)}</h3><p>${esc(p.description)}</p><div class="product-bottom"><span class="price">${money(p.price)}</span><button class="add-btn" aria-label="أضف ${esc(p.name)} للسلة" onclick="addToCart('${esc(p.id)}')" ${p.in_stock===false?'disabled':''}>${p.in_stock===false?'×':'+'}</button></div></div></article>`).join('');
 document.getElementById('emptyState').classList.toggle('hidden',list.length>0);
}

function setCategory(cat){
 activeCategory=cat;
 document.querySelectorAll('[data-category]').forEach(el=>el.classList.toggle('active',el.dataset.category===cat));
 document.querySelectorAll('.category-card').forEach(el=>el.classList.toggle('selected',el.dataset.category===cat));
 renderProducts();
}
document.querySelectorAll('[data-category]').forEach(el=>el.addEventListener('click',()=>setCategory(el.dataset.category)));
document.getElementById('searchInput').addEventListener('input',renderProducts);
document.getElementById('sortSelect').addEventListener('change',renderProducts);

function addToCart(id){
 const p=products.find(x=>String(x.id)===String(id));
 if(!p||p.in_stock===false)return;
 const item=cart.find(x=>String(x.id)===String(id));
 if(item)item.qty++;else cart.push({id,qty:1});
 renderCart();openCart();
}
function changeQty(id,delta){
 const item=cart.find(x=>String(x.id)===String(id));
 if(!item)return;
 item.qty+=delta;
 if(item.qty<=0)cart=cart.filter(x=>String(x.id)!==String(id));
 renderCart();
}
function renderCart(){
 const count=cart.reduce((s,x)=>s+x.qty,0),total=cart.reduce((s,x)=>s+x.qty*(products.find(p=>String(p.id)===String(x.id))?.price||0),0);
 document.getElementById('cartCount').textContent=count;
 document.getElementById('cartTotal').textContent=money(total);
 document.getElementById('cartItems').innerHTML=cart.length?cart.map(x=>{
  const p=products.find(z=>String(z.id)===String(x.id));if(!p)return '';
  return `<div class="cart-row"><div class="cart-thumb">${p.image_url?`<img src="${esc(p.image_url)}" alt="" style="width:100%;height:100%;object-fit:contain;border-radius:13px">`:p.emoji||'🐾'}</div><div class="cart-row-info"><b>${esc(p.name)}</b><small>${money(p.price)}</small></div><div class="qty-controls"><button onclick="changeQty('${esc(p.id)}',-1)">−</button><span>${x.qty}</span><button onclick="changeQty('${esc(p.id)}',1)">+</button></div></div>`;
 }).join(''):'<div class="empty-state">سلتك فارغة حالياً 🐾<br>اختار المنتجات اللي تحتاجها.</div>';
}
function openCart(){document.getElementById('cartDrawer').classList.add('open');document.getElementById('overlay').classList.add('show')}
function closeCart(){document.getElementById('cartDrawer').classList.remove('open');document.getElementById('overlay').classList.remove('show')}
document.getElementById('openCart').onclick=openCart;
document.getElementById('closeCart').onclick=closeCart;
document.getElementById('overlay').onclick=closeCart;
document.getElementById('checkoutBtn').onclick=()=>{if(!cart.length){alert('السلة فارغة، أضف منتجاً أولاً.');return}document.getElementById('checkoutModal').classList.remove('hidden')};
document.getElementById('closeCheckout').onclick=()=>document.getElementById('checkoutModal').classList.add('hidden');

document.getElementById('checkoutForm').addEventListener('submit',async e=>{
 e.preventDefault();
 const form=e.currentTarget,config=window.RAFIQ_TELEGRAM||{},botToken=String(config.botToken||'').trim(),chatId=String(config.chatId||'').trim();
 if(!botToken||!chatId||botToken.includes('PUT_YOUR_')||chatId.includes('PUT_YOUR_')){alert('لازم تعبي botToken و chatId داخل ملف telegram-config.js أولاً.');return}
 if(!/^\d+:[A-Za-z0-9_-]+$/.test(botToken)){alert('صيغة توكن البوت مو صحيحة. انسخه كاملاً من BotFather.');return}
 if(!cart.length){alert('السلة فارغة، أضف منتجاً أولاً.');return}
 const fd=new FormData(form),customerName=String(fd.get('name')||'').trim(),phone=String(fd.get('phone')||'').trim(),address=String(fd.get('address')||'').trim(),notes=String(fd.get('notes')||'').trim();
 if(!customerName||!phone||!address){alert('رجاءً أكمل معلومات التوصيل.');return}
 const items=cart.map(item=>{const p=products.find(x=>String(x.id)===String(item.id));return p?{name:p.name,qty:item.qty,price:p.price}:null}).filter(Boolean);
 if(!items.length){alert('تعذر العثور على منتجات السلة.');return}
 const total=items.reduce((sum,item)=>sum+item.price*item.qty,0),orderId=String(Date.now()).slice(-8);
 const lines=['🐾 طلب جديد - متجر رفيق',`🧾 رقم الطلب: ${orderId}`,'',`👤 الاسم: ${customerName}`,`📞 الهاتف: ${phone}`,`📍 العنوان: ${address}`,'','🛒 المنتجات:',...items.map((item,i)=>`${i+1}. ${item.name} × ${item.qty} = ${money(item.price*item.qty)}`),'',`💰 المجموع: ${money(total)}`,`📝 ملاحظات: ${notes||'لا توجد'}`];
 const message=lines.join('\n');
 if(message.length>4096){alert('تفاصيل الطلب طويلة جداً، قلّل الملاحظات أو عدد المنتجات.');return}
 const button=form.querySelector('button[type="submit"]');
 button.disabled=true;button.textContent='جاري إرسال الطلب...';
 try{
  const body=new URLSearchParams({chat_id:chatId,text:message});
  await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`,{method:'POST',mode:'no-cors',body});
  cart=[];renderCart();closeCart();
  document.getElementById('checkoutModal').classList.add('hidden');form.reset();
  alert('تم إرسال الطلب بنجاح شكرًا لكم,سيتم الرد باقرب وقت');
 }catch(error){
  console.error('Telegram request failed:',error);
  alert('هنالك مشكله في الارساله, يرجى مراسله الحساب الخصا وشكرا.');
 }finally{
  button.disabled=false;button.textContent='إرسال الطلب عبر المتجر ←';
 }
});

document.getElementById('menuToggle').onclick=()=>document.querySelector('.desktop-nav').classList.toggle('show');
document.getElementById('year').textContent=new Date().getFullYear();

async function loadStoreProducts(){
 try{
  const response=await fetch(`data/products.json?v=${Date.now()}`,{cache:'no-store'});
  if(!response.ok)throw new Error(`HTTP ${response.status}`);
  const data=await response.json();
  if(!Array.isArray(data))throw new Error('صيغة ملف المنتجات غير صحيحة');
  products=data.filter(p=>p&&p.is_active===true).map(p=>({...p,price:Number(p.price)||0,image_url:p.image_url||p.image_path||null,animal:p.animal||'all'}));
  renderProducts();renderCart();
 }catch(error){
  console.error('تعذر تحميل منتجات GitHub:',error.message);
  products=[];renderProducts();renderCart();
  const empty=document.getElementById('emptyState');
  empty.textContent='تعذر تحميل المنتجات حالياً. يرجى المحاولة لاحقاً.';
  empty.classList.remove('hidden');
 }
}

showScreen('welcome');
renderProducts();renderCart();loadStoreProducts();
