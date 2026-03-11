import { supabase } from '../config/supabaseClient.js';

export const ProductoCategoriaModel = {
    /**
     * Obtiene los IDs de productos asociados a una categoría
     */
    async getProductosPorCategoria(categoriaId) {
        const { data, error } = await supabase
            .from('producto_categorias_rel')
            .select('id_producto')
            .eq('id_categoria', categoriaId);

        if (error) {
            console.error("Error en ProductoCategoriaModel:", error.message);
            return [];
        }
        return data.map(rel => rel.id_producto);
    },

    /**
     * Obtiene las categorías de un producto específico
     */
    async getCategoriasPorProducto(productoId) {
        const { data, error } = await supabase
            .from('producto_categorias_rel')
            .select(`
                id_categoria,
                categoria ( id, nombre )
            `)
            .eq('id_producto', productoId);

        if (error) throw error;
        return data.map(d => d.categoria);
    }
};