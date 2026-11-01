const demoProducts=[
{id:'demo-1',name:'طعام جاف للقطط',category:'أغذية الحيوانات',description:'تركيبة يومية متوازنة للقطط البالغة.',price:18000,emoji:'🐈',tag:'الأكثر طلباً',image_url:null,in_stock:true},
{id:'demo-2',name:'طعام جاف للكلاب',category:'أغذية الحيوانات',description:'وجبة متكاملة لدعم النشاط والحيوية.',price:22000,emoji:'🐕',tag:'مختار',image_url:null,in_stock:true},
{id:'demo-3',name:'شامبو للحيوانات',category:'العناية والنظافة',description:'للعناية بالفرو والتنظيف اللطيف.',price:7500,emoji:'🧴',tag:'',image_url:null,in_stock:true},
{id:'demo-4',name:'فرشاة تمشيط',category:'الإكسسوارات',description:'تساعد على ترتيب الفرو وتقليل التشابك.',price:6000,emoji:'🪮',tag:'',image_url:null,in_stock:true},
{id:'demo-5',name:'حامل طعام وماء',category:'الإكسسوارات',description:'وعاء عملي للاستخدام اليومي.',price:9000,emoji:'🥣',tag:'',image_url:null,in_stock:true},
{id:'demo-6',name:'قفازات تنظيف',category:'العناية والنظافة',description:'مناسبة للعناية اليومية بفرو الحيوان.',price:4500,emoji:'🧤',tag:'جديد',image_url:null,in_stock:true},
{id:'demo-7',name:'حقيبة إسعافات أولية',category:'المستلزمات البيطرية',description:'مستلزمات أساسية للعناية الأولية.',price:15000,emoji:'🩺',tag:'',image_url:null,in_stock:true},
{id:'demo-8',name:'لعبة تفاعلية',category:'الإكسسوارات',description:'وقت لعب ونشاط لصديقك الأليف.',price:5000,emoji:'🧶',tag:'',image_url:null,in_stock:true}
];
let products=[],activeCategory='الكل',cart=[];
const money=n=>new Intl.NumberFormat('en-US').format(Number(n)||0)+' د.ع';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const productGrid=document.getElementById('productGrid');
function renderProducts(){const search=document.getElementById('searchInput').value.trim().toLocaleLowerCase('ar');let list=products.filter(p=>(activeCategory==='الكل'||p.category===activeCategory)&&(`${p.name} ${p.category} ${p.description}`).toLocaleLowerCase('ar').includes(search));const sort=document.getElementById('sortSelect').value;if(sort==='low')list.sort((a,b)=>a.price-b.price);if(sort==='high')list.sort((a,b)=>b.price-a.price);productGrid.innerHTML=list.map(p=>`<article class="product-card"><div class="product-image">${p.image_url?`<img src="${esc(p.image_url)}" alt="${esc(p.name)}" loading="lazy">`:`<span class="product-placeholder">${p.emoji||'🐾'}</span>`}${p.tag?`<span class="product-tag">${esc(p.tag)}</span>`:''}</div><div class="product-info"><span class="product-category">${esc(p.category)}</span><h3>${esc(p.name)}</h3><p>${esc(p.description)}</p><div class="product-bottom"><span class="price">${money(p.price)}</span><button class="add-btn" aria-label="أضف ${esc(p.name)} للسلة" onclick="addToCart('${esc(p.id)}')" ${p.in_stock===false?'disabled':''}>${p.in_stock===false?'×':'+'}</button></div></div></article>`).join('');document.getElementById('emptyState').classList.toggle('hidden',list.length>0)}
function setCategory(cat){activeCategory=cat;document.querySelectorAll('[data-category]').forEach(el=>el.classList.toggle('active',el.dataset.category===cat));document.querySelectorAll('.category-card').forEach(el=>el.classList.toggle('selected',el.dataset.category===cat));renderProducts()}
document.querySelectorAll('[data-category]').forEach(el=>el.addEventListener('click',()=>setCategory(el.dataset.category)));
document.getElementById('searchInput').addEventListener('input',renderProducts);document.getElementById('sortSelect').addEventListener('change',renderProducts);
function addToCart(id){const p=products.find(x=>String(x.id)===String(id));if(!p||p.in_stock===false)return;const item=cart.find(x=>String(x.id)===String(id));if(item)item.qty++;else cart.push({id,qty:1});renderCart();openCart()}
function changeQty(id,delta){const item=cart.find(x=>String(x.id)===String(id));if(!item)return;item.qty+=delta;if(item.qty<=0)cart=cart.filter(x=>String(x.id)!==String(id));renderCart()}
function renderCart(){const count=cart.reduce((s,x)=>s+x.qty,0),total=cart.reduce((s,x)=>s+x.qty*(products.find(p=>String(p.id)===String(x.id))?.price||0),0);document.getElementById('cartCount').textContent=count;document.getElementById('cartTotal').textContent=money(total);document.getElementById('cartItems').innerHTML=cart.length?cart.map(x=>{const p=products.find(z=>String(z.id)===String(x.id));if(!p)return '';return `<div class="cart-row"><div class="cart-thumb">${p.image_url?`<img src="${esc(p.image_url)}" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:13px">`:p.emoji||'🐾'}</div><div class="cart-row-info"><b>${esc(p.name)}</b><small>${money(p.price)}</small></div><div class="qty-controls"><button onclick="changeQty('${esc(p.id)}',-1)">−</button><span>${x.qty}</span><button onclick="changeQty('${esc(p.id)}',1)">+</button></div></div>`}).join(''):'<div class="empty-state">سلتك فارغة حالياً 🐾<br>اختار المنتجات اللي تحتاجها.</div>'}
function openCart(){document.getElementById('cartDrawer').classList.add('open');document.getElementById('overlay').classList.add('show')}function closeCart(){document.getElementById('cartDrawer').classList.remove('open');document.getElementById('overlay').classList.remove('show')}
document.getElementById('openCart').onclick=openCart;document.getElementById('closeCart').onclick=closeCart;document.getElementById('overlay').onclick=closeCart;
document.getElementById('checkoutBtn').onclick=()=>{if(!cart.length){alert('السلة فارغة، أضف منتجاً أولاً.');return}document.getElementById('checkoutModal').classList.remove('hidden')};document.getElementById('closeCheckout').onclick=()=>document.getElementById('checkoutModal').classList.add('hidden');
// Telegram direct demo: credentials are PUBLIC in telegram-config.js.
// Browser no-cors permits submitting the POST, but hides the Telegram API response.
document.getElementById('checkoutForm').addEventListener('submit', async e=>{
  e.preventDefault();
  const form=e.currentTarget;
  const config=window.RAFIQ_TELEGRAM||{};
  const botToken=String(config.botToken||'').trim();
  const chatId=String(config.chatId||'').trim();
  if(!botToken||!chatId||botToken.includes('PUT_YOUR_')||chatId.includes('PUT_YOUR_')){
    alert('لازم تعبي botToken و chatId داخل ملف telegram-config.js أولاً.');
    return;
  }
  if(!/^\d+:[A-Za-z0-9_-]+$/.test(botToken)){alert('صيغة توكن البوت مو صحيحة. انسخه كاملاً من BotFather.');return;}
  if(!cart.length){alert('السلة فارغة، أضف منتجاً أولاً.');return;}
  const fd=new FormData(form);
  const customerName=String(fd.get('name')||'').trim();
  const phone=String(fd.get('phone')||'').trim();
  const address=String(fd.get('address')||'').trim();
  const notes=String(fd.get('notes')||'').trim();
  if(!customerName||!phone||!address){alert('رجاءً أكمل معلومات التوصيل.');return;}

  const items=cart.map(item=>{
    const p=products.find(x=>String(x.id)===String(item.id));
    return p?{name:p.name,qty:item.qty,price:p.price}:null;
  }).filter(Boolean);
  if(!items.length){alert('تعذر العثور على منتجات السلة.');return;}
  const total=items.reduce((sum,item)=>sum+item.price*item.qty,0);
  const orderId=String(Date.now()).slice(-8);
  const lines=[
    '🐾 طلب جديد - متجر رفيق',
    `🧾 رقم الطلب: ${orderId}`,
    '',
    `👤 الاسم: ${customerName}`,
    `📞 الهاتف: ${phone}`,
    `📍 العنوان: ${address}`,
    '',
    '🛒 المنتجات:',
    ...items.map((item,i)=>`${i+1}. ${item.name} × ${item.qty} = ${money(item.price*item.qty)}`),
    '',
    `💰 المجموع: ${money(total)}`,
    `📝 ملاحظات: ${notes||'لا توجد'}`
  ];
  const message=lines.join('\n');
  if(message.length>4096){alert('تفاصيل الطلب طويلة جداً، قلّل الملاحظات أو عدد المنتجات.');return;}
  const button=form.querySelector('button[type="submit"]');
  button.disabled=true;
  button.textContent='جاري إرسال الطلب...';
  try{
    const body=new URLSearchParams({chat_id:chatId,text:message});
    // no-cors is intentional: static GitHub Pages cannot read a Telegram cross-origin response.
    // A resolved Promise is NOT proof that Telegram accepted or delivered the message.
    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`,{
      method:'POST',mode:'no-cors',body
    });
    cart=[];
    renderCart();
    closeCart();
    document.getElementById('checkoutModal').classList.add('hidden');
    form.reset();
    alert('تم إرسال الطلب من المتصفح. تأكد من وصوله فعلياً إلى بوت التليگرام؛ لا يمكن للموقع التحقق من النتيجة بهذه الطريقة.');
  }catch(error){
    console.error('Telegram request failed:',error);
    alert('تعذر الاتصال بتيليگرام. تأكد من الإنترنت والتوكن وجرب مرة ثانية.');
  }finally{
    button.disabled=false;
    button.textContent='إرسال الطلب عبر المتجر ←';
  }
});
document.getElementById('menuToggle').onclick=()=>document.querySelector('.desktop-nav').classList.toggle('show');document.getElementById('year').textContent=new Date().getFullYear();
async function loadStoreProducts(){
  try {
    const response=await fetch(`data/products.json?v=${Date.now()}`,{cache:'no-store'});
    if(!response.ok)throw new Error(`HTTP ${response.status}`);
    const data=await response.json();
    if(!Array.isArray(data))throw new Error('صيغة ملف المنتجات غير صحيحة');
    products=data.filter(p=>p&&p.is_active===true).map(p=>({...p,price:Number(p.price)||0}));
    renderProducts();renderCart();
  } catch(error) {
    console.error('تعذر تحميل منتجات GitHub:',error.message);
    products=[];renderProducts();renderCart();
    const empty=document.getElementById('emptyState');empty.textContent='تعذر تحميل المنتجات حالياً. يرجى المحاولة لاحقاً.';empty.classList.remove('hidden');
  }
}
renderProducts();renderCart();loadStoreProducts();
