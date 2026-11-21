const productGrid = document.getElementById('productGrid');

if (productGrid) {
    const cards = Array.from(productGrid.querySelectorAll('.product-card'));
    const filterButtons = document.querySelectorAll('.category-chip');
    const searchInput = document.getElementById('productSearch');
    const sortSelect = document.getElementById('productSort');
    const resultsCount = document.getElementById('resultsCount');
    const emptyState = document.getElementById('emptyState');
    const cartButton = document.getElementById('cartButton');
    const cartPanel = document.getElementById('cartPanel');
    const cartBackdrop = document.getElementById('cartBackdrop');
    const cartClose = document.getElementById('cartClose');
    const cartCount = document.getElementById('cartCount');
    const cartTitleCount = document.getElementById('cartTitleCount');
    const cartItems = document.getElementById('cartItems');
    const cartEmpty = document.getElementById('cartEmpty');
    const cartSummary = document.getElementById('cartSummary');
    const cartSubtotal = document.getElementById('cartSubtotal');
    const toast = document.getElementById('shopToast');
    const cart = new Map();
    let activeCategory = 'all';
    let toastTimer;

    const formatPrice = (price) => `${new Intl.NumberFormat('vi-VN').format(price)}đ`;

    function updateProducts() {
        const query = searchInput.value.trim().toLocaleLowerCase('vi');
        const visibleCards = cards.filter((card) => {
            const matchesCategory = activeCategory === 'all' || card.dataset.category === activeCategory;
            const matchesSearch = card.dataset.name.toLocaleLowerCase('vi').includes(query);
            return matchesCategory && matchesSearch;
        });

        if (sortSelect.value === 'price-low') {
            visibleCards.sort((a, b) => Number(a.dataset.price) - Number(b.dataset.price));
        } else if (sortSelect.value === 'price-high') {
            visibleCards.sort((a, b) => Number(b.dataset.price) - Number(a.dataset.price));
        }

        cards.forEach((card) => {
            card.hidden = !visibleCards.includes(card);
        });
        visibleCards.forEach((card) => productGrid.appendChild(card));
        resultsCount.textContent = `Đang hiển thị ${visibleCards.length} sản phẩm`;
        emptyState.hidden = visibleCards.length > 0;
    }

    function showToast(message) {
        toast.textContent = message;
        toast.classList.add('show');
        window.clearTimeout(toastTimer);
        toastTimer = window.setTimeout(() => toast.classList.remove('show'), 2400);
    }

    function renderCart() {
        const itemCount = Array.from(cart.values()).reduce((sum, item) => sum + item.quantity, 0);
        const subtotal = Array.from(cart.values()).reduce((sum, item) => sum + item.price * item.quantity, 0);
        cartCount.textContent = itemCount;
        cartTitleCount.textContent = `(${itemCount})`;
        cartItems.replaceChildren();
        cartEmpty.hidden = itemCount > 0;
        cartSummary.hidden = itemCount === 0;
        cartSubtotal.textContent = formatPrice(subtotal);

        cart.forEach((item, id) => {
            const row = document.createElement('div');
            row.className = 'cart-item';

            const details = document.createElement('div');
            const name = document.createElement('h3');
            name.textContent = item.name;
            const price = document.createElement('p');
            price.textContent = formatPrice(item.price);
            details.append(name, price);

            const controls = document.createElement('div');
            controls.className = 'cart-item-controls';
            const decrease = document.createElement('button');
            decrease.type = 'button';
            decrease.textContent = '-';
            decrease.setAttribute('aria-label', `Giảm số lượng ${item.name}`);
            decrease.addEventListener('click', () => changeQuantity(id, -1));
            const quantity = document.createElement('span');
            quantity.textContent = item.quantity;
            const increase = document.createElement('button');
            increase.type = 'button';
            increase.textContent = '+';
            increase.setAttribute('aria-label', `Tăng số lượng ${item.name}`);
            increase.addEventListener('click', () => changeQuantity(id, 1));
            controls.append(decrease, quantity, increase);

            const remove = document.createElement('button');
            remove.type = 'button';
            remove.className = 'cart-item-remove';
            remove.textContent = 'Xóa sản phẩm';
            remove.addEventListener('click', () => {
                cart.delete(id);
                renderCart();
            });
            row.append(details, controls, remove);
            cartItems.appendChild(row);
        });
    }

    function changeQuantity(id, amount) {
        const item = cart.get(id);
        if (!item) return;
        item.quantity += amount;
        if (item.quantity <= 0) cart.delete(id);
        renderCart();
    }

    function addToCart(card) {
        const id = card.dataset.name;
        const item = cart.get(id);
        if (item) {
            item.quantity += 1;
        } else {
            cart.set(id, {
                name: card.dataset.name,
                price: Number(card.dataset.price),
                quantity: 1
            });
        }
        renderCart();
        showToast(`Đã thêm ${card.dataset.name} vào giỏ hàng.`);
    }

    function openCart() {
        cartPanel.classList.add('open');
        cartPanel.setAttribute('aria-hidden', 'false');
        cartPanel.inert = false;
        cartBackdrop.hidden = false;
        document.body.classList.add('cart-open');
        cartClose.focus();
    }

    function closeCart() {
        cartPanel.classList.remove('open');
        cartPanel.setAttribute('aria-hidden', 'true');
        cartPanel.inert = true;
        cartBackdrop.hidden = true;
        document.body.classList.remove('cart-open');
        cartButton.focus();
    }

    filterButtons.forEach((button) => {
        button.addEventListener('click', () => {
            activeCategory = button.dataset.filter;
            filterButtons.forEach((filterButton) => {
                const isActive = filterButton === button;
                filterButton.classList.toggle('active', isActive);
                filterButton.setAttribute('aria-pressed', String(isActive));
            });
            updateProducts();
        });
    });

    searchInput.addEventListener('input', updateProducts);
    sortSelect.addEventListener('change', updateProducts);
    productGrid.addEventListener('click', (event) => {
        const button = event.target.closest('.add-button, .quick-add');
        if (!button) return;
        addToCart(button.closest('.product-card'));
    });
    cartButton.addEventListener('click', openCart);
    cartClose.addEventListener('click', closeCart);
    cartBackdrop.addEventListener('click', closeCart);
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && cartPanel.classList.contains('open')) closeCart();
    });
    cartPanel.inert = true;
    renderCart();
}
