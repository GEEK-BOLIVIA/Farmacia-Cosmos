// js/main.js
import { LayoutController } from './controllers/layoutController.js';
import { carruselController } from './controllers/carruselController.js';
import { CarruselView } from './views/carruselView.js';
import { CategoriasController } from './controllers/categoriasController.js';
import { CartController } from './controllers/cartController.js';
import { SearchController } from './controllers/searchController.js';
import { ConfigController } from './controllers/configController.js';

const App = {
    async init() {
        try {
            // ── FASE 1: Config + Skeletons en paralelo (0ms de espera visual) ──
            const hub = document.getElementById('carruseles-hub');
            if (hub) CarruselView.mostrarSkeleton('carruseles-hub', 'banners');

            // Config se lanza junto con todo lo demás — un solo cliente Supabase
            await Promise.all([
                ConfigController.init(),
                this._cargarContenido(hub)
            ]);

        } catch (error) {
            console.error("Error en App.init:", error);
        }
    },

    async _cargarContenido(hub) {
        const [carruseles] = await Promise.all([
            hub ? carruselController.obtenerContenidoGlobal() : Promise.resolve([]),
            this._inicializarUI()
        ]);

        if (hub && carruseles && carruseles.length > 0) {
            hub.innerHTML = '';
            hub.removeAttribute('data-initialized');
            carruseles.forEach(seccion => {
                CarruselView.render(seccion, 'carruseles-hub');
            });
        }
    },

    async _inicializarUI() {
        await LayoutController.render('./');

        await Promise.all([
            this._cargarCarrito(),
            CategoriasController.init().then(() => this.setupMobileMenuEvents())
        ]);

        SearchController.init().catch(err => console.error("Error buscador:", err));
    },

    async _cargarCarrito() {
        try {
            const targetContainer = document.getElementById('layout-cart') || document.body;
            const response = await fetch('components/carrito.html');
            const html = await response.text();
            targetContainer.insertAdjacentHTML('beforeend', html);
            this.setupCartEvents();
            CartController.init();
        } catch (err) {
            console.error("Error al cargar carrito.html:", err);
        }
    },

    setupCartEvents() {
        const sidebar = document.getElementById('carrito-sidebar');
        const overlay = document.getElementById('carrito-overlay');
        const closeBtn = document.getElementById('close-cart');

        window.toggleCart = () => {
            if (!sidebar || !overlay) return;
            const isOpen = !sidebar.classList.contains('translate-x-full');
            if (isOpen) {
                sidebar.classList.add('translate-x-full');
                overlay.classList.add('opacity-0');
                setTimeout(() => overlay.classList.add('hidden'), 300);
                document.body.style.overflow = '';
            } else {
                overlay.classList.remove('hidden');
                setTimeout(() => {
                    sidebar.classList.remove('translate-x-full');
                    overlay.classList.remove('opacity-0');
                }, 10);
                document.body.style.overflow = 'hidden';
            }
        };

        if (closeBtn) closeBtn.onclick = toggleCart;
        if (overlay) overlay.onclick = toggleCart;

        const cartTriggers = document.querySelectorAll('[onclick*="cart-modal"], [onclick*="toggleCart"]');
        cartTriggers.forEach(btn => {
            btn.removeAttribute('onclick');
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                window.toggleCart();
            });
        });

        const checkoutBtn = document.getElementById('checkout-whatsapp');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', () => CartController.enviarWhatsApp());
        }
    },

    setupMobileMenuEvents() {
        const categoriesBtn = document.getElementById('categories-toggle');
        const categoriesMenu = document.getElementById('categories-dropdown-menu');
        const arrow = document.getElementById('categories-arrow');
        const burgerBtn = document.getElementById('mobile-menu-open-button');
        const accordionMenu = document.getElementById('mobile-accordion-menu');
        const burgerIcon = document.getElementById('burger-icon');

        const toggleDropdown = (e) => {
            if (e) e.stopPropagation();
            const isHidden = categoriesMenu.classList.contains('hidden');
            if (isHidden) {
                categoriesMenu.classList.remove('hidden');
                setTimeout(() => {
                    categoriesMenu.classList.replace('opacity-0', 'opacity-100');
                    categoriesMenu.classList.replace('scale-95', 'scale-100');
                }, 10);
                arrow?.classList.add('rotate-180');
            } else {
                categoriesMenu.classList.replace('opacity-100', 'opacity-0');
                categoriesMenu.classList.replace('scale-100', 'scale-95');
                arrow?.classList.remove('rotate-180');
                setTimeout(() => categoriesMenu.classList.add('hidden'), 300);
            }
        };

        const toggleAccordion = () => {
            const isHidden = accordionMenu.classList.contains('hidden');
            if (isHidden) {
                accordionMenu.classList.remove('hidden');
                burgerIcon.innerText = 'close';
                const height = accordionMenu.scrollHeight;
                setTimeout(() => {
                    accordionMenu.style.maxHeight = `${height + 100}px`;
                }, 10);
            } else {
                accordionMenu.style.maxHeight = '0px';
                burgerIcon.innerText = 'menu';
                setTimeout(() => accordionMenu.classList.add('hidden'), 300);
            }
        };

        if (categoriesBtn) categoriesBtn.onclick = toggleDropdown;
        if (burgerBtn) burgerBtn.onclick = toggleAccordion;

        window.addEventListener('click', (e) => {
            if (categoriesMenu && !categoriesMenu.contains(e.target) && !categoriesBtn?.contains(e.target)) {
                if (!categoriesMenu.classList.contains('hidden')) toggleDropdown();
            }
        });
    }
};

document.addEventListener('DOMContentLoaded', () => App.init());