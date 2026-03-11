export const ConfigView = {
    applyColors(p) {
        if (!p) return;
        const root = document.documentElement;

        // Mapeo directo de tus nuevos nombres de columna a variables CSS
        root.style.setProperty('--color-primary', p.primary_color);
        root.style.setProperty('--color-secondary', p.secondary_color);
        root.style.setProperty('--color-accent', p.accent_color);
        root.style.setProperty('--color-primary-dark', p.primary_dark_color);
        root.style.setProperty('--color-bg-light', p.background_light_color);
        root.style.setProperty('--color-bg-dark', p.background_dark_color);
        root.style.setProperty('--color-surface-dark', p.surface_dark_color);
    },

    updateGeneralSettings(settings) {
        if (!settings || !Array.isArray(settings)) return;

        settings.forEach(conf => {
            if (conf.clave === 'logo' && conf.valor_actual) {
                const logos = document.querySelectorAll('.main-site-logo');

                logos.forEach(logoElement => {
                    // Definimos el comportamiento al cargar
                    logoElement.onload = () => {
                        // Quitamos la invisibilidad si la usas
                        logoElement.classList.remove('opacity-0');
                        logoElement.classList.add('opacity-100');
                    };

                    logoElement.onerror = () => {
                        logoElement.src = 'images/logo-cosmos.png'; // Fallback
                        logoElement.classList.remove('opacity-0');
                    };

                    // Cambiamos el src. Las clases de tamaño (h-10, etc.) se mantienen intactas.
                    logoElement.src = conf.valor_actual;
                });
            }
        });
    }
};