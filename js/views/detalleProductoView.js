import { MediaHelper } from '../utils/mediaHelper.js';

export const detalleProductoView = {
    CONFIG: {
        WHATSAPP_FARMACIA: "67540115" // Tu número aquí
    },
    elements: {
        breadcrumbPadre: document.getElementById('breadcrumb-padre-item'),
        linkPadre: document.getElementById('breadcrumb-categoria-padre-link'),
        linkSub: document.getElementById('breadcrumb-categoria-link'),
        spanNombre: document.getElementById('breadcrumb-producto-nombre'),
        mainContainer: document.getElementById('detalle-producto-container')
    },

    renderBreadcrumbs(p) {
        const { breadcrumbPadre, linkPadre, linkSub, spanNombre } = this.elements;
        if (breadcrumbPadre && linkPadre) {
            // Validamos que el padre no sea igual a la categoría actual
            if (p.categoria_padre && p.categoria_padre !== p.categoria_actual) {
                linkPadre.textContent = p.categoria_padre;
                linkPadre.href = `productos.html?categoria=${encodeURIComponent(p.categoria_padre)}`;

                breadcrumbPadre.classList.remove('hidden');
                breadcrumbPadre.style.display = 'inline-flex';
            } else {
                breadcrumbPadre.classList.add('hidden');
                breadcrumbPadre.style.display = 'none';
            }
        }

        // NIVEL 2: CATEGORÍA ACTUAL (Hija)
        if (linkSub) {
            linkSub.textContent = p.categoria_actual;
            linkSub.href = `productos.html?categoria=${encodeURIComponent(p.categoria_actual)}`;
        }

        // NIVEL 3: NOMBRE DEL PRODUCTO
        if (spanNombre) {
            spanNombre.textContent = p.nombre;
        }
    },

    renderContenido(p) {
        const agotado = p.stock <= 0;
        const mostrarPrecio = p.mostrar_precio !== false;
        const habilitarWS = p.habilitar_whatsapp === true;

        this.elements.mainContainer.innerHTML = `
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
                
                <div class="flex flex-col gap-6 w-full">
                    <div id="main-display" class="relative w-full bg-[#FAFAFA] dark:bg-gray-800 rounded-[2.5rem] aspect-square flex items-center justify-center overflow-hidden border border-gray-100 dark:border-gray-700 shadow-inner group">
                        ${this.getMediaHTML(p.multimedia[0]?.url)}
                    </div>
                    
                    <div class="flex items-center gap-4 px-2">
                        <button id="prev-btn" class="w-12 h-12 shrink-0 rounded-full bg-white dark:bg-gray-800 shadow-md hover:bg-primary hover:text-white transition-all flex items-center justify-center">
                            <span class="material-icons">chevron_left</span>
                        </button>

                        <div id="thumbs-list" class="flex gap-3 overflow-x-auto scrollbar-hide py-2 snap-x w-full">
                            ${p.multimedia.map((item, i) => {
            const info = MediaHelper.obtenerInfoVideo(item.url);
            return `
                                <div class="thumb-item w-20 h-20 rounded-2xl border-2 shrink-0 overflow-hidden cursor-pointer snap-center transition-all duration-300 ${i === 0 ? 'border-primary' : 'border-transparent opacity-70'}" data-index="${i}">
                                    <img src="${info.thumb}" class="w-full h-full object-cover pointer-events-none">
                                </div>`;
        }).join('')}
                        </div>

                        <button id="next-btn" class="w-12 h-12 shrink-0 rounded-full bg-white dark:bg-gray-800 shadow-md hover:bg-primary hover:text-white transition-all flex items-center justify-center">
                            <span class="material-icons">chevron_right</span>
                        </button>
                    </div>
                </div>

                <div class="flex flex-col space-y-8">
                    <div>
                        <span class="text-primary font-bold uppercase tracking-[0.2em] text-xs">${p.categoria_actual}</span>
                        <h1 class="text-4xl lg:text-5xl font-extrabold text-gray-900 dark:text-white mt-3 leading-tight">${p.nombre}</h1>
                    </div>

                    <div class="bg-gray-50 dark:bg-gray-800/40 p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-700/50">
                        <div class="flex flex-col">
                            ${mostrarPrecio ? `<span class="text-5xl font-black text-primary tracking-tight">Bs. ${Number(p.precio).toLocaleString()}</span>` : ''}
                            <div class="flex items-center gap-2 mt-3">
                                <span class="w-2 h-2 rounded-full ${agotado ? 'bg-red-500' : 'bg-green-500'}"></span>
                                <p class="text-sm font-bold ${agotado ? 'text-red-500' : 'text-gray-500'}">${agotado ? 'PRODUCTO AGOTADO' : `DISPONIBLE: ${p.stock} unidades`}</p>
                            </div>
                        </div>
                        
                        <div class="flex flex-col gap-4 mt-8">
                            ${mostrarPrecio ? `
                                <div class="flex flex-wrap sm:flex-nowrap gap-4">
                                    <div class="flex items-center border-2 border-gray-200 dark:border-gray-700 rounded-2xl bg-white dark:bg-gray-900 h-16 overflow-hidden min-w-[140px]">
                                        <button id="btn-menos" class="flex-1 h-full hover:bg-gray-50 dark:hover:bg-gray-800 font-bold text-xl">-</button>
                                        <span id="cant-num" class="w-12 text-center font-bold text-lg">1</span>
                                        <button id="btn-mas" class="flex-1 h-full hover:bg-gray-50 dark:hover:bg-gray-800 font-bold text-xl">+</button>
                                    </div>
                                   <button 
                                        id="btn-add-cart"
                                        class="btn-add-cart flex-grow bg-primary hover:bg-primary-dark text-white font-bold rounded-2xl h-16 shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-95"
                                        data-id="${p.id}"
                                        data-nombre="${p.nombre}"
                                        data-precio="${p.precio}"
                                        data-imagen="${p.multimedia[0]?.url || ''}"
                                        ${agotado ? 'disabled' : ''}
                                    >
                                        <span class="material-icons">shopping_cart</span> AÑADIR AL CARRITO
                                    </button>
                                </div>
                            ` : ''}

                            ${habilitarWS ? `
                                <a href="https://wa.me/591${this.CONFIG.WHATSAPP_FARMACIA}?text=Hola, solicito información de: ${encodeURIComponent(p.nombre)}" 
                                   target="_blank"
                                   class="w-full bg-[#25D366] hover:bg-[#128C7E] text-white font-bold rounded-2xl h-16 shadow-lg flex items-center justify-center gap-3 transition-all active:scale-[0.98]">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 448 512" fill="currentColor">
                                        <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-5.5-2.8-23.4-8.6-44.5-27.4-16.4-14.6-27.5-32.7-30.7-38.2-3.2-5.6-.3-8.6 2.5-11.3 2.5-2.5 5.5-6.5 8.3-9.7 2.8-3.3 3.7-5.6 5.5-9.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 13.2 5.8 23.5 9.2 31.6 11.8 13.3 4.2 25.4 3.6 35 2.2 10.7-1.5 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/>
                                    </svg>
                                    CONSULTAR POR WHATSAPP
                                </a>
                            ` : ''}
                        </div>
                    </div>

                    <div class="space-y-4">
                        <div class="flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-2">
                            <span class="material-icons text-primary">description</span>
                            <h3 class="text-lg font-bold text-gray-800 dark:text-gray-200 uppercase tracking-widest text-sm">Descripción</h3>
                        </div>
                        <p class="text-gray-600 dark:text-gray-400 leading-relaxed text-lg font-light">${p.descripcion || 'Sin descripción.'}</p>
                    </div>
                </div>
            </div>
        `;
    },

    getMediaHTML(url) {
        if (!url) return `<div class="p-10 text-gray-400">Sin imagen</div>`;
        const info = MediaHelper.obtenerInfoVideo(url);
        return info.tipo === 'imagen'
            ? `<img src="${url}" class="w-full h-full object-contain zoom-imagen cursor-zoom-in animate-fadeIn">`
            : MediaHelper.renderVideoPlayer(url);
    }
};