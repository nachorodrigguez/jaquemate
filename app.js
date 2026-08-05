document.addEventListener('DOMContentLoaded', () => {
    
    // --- Mobile Menu Toggle ---
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileNav = document.getElementById('mobile-nav');

    mobileMenuBtn.addEventListener('click', () => {
        mobileNav.classList.toggle('active');
    });

    // Close mobile menu when clicking a link
    mobileNav.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            mobileNav.classList.remove('active');
        });
    });

    // --- Cart Logic ---
    const cartBtn = document.getElementById('cart-btn');
    const closeCartBtn = document.getElementById('close-cart');
    const cartModal = document.getElementById('cart-modal');
    const cartOverlay = document.getElementById('cart-overlay');
    const cartItemsContainer = document.getElementById('cart-items');
    const cartCountEl = document.querySelector('.cart-count');
    const cartTotalPriceEl = document.getElementById('cart-total-price');
    const checkoutBtn = document.getElementById('checkout-btn');

    let cart = [];

    // Open/Close Cart
    function openCart() {
        cartModal.classList.add('active');
        cartOverlay.classList.add('active');
    }

    function closeCart() {
        cartModal.classList.remove('active');
        cartOverlay.classList.remove('active');
    }

    cartBtn.addEventListener('click', openCart);
    closeCartBtn.addEventListener('click', closeCart);
    cartOverlay.addEventListener('click', closeCart);

    // Add to Cart Buttons
    const addToCartBtns = document.querySelectorAll('.add-to-cart-btn');
    
    addToCartBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.target.getAttribute('data-id');
            const name = e.target.getAttribute('data-name');
            const price = parseFloat(e.target.getAttribute('data-price'));
            const img = e.target.getAttribute('data-img');

            addItemToCart({ id, name, price, img, quantity: 1 });
            openCart();
        });
    });

    function addItemToCart(item) {
        const existingItem = cart.find(cartItem => cartItem.id === item.id);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push(item);
        }
        
        updateCartUI();
    }

    function removeItemFromCart(id) {
        cart = cart.filter(item => item.id !== id);
        updateCartUI();
    }

    function changeQuantity(id, amount) {
        const item = cart.find(item => item.id === id);
        if (item) {
            item.quantity += amount;
            if (item.quantity <= 0) {
                removeItemFromCart(id);
            } else {
                updateCartUI();
            }
        }
    }

    function formatPrice(price) {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS',
            minimumFractionDigits: 0
        }).format(price);
    }

    function updateCartUI() {
        // Clear container
        cartItemsContainer.innerHTML = '';
        
        let totalItems = 0;
        let totalPrice = 0;

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<div class="empty-cart-msg">Tu carrito está vacío</div>';
        } else {
            cart.forEach(item => {
                totalItems += item.quantity;
                totalPrice += item.price * item.quantity;

                const itemEl = document.createElement('div');
                itemEl.classList.add('cart-item');
                itemEl.innerHTML = `
                    <img src="${item.img}" alt="${item.name}">
                    <div class="cart-item-details">
                        <div class="cart-item-title">${item.name}</div>
                        <div class="cart-item-price">${formatPrice(item.price)}</div>
                        <div class="cart-item-quantity">
                            <button class="qty-btn minus" data-id="${item.id}">-</button>
                            <span>${item.quantity}</span>
                            <button class="qty-btn plus" data-id="${item.id}">+</button>
                        </div>
                    </div>
                    <button class="remove-item" data-id="${item.id}"><i data-lucide="trash-2"></i></button>
                `;
                cartItemsContainer.appendChild(itemEl);
            });
            // Re-initialize icons for new DOM elements
            lucide.createIcons();
        }

        cartCountEl.textContent = totalItems;
        cartTotalPriceEl.textContent = formatPrice(totalPrice);
        
        // Re-bind events for newly created elements
        bindCartItemEvents();
    }

    function bindCartItemEvents() {
        document.querySelectorAll('.qty-btn.plus').forEach(btn => {
            btn.addEventListener('click', (e) => {
                changeQuantity(e.target.getAttribute('data-id'), 1);
            });
        });

        document.querySelectorAll('.qty-btn.minus').forEach(btn => {
            btn.addEventListener('click', (e) => {
                changeQuantity(e.target.getAttribute('data-id'), -1);
            });
        });

        document.querySelectorAll('.remove-item').forEach(btn => {
            // Because SVG click might target inner path, use closest to get button
            btn.addEventListener('click', (e) => {
                const button = e.target.closest('.remove-item');
                if(button) {
                    removeItemFromCart(button.getAttribute('data-id'));
                }
            });
        });
    }

    // --- Checkout Logic (Mercado Pago Prep) ---
    
    /**
     * IMPORTANTE: Función preparada para integrar SDK de Mercado Pago (Checkout Pro)
     * Debe enviarse la lista de items al backend para generar el 'preference_id',
     * y luego inicializar el checkout con ese ID.
     */
    async function iniciarCheckout() {
        if(cart.length === 0) {
            alert('Tu carrito está vacío');
            return;
        }

        try {
            checkoutBtn.textContent = 'Procesando...';
            checkoutBtn.disabled = true;

            // TODO: Integración Mercado Pago (Checkout Pro)
            /*
            // 1. Enviar el 'cart' a tu servidor (Node.js/PHP/Python) para crear la preferencia.
            const response = await fetch('/crear-preferencia', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ items: cart })
            });
            
            const preference = await response.json();
            
            // 2. Inicializar MercadoPago SDK
            const mp = new MercadoPago('PUBLIC_KEY', { locale: 'es-AR' });
            
            // 3. Abrir el checkout
            mp.checkout({
                preference: { id: preference.id },
                autoOpen: true
            });
            */
            
            // Simulación de éxito por ahora
            setTimeout(() => {
                alert('¡Checkout simulado con éxito! (SDK de MP está comentado en el código).');
                cart = [];
                updateCartUI();
                closeCart();
                checkoutBtn.textContent = 'Finalizar Compra';
                checkoutBtn.disabled = false;
            }, 1000);

        } catch (error) {
            console.error('Error al iniciar checkout:', error);
            checkoutBtn.textContent = 'Finalizar Compra';
            checkoutBtn.disabled = false;
        }
    }

    checkoutBtn.addEventListener('click', iniciarCheckout);
});
