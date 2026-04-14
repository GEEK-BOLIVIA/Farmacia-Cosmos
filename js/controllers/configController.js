import { ConfigModel } from '../models/configModel.js';
import { ConfigView } from '../views/configView.js';

export const ConfigController = {
    async init() {
        try {
            const palette = await ConfigModel.getActivePalette();
            ConfigView.applyColors(palette);

            const settings = await ConfigModel.getSettings();
            console.log("Configuraciones recibidas:", settings);
            this._aplicarSettingsCuandoHayDOM(settings);

        } catch (err) {
            console.error("Error cargando configuración dinámica:", err);
        }
    },

    _aplicarSettingsCuandoHayDOM(settings) {
        const header = document.getElementById('layout-header');

        if (header && header.children.length > 0) {
            ConfigView.updateGeneralSettings(settings);
            return;
        }

        const observer = new MutationObserver((_, obs) => {
            const logos = document.querySelectorAll('.main-site-logo');
            if (logos.length > 0) {
                obs.disconnect();
                ConfigView.updateGeneralSettings(settings);
            }
        });

        observer.observe(document.getElementById('layout-header') || document.body, {
            childList: true,
            subtree: true
        });
    }
};

// ELIMINADO: ConfigController.init() — ahora se llama desde main.js