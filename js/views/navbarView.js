import { ProductosModel } from '../models/productoModel.js';
export const NavbarView = {
    CONFIG: {
        WHATSAPP_FARMACIA: "67540115" // Tu número aquí
    },
    _datosCompletos: [],

    render(padresConHijas, hijasNavbar) {
        this._datosCompletos = padresConHijas;
        this._renderHorizontalLinks(hijasNavbar);
        this._renderDropdownAcordeon(padresConHijas);
        // Cambiamos: ahora le pasamos 'hijasNavbar' (las 5 del nav)
        this._renderMobileAccordion(hijasNavbar);
        this._initEventListeners();
    },
    _renderMobileAccordion(hijas) {
        const container = document.getElementById('mobile-accordion-links');
        if (!container) return;

        // Renderizamos los mismos 5 links del Nav
        container.innerHTML = hijas.map(cat => `
        <div class="border-b border-gray-100 last:border-0">
            <a href="${cat.link}" class="flex items-center justify-between px-6 py-4 hover:bg-gray-50 text-sm font-bold text-gray-700 uppercase transition-colors hover:text-primary">
                ${cat.nombre}
                <span class="material-icons text-gray-300 text-sm">chevron_right</span>
            </a>
        </div>
    `).join('');
    },
    _renderHorizontalLinks(hijas) {
        const container = document.getElementById('main-nav-links');
        if (!container) return;
        container.innerHTML = `
            <a class="text-white hover:text-white/90 hover:bg-white/10 px-3 py-2 rounded-md text-sm font-medium transition-all relative group" href="index.html">
                INICIO
                <span class="absolute bottom-1.5 left-3 right-3 h-0.5 bg-secondary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></span>
            </a>
        `;
        hijas.forEach(cat => {
            container.insertAdjacentHTML('beforeend', `
                <a class="text-white hover:text-white/90 hover:bg-white/10 px-3 py-2 rounded-md text-sm font-medium transition-all relative group uppercase tracking-tighter" href="${cat.link}">
                    ${cat.nombre}
                    <span class="absolute bottom-1.5 left-3 right-3 h-0.5 bg-secondary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></span>
                </a>
            `);
        });
    },

    _renderDropdownAcordeon(padres) {
        const container = document.getElementById('dropdown-links-container');
        if (!container) return;

        container.className = "py-2 max-h-[70vh] overflow-y-auto scrollbar-hide";
        container.innerHTML = '';

        padres.forEach(padre => {
            const wrapper = document.createElement('div');
            wrapper.className = "border-b border-gray-50 last:border-0";

            // Añadimos 'padre-link' al span del nombre
            wrapper.innerHTML = `
            <div class="flex items-center justify-between px-4 py-3 hover:bg-gray-50 cursor-pointer group padre-trigger" data-id="${padre.id}" data-nombre="${padre.nombre}">
                <span class="padre-link text-sm font-bold text-gray-700 group-hover:text-primary transition-colors uppercase tracking-tight">
                    ${padre.nombre}
                </span>
                <span class="material-icons text-gray-400 group-hover:text-primary transition-transform duration-300 arrow-icon pointer-events-none">expand_more</span>
            </div>
            
            <div class="hidden bg-gray-50/50 flex-col overflow-hidden" id="collapse-${padre.id}">
                ${padre.subcategorias.map(hija => `
                    <div class="flex items-center justify-between pl-8 pr-4 py-2.5 hover:bg-white cursor-pointer group/hija hija-trigger" 
                         data-nombre="${hija.nombre}" data-id="${hija.id}">
                        <span class="text-xs font-medium text-gray-500 group-hover/hija:text-primary transition-colors pointer-events-none">
                            ${hija.nombre}
                        </span>
                        <span class="material-icons text-base text-gray-300 opacity-0 group-hover/hija:opacity-100 transition-all pointer-events-none">chevron_right</span>
                    </div>
                `).join('')}
            </div>
        `;
            container.appendChild(wrapper);
        });

        this._injectSubMenuContainer();
    },

    _injectSubMenuContainer() {
        if (document.getElementById('sub-menu-products')) return;
        const parentMenu = document.getElementById('categories-dropdown-menu');
        parentMenu.classList.add('overflow-visible');

        const subMenu = document.createElement('div');
        subMenu.id = 'sub-menu-products';
        // Ensanchamos a 550px para dar más aire a las tarjetas
        subMenu.className = "absolute top-0 left-full ml-4 w-[550px] bg-white shadow-[0_20px_50px_rgba(0,0,0,0.15)] rounded-[2.5rem] border border-gray-100 hidden z-[100] h-[600px] flex flex-col overflow-hidden transition-all duration-300";
        parentMenu.appendChild(subMenu);
    },

    _initEventListeners() {
        const toggle = document.getElementById('categories-toggle');
        const menu = document.getElementById('categories-dropdown-menu');
        const arrow = document.getElementById('categories-arrow');
        const subMenu = document.getElementById('sub-menu-products');

        // Toggle del botón Burger / Categorías (Desktop)
        if (toggle) {
            toggle.onclick = (e) => {
                e.stopPropagation();
                if (menu.classList.contains('hidden')) {
                    menu.classList.remove('hidden');
                    setTimeout(() => {
                        menu.classList.replace('opacity-0', 'opacity-100');
                        menu.classList.replace('scale-95', 'scale-100');
                    }, 10);
                    arrow?.classList.add('rotate-180');
                } else {
                    this._closeAll(menu, subMenu, arrow);
                }
            };
        }

        document.addEventListener('click', (e) => {
            // --- LÓGICA ESCRITORIO (Acordeón y Preview) ---
            const padreBtn = e.target.closest('.padre-trigger');
            if (padreBtn) {
                e.stopPropagation();
                if (e.target.classList.contains('padre-link')) {
                    window.location.href = `productos.html?categoria=${encodeURIComponent(padreBtn.dataset.nombre)}`;
                    return;
                }
                const id = padreBtn.dataset.id;
                const collapse = document.getElementById(`collapse-${id}`);
                const arrowIcon = padreBtn.querySelector('.arrow-icon');
                collapse?.classList.toggle('hidden');
                arrowIcon?.classList.toggle('rotate-180');
                return;
            }

            const hijaBtn = e.target.closest('.hija-trigger');
            if (hijaBtn) {
                e.stopPropagation();
                this._showProductsPreview(hijaBtn.dataset.id, hijaBtn.dataset.nombre);
                return;
            }

            // Cerrar menús de escritorio si se hace click fuera
            if (menu && !menu.contains(e.target) && e.target !== toggle) {
                this._closeAll(menu, subMenu, arrow);
            }
        });
    },
    async _showProductsPreview(idHija, nombreHija) {
        const subMenu = document.getElementById('sub-menu-products');
        if (!subMenu) return;

        subMenu.classList.remove('hidden');
        setTimeout(() => {
            subMenu.classList.remove('opacity-0', 'translate-x-4');
            subMenu.classList.add('opacity-100', 'translate-x-0');
        }, 10);

        subMenu.innerHTML = `
        <div class="p-4 border-b border-gray-50 bg-primary text-white flex justify-between items-center shrink-0">
            <div>
                <p class="text-[8px] opacity-80 uppercase tracking-widest">Explorando</p>
                <h4 class="font-bold text-[11px] uppercase tracking-wider truncate">${nombreHija}</h4>
            </div>
            <button class="hover:bg-white/20 rounded-full p-1.5 transition-colors flex items-center justify-center close-sub-btn">
                <span class="material-icons text-sm">close</span>
            </button>
        </div>
        
        <div class="p-4 grid grid-cols-2 gap-4 overflow-y-auto flex-grow bg-white scrollbar-hide items-start align-content-start" id="modal-products-content">
        </div>

        <div class="p-4 bg-gray-50/80 border-t shrink-0">
            <a href="productos.html?categoria=${encodeURIComponent(nombreHija)}" class="group block w-full text-center bg-[#0f172a] text-white text-[10px] font-bold py-3 rounded-xl hover:bg-primary transition-all uppercase tracking-widest shadow-md">
                Ver todos los productos <span class="ml-1 inline-block group-hover:translate-x-1 transition-transform">→</span>
            </a>
        </div>
    `;

        subMenu.querySelector('.close-sub-btn').onclick = () => {
            subMenu.classList.add('opacity-0', 'translate-x-4');
            setTimeout(() => subMenu.classList.add('hidden'), 300);
        };

        try {
            const productos = await ProductosModel.fetchBySubcategoriaId(idHija, 8);
            this._renderRealProducts(productos);
        } catch (error) {
            console.error(error);
        }
    },

    _renderRealProducts(productos) {
        const content = document.getElementById('modal-products-content');
        if (!content) return;

        if (!productos || productos.length === 0) {
            content.innerHTML = `<div class="col-span-2 text-center py-10 opacity-30 text-[10px] font-bold uppercase tracking-widest">Sin productos</div>`;
            return;
        }

        content.innerHTML = productos.map(prod => {
            const precioHTML = prod.mostrar_precio
                ? `<p class="text-[14px] text-primary font-black mt-1">Bs. ${Number(prod.precio).toLocaleString()}</p>`
                : '';

            const btnCarrito = prod.mostrar_precio
                ? `<button class="btn-add-cart flex-[3] flex items-center justify-center gap-1 bg-primary text-white py-2.5 rounded-2xl transition-all duration-500 group/cart shadow-sm active:scale-95 overflow-hidden px-2 min-w-0"
                    data-id="${prod.id}" 
                    data-nombre="${prod.nombre}" 
                    data-precio="${prod.precio}" 
                    data-imagen="${prod.imagen_url}">
                    <span class="material-icons text-base shrink-0">shopping_cart</span>
                    <div class="max-w-[45px] group-hover/cart:max-w-[160px] transition-all duration-500 ease-in-out overflow-hidden">
                        <span class="text-[9px] font-bold uppercase whitespace-nowrap block px-1">
                            <span class="group-hover/cart:hidden">Añadir</span>
                            <span class="hidden group-hover/cart:inline">Añadir al Carrito</span>
                        </span>
                    </div>
                </button>`
                : '';

            const btnWhatsapp = prod.habilitar_whatsapp
                ? `<a href="https://wa.me/59167540115?text=Información sobre: ${prod.nombre}" target="_blank" 
                    class="flex-1 flex items-center justify-center border-2 border-[#25D366] text-[#25D366] py-2.5 rounded-2xl hover:flex-[4] hover:bg-[#25D366] hover:text-white transition-all duration-500 group/ws active:scale-95 overflow-hidden px-2 min-w-0">
                    <div class="flex items-center shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" class="shrink-0">
                            <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.06 3.978l-1.125 4.105 4.198-1.102a7.847 7.847 0 0 0 3.858 1.018h.004c4.368 0 7.926-3.558 7.93-7.93a7.898 7.898 0 0 0-2.33-5.59zM7.994 14.166a6.522 6.522 0 0 1-3.332-.915l-.239-.142-2.481.651.662-2.419-.156-.248a6.513 6.513 0 0 1-1.001-3.418c0-3.601 2.939-6.54 6.543-6.541a6.513 6.513 0 0 1 4.62 1.917 6.513 6.513 0 0 1 1.92 4.626c-.002 3.602-2.941 6.541-6.541 6.541zM11.523 9.471c-.193-.097-1.144-.564-1.321-.628-.176-.065-.305-.097-.433.097-.128.194-.497.628-.609.756-.112.129-.224.144-.417.047-.193-.097-.816-.301-1.554-.959-.575-.513-.962-1.147-1.075-1.341-.112-.194-.012-.299.086-.395.087-.087.193-.225.29-.338.096-.113.128-.193.193-.322.064-.13.032-.242-.016-.339-.049-.097-.433-1.044-.593-1.428-.157-.376-.312-.326-.432-.332-.11-.006-.237-.007-.364-.007-.127 0-.333.048-.507.237-.174.189-.665.65-.665 1.585 0 .935.68 1.838.775 1.967.095.129 1.339 2.045 3.245 2.87.453.197.807.315 1.082.402.455.144.869.124 1.196.075.365-.054 1.144-.468 1.305-1.196.162-.728.162-1.352.113-1.481-.049-.129-.177-.193-.37-.29z"/>
                        </svg>
                    </div>
                    <div class="max-w-0 group-hover/ws:max-w-[100px] transition-all duration-500 ease-in-out overflow-hidden">
                        <span class="text-[9px] font-bold uppercase whitespace-nowrap ml-1 block">Consultar</span>
                    </div>
                   </a>`
                : '';

            const accionesHTML = (btnCarrito || btnWhatsapp)
                ? `<div class="flex items-center gap-1.5 mt-4 w-full h-11">
                    ${btnCarrito}
                    ${btnWhatsapp}
                   </div>`
                : '';

            // CAMBIO: Se envuelve el contenido superior en un <a> para redirigir al detalle
            return `
            <div class="flex flex-col p-4 bg-white border border-gray-100 rounded-[2.5rem] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group w-full">
                <a href="detalle_producto.html?id=${prod.id}" class="block cursor-pointer flex-grow">
                    <div class="w-full h-36 mb-4 flex items-center justify-center overflow-hidden rounded-3xl bg-gray-50/50">
                        <img src="${prod.imagen_url}" 
                             class="w-full h-full object-contain p-3 group-hover:scale-110 transition-transform duration-700" 
                             onerror="this.src='https://via.placeholder.com/200'">
                    </div>
                    
                    <div class="px-1">
                        <h3 class="text-[12px] font-extrabold text-[#1e293b] leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                            ${prod.nombre}
                        </h3>
                        <p class="text-[10px] text-slate-400 mt-2 line-clamp-2 leading-relaxed font-medium min-h-[30px]">
                            ${prod.descripcion || 'Sin descripción disponible.'}
                        </p>
                        ${precioHTML}
                    </div>
                </a>
                
                ${accionesHTML}
            </div>
        `;
        }).join('');
    },

    _closeAll(menu, subMenu, arrow) {
        menu.classList.replace('opacity-100', 'opacity-0');
        menu.classList.replace('scale-100', 'scale-95');
        subMenu?.classList.add('hidden', 'opacity-0', 'translate-x-4');
        arrow?.classList.remove('rotate-180');
        setTimeout(() => {
            menu.classList.add('hidden');
            // Cerrar acordeones al salir
            document.querySelectorAll('[id^="collapse-"]').forEach(el => el.classList.add('hidden'));
            document.querySelectorAll('.arrow-icon').forEach(el => el.classList.remove('rotate-180'));
        }, 300);
    }
};
