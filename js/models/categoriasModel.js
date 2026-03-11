import { supabase } from '../config/supabaseClient.js';

export const CategoriasModel = {
    async fetchAllVisible() {
        const { data, error } = await supabase
            .from('categoria')
            .select('*')
            .eq('visible', true)
            .order('nombre', { ascending: true });

        if (error) {
            console.error('Error al obtener categorías:', error.message);
            return [];
        }

        return data;
    },

    async getNavbarTree() {
        const categorias = await this.fetchAllVisible();
        
        // Mapeamos las categorías para facilitar la búsqueda por ID
        const map = {};
        categorias.forEach(cat => {
            map[cat.id] = { ...cat, hijos: [] };
        });

        const tree = [];
        categorias.forEach(cat => {
            if (cat.id_padre) {
                // Si tiene padre, la añadimos a la lista de hijos del padre
                if (map[cat.id_padre]) {
                    map[cat.id_padre].hijos.push(map[cat.id]);
                }
            } else {
                // Si no tiene padre, es una categoría raíz
                tree.push(map[cat.id]);
            }
        });

        return tree;
    }
};