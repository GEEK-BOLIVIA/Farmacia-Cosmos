// js/views/searchView.js
export const SearchView = {
    elements: {},
    templates: {},

    async init() {
        this.elements = {
            input: document.getElementById('search-input'),
            modal: document.getElementById('search-results-modal'),
            clearBtn: document.getElementById('clear-search'),
            productsCont: document.getElementById('suggested-products'),
            brandsCont: document.getElementById('suggested-brands'), // Contenedor para subcategorías
            catsCont: document.getElementById('suggested-categories')
        };
        await this.cargarTemplates();
    },

    async cargarTemplates() {
        try {
            const res = await fetch('components/buscador_resultados.html');
            const html = await res.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            
            this.templates = {
                product: doc.getElementById('template-search-product'),
                category: doc.getElementById('template-search-category'),
                subcategory: doc.getElementById('template-search-subcategory')
            };
        } catch (error) {
            console.error("[SearchView] Error al cargar templates:", error);
        }
    },

    render(prods, cats, subs) {
        this.limpiarContenedores();

        // Usamos DocumentFragments para minimizar el "reflow" del navegador (máxima velocidad)
        const prodsFrag = document.createDocumentFragment();
        const catsFrag = document.createDocumentFragment();
        const subsFrag = document.createDocumentFragment();

        // 1. Procesar Productos
        if (prods.length > 0) {
            prods.forEach(p => {
                const clone = this.templates.product.content.cloneNode(true);
                
                const link = clone.querySelector('a');
                link.href = `detalle_producto.html?id=${p.id}`;
                
                const img = clone.querySelector('.search-img');
                img.src = p.imagen_url || 'assets/img/placeholder.png';
                img.onerror = () => { img.src = 'assets/img/placeholder.png'; };

                clone.querySelector('.search-name').textContent = p.nombre;
                clone.querySelector('.search-price').textContent = `Bs. ${Number(p.precio).toLocaleString('es-BO', { minimumFractionDigits: 2 })}`;
                
                prodsFrag.appendChild(clone);
            });
            this.elements.productsCont.appendChild(prodsFrag);
        } else {
            this.elements.productsCont.innerHTML = `
                <div class="p-8 text-center text-gray-400 w-full">
                    <p class="text-xs italic">No se encontraron productos</p>
                </div>`;
        }

        // 2. Procesar Categorías Padre
        if (cats.length > 0) {
            cats.forEach(c => {
                const clone = this.templates.category.content.cloneNode(true);
                const link = clone.querySelector('a');
                link.href = `productos.html?categoria=${encodeURIComponent(c.nombre)}`;
                link.textContent = c.nombre;
                catsFrag.appendChild(clone);
            });
            this.elements.catsCont.appendChild(catsFrag);
        }

        // 3. Procesar Subcategorías
        if (subs.length > 0) {
            subs.forEach(s => {
                const clone = this.templates.subcategory.content.cloneNode(true);
                const link = clone.querySelector('a');
                link.href = `productos.html?subcategoria=${encodeURIComponent(s.nombre)}`;
                
                link.innerHTML = `
                    <div class="flex flex-col py-1">
                        <span class="font-bold text-gray-700 dark:text-gray-200">${s.nombre}</span>
                        <span class="text-[10px] text-primary uppercase font-black opacity-70">En ${s.padreNombre}</span>
                    </div>
                `;
                subsFrag.appendChild(clone);
            });
            this.elements.brandsCont.appendChild(subsFrag);
        }

        this.toggleModal(true);
    },

    limpiarContenedores() {
        this.elements.productsCont.innerHTML = '';
        this.elements.catsCont.innerHTML = '';
        this.elements.brandsCont.innerHTML = '';
    },

    toggleModal(show) {
        if (!this.elements.modal) return;

        if (show) {
            this.elements.modal.classList.remove('hidden');
            // Añadimos una transición suave si usas Tailwind
            this.elements.modal.classList.add('opacity-100'); 
            document.body.style.overflow = 'hidden'; 
        } else {
            this.elements.modal.classList.add('hidden');
            document.body.style.overflow = ''; 
        }
        
        this.elements.clearBtn?.classList.toggle('hidden', !this.elements.input.value);
    },

    setLoading(isLoading) {
        if (isLoading) {
            this.limpiarContenedores();
            this.elements.productsCont.innerHTML = `
                <div class="flex flex-col items-center justify-center p-10 w-full gap-2">
                    <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                    <p class="text-[10px] text-gray-400 uppercase tracking-widest">Buscando...</p>
                </div>`;
        }
    }
};