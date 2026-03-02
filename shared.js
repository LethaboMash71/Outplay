// OUTPLAY — shared.js
// Cart state + shared UI logic (cursor, toast, cart sidebar)
// ============================================================

//PRODUCTS
const PRODUCTS = [
  {
    id: 1,
    name: "Classic Tee — White",
    price: 799,
    images: ["img/IMG_5597.jpeg", "img/IMG_5602.jpeg"],
    color: "white",
    colorHex: "#f0f0f0",
    sizes: ["XS","S","M","L","XL"],
    tag: "new",
    tagLabel: "NEW",
    desc: "The OG. Clean white tee with the iconic two-face logo. 100% premium cotton.",
  },
  {
    id: 2,
    name: "Classic Tee — Red",
    price: 799,
    images: ["img/IMG_5600.jpeg","img/IMG_5603.jpeg"],
    color: "red",
    colorHex: "#cc2828",
    sizes: ["S","M","L","XL"],
    tag: "hot",
    tagLabel: "🔥 HOT",
    desc: "Bold red. Yellow logo. Impossible to ignore. 100% premium cotton.",
  },
  {
    id: 3,
    name: "Classic Tee — Black",
    price: 799,
    images: ["img/IMG_5601.jpeg","img/IMG_5602.jpeg"],
    color: "black",
    colorHex: "#1a1a1a",
    sizes: ["XS","S","M","L","XL","2XL"],
    tag: null,
    tagLabel: null,
    desc: "Clean, dark, and effortless. Goes with everything. 100% premium cotton.",
  },
  {
    id: 4,
    name: "Full Stack — 3 Pack",
    price: 2099,
    images: ["img/IMG_5598.jpeg","img/IMG_5602.jpeg"],
    color: null,
    colorHex: null,
    sizes: ["S","M","L"],
    tag: "deal",
    tagLabel: "BEST VALUE",
    desc: "All three colorways in one move. White, Red & Black. Save R297.",
  },
];

//CART STATE
function getCart() {
  try { return JSON.parse(localStorage.getItem('outplay_cart') || '[]'); }
  catch { return []; }
}
function saveCart(cart) {
  localStorage.setItem('outplay_cart', JSON.stringify(cart));
}
function addToCart(productId, size) {
  const product = PRODUCTS.find(p => p.id === productId);
  if (!product) return;
  const cart = getCart();
  const existing = cart.find(i => i.id === productId && i.size === size);
  if (existing) { existing.qty += 1; }
  else { cart.push({ id: product.id, name: product.name, price: product.price, images: product.images, size, qty: 1 }); }
  saveCart(cart);
  updateCartUI();
  showToast(`${product.name} (${size}) added to cart ✓`);
}
function removeFromCart(index) {
  const cart = getCart();
  cart.splice(index, 1);
  saveCart(cart);
  updateCartUI();
  renderCartItems();
}
function getCartCount() { return getCart().reduce((s,i) => s + i.qty, 0); }
function getCartTotal() { return getCart().reduce((s,i) => s + i.price * i.qty, 0); }

//FORMAT CURRENCY
function formatZAR(amount) {
  return `R${amount.toLocaleString('en-ZA')}`;
}

// CART UI
function updateCartUI() {
  const countEl = document.getElementById('cartCount');
  const totalEl = document.getElementById('cartTotal');
  if (countEl) countEl.textContent = getCartCount();
  if (totalEl) totalEl.textContent = formatZAR(getCartTotal());
  renderCartItems();
}
function renderCartItems() {
  const container = document.getElementById('cartItems');
  if (!container) return;
  const cart = getCart();
  if (cart.length === 0) {
    container.innerHTML = `<div class="cart-empty"><div class="empty-icon">🛒</div>Your cart is empty.<br>Add something dope.</div>`;
    return;
  }
  container.innerHTML = cart.map((item, i) => `
    <div class="cart-item">
      <img class="cart-item-img" src="${item.images[0]}" alt="${item.name}" />
      <div class="cart-item-details">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-meta">SIZE: ${item.size} · QTY: ${item.qty}</div>
        <div class="cart-item-price">${formatZAR(item.price * item.qty)}</div>
      </div>
      <button class="cart-item-remove" onclick="removeFromCart(${i})">✕</button>
    </div>
  `).join('');
}
function openCart() {
  document.getElementById('cartSidebar')?.classList.add('open');
  document.getElementById('cartOverlay')?.classList.add('open');
}
function closeCart() {
  document.getElementById('cartSidebar')?.classList.remove('open');
  document.getElementById('cartOverlay')?.classList.remove('open');
}
function checkout() {
  if (getCartCount() === 0) { showToast('Your cart is empty!'); return; }
  showToast('Demo mode — no checkout yet! 🎉');
}

//TOAST
function showToast(msg) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

//INTERACTIVE CURSOR
function initCursor() {
  const cursor = document.getElementById('cursor');
  const ring = document.getElementById('cursorRing');
  if (!cursor || !ring) return;
  let ringX = 0, ringY = 0, mouseX = 0, mouseY = 0;
  document.addEventListener('mousemove', e => {
    mouseX = e.clientX; mouseY = e.clientY;
    cursor.style.left = mouseX + 'px';
    cursor.style.top = mouseY + 'px';
  });
  (function animateRing() {
    ringX += (mouseX - ringX) * 0.12;
    ringY += (mouseY - ringY) * 0.12;
    ring.style.left = ringX + 'px';
    ring.style.top = ringY + 'px';
    requestAnimationFrame(animateRing);
  })();
  function attachHover() {
    document.querySelectorAll('button, a, .product-card, .hero-dot, .size-chip, .color-swatch, [data-hover]').forEach(el => {
      el.addEventListener('mouseenter', () => { cursor.classList.add('hover'); ring.classList.add('hover'); });
      el.addEventListener('mouseleave', () => { cursor.classList.remove('hover'); ring.classList.remove('hover'); });
    });
  }
  attachHover();
  // re-attach after dynamic renders
  window.reattachCursor = attachHover;
}

//SCROLL REVEAL
function initReveal() {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target); } });
  }, { threshold: 0.08 });
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

//ACTIVE NAVIGATION
function initNav() {
  const page = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(a => {
    const href = a.getAttribute('href');
    if (href === page || (page === '' && href === 'index.html') || (page === 'index.html' && href === 'index.html')) {
      a.classList.add('active');
    }
  });
}

// ===== NEWSLETTER =====
function subscribeNewsletter() {
  const input = document.getElementById('emailInput');
  if (!input) return;
  if (!input.value || !input.value.includes('@')) { showToast('Please enter a valid email address'); return; }
  showToast('Yebo! You\'re in the squad 🎉');
  input.value = '';
}

// ===== INIT ALL =====
document.addEventListener('DOMContentLoaded', () => {
  initCursor();
  initReveal();
  initNav();
  updateCartUI();
});