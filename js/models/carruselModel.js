import { supabase } from '../config/supabaseClient.js';

export const carruselModel = {
    // carruselModel.js
    async listarConItems() {
        try {
            const { data, error } = await supabase
                .from('carruseles')
                .select(`
                *,
                items:carrusel_items (
                    id,
                    orden,
                    titulo_manual,
                    subtitulo_manual,
                    imagen_url_manual,
                    link_destino_manual,
                    producto:producto_id (id, nombre, imagen_url, precio), 
                    categoria:categoria_id (id, nombre)
                )
            `)
                .eq('activo', true)
                .order('orden_seccion', { ascending: true })
                .order('orden', { foreignTable: 'carrusel_items', ascending: true });

            if (error) throw error;
            return data;
        } catch (err) {
            console.error('Error al listar carruseles con ítems:', err.message);
            return [];
        }
    },
    // carruselModel.js
    async obtenerPorUbicacion(slug) {
        try {
            const { data, error } = await supabase
                .from('carruseles')
                .select(`
                *,
                items:carrusel_items (
                    *,
                    producto:producto_id (id, nombre, imagen_url, precio),
                    categoria:categoria_id (id, nombre)
                )
            `)
                .eq('ubicacion_slug', slug)
                .eq('activo', true)
                .order('orden', { foreignTable: 'carrusel_items', ascending: true });

            if (error) {
                console.error("ERROR DE SUPABASE:", error); // Añade esto
                throw error;
            }
            return data || [];
        } catch (err) {
            console.error("Error en Modelo:", err.message);
            return [];
        }
    }
};