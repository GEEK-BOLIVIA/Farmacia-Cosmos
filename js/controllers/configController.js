import { ConfigModel } from '../models/configModel.js';
import { ConfigView } from '../views/configView.js';

export const ConfigController = {
    async init() {
        try {
            // Obtener paleta con los nuevos nombres de columna
            const palette = await ConfigModel.getActivePalette();
            ConfigView.applyColors(palette);

            // Obtener configuraciones de texto/logo
            const settings = await ConfigModel.getSettings();
            console.log("Configuraciones recibidas:", settings);
            ConfigView.updateGeneralSettings(settings);
            
        } catch (err) {
            console.error("Error cargando configuración dinámica:", err);
        }
    }
};

ConfigController.init();