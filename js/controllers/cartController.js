// js/controllers/cartController.js

export const CartController = {
    items: [],

    init() {
        this.loadFromStorage();
        this.setupEventListeners();
        this.updateUI();
    },

    loadFromStorage() {
        try {
            // USAMOS 'cart_items' consistentemente
            const stored = localStorage.getItem('cart_items');
            this.items = stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error("Error al leer localStorage:", error);
            this.items = [];
        }
    },

    save() {
        localStorage.setItem('cart_items', JSON.stringify(this.items));
    },

    setupEventListeners() {
        // 1. Escuchar clics en el documento (Delegación)
        document.addEventListener('click', (e) => {
            // Caso A: Añadir al carrito
            const btnAdd = e.target.closest('.btn-add-cart');
            if (btnAdd) {
                e.preventDefault();
                const product = {
                    id: btnAdd.dataset.id,
                    nombre: btnAdd.dataset.nombre || "Producto",
                    precio: parseFloat(btnAdd.dataset.precio) || 0,
                    imagen: btnAdd.dataset.imagen || "",
                    cantidad: 1
                };
                this.addItem(product);
                return;
            }

            // Caso B: Clic en "Finalizar Pedido" (El ID de tu HTML es btn-checkout)
            const btnCheckout = e.target.closest('#btn-checkout');
            if (btnCheckout) {
                e.preventDefault();
                this.prepararCheckout();
                return;
            }
        });
    },

    addItem(product) {
        const existingItem = this.items.find(item => String(item.id) === String(product.id));
        if (existingItem) {
            existingItem.cantidad += 1;
        } else {
            this.items.push(product);
        }
        this.save();
        this.updateUI();
        if (window.toggleCart) window.toggleCart();
    },

    removeItem(id) {
        this.items = this.items.filter(item => String(item.id) !== String(id));
        this.save();
        this.updateUI();
    },

    changeQuantity(id, delta) {
        const item = this.items.find(item => String(item.id) === String(id));
        if (item) {
            item.cantidad += delta;
            if (item.cantidad <= 0) {
                this.removeItem(id);
            } else {
                this.save();
                this.updateUI();
            }
        }
    },

    updateUI() {
        const totalQty = this.items.reduce((acc, item) => acc + item.cantidad, 0);
        const totalMoney = this.items.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);

        const counts = document.querySelectorAll('#header-cart-count, #cart-count-badge');
        counts.forEach(el => {
            el.innerText = totalQty;
            el.style.display = totalQty > 0 ? 'flex' : 'none';
        });

        const totalLabels = document.querySelectorAll('#header-cart-total, #cart-total, #cart-subtotal');
        totalLabels.forEach(el => {
            el.innerText = `Bs. ${totalMoney.toLocaleString('es-BO', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            })}`;
        });

        this.renderCartItems();

        const emptyMsg = document.getElementById('cart-empty-message');
        const cartFooter = document.getElementById('cart-footer');

        if (this.items.length === 0) {
            if (emptyMsg) emptyMsg.classList.remove('hidden');
            if (cartFooter) cartFooter.classList.add('hidden');
        } else {
            if (emptyMsg) emptyMsg.classList.add('hidden');
            if (cartFooter) cartFooter.classList.remove('hidden');
        }
    },

    renderCartItems() {
        const container = document.getElementById('carrito-items-container');
        if (!container) return;

        if (this.items.length === 0) {
            container.innerHTML = `
                <div class="flex flex-col items-center justify-center py-20 opacity-50">
                    <span class="material-icons text-6xl">shopping_basket</span>
                    <p class="mt-4">Tu carrito está vacío</p>
                </div>`;
            return;
        }

        container.innerHTML = this.items.map(item => `
            <div class="flex gap-4 bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
                <img src="${item.imagen}" class="w-16 h-16 object-cover rounded-lg">
                <div class="flex-grow">
                    <h4 class="text-sm font-bold line-clamp-1">${item.nombre}</h4>
                    <p class="text-primary text-xs font-bold">Bs. ${(item.precio).toFixed(2)}</p>
                    <div class="flex items-center justify-between mt-2">
                        <div class="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg">
                            <button onclick="CartController.changeQuantity('${item.id}', -1)" class="px-2 py-1 text-lg">-</button>
                            <span class="px-2 text-xs font-bold">${item.cantidad}</span>
                            <button onclick="CartController.changeQuantity('${item.id}', 1)" class="px-2 py-1 text-lg">+</button>
                        </div>
                        <button onclick="CartController.removeItem('${item.id}')" class="text-red-400">
                            <span class="material-icons text-sm">delete</span>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    },

    // CORRECCIÓN AQUÍ: Usamos this.items en lugar de volver a consultar localStorage con clave errónea
    prepararCheckout() {
        // Usamos this.items que ya está cargado en memoria por el init()
        if (this.items.length === 0) {
            alert("El carrito está vacío");
            return;
        }

        // Redirigimos a finalizar.html (asegúrate que el archivo exista con ese nombre)
        window.location.href = 'finalizar.html';
    }
};

window.CartController = CartController;