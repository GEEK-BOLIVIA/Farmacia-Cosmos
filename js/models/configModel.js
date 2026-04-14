import { supabase } from '../config/supabaseClient.js';

const CACHE_TTL = 60 * 60 * 1000;
const KEY_PALETTE = 'cosmos_cfg_palette';
const KEY_SETTINGS = 'cosmos_cfg_settings';

const _memCache = new Map();

function getCache(key) {
    if (_memCache.has(key)) {
        const { data, ts } = _memCache.get(key);
        if (Date.now() - ts < CACHE_TTL) return data;
        _memCache.delete(key);
    }
    try {
        const cached = sessionStorage.getItem(key);
        if (!cached) return null;
        const { data, ts } = JSON.parse(cached);
        if (Date.now() - ts > CACHE_TTL) return null;
        _memCache.set(key, { data, ts });
        return data;
    } catch (_) { return null; }
}

function setCache(key, data) {
    const entry = { data, ts: Date.now() };
    _memCache.set(key, entry);
    try {
        sessionStorage.setItem(key, JSON.stringify(entry));
    } catch (_) { }
}

export const ConfigModel = {
    async getActivePalette() {
        const cached = getCache(KEY_PALETTE);
        if (cached) return cached;

        const { data, error } = await supabase
            .from('paletas_colores')
            .select('primary_color, secondary_color, accent_color, primary_dark_color, background_light_color, background_dark_color, surface_dark_color')
            .eq('es_activa', true)
            .single();
        if (error) throw error;

        setCache(KEY_PALETTE, data);
        return data;
    },
    async getSettings() {
        const cached = getCache(KEY_SETTINGS);
        if (cached) return cached;

        const { data, error } = await supabase
            .from('configuraciones_sitio')
            .select('clave, valor_actual');
        if (error) throw error;

        setCache(KEY_SETTINGS, data);
        return data;
    },

    limpiarCache() {
        _memCache.clear();
        [KEY_PALETTE, KEY_SETTINGS].forEach(k => sessionStorage.removeItem(k));
    }
};