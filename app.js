// app.js - E-AXLE simple storefront with scheduling option

const products = [
  { id: 1, name: 'Portable Speaker', price: 1499, discount: 10, desc: 'Bluetooth speaker with 10h battery' },
  { id: 2, name: 'Wireless Mouse', price: 799, discount: 0, desc: 'Ergonomic wireless mouse' },
  { id: 3, name: 'USB-C Cable', price: 199, discount: 5, desc: 'Durable charging cable, 1.5m' },
  { id: 4, name: 'Headphones', price: 1999, discount: 15, desc: 'Over-ear, noise isolating' },
  { id: 5, name: 'Smart Watch', price: 2499, discount: 20, desc: 'Fitness tracker with heart rate monitor' },
  { id: 6, name: 'Wireless Charger', price: 499, discount: 0, desc: 'Fast Qi charging pad' },
  { id: 7, name: 'Gaming Keyboard', price: 2999, discount: 25, desc: 'Mechanical RGB keyboard' },
  { id: 8, name: 'Laptop Stand', price: 899, discount: 10, desc: 'Adjustable aluminum stand' }
];

let cart = [];

// DOM refs
const productList = document.getElementById('productList');
const cartItems = document.getElementById('cartItems');
const cartTotal = document.getElementById('cartTotal');
const placeOrderBtn = document.getElementById('placeOrderBtn');
const orderModal = document.getElementById('orderModal');
const deliveryDate = document.getElementById('deliveryDate');
const deliveryTime = document.getElementById('deliveryTime');
const confirmOrderBtn = document.getElementById('confirmOrderBtn');
const cancelOrderBtn = document.getElementById('cancelOrderBtn');
const cartCount = document.getElementById('cartCount');

function renderProducts(){
  if(!productList) return;
  productList.innerHTML = '';
  products.forEach(p => {
    const el = document.createElement('div');
    el.className = 'product';
    let priceHtml = `₹${p.price}`;
    if(p.discount && p.discount > 0){
      const discounted = Math.round(p.price * (1 - p.discount/100));
      priceHtml = `<span class="orig-price">₹${p.price}</span> <span class="disc-price">₹${discounted}</span> <span class="disc-label">${p.discount}% off</span>`;
    }
    el.innerHTML = `
      <h3>${p.name}</h3>
      <p>${p.desc}</p>
      <div class="price">${priceHtml}</div>
      <button class="btn" data-id="${p.id}">Add to cart</button>
    `;
    productList.appendChild(el);
  });
  productList.querySelectorAll('button[data-id]').forEach(btn => {
    btn.addEventListener('click', e => {
      const id = Number(e.currentTarget.dataset.id);
      addToCart(id);
    });
  });
}

function computePrice(p){
  if(p.discount && p.discount>0){
    return Math.round(p.price * (1 - p.discount/100));
  }
  return p.price;
}

function addToCart(productId){
  const prod = products.find(p => p.id === productId);
  if(!prod) return;
  const existing = cart.find(i => i.id === prod.id);
  if(existing){
    existing.qty += 1;
  } else {
    // store computed price to avoid recalculating later
    cart.push({ ...prod, qty: 1, unitPrice: computePrice(prod) });
  }
  updateCartUI();
}

function removeFromCart(productId){
  cart = cart.filter(i => i.id !== productId);
  updateCartUI();
}

function updateCartUI(){
  // update cart count in nav
  updateCartCount();

  if(!cartItems || !cartTotal) return;

  if(cart.length === 0){
    cartItems.innerHTML = 'No items yet.';
    if(placeOrderBtn) placeOrderBtn.disabled = true;
    cartTotal.textContent = '0';
    return;
  }
  cartItems.innerHTML = '';
  let total = 0;
  cart.forEach(item => {
    const unit = item.unitPrice !== undefined ? item.unitPrice : computePrice(item);
    total += unit * item.qty;
    const row = document.createElement('div');
    row.className = 'cart-item';
    row.innerHTML = `
      <div>
        <div><strong>${item.name}</strong> × ${item.qty}</div>
        <div style="font-size:12px;color:#666">₹${unit} each</div>
      </div>
      <div style="text-align:right">
        <div>₹${unit * item.qty}</div>
        <div style="margin-top:6px"><button class="btn" data-remove="${item.id}">Remove</button></div>
      </div>
    `;
    cartItems.appendChild(row);
  });
  cartTotal.textContent = total;
  if(placeOrderBtn) placeOrderBtn.disabled = false;

  cartItems.querySelectorAll('button[data-remove]').forEach(btn => {
    btn.addEventListener('click', e => {
      const id = Number(e.currentTarget.dataset.remove);
      removeFromCart(id);
    });
  });
}

function updateCartCount(){
  const count = cart.reduce((s,i)=>s+i.qty,0);
  if(cartCount) cartCount.textContent = count;
}

function openOrderModal(){
  // set minimum date to today
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth()+1).padStart(2,'0');
  const dd = String(today.getDate()).padStart(2,'0');
  deliveryDate.min = `${yyyy}-${mm}-${dd}`;
  deliveryDate.value = `${yyyy}-${mm}-${dd}`;
  deliveryTime.value = '';
  orderModal.classList.remove('hidden');
}

function closeOrderModal(){
  orderModal.classList.add('hidden');
}

function confirmOrder(){
  const date = deliveryDate.value;
  const time = deliveryTime.value;
  if(!date || !time){
    alert('Please choose delivery date and time.');
    return;
  }
  const dt = new Date(`${date}T${time}`);
  if(dt < new Date()){
    alert('Please choose a future delivery date/time.');
    return;
  }
  // Build order summary
  const items = cart.map(i => `${i.name} × ${i.qty}`).join(', ');
  const total = cart.reduce((s,i)=>s+i.price*i.qty,0);
  // Simple confirmation — in a full app this would call a backend
  alert(`Order placed!\nItems: ${items}\nTotal: ₹${total}\nDelivery: ${dt.toLocaleString()}`);
  cart = [];
  updateCartUI();
  closeOrderModal();
}

// Event listeners
if(placeOrderBtn) placeOrderBtn.addEventListener('click', openOrderModal);
if(cancelOrderBtn) cancelOrderBtn.addEventListener('click', closeOrderModal);
if(confirmOrderBtn) confirmOrderBtn.addEventListener('click', confirmOrder);

// Initialize
renderProducts();
updateCartUI();
