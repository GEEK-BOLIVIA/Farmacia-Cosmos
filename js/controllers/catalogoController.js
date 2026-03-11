import { catalogoModel } from '../models/catalogoModel.js';
import { catalogoView } from '../views/catalogoView.js';

export const catalogoController = {
    state: {
        padre: null,            // Objeto de la categoría principal
        subcategoriaId: null,   // ID de la subcategoría específica (Hija)
        buscar: null,
        minPrice: 0,
        maxPrice: 500,
        orden: 'Lo más nuevo',
        paginaActual: 1,
        viewMode: localStorage.getItem('productViewMode') || 'grid'
    },

    async init() {
        this._parseURLParams();

        const params = new URLSearchParams(window.location.search);
        const nombreCatUrl = params.get('categoria'); // Aquí capturamos lo que viene del carrusel

        if (nombreCatUrl) {
            // Buscamos la categoría padre por nombre
            this.state.padre = await catalogoModel.getCategoriaPorNombre(nombreCatUrl);

            if (this.state.padre) {
                const hijas = await catalogoModel.getSubcategorias(this.state.padre.id);

                // Si NO hay subcategoría en la URL, nos aseguramos de que el radio sea "Todo"
                catalogoView.renderSidebarCategorias(hijas, this.state.subcategoriaId);
            }
        }

        await this.cargarCatalogo();
        this.bindEvents();
    },

    _parseURLParams() {
        const params = new URLSearchParams(window.location.search);
        this.state.subcategoriaId = params.get('sub') ? parseInt(params.get('sub')) : null;
    },

    async cargarCatalogo() {
        try {
            catalogoView.setLoading(true);
            let idsParaFiltrar = [];
            let subcategoriaObjeto = null;

            // PRIORIDAD 1: Si hay una subcategoría específica seleccionada
            if (this.state.subcategoriaId) {
                idsParaFiltrar = [this.state.subcategoriaId];
                subcategoriaObjeto = await catalogoModel.getCategoriaPorId(this.state.subcategoriaId);
                if (catalogoView.tituloH1 && subcategoriaObjeto) {
                    catalogoView.tituloH1.innerText = subcategoriaObjeto.nombre;
                }
            }
            // PRIORIDAD 2: Si solo tenemos la categoría PADRE (Viniendo del carrusel)
            else if (this.state.padre) {
                const hijas = await catalogoModel.getSubcategorias(this.state.padre.id);
                // Obtenemos los IDs de todas sus hijas para mostrar "Todo" lo de esa categoría
                idsParaFiltrar = hijas.map(h => h.id);

                if (catalogoView.tituloH1) {
                    catalogoView.tituloH1.innerText = this.state.padre.nombre;
                }
            }

            // ... resto del código de obtención de datos y renderizado ...
            const { productos, totalCount, rango } = await catalogoModel.getProductosData({
                subcategoriasIds: idsParaFiltrar,
                // ... otros filtros ...
            });

            catalogoView.renderProductos(productos, this.state.viewMode);
            // ...
        } catch (error) {
            console.error(error);
        } finally {
            catalogoView.setLoading(false);
        }
    },

    bindEvents() {
        // 1. Delegación para el Aside (Subcategorías / Radios)
        const aside = document.getElementById('filters-sidebar');
        aside?.addEventListener('change', (e) => {
            if (e.target.classList.contains('cat-filter-radio')) {
                const val = e.target.value;
                this.state.subcategoriaId = val === 'todo' ? null : parseInt(val);
                this.state.paginaActual = 1;
                this._actualizarURLYRefrescar();
            }
        });

        // 2. Cambio de Modo de Vista (Grid / List)
        document.getElementById('grid-view-button')?.addEventListener('click', () => {
            this.cambiarModoVista('grid');
        });
        document.getElementById('list-view-button')?.addEventListener('click', () => {
            this.cambiarModoVista('list');
        });

        // 3. Ordenamiento (Select)
        document.getElementById('sort-select')?.addEventListener('change', (e) => {
            this.state.orden = e.target.value;
            this.state.paginaActual = 1;
            this._actualizarURLYRefrescar();
        });

        // 4. Filtros de Precio (Slider e Inputs Numéricos)
        const priceSlider = document.getElementById('price-range-input');
        const minInput = document.getElementById('min-price');
        const maxInput = document.getElementById('max-price');

        // Actualización Visual del Slider (Input: ocurre mientras arrastras)
        priceSlider?.addEventListener('input', (e) => {
            const val = e.target.value;
            this.state.maxPrice = val;
            if (maxInput) maxInput.value = val; // Sincroniza el input numérico
            if (catalogoView.priceMaxDisplay) {
                catalogoView.priceMaxDisplay.innerText = `Bs ${val}${val == 500 ? '+' : ''}`;
            }
        });

        // Aplicar Filtro (Change: ocurre al soltar el slider o perder el foco del input)
        [priceSlider, minInput, maxInput].forEach(el => {
            el?.addEventListener('change', (e) => {
                if (el.id === 'min-price') {
                    this.state.minPrice = e.target.value !== '' ? parseInt(e.target.value) : 0;
                }
                if (el.id === 'max-price' || el.id === 'price-range-input') {
                    this.state.maxPrice = e.target.value !== '' ? parseInt(e.target.value) : 500;
                }

                this.state.paginaActual = 1;
                this._actualizarURLYRefrescar();
            });
        });

        // 5. Botón Limpiar Todo
        document.getElementById('btn-limpiar-filtros')?.addEventListener('click', () => {
            this.limpiarTodosLosFiltros();
        });

        // 6. Delegación de Clics Globales (Paginación, Carrito y Tags de filtros)
        document.addEventListener('click', (e) => {
            // Paginación
            const pageBtn = e.target.closest('.page-link');
            if (pageBtn) {
                this.state.paginaActual = parseInt(pageBtn.dataset.page);
                window.scrollTo({ top: 0, behavior: 'smooth' });
                this._actualizarURLYRefrescar();
                return;
            }

            // Botón Añadir al Carrito
            const cartBtn = e.target.closest('.btn-add-cart');
            if (cartBtn) {
                const idProducto = cartBtn.dataset.id;
                this.agregarAlCarrito(idProducto);
                return;
            }

            // Eliminar Filtros desde los Tags (X)
            const removeTagBtn = e.target.closest('.btn-remove-tag');
            if (removeTagBtn) {
                const tipo = removeTagBtn.dataset.tipo; // 'minPrice' o 'maxPrice'
                this.eliminarFiltro(tipo);
                return;
            }
        });
        // 7. Toggle de Acordeones en el Sidebar (Subcategorías y Precio)
        const filterToggles = document.querySelectorAll('#filters-sidebar h4.cursor-pointer');
        filterToggles.forEach(toggle => {
            toggle.addEventListener('click', () => {
                const container = toggle.nextElementSibling; // El div que sigue al h4
                const icon = toggle.querySelector('.material-icons');

                // Toggle de la visibilidad con una animación simple
                if (container.classList.contains('hidden')) {
                    container.classList.remove('hidden');
                    icon.innerText = 'expand_less';
                } else {
                    container.classList.add('hidden');
                    icon.innerText = 'expand_more';
                }
            });
        });
        // Toggle Sidebar Móvil
        const sidebar = document.getElementById('filters-sidebar');
        const openBtn = document.getElementById('mobile-filters-button');
        const closeBtn = document.getElementById('close-filters-button');

        openBtn?.addEventListener('click', () => {
            sidebar.classList.remove('-translate-x-full');
        });

        closeBtn?.addEventListener('click', () => {
            sidebar.classList.add('-translate-x-full');
        });
    },

    async cambiarModoVista(modo) {
        this.state.viewMode = modo;
        localStorage.setItem('productViewMode', modo);

        // 1. Mostrar skeletons inmediatamente para que el usuario no vea el diseño roto
        catalogoView.renderSkeletons(modo);

        // 2. Esperar un pequeño delay o simplemente recargar (opcional pero ayuda a la fluidez)
        setTimeout(() => {
            this.cargarCatalogo();
        }, 150);
    },

    _actualizarURLYRefrescar() {
        const params = new URLSearchParams(window.location.search);
        if (this.state.padre) params.set('categoria', this.state.padre.nombre);

        if (this.state.subcategoriaId) params.set('sub', this.state.subcategoriaId);
        else params.delete('sub');

        history.pushState(null, '', `${window.location.pathname}?${params.toString()}`);
        this.cargarCatalogo();
    },
    // Método para eliminar un filtro específico desde la "X" del tag
    eliminarFiltro(tipo) {
        if (tipo === 'minPrice') {
            this.state.minPrice = 0;
            const minInput = document.getElementById('min-price');
            if (minInput) minInput.value = '';
        }
        else if (tipo === 'maxPrice') {
            this.state.maxPrice = 500;
            const maxInput = document.getElementById('max-price');
            const priceSlider = document.getElementById('price-range-input');
            if (maxInput) maxInput.value = '';
            if (priceSlider) priceSlider.value = 500;
            if (catalogoView.priceMaxDisplay) catalogoView.priceMaxDisplay.innerText = `Bs 500+`;
        }

        this.state.paginaActual = 1;
        this._actualizarURLYRefrescar();
    },

    // Método para el botón "Limpiar Todo"
    limpiarTodosLosFiltros() {
        this.state.minPrice = 0;
        this.state.maxPrice = 500;

        // Reset visual de inputs
        const minInput = document.getElementById('min-price');
        const maxInput = document.getElementById('max-price');
        const priceSlider = document.getElementById('price-range-input');

        if (minInput) minInput.value = '';
        if (maxInput) maxInput.value = '';
        if (priceSlider) priceSlider.value = 500;
        if (catalogoView.priceMaxDisplay) catalogoView.priceMaxDisplay.innerText = `Bs 500+`;

        this.state.paginaActual = 1;
        this._actualizarURLYRefrescar();
    },
    agregarAlCarrito(id) {
        window.dispatchEvent(new CustomEvent('addToCart', { detail: { id } }));
    }
};

document.addEventListener('DOMContentLoaded', () => catalogoController.init());