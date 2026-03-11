import { supabase } from '../config/supabaseClient.js';

export const ConfigModel = {
    async getActivePalette() {
        const { data, error } = await supabase
            .from('paletas_colores')
            .select('*') // Trae todas las nuevas columnas (primary_color, etc.)
            .eq('es_activa', true)
            .single();
        if (error) throw error;
        return data;
    },

    async getSettings() {
        const { data, error } = await supabase
            .from('configuraciones_sitio')
            .select('clave, valor_actual');
        if (error) throw error;
        return data;
    }
};