import { carruselModel } from '../models/carruselModel.js';

export const carruselController = {

    async obtenerContenidoGlobal() {
        try {
            const carruseles = await carruselModel.listarConItems();
            return carruseles.map(carrusel => ({
                ...carrusel,
                items: this._formatearItems(carrusel.items)
            }));
        } catch (error) {
            console.error('Error al cargar contenido de carruseles:', error);
            return [];
        }
    },

    async obtenerPorUbicacion(slug) {
        try {
            const data = await carruselModel.obtenerPorUbicacion(slug);

            if (!data || data.length === 0) {
                console.warn(`Controlador: No se encontró carrusel activo con slug: "${slug}"`);
                return null;
            }

            const carrusel = data[0];
            return {
                ...carrusel,
                items: this._formatearItems(carrusel.items)
            };
        } catch (error) {
            console.error('Error en Controlador:', error);
            return null;
        }
    },

    _formatearItems(itemsRaw) {
        if (!itemsRaw) return [];

        return itemsRaw.map(item => {
            const esProducto = !!item.producto;
            const esCategoria = !!item.categoria;

            return {
                id: item.id,
                orden: item.orden,
                titulo: item.titulo_manual || item.producto?.nombre || item.categoria?.nombre || '',
                subtitulo: item.subtitulo_manual || (item.producto?.precio != null ? `Bs. ${item.producto.precio.toLocaleString()}` : ''),
                imagen: item.imagen_url_manual || item.producto?.imagen_url || null,
                link: item.link_destino_manual ||
                    (esProducto
                        ? `detalle_producto.html?id=${item.producto.id}`
                        : (esCategoria
                            ? `productos.html?categoria=${item.categoria.id}`
                            : '#')),
                tipo: esProducto ? 'producto' : (esCategoria ? 'categoria' : 'manual')
            };
        });
    }
};