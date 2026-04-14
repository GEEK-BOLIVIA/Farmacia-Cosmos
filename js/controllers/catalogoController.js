import { catalogoModel } from '../models/catalogoModel.js';
import { catalogoView } from '../views/catalogoView.js';

export const catalogoController = {
    state: {
        padre: null,
        subcategoriaId: null,
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
        const nombreCatUrl = params.get('categoria');

        if (nombreCatUrl) {
            this.state.padre = await catalogoModel.getCategoriaPorNombre(nombreCatUrl);

            if (this.state.padre) {
                const hijas = await catalogoModel.getSubcategorias(this.state.padre.id);

                if (hijas.length > 0) {
                    // Tiene subcategorías → mostrar el sidebar con radios
                    catalogoView.renderSidebarCategorias(hijas, this.state.subcategoriaId);
                } else {
                    // ✅ No tiene hijas → ocultar la sección de subcategorías del sidebar
                    const seccionSub = document.getElementById('categorias-filter-container');
                    if (seccionSub) seccionSub.closest('.mb-6').classList.add('hidden');
                }
            }
        }

        await this.cargarCatalogo();
        this.bindEvents();
    },

    _parseURLParams() {
        const params = new URLSearchParams(window.location.search);
        this.state.subcategoriaId = params.get('sub') ? parseInt(params.get('sub')) : null;
        if (params.get('orden')) this.state.orden = params.get('orden');
        if (params.get('pagina')) this.state.paginaActual = parseInt(params.get('pagina'));
        if (params.get('minPrice')) this.state.minPrice = parseInt(params.get('minPrice'));
        if (params.get('maxPrice')) this.state.maxPrice = parseInt(params.get('maxPrice'));
    },

    async cargarCatalogo() {
        try {
            catalogoView.renderSkeletons(this.state.viewMode);
            catalogoView.setLoading(true);

            let idsParaFiltrar = [];
            let subcategoriaObjeto = null;

            // PRIORIDAD 1: Subcategoría específica seleccionada desde el sidebar
            if (this.state.subcategoriaId) {
                idsParaFiltrar = [this.state.subcategoriaId];
                subcategoriaObjeto = await catalogoModel.getCategoriaPorId(this.state.subcategoriaId);

                if (catalogoView.tituloH1 && subcategoriaObjeto) {
                    catalogoView.tituloH1.innerText = subcategoriaObjeto.nombre;
                }

                catalogoView.updateBreadcrumb(this.state.padre, subcategoriaObjeto);
            }
            // PRIORIDAD 2: Categoría padre navegada desde el nav
            else if (this.state.padre) {
                const hijas = await catalogoModel.getSubcategorias(this.state.padre.id);

                if (hijas.length > 0) {
                    // Tiene hijas → mostrar productos de todas ellas combinadas
                    idsParaFiltrar = hijas.map(h => h.id);
                } else {
                    // ✅ No tiene hijas → es categoría final, filtrar por su propio ID
                    idsParaFiltrar = [this.state.padre.id];
                }

                if (catalogoView.tituloH1) {
                    catalogoView.tituloH1.innerText = this.state.padre.nombre;
                }

                catalogoView.updateBreadcrumb(this.state.padre, null);
            } else {
                // Sin filtro → catálogo completo
                catalogoView.updateBreadcrumb(null, null);
            }

            // ✅ Pasamos TODOS los filtros del state a la consulta
            const { productos, totalCount, rango } = await catalogoModel.getProductosData({
                subcategoriasIds: idsParaFiltrar,
                buscar: this.state.buscar,
                minPrice: this.state.minPrice,
                maxPrice: this.state.maxPrice,
                ordenOpcion: this.state.orden,
                pagina: this.state.paginaActual,
                productosPorPagina: 15
            });

            catalogoView.renderProductos(productos, this.state.viewMode);
            catalogoView.updateStats(totalCount, rango);
            catalogoView.renderPaginacion(totalCount, this.state.paginaActual);
            catalogoView.actualizarEtiquetasFiltros({
                minPrice: this.state.minPrice,
                maxPrice: this.state.maxPrice
            });

        } catch (error) {
            console.error('Error al cargar catálogo:', error);
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

        // 3. Ordenamiento
        document.getElementById('sort-select')?.addEventListener('change', (e) => {
            this.state.orden = e.target.value;
            this.state.paginaActual = 1;
            this._actualizarURLYRefrescar();
        });

        // 4. Filtros de Precio
        const priceSlider = document.getElementById('price-range-input');
        const minInput = document.getElementById('min-price');
        const maxInput = document.getElementById('max-price');

        priceSlider?.addEventListener('input', (e) => {
            const val = e.target.value;
            this.state.maxPrice = parseInt(val);
            if (maxInput) maxInput.value = val;
            if (catalogoView.priceMaxDisplay) {
                catalogoView.priceMaxDisplay.innerText = `Bs ${val}${val == 500 ? '+' : ''}`;
            }
        });

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

        // 6. Delegación de Clics Globales
        document.addEventListener('click', (e) => {
            const pageBtn = e.target.closest('.page-link');
            if (pageBtn) {
                this.state.paginaActual = parseInt(pageBtn.dataset.page);
                window.scrollTo({ top: 0, behavior: 'smooth' });
                this._actualizarURLYRefrescar();
                return;
            }

            const cartBtn = e.target.closest('.btn-add-cart');
            if (cartBtn) {
                this.agregarAlCarrito(cartBtn.dataset.id);
                return;
            }

            const removeTagBtn = e.target.closest('.btn-remove-tag');
            if (removeTagBtn) {
                this.eliminarFiltro(removeTagBtn.dataset.tipo);
                return;
            }
        });

        // 7. Toggle Acordeones Sidebar
        const filterToggles = document.querySelectorAll('#filters-sidebar h4.cursor-pointer');
        filterToggles.forEach(toggle => {
            toggle.addEventListener('click', () => {
                const container = toggle.nextElementSibling;
                const icon = toggle.querySelector('.material-icons');
                if (container.classList.contains('hidden')) {
                    container.classList.remove('hidden');
                    icon.innerText = 'expand_less';
                } else {
                    container.classList.add('hidden');
                    icon.innerText = 'expand_more';
                }
            });
        });

        // 8. Toggle Sidebar Móvil
        const sidebar = document.getElementById('filters-sidebar');
        document.getElementById('mobile-filters-button')?.addEventListener('click', () => {
            sidebar.classList.remove('-translate-x-full');
        });
        document.getElementById('close-filters-button')?.addEventListener('click', () => {
            sidebar.classList.add('-translate-x-full');
        });
    },

    async cambiarModoVista(modo) {
        this.state.viewMode = modo;
        localStorage.setItem('productViewMode', modo);
        catalogoView.renderSkeletons(modo);
        setTimeout(() => this.cargarCatalogo(), 150);
    },

    _actualizarURLYRefrescar() {
        const params = new URLSearchParams(window.location.search);

        if (this.state.padre) params.set('categoria', this.state.padre.nombre);

        if (this.state.subcategoriaId) params.set('sub', this.state.subcategoriaId);
        else params.delete('sub');

        if (this.state.paginaActual > 1) params.set('pagina', this.state.paginaActual);
        else params.delete('pagina');

        history.pushState(null, '', `${window.location.pathname}?${params.toString()}`);
        this.cargarCatalogo();
    },

    eliminarFiltro(tipo) {
        if (tipo === 'minPrice') {
            this.state.minPrice = 0;
            const minInput = document.getElementById('min-price');
            if (minInput) minInput.value = '';
        } else if (tipo === 'maxPrice') {
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

    limpiarTodosLosFiltros() {
        this.state.minPrice = 0;
        this.state.maxPrice = 500;
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