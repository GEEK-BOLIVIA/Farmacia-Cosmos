export const catalogoView = {
     CONFIG: {
        WHATSAPP_FARMACIA: "67540115" // Tu número aquí
    },
    // 1. Referencias al DOM
    grid: document.getElementById('product-grid-container'),
    conteo: document.getElementById('productos-conteo'),
    // Contenedor principal de la lista del Breadcrumb
    breadcrumbList: document.querySelector('nav[aria-label="Breadcrumb"] ol'),
    paginationContainer: document.getElementById('pagination-controls'),

    // Contenedores de Filtros
    sidebarCategoriasContainer: document.getElementById('categorias-filter-container'),

    // Controles de Precio y Rating
    priceRangeInput: document.getElementById('price-range-input'),
    priceMaxDisplay: document.getElementById('price-max-display'),
    ratingStars: document.querySelectorAll('.star-icon'),
    ratingInput: document.getElementById('rating-score-input'),
    tituloH1: document.getElementById('titulo-categoria'),

    // 2. Configuración de Clases para los Modos de Vista
    configs: {
        grid: ['grid', 'grid-cols-1', 'sm:grid-cols-2', 'lg:grid-cols-3', 'gap-6'],
        list: ['flex', 'flex-col', 'space-y-6']
    },

    init(viewMode) {
        this.updateViewMode(viewMode);
    },

    /**
     * Actualiza el Breadcrumb con la jerarquía Inicio > Padre > Hija
     */
    updateBreadcrumb(padre, subcategoria = null) {
        if (!this.breadcrumbList) return;

        let html = `
            <li class="inline-flex items-center">
                <a class="inline-flex items-center hover:text-primary dark:hover:text-white transition-colors" href="index.html">
                    <span class="material-icons text-base mr-2">home</span> Inicio
                </a>
            </li>`;

        if (padre) {
            html += `
                <li class="animate-fade-in">
                    <div class="flex items-center">
                        <span class="material-icons text-gray-400 text-base">chevron_right</span>
                        <a href="productos.html?categoria=${encodeURIComponent(padre.nombre)}" 
                           class="ml-1 md:ml-2 font-medium hover:text-primary dark:text-gray-300 transition-colors">
                           ${padre.nombre}
                        </a>
                    </div>
                </li>`;
        }

        if (subcategoria) {
            html += `
                <li class="animate-fade-in">
                    <div class="flex items-center">
                        <span class="material-icons text-gray-400 text-base">chevron_right</span>
                        <span class="ml-1 md:ml-2 font-bold text-gray-900 dark:text-white uppercase text-[12px] tracking-wider">
                            ${subcategoria.nombre}
                        </span>
                    </div>
                </li>`;
        } else if (!padre) {
            html += `
                <li>
                    <div class="flex items-center">
                        <span class="material-icons text-gray-400 text-base">chevron_right</span>
                        <span class="ml-1 md:ml-2 font-medium text-gray-900 dark:text-white">Catálogo Completo</span>
                    </div>
                </li>`;
        }

        this.breadcrumbList.innerHTML = html;
    },

    /**
     * Renderiza los productos usando el diseño de tarjetas
     */
    // En tu catalogoView.js
    renderProductos(productos, viewMode) {
        const container = document.getElementById('product-grid-container');
        if (!container) return;

        // Limpiamos el contenido anterior
        container.innerHTML = '';

        // Aplicamos las clases correctas al contenedor antes de meter las tarjetas
        this.updateViewMode(viewMode);

        if (productos.length === 0) {
            container.innerHTML = `<p class="col-span-full text-center py-10 text-gray-500">No se encontraron productos.</p>`;
            return;
        }

        // Insertamos las tarjetas con el diseño correspondiente
        productos.forEach(p => {
            container.insertAdjacentHTML('beforeend', this.crearTarjeta(p, viewMode));
        });
    },
    renderSkeletons(viewMode) {
        const container = document.getElementById('product-grid-container');
        if (!container) return;

        const isList = viewMode === 'list';
        const skeletonCount = 6; // Número de tarjetas falsas a mostrar

        // Aplicamos la estructura de rejilla o lista inmediatamente
        this.updateViewMode(viewMode);

        let skeletonHTML = '';
        for (let i = 0; i < skeletonCount; i++) {
            if (isList) {
                skeletonHTML += `
            <div class="flex flex-col md:flex-row p-4 bg-gray-100 animate-pulse rounded-[2rem] gap-6 w-full h-40">
                <div class="w-32 h-32 bg-gray-200 rounded-2xl shrink-0"></div>
                <div class="flex-grow space-y-3">
                    <div class="h-6 bg-gray-200 rounded w-3/4"></div>
                    <div class="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
            </div>`;
            } else {
                skeletonHTML += `
            <div class="p-4 bg-gray-100 animate-pulse rounded-[2rem] h-80 w-full">
                <div class="w-full h-40 bg-gray-200 rounded-2xl mb-4"></div>
                <div class="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div class="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>`;
            }
        }
        container.innerHTML = skeletonHTML;
    },
    /**
     * Crea el HTML de la tarjeta (Actualizada con Nombre y Precio destacados)
     */
    crearTarjeta(p, viewMode) {
        const isList = viewMode === 'list';

        // --- LÓGICA DE CONTEXTO POR ESTRUCTURA (FIX DEFINITIVO) ---

        // 1. Intentamos buscar el breadcrumb específicamente por su clase de contenedor
        // Normalmente el breadcrumb está en un div con clase 'flex' cerca del inicio
        const breadcrumbContainer = document.querySelector('.breadcrumb, .breadcrumbs, #breadcrumb-container');

        let nombrePadreDesdeNav = null;

        if (breadcrumbContainer) {
            const enlaces = Array.from(breadcrumbContainer.querySelectorAll('a'));
            // El breadcrumb suele ser: Inicio > Padre > Actual. Queremos el índice 1.
            nombrePadreDesdeNav = enlaces[1]?.innerText.trim();
        }

        // 2. Si falló (porque el breadcrumb no tiene esas clases), buscamos el H1
        const tituloElemento = document.getElementById('titulo-categoria');
        const categoriaFiltro = tituloElemento?.innerText.trim() || 'Catálogo';

        // 3. Decisión final:
        // Si nombrePadreDesdeNav existe y no es "Inicio", es nuestro hombre (ej: Bodega).
        // Si no, usamos el título actual (ej: Singanis...).
        const contextoAEnviar = (nombrePadreDesdeNav && nombrePadreDesdeNav.toLowerCase() !== 'inicio')
            ? nombrePadreDesdeNav
            : categoriaFiltro;

        // Construimos la URL
        const detalleURL = `detalle_producto.html?id=${p.id}&categoria=${encodeURIComponent(contextoAEnviar)}`;
        // ---------------------------------------------------------

        const containerClass = isList
            ? "flex flex-row p-3 md:p-4 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-[1.5rem] md:rounded-[2rem] shadow-sm hover:shadow-md transition-all w-full gap-3 md:gap-6 animate-fade-in relative"
            : "flex flex-col p-4 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-[2rem] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group animate-fade-in w-full h-full justify-between";

        const imgContainerClass = isList
            ? "w-24 h-24 md:w-40 md:h-32 shrink-0 overflow-hidden rounded-xl md:rounded-2xl bg-gray-50/50"
            : "w-full h-40 mb-3 flex items-center justify-center overflow-hidden rounded-2xl bg-gray-50/50 dark:bg-gray-900/10";

        const precioHTML = p.mostrar_precio
            ? `<p class="text-[19px] text-primary font-black tracking-tighter">Bs. ${Number(p.precio).toLocaleString()}</p>`
            : '';

        const btnCarrito = p.mostrar_precio
            ? `<button class="btn-add-cart flex-[3] flex items-center justify-center gap-1 bg-primary text-white py-2 rounded-xl transition-all duration-500 group/cart shadow-sm active:scale-95 overflow-hidden px-2 min-w-0" 
                data-id="${p.id}" 
                data-nombre="${p.nombre}" 
                data-precio="${p.precio}" 
                data-imagen="${p.imagen_url}"
                ${p.stock <= 0 ? 'disabled opacity-50' : ''}>
                
                <span class="material-icons text-base shrink-0">shopping_cart</span>
                <div class="max-w-[45px] group-hover/cart:max-w-[160px] transition-all duration-500 ease-in-out overflow-hidden">
                    <span class="text-[10px] font-bold uppercase whitespace-nowrap block px-1">
                        <span class="group-hover/cart:hidden">Añadir</span>
                        <span class="hidden group-hover/cart:inline">Añadir al Carrito</span>
                    </span>
                </div>
            </button>`
            : '';

        const btnWhatsapp = p.habilitar_whatsapp
            ? `<a href="https://wa.me/591${this.CONFIG.WHATSAPP_FARMACIA}?text=${encodeURIComponent('Deseo información de: ' + p.nombre)}" target="_blank" 
    class="flex-1 flex items-center justify-center border-2 border-[#25D366] text-[#25D366] py-2 rounded-xl hover:flex-[4] hover:bg-[#25D366] hover:text-white transition-all duration-500 group/ws active:scale-95 overflow-hidden px-2 min-w-0">
    <div class="flex items-center shrink-0">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" class="shrink-0">
            <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.06 3.978l-1.125 4.105 4.198-1.102a7.847 7.847 0 0 0 3.858 1.018h.004c4.368 0 7.926-3.558 7.93-7.93a7.898 7.898 0 0 0-2.33-5.59zM7.994 14.166a6.522 6.522 0 0 1-3.332-.915l-.239-.142-2.481.651.662-2.419-.156-.248a6.513 6.513 0 0 1-1.001-3.418c0-3.601 2.939-6.54 6.543-6.541a6.513 6.513 0 0 1 4.62 1.917 6.513 6.513 0 0 1 1.92 4.626c-.002 3.602-2.941 6.541-6.541 6.541zM11.523 9.471c-.193-.097-1.144-.564-1.321-.628-.176-.065-.305-.097-.433.097-.128.194-.497.628-.609.756-.112.129-.224.144-.417.047-.193-.097-.816-.301-1.554-.959-.575-.513-.962-1.147-1.075-1.341-.112-.194-.012-.299.086-.395.087-.087.193-.225.29-.338.096-.113.128-.193.193-.322.064-.13.032-.242-.016-.339-.049-.097-.433-1.044-.593-1.428-.157-.376-.312-.326-.432-.332-.11-.006-.237-.007-.364-.007-.127 0-.333.048-.507.237-.174.189-.665.65-.665 1.585 0 .935.68 1.838.775 1.967.095.129 1.339 2.045 3.245 2.87.453.197.807.315 1.082.402.455.144.869.124 1.196.075.365-.054 1.144-.468 1.305-1.196.162-.728.162-1.352.113-1.481-.049-.129-.177-.193-.37-.29z"/>
        </svg>
    </div>
    <div class="max-w-0 group-hover/ws:max-w-[100px] transition-all duration-500 ease-in-out overflow-hidden">
        <span class="text-[10px] font-bold uppercase whitespace-nowrap ml-1 block">Consultar</span>
    </div>
  </a>`
            : '';

        if (isList) {
            return `
    <div class="${containerClass}">
        <a href="${detalleURL}" class="${imgContainerClass} block">
            <img src="${p.imagen_url}" class="w-full h-full object-contain p-2 hover:scale-110 transition-transform duration-700" onerror="this.src='https://via.placeholder.com/200'">
        </a>
        <div class="flex flex-col flex-grow justify-center min-w-0">
            <a href="${detalleURL}" class="block group">
                <h3 class="text-[14px] md:text-[18px] font-black text-[#1e293b] dark:text-white leading-tight uppercase truncate tracking-tight group-hover:text-primary transition-colors">
                    ${p.nombre}
                </h3>
            </a>
            <p class="text-[10px] md:text-[12px] text-slate-400 mt-1 md:mt-2 line-clamp-1 md:line-clamp-2 font-medium">
                ${p.descripcion || 'Sin descripción disponible.'}
            </p>
            <div class="mt-2 md:mt-4 flex items-center gap-2 md:gap-3">
                <span class="text-[8px] md:text-[9px] uppercase font-bold px-2 py-0.5 md:py-1 rounded-lg ${p.stock > 0 ? 'bg-green-50 text-green-500' : 'bg-red-50 text-red-500'}">
                    ${p.stock > 0 ? 'EN STOCK' : 'AGOTADO'}
                </span>
            </div>
        </div>
        <div class="flex flex-col items-end justify-between border-l border-gray-100 dark:border-gray-700 pl-3 md:pl-6 min-w-[100px] md:min-w-[160px]">
            <div class="mb-2 md:mb-4">
                ${precioHTML}
            </div>
            <div class="flex flex-col gap-1.5 w-full">
                <div class="w-full [&>button]:w-full [&>button]:flex-none">${btnCarrito}</div>
                <div class="w-full [&>a]:w-full [&>a]:flex-none">${btnWhatsapp}</div>
            </div>
        </div>
    </div>`;
        }

        return `
<div class="${containerClass}">
    <a href="${detalleURL}" class="${imgContainerClass} block">
        <img src="${p.imagen_url}" 
             class="w-full h-full object-contain p-2 group-hover:scale-110 transition-transform duration-700" 
             onerror="this.src='https://via.placeholder.com/200'">
    </a>
    <div class="flex flex-col flex-grow">
        <a href="${detalleURL}" class="block group">
            <h3 class="text-[16px] font-black text-[#1e293b] dark:text-white leading-tight line-clamp-2 uppercase tracking-tight group-hover:text-primary transition-colors">
                ${p.nombre}
            </h3>
        </a>
        <p class="text-[11px] text-slate-400 mt-1 line-clamp-1 font-medium">
            ${p.descripcion || 'Sin descripción disponible.'}
        </p>
        <div class="flex items-center justify-between mt-3">
            ${precioHTML}
            <span class="text-[9px] uppercase font-bold px-2 py-1 rounded-lg ${p.stock > 0 ? 'bg-green-50 text-green-500' : 'bg-red-50 text-red-500'}">
                ${p.stock > 0 ? 'EN STOCK' : 'AGOTADO'}
            </span>
        </div>
        <div class="flex items-center gap-1.5 mt-4 w-full h-11">
            ${btnCarrito}
            ${btnWhatsapp}
        </div>
    </div>
</div>`;
    },
    /**
     * Actualiza el contador de resultados
     */
    updateStats(total, rango) {
        if (this.conteo) {
            this.conteo.innerText = total > 0
                ? `Mostrando ${rango.inicio}-${rango.fin} de ${total} productos`
                : `0 productos encontrados`;
        }
    },

    /**
     * Cambia entre Cuadrícula y Lista
     */
    updateViewMode(mode) {
        // 1. Seleccionamos el contenedor de productos
        const container = document.getElementById('product-grid-container');
        if (!container) return;

        // 2. Limpiamos TODAS las clases existentes para evitar conflictos
        // Esto evita que las clases 'grid-cols-3' se queden pegadas al pasar a lista
        container.className = "w-full transition-all duration-300";

        // 3. Aplicamos la estructura según el modo seleccionado
        if (mode === 'grid') {
            // Configuramos el Grid responsivo
            container.classList.add('grid', 'grid-cols-1', 'sm:grid-cols-2', 'lg:grid-cols-3', 'gap-6');
        } else {
            // Configuramos la Lista (una sola columna de items anchos)
            container.classList.add('flex', 'flex-col', 'space-y-4');
        }

        // 4. Actualizamos el estado visual de los botones de la barra superior
        this.updateActiveButtonStyles(mode);
    },

    updateActiveButtonStyles(mode) {
        const gridBtn = document.getElementById('grid-view-button');
        const listBtn = document.getElementById('list-view-button');

        if (mode === 'grid') {
            gridBtn?.classList.add('bg-white', 'text-primary', 'shadow-sm');
            listBtn?.classList.remove('bg-white', 'text-primary', 'shadow-sm');
            listBtn?.classList.add('text-gray-500');
        } else {
            listBtn?.classList.add('bg-white', 'text-primary', 'shadow-sm');
            gridBtn?.classList.remove('bg-white', 'text-primary', 'shadow-sm');
            gridBtn?.classList.add('text-gray-500');
        }
    },

    /**
     * Renderiza la paginación
     */
    renderPaginacion(totalCount, currentPage) {
        if (!this.paginationContainer) return;

        const totalPages = Math.ceil(totalCount / 15);
        if (totalPages <= 1) {
            this.paginationContainer.innerHTML = '';
            return;
        }

        let html = '';
        for (let i = 1; i <= totalPages; i++) {
            const isActive = i === currentPage;
            const activeClasses = isActive
                ? 'bg-primary text-white shadow-md scale-110'
                : 'bg-white dark:bg-gray-800 text-gray-500 border border-gray-200 dark:border-gray-700 hover:bg-gray-50';

            html += `<button class="page-link w-10 h-10 rounded-xl font-bold transition-all duration-300 ${activeClasses}" data-page="${i}">${i}</button>`;
        }
        this.paginationContainer.innerHTML = html;
    },

    /**
     * Renderiza las subcategorías en el sidebar
     */
    renderSidebarCategorias(categorias, seleccionadaId = null) {
        if (!this.sidebarCategoriasContainer) return;

        // Convertimos a String para comparar correctamente con el value del input
        const idActual = seleccionadaId !== null ? seleccionadaId.toString() : 'todo';

        const crearRadioHTML = (id, nombre, isChecked) => `
            <label class="flex items-center gap-3 p-2 cursor-pointer hover:bg-primary/5 dark:hover:bg-primary/10 rounded-xl transition-all group">
                <div class="relative flex items-center justify-center w-5 h-5 shrink-0">
                    <input type="radio" name="subcategoria-filter" value="${id}" 
                        class="cat-filter-radio absolute opacity-0 w-full h-full cursor-pointer z-10" 
                        ${isChecked ? 'checked' : ''}>
                    
                    <div class="w-full h-full border-2 rounded-full transition-all duration-300 
                        ${isChecked ? 'border-primary' : 'border-gray-300 dark:border-gray-600 group-hover:border-primary/50'}">
                    </div>

                    <div class="absolute w-2.5 h-2.5 rounded-full bg-primary transition-all duration-300 transform 
                        ${isChecked ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}">
                    </div>
                </div>

                <span class="text-sm transition-colors duration-300 truncate
                    ${isChecked ? 'font-bold text-primary' : 'font-medium text-slate-600 dark:text-gray-300 group-hover:text-primary'}">
                    ${nombre}
                </span>
            </label>
        `;

        let html = crearRadioHTML('todo', 'Ver todo', idActual === 'todo');
        html += categorias.map(cat => crearRadioHTML(cat.id, cat.nombre, idActual === cat.id.toString())).join('');

        this.sidebarCategoriasContainer.innerHTML = html;
    },
    /**
     * Actualiza las estrellas de calificación
     */
    updateStarsFilter(rating) {
        this.ratingStars.forEach(star => {
            const starValue = parseInt(star.dataset.value);
            if (starValue <= rating) {
                star.innerText = 'star';
                star.classList.replace('text-gray-300', 'text-yellow-400');
            } else {
                star.innerText = 'star_outline';
                star.classList.replace('text-yellow-400', 'text-gray-300');
            }
        });
        if (this.ratingInput) this.ratingInput.value = rating || '';
    },

    setLoading(isLoading) {
        if (this.grid) {
            this.grid.style.opacity = isLoading ? '0.4' : '1';
            this.grid.style.pointerEvents = isLoading ? 'none' : 'auto';
        }
    },
    actualizarEtiquetasFiltros(filtros) {
        const container = document.getElementById('active-filters-container');
        const tagsContainer = document.getElementById('applied-tags');
        if (!container || !tagsContainer) return;

        let html = '';

        // Etiqueta para Precio Mínimo
        if (filtros.minPrice && filtros.minPrice > 0) {
            html += this._crearTagHTML(`Min: Bs. ${filtros.minPrice}`, 'minPrice');
        }

        // Etiqueta para Precio Máximo (solo si es menor al máximo posible, ej: 500)
        if (filtros.maxPrice && filtros.maxPrice < 500) {
            html += this._crearTagHTML(`Max: Bs. ${filtros.maxPrice}`, 'maxPrice');
        }

        // Si hay etiquetas, mostrar el contenedor principal, si no, ocultarlo
        if (html !== '') {
            tagsContainer.innerHTML = html;
            container.classList.remove('hidden');
        } else {
            container.classList.add('hidden');
        }
    },

    // Función auxiliar para el diseño de la etiqueta
    _crearTagHTML(texto, tipo) {
        return `
        <span class="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full border border-primary/20">
            ${texto}
            <button onclick="window.catalogoController.eliminarFiltro('${tipo}')" class="flex items-center hover:text-red-500 transition-colors">
                <span class="material-icons text-xs">close</span>
            </button>
        </span>
    `;
    }
};