import { supabase } from '../config/supabaseClient.js';

export const ProductosModel = {
    /**
     * Obtiene todos los productos marcados como visibles.
     */
    async fetchAllVisible() {
        const { data, error } = await supabase
            .from('producto')
            .select('*')
            .eq('visible', true)
            .order('nombre', { ascending: true });

        if (error) {
            console.error("Error al obtener productos:", error.message);
            throw error;
        }
        return data || [];
    },

    /**
     * NIVEL 3 NAVBAR: Obtiene productos filtrados por ID de subcategoría.
     * Utiliza la tabla intermedia producto_categorias_rel.
     */
    async fetchBySubcategoriaId(subcatId, limit = 5) {
        const { data, error } = await supabase
            .from('producto')
            .select(`
                *,
                producto_categorias_rel!inner(id_categoria)
            `)
            .eq('visible', true)
            .eq('producto_categorias_rel.id_categoria', subcatId)
            .limit(limit);

        if (error) {
            console.error("Error al filtrar por subcategoría:", error.message);
            return [];
        }
        return data || [];
    },

    /**
     * Obtiene un producto por su ID incluyendo sus categorías asociadas.
     */
    async fetchById(id) {
        const { data, error } = await supabase
            .from('producto')
            .select(`
                *,
                producto_categorias_rel(
                    categoria(id, nombre)
                )
            `)
            .eq('id', id)
            .single();

        if (error) {
            console.error(`Error al obtener el producto ${id}:`, error.message);
            return null;
        }
        return data;
    },

    /**
     * Búsqueda por nombre usando el índice de trigramas/pattern.
     */
    async searchByName(query) {
        // Usamos ilike para coincidencia parcial si textSearch es muy estricto
        const { data, error } = await supabase
            .from('producto')
            .select('*')
            .eq('visible', true)
            .ilike('nombre', `%${query}%`)
            .limit(10);

        if (error) {
            console.error("Error en la búsqueda:", error.message);
            return [];
        }
        return data || [];
    }
};