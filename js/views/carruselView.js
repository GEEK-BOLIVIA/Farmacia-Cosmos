export const CarruselView = {
    render(carrusel, containerId) {
        const container = document.getElementById(containerId);
        if (!container || !carrusel) return;

        if (container.dataset.initialized !== "true") {
            container.innerHTML = '';
            container.dataset.initialized = "true";
        }

        let html = '';
        switch (carrusel.tipo) {
            case 'banners': html = this._generateHeroSection(carrusel); break;
            case 'productos': html = this._generateProductGrid(carrusel); break;
            case 'categorias': html = this._generateCategoryGrid(carrusel); break;
            default: html = this._generateHeroSection(carrusel);
        }

        container.insertAdjacentHTML('beforeend', html);
        this._initCarouselLogic(carrusel.id, carrusel.tipo);
    },

    _initCarouselLogic(carruselId, tipo) {
        const slider = document.getElementById(`slider-${carruselId}`);
        if (!slider) return;

        // Buscamos el contenedor de puntos específico para este carrusel
        const dotsContainer = document.getElementById(`dots-${carruselId}`);
        const parent = slider.parentElement;

        // 1. Lógica de Autoplay (Solo para Banners)
        if (tipo === 'banners') {
            let isHovered = false;
            parent.addEventListener('mouseenter', () => isHovered = true);
            parent.addEventListener('mouseleave', () => isHovered = false);

            setInterval(() => {
                if (isHovered) return;
                const maxScroll = slider.scrollWidth - slider.clientWidth;

                if (slider.scrollLeft >= maxScroll - 10) {
                    slider.scrollTo({ left: 0, behavior: 'smooth' });
                } else {
                    slider.scrollBy({ left: slider.clientWidth, behavior: 'smooth' });
                }
            }, 5000);
        }

        // 2. Sincronización de Indicadores (Dots) al hacer Scroll
        slider.addEventListener('scroll', () => {
            if (!dotsContainer) return;

            // Calculamos el índice actual
            // Si es banner, el paso es el ancho del slider. 
            // Si es producto/categoría, el paso es el ancho de la tarjeta + gap.
            const firstItem = slider.firstElementChild;
            const step = (tipo === 'banners') ? slider.clientWidth : (firstItem ? firstItem.offsetWidth + 16 : slider.clientWidth);

            const index = Math.round(slider.scrollLeft / step);
            const dots = dotsContainer.querySelectorAll('.dot-indicator');

            dots.forEach((dot, i) => {
                if (i === index) {
                    dot.classList.add('bg-primary', 'w-6', 'md:w-8');
                    dot.classList.remove('bg-gray-300', 'bg-white/60', 'w-2');
                } else {
                    dot.classList.remove('bg-primary', 'w-6', 'md:w-8');
                    dot.classList.add('bg-gray-300', 'w-2');
                }
            });
        });
    },
    scrollToSlide(carruselId, index) {
        const slider = document.getElementById(`slider-${carruselId}`);
        if (slider) {
            slider.scrollTo({
                left: slider.clientWidth * index,
                behavior: 'smooth'
            });
        }
    },

    _renderMedia(item, imgClasses = "w-full h-full object-contain") {
        if (item.imagen && item.imagen.includes('fa-')) {
            return `<i class="${item.imagen} text-3xl md:text-5xl text-gray-600"></i>`;
        }
        return `<img src="${item.imagen || 'https://via.placeholder.com/300'}" alt="${item.titulo}" class="${imgClasses}" loading="lazy">`;
    },

    // BANNERS: Sin texto si los campos están vacíos
    _generateHeroSection(carrusel) {
        window.scrollToSlide = this.scrollToSlide;
        return `
        <section class="relative w-full h-[300px] sm:h-[450px] md:h-[600px] mb-12 group overflow-hidden">
            <div class="flex w-full h-full overflow-x-auto snap-x snap-mandatory no-scrollbar scroll-smooth touch-pan-x" id="slider-${carrusel.id}">
                ${carrusel.items.map(item => {
            // Verificación estricta de contenido
            const hasText = (item.titulo && item.titulo.trim() !== "") || (item.subtitulo && item.subtitulo.trim() !== "");

            return `
                    <div class="w-full flex-shrink-0 h-full snap-center relative">
                        ${item.link ? `<a href="${item.link}" class="block w-full h-full">` : ''}
                        <img class="w-full h-full object-cover" src="${item.imagen}" />
                        ${hasText ? `
                            <div class="absolute inset-0 bg-black/30 flex items-center justify-start px-14 md:px-24">
                                <div class="max-w-2xl text-white pr-10">
                                    ${item.subtitulo ? `<span class="bg-primary px-3 py-1 text-[10px] md:text-xs font-bold uppercase mb-4 inline-block">${item.subtitulo}</span>` : ''}
                                    <h2 class="text-2xl md:text-5xl lg:text-7xl font-black uppercase leading-tight drop-shadow-lg">${item.titulo}</h2>
                                </div>
                            </div>
                        ` : ''}
                        ${item.link ? `</a>` : ''}
                    </div>`;
        }).join('')}
            </div>

            <button onclick="document.getElementById('slider-${carrusel.id}').scrollBy({left: -this.parentElement.offsetWidth, behavior: 'smooth'})"
                class="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 shadow-xl text-black w-10 h-10 flex items-center justify-center z-20 rounded-full">
                <span class="material-icons">chevron_left</span>
            </button>
            <button onclick="document.getElementById('slider-${carrusel.id}').scrollBy({left: this.parentElement.offsetWidth, behavior: 'smooth'})"
                class="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 shadow-xl text-black w-10 h-10 flex items-center justify-center z-20 rounded-full">
                <span class="material-icons">chevron_right</span>
            </button>

            <div class="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 bg-black/20 backdrop-blur-md p-2 rounded-full z-10">
                ${carrusel.items.map((_, i) => `
                    <div onclick="scrollToSlide('${carrusel.id}', ${i})" 
                         class="dot ${i === 0 ? 'bg-primary w-6' : 'bg-white/60 w-2'} h-2 rounded-full cursor-pointer transition-all"></div>
                `).join('')}
            </div>
        </section>
        `;
    },

    _generateProductGrid(carrusel) {
        return `
        <section class="container mx-auto px-4 mb-16 relative">
            <h2 class="text-xl md:text-2xl font-black mb-8 border-l-4 border-primary pl-4 uppercase">${carrusel.nombre}</h2>
            <div class="relative px-2">
                <div class="flex overflow-x-auto snap-x snap-mandatory no-scrollbar scroll-smooth gap-4" id="slider-${carrusel.id}">
                    ${carrusel.items.map(item => `
                        <div class="w-[85vw] sm:w-[calc(50%-1rem)] lg:w-[calc(25%-1rem)] flex-shrink-0 snap-center bg-white border p-4 rounded-xl shadow-sm">
                            <div class="h-48 mb-4 flex items-center justify-center bg-gray-50 rounded-lg overflow-hidden">
                                ${this._renderMedia(item, "max-h-full object-contain")}
                            </div>
                            <h3 class="font-bold text-gray-800 uppercase text-xs truncate">${item.titulo}</h3>
                            <p class="text-primary font-black text-xl my-2">${item.subtitulo}</p>
                            <a href="${item.link}" class="block w-full text-center bg-gray-900 text-white py-2 rounded-lg font-bold text-[10px] hover:bg-primary uppercase transition-colors">Ver Detalles</a>
                        </div>`).join('')}
                </div>
                <button onclick="document.getElementById('slider-${carrusel.id}').scrollBy({left: -slider.clientWidth, behavior: 'smooth'})"
                    class="absolute -left-4 top-1/2 bg-white shadow-md border w-8 h-8 flex items-center justify-center z-20 rounded-full"><span class="material-icons">chevron_left</span></button>
                <button onclick="document.getElementById('slider-${carrusel.id}').scrollBy({left: slider.clientWidth, behavior: 'smooth'})"
                    class="absolute -right-4 top-1/2 bg-white shadow-md border w-8 h-8 flex items-center justify-center z-20 rounded-full"><span class="material-icons">chevron_right</span></button>
            </div>
            <div class="flex justify-center gap-2 mt-6">
                ${carrusel.items.map((_, i) => `<div class="dot ${i === 0 ? 'bg-primary w-6' : 'bg-gray-300 w-2'} h-2 rounded-full transition-all"></div>`).join('')}
            </div>
        </section>
        `;
    },

    _generateCategoryGrid(carrusel) {
        return `
    <section class="container mx-auto px-4 mb-16 relative" id="section-${carrusel.id}">
        <h2 class="text-center text-xl md:text-2xl font-black mb-10 uppercase">${carrusel.nombre}</h2>
        <div class="relative px-10">
            <div class="flex overflow-x-auto snap-x snap-mandatory no-scrollbar scroll-smooth gap-4 md:gap-10" id="slider-${carrusel.id}">
                ${carrusel.items.map(item => {
            // CONSTRUCCIÓN DEL LINK: 
            // Si el item tiene un nombre de categoría, forzamos la ruta al catálogo
            const destino = `productos.html?categoria=${encodeURIComponent(item.titulo)}`;

            return `
                    <a href="${destino}" class="flex-shrink-0 w-24 md:w-36 text-center group snap-center">
                        <div class="w-20 h-20 md:w-32 md:h-32 rounded-full bg-gray-50 border-2 border-transparent group-hover:border-primary flex items-center justify-center mx-auto transition-all shadow-inner overflow-hidden mb-3">
                            ${this._renderMedia(item, "w-1/2 h-1/2 object-contain group-hover:scale-110 transition-transform")}
                        </div>
                        <span class="text-[9px] md:text-xs font-black uppercase text-gray-600 group-hover:text-primary tracking-widest block leading-tight">
                            ${item.titulo}
                        </span>
                    </a>`;
        }).join('')}
            </div>
            </div>
        </section>
    `;
    }
};