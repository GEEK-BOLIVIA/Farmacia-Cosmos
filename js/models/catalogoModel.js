import { supabase } from '../config/supabaseClient.js';

export const catalogoModel = {
    async getProductosData({
        subcategoriasIds = [],
        buscar = null,
        minPrice = 0,
        maxPrice = null,
        ordenOpcion = 'Lo más nuevo',
        pagina = 1,
        productosPorPagina = 15
    }) {
        const desde = (pagina - 1) * productosPorPagina;
        const hasta = desde + productosPorPagina - 1;

        const selectQuery = subcategoriasIds.length > 0 
            ? `*, producto_categorias_rel!inner(id_categoria)` 
            : `*, producto_categorias_rel(id_categoria)`;

        let query = supabase
            .from('producto')
            .select(selectQuery, { count: 'exact' })
            .eq('visible', true);

        if (subcategoriasIds.length > 0) {
            query = query.in('producto_categorias_rel.id_categoria', subcategoriasIds);
        }

        if (buscar) query = query.ilike('nombre', `%${buscar}%`);
        if (minPrice > 0) query = query.gte('precio', minPrice);
        if (maxPrice && maxPrice < 500) query = query.lte('precio', maxPrice);

        const orderConfig = { ascending: ordenOpcion === 'Precio: Menor a Mayor' };
        const column = ordenOpcion.includes('Precio') ? 'precio' : 'id';
        query = query.order(column, orderConfig);

        const { data, count, error } = await query.range(desde, hasta);
        if (error) throw error;

        return {
            productos: data,
            totalCount: count,
            rango: { inicio: desde + 1, fin: desde + (data ? data.length : 0) }
        };
    },
    
    /**
     * Obtiene los datos completos de una categoría por su nombre (para el Padre)
     */
    async getCategoriaPorNombre(nombre) {
        const { data } = await supabase
            .from('categoria')
            .select('*')
            .ilike('nombre', nombre)
            .single();
        return data;
    },

    async getCategoriaPorId(id) {
        if (!id) return null;
        const { data } = await supabase
            .from('categoria')
            .select('*')
            .eq('id', id)
            .single();
        return data;
    },

    async getSubcategorias(idPadre) {
        const { data } = await supabase
            .from('categoria')
            .select('id, nombre')
            .eq('id_padre', idPadre)
            .eq('visible', true)
            .order('nombre', { ascending: true });
        return data || [];
    },

    /**
     * Obtiene nombres de categorías basados en un array de IDs 
     * (Útil si en el futuro decides volver a usar tags o selección múltiple)
     */
    async getCategoriasNombres(ids) {
        if (!ids || !ids.length) return [];
        const { data, error } = await supabase
            .from('categoria')
            .select('id, nombre')
            .in('id', ids);
        
        if (error) return [];
        return data || [];
    }
};