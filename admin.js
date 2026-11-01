(() => {
  'use strict';
  const $ = (s) => document.querySelector(s);
  const config = window.RAFIQ_GITHUB || {};
  const configured = Boolean(config.owner && config.owner !== 'YOUR_GITHUB_USERNAME' && config.repo && config.branch && config.productsPath && config.imageDirectory);
  const setupNotice = $('#setupNotice'), loginPanel = $('#loginPanel'), dashboard = $('#dashboard');
  let token = '', rows = [], currentImagePath = '', selectedFile = null;
  const apiRoot = `https://api.github.com/repos/${encodeURIComponent(config.owner || '')}/${encodeURIComponent(config.repo || '')}/contents/`;
  const money = n => new Intl.NumberFormat('en-US').format(Number(n) || 0) + ' د.ع';
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function message(el, text, ok=false) { el.textContent = text; el.classList.toggle('success', ok); }
  function toast(text) { const el=$('#toast'); el.textContent=text; el.classList.add('show'); setTimeout(()=>el.classList.remove('show'),2800); }
  function apiHeaders() { return { 'Accept':'application/vnd.github+json', 'Authorization':`Bearer ${token}`, 'X-GitHub-Api-Version':'2022-11-28' }; }
  function safePath(path) { const [pathname, query] = String(path).split('?'); const encoded = pathname.split('/').map(encodeURIComponent).join('/'); return encoded + (query ? '?' + query : ''); }
  async function api(path, options={}) {
    const response = await fetch(apiRoot + safePath(path), { ...options, headers:{...apiHeaders(), ...(options.headers||{})} });
    const data = response.status === 204 ? null : await response.json().catch(()=>({}));
    if (!response.ok) {
      const err = new Error(data?.message || `GitHub API error (${response.status})`);
      err.status = response.status;
      if(response.status===401) err.message='التوكن غير صحيح أو انتهت صلاحيته. سجّلي الدخول من جديد.';
      if(response.status===403) err.message='ما عند التوكن صلاحية Contents: Read and write أو تجاوز حد الطلبات.';
      if(response.status===404) err.message='المستودع أو الملف غير موجود. راجعي إعدادات github-config.js.';
      if(response.status===409||response.status===422) err.message='صار تعارض أثناء الحفظ. أعيدي المحاولة بعد تحديث البيانات.';
      throw err;
    }
    return data;
  }
  function decodeBase64Utf8(value) {
    const binary = atob(String(value).replace(/\s/g,''));
    const bytes = Uint8Array.from(binary, c => c.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  }
  async function getProductsFile() {
    const file = await api(`${config.productsPath}?ref=${encodeURIComponent(config.branch)}`);
    return { sha:file.sha, products:JSON.parse(decodeBase64Utf8(file.content || 'W10=')) };
  }
  async function saveProductsFile(products, sha) {
    const bytes = new TextEncoder().encode(JSON.stringify(products, null, 2) + '\n');
    let binary=''; for(let i=0;i<bytes.length;i+=0x8000) binary += String.fromCharCode(...bytes.subarray(i,i+0x8000));
    const content = btoa(binary);
    await api(config.productsPath, {method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:'Update Rafiq store products',content,sha,branch:config.branch})});
  }
  async function readFileSha(path) {
    try { const f=await api(`${path}?ref=${encodeURIComponent(config.branch)}`); return f.sha; }
    catch(e) { if(e.status===404)return null; throw e; }
  }
  async function deleteRepoFile(path, messageText='Remove unused product image') {
    const sha=await readFileSha(path); if(!sha)return;
    await api(path,{method:'DELETE',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:messageText,sha,branch:config.branch})});
  }
  function fileToBase64(file) {
    return new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>{const result=String(reader.result||'');resolve(result.slice(result.indexOf(',')+1));};reader.onerror=()=>reject(new Error('تعذرت قراءة الصورة.'));reader.readAsDataURL(file);});
  }
  function showEditor(show) {
    $('#productEditor').classList.toggle('hidden', !show);
    if (!show) { $('#productForm').reset(); $('#productForm [name=id]').value=''; selectedFile=null; currentImagePath=''; $('#imagePreview').removeAttribute('src'); $('.image-picker').classList.remove('has-image'); $('#imagePlaceholder').style.display='grid'; message($('#editorMessage'),''); }
  }
  function setPreview(url) { const img=$('#imagePreview'); if(url){img.src=url;$('.image-picker').classList.add('has-image');$('#imagePlaceholder').style.display='none';}else{img.removeAttribute('src');$('.image-picker').classList.remove('has-image');$('#imagePlaceholder').style.display='grid';} }
  async function validateToken(value) {
    token=value.trim();
    if(!token) throw new Error('أدخلي Fine-grained Personal Access Token.');
    await getProductsFile();
  }
  async function enterDashboard() {
    loginPanel.classList.add('hidden'); dashboard.classList.remove('hidden'); $('#logoutBtn').classList.remove('hidden');
    await loadProducts();
  }
  async function init() {
    if(!configured){setupNotice.classList.remove('hidden');loginPanel.classList.add('hidden');return;}
  }
  async function loadProducts() {
    message($('#dashboardMessage'),'جاري تحميل المنتجات من GitHub...');
    try { const result=await getProductsFile(); rows=Array.isArray(result.products)?result.products:[]; renderRows(); message($('#dashboardMessage'),''); }
    catch(err){message($('#dashboardMessage'),'تعذر تحميل المنتجات: '+err.message);}
  }
  function renderRows() {
    $('#totalProducts').textContent=rows.length;
    $('#activeProducts').textContent=rows.filter(p=>p.is_active).length;
    $('#outProducts').textContent=rows.filter(p=>!p.in_stock).length;
    const q=$('#adminSearch').value.trim().toLocaleLowerCase('ar'), f=$('#adminFilter').value;
    const filtered=rows.filter(p=>(!q||`${p.name} ${p.category}`.toLocaleLowerCase('ar').includes(q))&&(f==='all'||(f==='active'&&p.is_active)||(f==='hidden'&&!p.is_active)||(f==='out'&&!p.in_stock)));
    $('#adminProductList').innerHTML=filtered.length?filtered.map(p=>`<article class="admin-product-row" data-id="${esc(p.id)}">${p.image_url?`<img src="${esc(p.image_url)}" alt="">`:'<div class="admin-product-placeholder">🐾</div>'}<div class="admin-product-copy"><b>${esc(p.name)}</b><small>${esc(p.category)} · <span class="admin-price">${money(p.price)}</span></small><span class="status-chip ${p.is_active&&p.in_stock?'':'off'}">${p.is_active?(p.in_stock?'معروض · متوفر':'معروض · نفد المخزون'):'مخفي'}</span></div><div class="admin-row-actions"><button type="button" data-action="edit">تعديل</button><button type="button" data-action="toggle">${p.is_active?'إخفاء':'إظهار'}</button><button type="button" class="delete" data-action="delete">حذف</button></div></article>`).join(''):'<div class="admin-empty">ماكو منتجات حالياً. اضغطي «إضافة منتج» حتى تبدئين 🐾</div>';
  }
  function openNew(){showEditor(true);$('#editorTitle').textContent='إضافة منتج جديد';}
  function openEdit(p){showEditor(true);$('#editorTitle').textContent='تعديل المنتج';const f=$('#productForm');for(const key of ['id','name','price','category','description','tag','is_active','in_stock']){const el=f.elements.namedItem(key);if(!el)continue;if(el.type==='checkbox')el.checked=Boolean(p[key]);else el.value=p[key]??'';}currentImagePath=p.image_path||'';setPreview(p.image_url||'');}
  async function uploadImage(file) {
    if(!file)return {path:currentImagePath,url:currentImagePath?`../${currentImagePath}`:''};
    if(!['image/jpeg','image/png','image/webp'].includes(file.type))throw new Error('اختاري صورة JPG أو PNG أو WEBP.');
    if(file.size>5*1024*1024)throw new Error('حجم الصورة يجب ألا يتجاوز 5MB.');
    const ext=file.type==='image/png'?'png':file.type==='image/webp'?'webp':'jpg';
    const path=`${config.imageDirectory}/${crypto.randomUUID()}.${ext}`;
    const content=await fileToBase64(file);
    await api(path,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:'Add product image',content,branch:config.branch})});
    return {path,url:path};
  }
  async function saveProduct(e) {
    e.preventDefault();const f=e.currentTarget,btn=$('#saveProductBtn');btn.disabled=true;btn.textContent='جاري الحفظ...';message($('#editorMessage'),'');
    let uploadedPath='';
    try {
      const fd=new FormData(f),id=String(fd.get('id')||'');
      const name=String(fd.get('name')||'').trim(),price=Number(fd.get('price'));
      if(!name||!Number.isSafeInteger(price)||price<0)throw new Error('تأكدي من اسم المنتج والسعر الصحيح بالدينار.');
      const image=await uploadImage(selectedFile);uploadedPath=selectedFile?image.path:'';
      const latest=await getProductsFile();const products=latest.products.filter(p=>String(p.id)!==id);
      const old=rows.find(p=>String(p.id)===id);
      const record={id:id||crypto.randomUUID(),name,price,category:String(fd.get('category')),description:String(fd.get('description')||'').trim(),tag:String(fd.get('tag')||'').trim(),is_active:f.elements.is_active.checked,in_stock:f.elements.in_stock.checked,image_path:image.path||old?.image_path||'',image_url:image.path||old?.image_url||''};
      products.unshift(record);
      await saveProductsFile(products,latest.sha);
      if(selectedFile&&old?.image_path&&old.image_path!==image.path){try{await deleteRepoFile(old.image_path);}catch(cleanError){console.warn('Old image cleanup skipped:',cleanError.message);}}
      toast(id?'تم تعديل المنتج وحفظه في GitHub':'تمت إضافة المنتج وحفظه في GitHub');showEditor(false);await loadProducts();
    } catch(err) {
      if(uploadedPath){try{await deleteRepoFile(uploadedPath,'Cleanup failed product image upload');}catch(_){}}
      message($('#editorMessage'),'ما تم الحفظ: '+err.message);
    } finally {btn.disabled=false;btn.textContent='حفظ المنتج';selectedFile=null;}
  }
  async function deleteProduct(p) {
    if(!confirm(`متأكدة تريدين حذف «${p.name}»؟`))return;
    try {const latest=await getProductsFile();await saveProductsFile(latest.products.filter(x=>String(x.id)!==String(p.id)),latest.sha);if(p.image_path){try{await deleteRepoFile(p.image_path);}catch(e){console.warn('Image cleanup:',e.message);}}toast('تم حذف المنتج من GitHub');await loadProducts();}
    catch(err){toast('تعذر الحذف: '+err.message);}
  }
  async function toggleProduct(p) {
    try {const latest=await getProductsFile();const products=latest.products.map(x=>String(x.id)===String(p.id)?{...x,is_active:!x.is_active}:x);await saveProductsFile(products,latest.sha);await loadProducts();}
    catch(err){toast('تعذر تحديث الحالة: '+err.message);}
  }
  $('#loginForm').addEventListener('submit',async e=>{e.preventDefault();const value=new FormData(e.currentTarget).get('token');message($('#loginMessage'),'جاري التحقق من صلاحية GitHub...');const btn=e.currentTarget.querySelector('button[type="submit"]');btn.disabled=true;try{await validateToken(String(value||''));await enterDashboard();}catch(err){token='';message($('#loginMessage'),'تعذر الدخول: '+err.message);}finally{btn.disabled=false;}});
  $('#logoutBtn').addEventListener('click',()=>{token='';rows=[];dashboard.classList.add('hidden');loginPanel.classList.remove('hidden');$('#logoutBtn').classList.add('hidden');$('#loginForm').reset();message($('#loginMessage'),'تم تسجيل الخروج.');});
  $('#newProductBtn').addEventListener('click',openNew);$('#closeEditor').addEventListener('click',()=>showEditor(false));$('#cancelEditor').addEventListener('click',()=>showEditor(false));$('#productForm').addEventListener('submit',saveProduct);
  $('#productImage').addEventListener('change',e=>{selectedFile=e.target.files?.[0]||null;if(selectedFile){const url=URL.createObjectURL(selectedFile);setPreview(url);}});
  $('#adminSearch').addEventListener('input',renderRows);$('#adminFilter').addEventListener('change',renderRows);
  $('#adminProductList').addEventListener('click',e=>{const btn=e.target.closest('button[data-action]');if(!btn)return;const row=btn.closest('[data-id]'),p=rows.find(x=>String(x.id)===row.dataset.id);if(!p)return;const a=btn.dataset.action;if(a==='edit')openEdit(p);if(a==='delete')deleteProduct(p);if(a==='toggle')toggleProduct(p);});
  init().catch(err=>{setupNotice.classList.remove('hidden');message($('#loginMessage'),err.message);});
})();
