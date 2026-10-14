const productGrid = document.querySelector('#productGrid');
const offerGrid = document.querySelector('#offerGrid');
const cartCount = document.querySelector('#cartCount');
const cartButton = document.querySelector('#cartButton');
const searchInput = document.querySelector('#searchInput');
const clearSearch = document.querySelector('#clearSearch');
const modal = document.querySelector('#confirmationModal');
const modalTitle = document.querySelector('#modalTitle');
const modalMessage = document.querySelector('#modalMessage');
const modalClose = document.querySelector('#modalClose');
const modalContinue = document.querySelector('#modalContinue');
const bannerBuyButton = document.querySelector('.banner-buy-button');

// Carrito de demostración: mantiene los productos mientras la página esté abierta.
const cart = [];
let lastFocusedElement = null;

function cartQuantity() {
  return cart.reduce((sum, item) => sum + item.quantity, 0);
}

function cartTotal() {
  return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

function updateCartBadge() {
  cartCount.textContent = cartQuantity();
}

function showModal(message, title = '¡Solicitud registrada con éxito!') {
  lastFocusedElement = document.activeElement;
  modalTitle.textContent = title;
  modalMessage.textContent = message;
  modal.hidden = false;
  modalClose.focus();
}

function closeModal() {
  modal.hidden = true;
  if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
    lastFocusedElement.focus();
  }
}

function addToCart(product) {
  // Capturamos nombre, precio y cantidad elegidos por el usuario.
  const existing = cart.find(item => item.name === product.name);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }

  updateCartBadge();
  showModal(
    `${product.name} se añadió al carrito. Precio unitario: S/ ${product.price.toFixed(2)}. ` +
    `Artículos en tu carrito: ${cartQuantity()}.`
  );
}

function handleProductClick(event) {
  const button = event.target.closest('.buy-button');
  if (!button) return;

  const card = button.closest('[data-name][data-price]');
  if (!card) return;

  const product = {
    name: card.dataset.name,
    price: Number(card.dataset.price)
  };

  if (!Number.isFinite(product.price) || product.price < 0) {
    showModal('No se pudo leer el precio de esta prenda.', 'Revisa el producto');
    return;
  }

  addToCart(product);
}

productGrid.addEventListener('click', handleProductClick);
offerGrid.addEventListener('click', handleProductClick);

// El banner de nuevo ingreso también permite añadir Baggie Jean al carrito.
bannerBuyButton.addEventListener('click', () => {
  addToCart({
    name: bannerBuyButton.dataset.bannerProduct,
    price: Number(bannerBuyButton.dataset.bannerPrice)
  });
});

// Buscar entre productos principales y ofertas.
searchInput.addEventListener('input', () => {
  const query = searchInput.value.trim().toLocaleLowerCase('es');
  let visible = 0;

  document.querySelectorAll('[data-name][data-price]').forEach(card => {
    const matches = card.dataset.name.toLocaleLowerCase('es').includes(query);
    card.hidden = !matches;
    if (matches) visible++;
  });

  document.querySelector('#emptyMessage').hidden = visible !== 0;
  clearSearch.hidden = query.length === 0;
});

clearSearch.addEventListener('click', () => {
  searchInput.value = '';
  searchInput.dispatchEvent(new Event('input'));
  searchInput.focus();
});

// El botón del carrito muestra un resumen calculado con las selecciones actuales.
cartButton.addEventListener('click', () => {
  if (cart.length === 0) {
    showModal('Tu carrito está vacío. Añade una prenda para comenzar.', 'Tu carrito');
    return;
  }

  const summary = cart.map(item => `${item.quantity} × ${item.name}`).join(' · ');
  showModal(`${summary}. Total del carrito: S/ ${cartTotal().toFixed(2)}.`, 'Resumen del carrito');
});

// El icono del perfil muestra una confirmación de demostración, sin solicitar datos personales.
document.querySelector('#profileButton').addEventListener('click', () => {
  showModal('La sección de perfil estará disponible próximamente.', 'Mi perfil');
});

document.querySelector('.location-button').addEventListener('click', () => {
  showModal('Puedes añadir aquí la dirección de tu tienda o zona de entrega.', 'Información de tienda');
});

modalClose.addEventListener('click', closeModal);
modalContinue.addEventListener('click', closeModal);
modal.addEventListener('click', event => {
  if (event.target === modal) closeModal();
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && !modal.hidden) closeModal();
});
