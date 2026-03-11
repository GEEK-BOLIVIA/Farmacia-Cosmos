import { MediaHelper } from './mediaHelper.js';

/**
 * ZoomHelper: Gestiona el modal de visualización en alta resolución,
 * navegación de galería interna y reproducción de video.
 */
export const ZoomHelper = {
    modal: null,
    modalImagen: null,
    modalMediaContainer: null,
    thumbContainer: null,
    recursos: [],
    indiceActual: 0,
    galeriaVisible: true,

    /**
     * Inicializa las referencias del DOM y vincula eventos globales.
     */
    init() {
        this.modal = document.getElementById("modal-zoom-container");
        this.modalMediaContainer = document.getElementById("modal-media-content");
        this.modalImagen = document.getElementById("modalImagen");
        this.thumbContainer = document.getElementById("modal-thumbs-list");

        const cerrarBtn = document.getElementById("cerrar-modal");
        const prevBtn = document.getElementById("modal-prev");
        const nextBtn = document.getElementById("modal-next");
        const toggleBtn = document.getElementById("modal-toggle-gallery");

        if (!this.modal) return;

        // --- Navegación y Controles ---
        cerrarBtn.onclick = () => this.cerrar();

        prevBtn.onclick = (e) => {
            e.stopPropagation();
            this.navegar(-1);
        };

        nextBtn.onclick = (e) => {
            e.stopPropagation();
            this.navegar(1);
        };

        // Dentro de ZoomHelper.init()...
        if (toggleBtn) {
            toggleBtn.onclick = (e) => {
                e.stopPropagation();
                this.galeriaVisible = !this.galeriaVisible;

                // Ocultar/Mostrar contenedor de miniaturas
                this.thumbContainer.classList.toggle('hidden', !this.galeriaVisible);

                // IMPORTANTE: Forzamos el texto y aseguramos la clase
                toggleBtn.textContent = this.galeriaVisible ? 'grid_view' : 'grid_off';

                // Si el icono se vuelve texto, es porque perdió la fuente. 
                // Esta línea asegura que el navegador lo trate como icono:
                toggleBtn.classList.add('material-icons');
            };
        }

        // Cerrar al hacer click fuera del contenido (en el overlay)
        this.modal.onclick = (e) => {
            if (e.target === this.modal) this.cerrar();
        };

        // --- Lógica de Zoom (Efecto Lupa) ---
        this.modalMediaContainer.onmousemove = (e) => {
            // Solo aplicar zoom si la imagen principal está visible (no es un video)
            if (!this.modalImagen.classList.contains('hidden')) {
                const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
                const x = ((e.pageX - left) / width) * 100;
                const y = ((e.pageY - top) / height) * 100;
                this.modalImagen.style.transformOrigin = `${x}% ${y}%`;
                this.modalImagen.style.transform = "scale(2)";
            }
        };

        this.modalMediaContainer.onmouseleave = () => {
            this.modalImagen.style.transform = "scale(1)";
        };

        // Atajos de teclado
        document.addEventListener('keydown', (e) => {
            if (this.modal.classList.contains('hidden')) return;
            if (e.key === 'Escape') this.cerrar();
            if (e.key === 'ArrowLeft') this.navegar(-1);
            if (e.key === 'ArrowRight') this.navegar(1);
        });
    },

    /**
     * Abre el modal cargando la galería del producto.
     */
    abrir(galeriaCompleta, indexInicial) {
        this.recursos = galeriaCompleta;
        this.indiceActual = indexInicial;

        this.modal.classList.replace("hidden", "flex");
        document.body.style.overflow = "hidden"; // Bloquear scroll de la página de fondo

        this.renderThumbnails();
        this.actualizarVistaModal();
    },

    /**
     * Cambia entre recursos (imágenes/videos).
     */
    navegar(direccion) {
        this.indiceActual = (this.indiceActual + direccion + this.recursos.length) % this.recursos.length;
        this.actualizarVistaModal();
    },

    /**
     * Renderiza el recurso actual (Imagen o Video) ajustando el tamaño.
     */
    actualizarVistaModal() {
        const recurso = this.recursos[this.indiceActual];
        const info = MediaHelper.obtenerInfoVideo(recurso.url);

        // Limpiar video anterior si existía para evitar duplicados o audio fantasma
        const videoAnterior = this.modalMediaContainer.querySelector('.video-wrapper-modal');
        if (videoAnterior) videoAnterior.remove();

        if (info.tipo === 'imagen') {
            this.modalImagen.src = recurso.url;
            this.modalImagen.classList.remove('hidden');
        } else {
            // Es un video: Ocultamos imagen y creamos un contenedor seguro para el reproductor
            this.modalImagen.classList.add('hidden');
            const videoHTML = `
                <div class="video-wrapper-modal w-full h-full p-4 md:p-8 flex items-center justify-center bg-black/20">
                    ${MediaHelper.renderVideoPlayer(recurso.url)}
                </div>`;
            this.modalMediaContainer.insertAdjacentHTML('beforeend', videoHTML);
        }

        this.actualizarMiniaturasActivas();
    },

    /**
     * Genera la lista de miniaturas inferior.
     */
    renderThumbnails() {
        this.thumbContainer.innerHTML = this.recursos.map((rec, i) => {
            const info = MediaHelper.obtenerInfoVideo(rec.url);
            return `
                <div class="modal-thumb-card w-16 h-16 md:w-20 md:h-20 flex-shrink-0 rounded-xl overflow-hidden cursor-pointer border-2 transition-all bg-black relative" data-idx="${i}">
                    <img src="${info.thumb}" class="w-full h-full object-cover pointer-events-none">
                    ${info.tipo !== 'imagen' ? `
                        <div class="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <span class="material-icons text-white text-xs">play_circle</span>
                        </div>` : ''}
                </div>
            `;
        }).join('');

        this.thumbContainer.querySelectorAll('.modal-thumb-card').forEach(card => {
            card.onclick = (e) => {
                e.stopPropagation();
                this.indiceActual = parseInt(card.dataset.idx);
                this.actualizarVistaModal();
            };
        });
    },

    /**
     * Resalta la miniatura que se está visualizando.
     */
    actualizarMiniaturasActivas() {
        this.thumbContainer.querySelectorAll('.modal-thumb-card').forEach((item, i) => {
            const esActivo = i === this.indiceActual;
            item.classList.toggle('border-primary', esActivo);
            item.classList.toggle('border-transparent', !esActivo);
            item.classList.toggle('scale-110', esActivo);
            item.classList.toggle('opacity-100', esActivo);
            item.classList.toggle('opacity-50', !esActivo);
        });
    },

    /**
     * Cierra el modal y limpia recursos pesados.
     */
    cerrar() {
        this.modal.classList.replace("flex", "hidden");
        document.body.style.overflow = "auto";

        // Remover video para detener la reproducción inmediatamente
        const video = this.modalMediaContainer.querySelector('.video-wrapper-modal');
        if (video) video.remove();

        this.modalImagen.src = "";
    }
};