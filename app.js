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
            let id = e.target.getAttribute('data-id');
            let name = e.target.getAttribute('data-name');
            const price = parseFloat(e.target.getAttribute('data-price'));
            const img = e.target.getAttribute('data-img');

            const productInfo = e.target.closest('.product-info');
            if (productInfo) {
                const colorSwatch = productInfo.querySelector('.color-swatch.selected');
                if (colorSwatch) {
                    const color = colorSwatch.getAttribute('data-color');
                    name = `${name} (${color})`;
                    id = `${id}-${color.toLowerCase()}`;
                }
            }

            addItemToCart({ id, name, price, img, quantity: 1 });
            openCart();
        });
    });

    // Variant Selection Logic
    document.querySelectorAll('.variant-select').forEach(select => {
        select.addEventListener('change', (e) => {
            const selectedOption = e.target.options[e.target.selectedIndex];
            const price = selectedOption.getAttribute('data-price');
            const name = selectedOption.getAttribute('data-name');
            const targetId = e.target.getAttribute('data-target');
            
            const btn = document.getElementById(`btn-${targetId}`);
            const priceEl = document.getElementById(`price-${targetId}`);
            
            if (btn && priceEl) {
                // Update button data
                btn.setAttribute('data-price', price);
                btn.setAttribute('data-name', name);
                // Also update the ID so standard and personalized count as separate items in cart
                const variantValue = e.target.value;
                btn.setAttribute('data-id', `${targetId}-${variantValue}`);
                
                // Update displayed price
                priceEl.textContent = formatPrice(parseFloat(price));
            }
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
                if (button) {
                    removeItemFromCart(button.getAttribute('data-id'));
                }
            });
        });
    }

    // --- Checkout Logic (WhatsApp) ---
    async function iniciarCheckout() {
        if (cart.length === 0) {
            alert('Tu carrito está vacío');
            return;
        }

        try {
            checkoutBtn.textContent = 'Redirigiendo a WhatsApp...';
            checkoutBtn.disabled = true;

            let mensaje = "¡Hola! Me gustaría realizar el siguiente pedido:\n\n";
            let totalPrice = 0;

            cart.forEach(item => {
                const itemTotal = item.price * item.quantity;
                totalPrice += itemTotal;
                mensaje += `- ${item.quantity}x ${item.name} (${formatPrice(item.price)} c/u) = ${formatPrice(itemTotal)}\n`;
            });

            mensaje += `\n*Total a pagar: ${formatPrice(totalPrice)}*`;

            // Codificar el mensaje para URL
            const mensajeCodificado = encodeURIComponent(mensaje);

            // Número de WhatsApp (puedes cambiarlo por el tuyo)
            const numeroWhatsApp = "1131340114"; // Reemplazar con el número real
            const urlWhatsApp = `https://wa.me/${numeroWhatsApp}?text=${mensajeCodificado}`;

            // Abrir WhatsApp en una nueva pestaña
            window.open(urlWhatsApp, '_blank');

            // Vaciar el carrito después de enviar
            setTimeout(() => {
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

    // --- Magnifier Lens Logic (Global) ---
    const magnifierLens = document.createElement('div');
    magnifierLens.classList.add('magnifier-lens');
    document.body.appendChild(magnifierLens);

    // --- Carousel Logic ---
    document.querySelectorAll('.carousel-container').forEach(container => {
        const track = container.querySelector('.carousel-track');
        const slides = container.querySelectorAll('.carousel-slide');
        const prevBtn = container.querySelector('.prev');
        const nextBtn = container.querySelector('.next');
        const indicators = container.querySelectorAll('.indicator');
        
        let currentIndex = 0;

        if (slides.length <= 1) {
            if(prevBtn) prevBtn.style.display = 'none';
            if(nextBtn) nextBtn.style.display = 'none';
            if(container.querySelector('.carousel-indicators')) container.querySelector('.carousel-indicators').style.display = 'none';
            return;
        }

        function updateCarousel(index) {
            track.style.transform = `translateX(-${index * 100}%)`;
            indicators.forEach((ind, i) => {
                ind.classList.toggle('active', i === index);
            });
            currentIndex = index;
        }

        if(nextBtn) {
            nextBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                let newIndex = currentIndex + 1;
                if (newIndex >= slides.length) newIndex = 0;
                updateCarousel(newIndex);
            });
        }

        if(prevBtn) {
            prevBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                let newIndex = currentIndex - 1;
                if (newIndex < 0) newIndex = slides.length - 1;
                updateCarousel(newIndex);
            });
        }

        indicators.forEach((ind, i) => {
            ind.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                updateCarousel(i);
            });
        });

        // --- Touch Swipe Logic ---
        let touchStartX = 0;
        let touchEndX = 0;

        container.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        container.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        }, { passive: true });

        function handleSwipe() {
            const swipeThreshold = 40; // Pixels needed to trigger swipe
            const diff = touchEndX - touchStartX;
            
            if (Math.abs(diff) > swipeThreshold) {
                if (diff < 0) {
                    // Swiped left -> Next slide
                    let newIndex = currentIndex + 1;
                    if (newIndex >= slides.length) newIndex = 0;
                    updateCarousel(newIndex);
                } else {
                    // Swiped right -> Previous slide
                    let newIndex = currentIndex - 1;
                    if (newIndex < 0) newIndex = slides.length - 1;
                    updateCarousel(newIndex);
                }
            }
        }
    });

    // --- Color Swatches Logic ---
    document.querySelectorAll('.color-swatch').forEach(swatch => {
        swatch.addEventListener('click', (e) => {
            const currentSwatch = e.target;
            const container = currentSwatch.closest('.color-swatches');
            
            container.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('selected'));
            currentSwatch.classList.add('selected');

            const newImgSrc1 = currentSwatch.getAttribute('data-img-1');
            const newImgSrc2 = currentSwatch.getAttribute('data-img-2');
            const productCard = currentSwatch.closest('.product-card');
            
            if (productCard && newImgSrc1) {
                const slides = productCard.querySelectorAll('.carousel-slide');
                if (slides.length > 0) {
                    slides[0].style.opacity = 0;
                    if (slides.length >= 2 && newImgSrc2) slides[1].style.opacity = 0;
                    
                    setTimeout(() => {
                        slides[0].src = newImgSrc1;
                        if (slides.length >= 2 && newImgSrc2) slides[1].src = newImgSrc2;
                        slides[0].style.opacity = 1;
                        if (slides.length >= 2 && newImgSrc2) slides[1].style.opacity = 1;
                    }, 300);
                }
            }
        });
    });

    // --- Lightbox Logic ---
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxClose = document.querySelector('.lightbox-close');

    if (lightbox && lightboxImg && lightboxClose) {
        document.querySelectorAll('.carousel-slide').forEach(img => {
            img.style.cursor = 'zoom-in';
            img.addEventListener('click', () => {
                lightbox.classList.add('show');
                lightboxImg.src = img.src;
                document.body.classList.add('no-scroll');
            });
        });

        // --- Magnifier Lens for Lightbox ---
        function hideLens() {
            magnifierLens.style.display = 'none';
        }

        function showLens(e) {
            magnifierLens.style.display = 'block';
            magnifierLens.style.backgroundImage = `url(${lightboxImg.src})`;
            magnifierLens.style.backgroundSize = `${lightboxImg.width * 1}px ${lightboxImg.height * 1}px`;
            moveLens(e);
        }

        function moveLens(e) {
            if (magnifierLens.style.display === 'none') return;
            
            let clientX, clientY;
            if (e.type.includes('touch')) {
                clientX = e.touches[0].clientX;
                clientY = e.touches[0].clientY;
            } else {
                clientX = e.clientX;
                clientY = e.clientY;
            }

            const rect = lightboxImg.getBoundingClientRect();
            let x = clientX - rect.left;
            let y = clientY - rect.top;

            magnifierLens.style.left = `${clientX - 125}px`; 
            magnifierLens.style.top = `${clientY - 125}px`;

            const bgX = (x / rect.width) * 100;
            const bgY = (y / rect.height) * 100;
            magnifierLens.style.backgroundPosition = `${bgX}% ${bgY}%`;
        }

        lightboxImg.addEventListener('mouseenter', showLens);
        lightboxImg.addEventListener('mousemove', moveLens);
        lightboxImg.addEventListener('mouseleave', hideLens);

        lightboxImg.addEventListener('touchstart', (e) => {
            if (e.touches.length === 1) showLens(e);
        }, { passive: true });
        
        lightboxImg.addEventListener('touchmove', (e) => {
            if (e.touches.length === 1) moveLens(e);
        }, { passive: true });

        lightboxImg.addEventListener('touchend', hideLens);

        // Close lightbox logic
        lightboxClose.addEventListener('click', () => {
            lightbox.classList.remove('show');
            document.body.classList.remove('no-scroll');
            hideLens();
        });

        lightbox.addEventListener('click', (e) => {
            if (e.target !== lightboxImg) {
                lightbox.classList.remove('show');
                document.body.classList.remove('no-scroll');
                hideLens();
            }
        });
    }
});
