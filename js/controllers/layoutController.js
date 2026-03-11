export class LayoutController {
    static async render(basePath = './') {
        const components = [
            { id: 'layout-header', file: 'components/header.html' },
            { id: 'layout-nav', file: 'components/navbar.html' },
            { id: 'layout-footer', file: 'components/footer.html' }
        ];

        // 1. Cargar todos los archivos HTML en sus respectivos contenedores
        await Promise.all(
            components.map(comp => this.loadComponent(comp.id, `${basePath}${comp.file}`))
        );

        // 2. Ejecutar lógica de inicialización una vez el HTML ya existe en el DOM
        this.initGlobalEvents();
    }

    static async loadComponent(id, url) {
        const container = document.getElementById(id);
        if (!container) return;
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`Error loading ${url}`);
            const html = await response.text();
            container.innerHTML = html;
        } catch (error) {
            console.error(`[LayoutController] Falló la carga de ${url}:`, error);
        }
    }

    /**
     * Aquí colocamos eventos que son fijos del Layout, 
     * como el botón de categorías de escritorio.
     */
    static initGlobalEvents() {
        const catBtn = document.getElementById('categories-toggle');
        const catMenu = document.getElementById('categories-dropdown-menu');
        const arrow = document.getElementById('categories-arrow');

        if (catBtn && catMenu) {
            catBtn.onclick = (e) => {
                e.stopPropagation();
                const isHidden = catMenu.classList.contains('hidden');
                
                if (isHidden) {
                    catMenu.classList.remove('hidden');
                    // Rotar flecha
                    if (arrow) arrow.style.transform = 'rotate(180deg)';
                    // Animación de entrada
                    setTimeout(() => {
                        catMenu.classList.replace('opacity-0', 'opacity-100');
                        catMenu.classList.replace('scale-95', 'scale-100');
                    }, 10);
                } else {
                    this.closeDesktopMenu();
                }
            };

            // Cerrar menú al hacer click fuera
            window.addEventListener('click', (e) => {
                if (!catMenu.contains(e.target) && !catBtn.contains(e.target)) {
                    this.closeDesktopMenu();
                }
            });
        }
    }

    static closeDesktopMenu() {
        const catMenu = document.getElementById('categories-dropdown-menu');
        const arrow = document.getElementById('categories-arrow');
        if (catMenu && !catMenu.classList.contains('hidden')) {
            catMenu.classList.replace('opacity-100', 'opacity-0');
            catMenu.classList.replace('scale-100', 'scale-95');
            if (arrow) arrow.style.transform = 'rotate(0deg)';
            setTimeout(() => catMenu.classList.add('hidden'), 300);
        }
    }
}