import { supabase } from '../config/supabaseClient.js';

const CACHE_TTL = 5 * 60 * 1000;
const KEY_ALL = 'cosmos_carruseles_all';
const KEY_SLUG = 'cosmos_carrusel_slug_';

// Caché en memoria — indestructible por Supabase, vive mientras la pestaña esté abierta
const _memCache = new Map();

function getCache(key) {
    if (!_memCache.has(key)) return null;
    const { data, ts } = _memCache.get(key);
    if (Date.now() - ts > CACHE_TTL) { _memCache.delete(key); return null; }
    return data;
}

function setCache(key, data) {
    _memCache.set(key, { data, ts: Date.now() });
}

export const carruselModel = {

    async listarConItems() {
        const cached = getCache(KEY_ALL);
        if (cached) { console.log('Carruseles desde caché'); return cached; }

        try {
            const { data, error } = await supabase
                .from('vista_carruseles_activos')
                .select('*');

            if (error) throw error;

            const result = this._agruparFilas(data);
            setCache(KEY_ALL, result);
            return result;
        } catch (err) {
            console.error('Error al listar carruseles:', err.message);
            return [];
        }
    },

    async obtenerPorUbicacion(slug) {
        const cacheKey = KEY_SLUG + slug;
        const cached = getCache(cacheKey);
        if (cached) { console.log(`Carrusel "${slug}" desde caché`); return cached; }

        try {
            const { data, error } = await supabase
                .from('vista_carruseles_activos')
                .select('*')
                .eq('ubicacion_slug', slug);

            if (error) { console.error('ERROR SUPABASE:', error); throw error; }

            const result = this._agruparFilas(data || []);
            setCache(cacheKey, result);
            return result;
        } catch (err) {
            console.error('Error en Modelo:', err.message);
            return [];
        }
    },

    limpiarCache() {
        _memCache.clear();
        console.log('Caché en memoria limpiado');
    },

    _agruparFilas(filas) {
        const mapa = new Map();
        filas.forEach(fila => {
            if (!mapa.has(fila.id)) {
                mapa.set(fila.id, {
                    id: fila.id,
                    nombre: fila.nombre,
                    tipo: fila.tipo,
                    ubicacion_slug: fila.ubicacion_slug,
                    orden_seccion: fila.orden_seccion,
                    items: []
                });
            }
            if (fila.item_id) {
                mapa.get(fila.id).items.push({
                    id: fila.item_id,
                    orden: fila.item_orden,
                    titulo_manual: fila.titulo_manual,
                    subtitulo_manual: fila.subtitulo_manual,
                    imagen_url_manual: fila.imagen_url_manual,
                    link_destino_manual: fila.link_destino_manual,
                    producto: fila.producto_id ? {
                        id: fila.producto_id,
                        nombre: fila.producto_nombre,
                        imagen_url: fila.producto_imagen,
                        precio: fila.producto_precio
                    } : null,
                    categoria: fila.categoria_id ? {
                        id: fila.categoria_id,
                        nombre: fila.categoria_nombre
                    } : null
                });
            }
        });
        return Array.from(mapa.values());
    }
};