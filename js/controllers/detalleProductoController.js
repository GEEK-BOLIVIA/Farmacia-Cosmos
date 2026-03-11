import { detalleProductoModel } from '../models/detalleProductoModel.js';
import { detalleProductoView } from '../views/detalleProductoView.js';
import { ZoomHelper } from '../utils/zoomHelper.js';
import { MediaHelper } from '../utils/mediaHelper.js';

export const detalleProductoController = {
    productoActual: null,
    indiceImagen: 0,

    async init() {
        const params = new URLSearchParams(window.location.search);
        const id = params.get('id');
        const categoriaUrl = params.get('categoria');

        if (!id) return;

        try {
            // Mostramos skeleton antes de la carga
            if (detalleProductoView.renderSkeleton) detalleProductoView.renderSkeleton();

            const data = await detalleProductoModel.getProductoCompleto(id, categoriaUrl);
            if (!data) return;

            this.productoActual = data;

            // Renderizado
            detalleProductoView.renderBreadcrumbs(data);
            detalleProductoView.renderContenido(data);

            this.setupGalleryEvents();
            if (data.mostrar_precio !== false) this.setupQuantityEvents();

            document.title = `Farmacia Cosmos - ${data.nombre}`;

        } catch (error) {
            console.error("Error crítico en init:", error);
        }
    },
    setupGalleryEvents() {
        const thumbs = document.querySelectorAll('.thumb-item');
        const display = document.getElementById('main-display');

        const updateMedia = (idx) => {
            if (idx < 0 || idx >= this.productoActual.multimedia.length) return;

            this.indiceImagen = idx;
            const recurso = this.productoActual.multimedia[idx];

            // Actualizar el display principal
            display.innerHTML = detalleProductoView.getMediaHTML(recurso.url);

            // Actualizar clases de las miniaturas
            thumbs.forEach((t, i) => {
                t.classList.toggle('border-primary', i === idx);
                t.classList.toggle('border-transparent', i !== idx);
                t.classList.toggle('opacity-100', i === idx);
                t.classList.toggle('opacity-70', i !== idx);
                if (i === idx) t.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
            });
        };

        thumbs.forEach(t => {
            t.onclick = (e) => {
                e.preventDefault();
                updateMedia(parseInt(t.dataset.index));
            };
        });

        document.getElementById('next-btn').onclick = () => {
            const nextIdx = (this.indiceImagen + 1) % this.productoActual.multimedia.length;
            updateMedia(nextIdx);
        };

        document.getElementById('prev-btn').onclick = () => {
            const prevIdx = (this.indiceImagen - 1 + this.productoActual.multimedia.length) % this.productoActual.multimedia.length;
            updateMedia(prevIdx);
        };

        // Evento para abrir el MODAL de Zoom
        display.onclick = (e) => {
            // Evitar clics en reproductores de video
            if (e.target.closest('iframe') || e.target.closest('video')) return;

            // Abrir el modal con la galería completa
            ZoomHelper.abrir(this.productoActual.multimedia, this.indiceImagen);
        };
    },

    setupQuantityEvents() {
        const num = document.getElementById('cant-num');
        const btnMas = document.getElementById('btn-mas');
        const btnMenos = document.getElementById('btn-menos');
        const btnAdd = document.getElementById('btn-add-cart');

        if (!num || !btnMas || !btnMenos) return;

        btnMas.onclick = () => {
            let n = parseInt(num.innerText);
            const stockMax = this.productoActual.stock || 99;
            if (n < stockMax) num.innerText = n + 1;
        };

        btnMenos.onclick = () => {
            let n = parseInt(num.innerText);
            if (n > 1) num.innerText = n - 1;
        };

        if (btnAdd) {
            btnAdd.onclick = () => {
                const cantidadSeleccionada = parseInt(num.innerText);

                const productoAAgregar = {
                    id: this.productoActual.id,
                    nombre: this.productoActual.nombre,
                    precio: parseFloat(this.productoActual.precio),
                    imagen: this.productoActual.multimedia[0]?.url || '',
                    cantidad: cantidadSeleccionada
                };

                // 1. Ejecutamos la lógica de guardado
                this.agregarAlCarritoConCantidad(productoAAgregar);

                // 2. RESETEAR EL CONTADOR A 1
                num.innerText = "1";

                // Opcional: Feedback visual (ejemplo rápido)
                const originalText = btnAdd.innerHTML;
                btnAdd.innerHTML = "¡AÑADIDO!";
                btnAdd.classList.add('bg-green-500');

                setTimeout(() => {
                    btnAdd.innerHTML = originalText;
                    btnAdd.classList.remove('bg-green-500');
                }, 2000);
            };
        }
    },
    agregarAlCarritoConCantidad(producto) {
        const carrito = JSON.parse(localStorage.getItem('cart_items')) || [];
        const itemExiste = carrito.find(item => String(item.id) === String(producto.id));

        if (itemExiste) {
            itemExiste.cantidad += producto.cantidad;
        } else {
            carrito.push(producto);
        }

        localStorage.setItem('cart_items', JSON.stringify(carrito));

        // Actualizamos la interfaz del carrito y lo abrimos
        if (window.CartController) {
            window.CartController.loadFromStorage();
            window.CartController.updateUI();
            if (window.toggleCart) window.toggleCart();
        }
    }
};

document.addEventListener('DOMContentLoaded', () => detalleProductoController.init());