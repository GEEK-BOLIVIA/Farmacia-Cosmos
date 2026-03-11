import { CategoriasModel } from '../models/categoriasModel.js';
import { NavbarView } from '../views/navbarView.js';

export const CategoriasController = {
    async init() {
        try {
            // 1. Obtenemos todas las categorías visibles desde el Modelo
            const todas = await CategoriasModel.fetchAllVisible();

            if (!todas || todas.length === 0) {
                console.warn("[CategoriasController] No se encontraron categorías.");
                return;
            }

            // 2. Filtramos las categorías "Hijas" para el Navbar Horizontal (Desktop)
            // Tomamos las primeras 5 que tengan un padre asignado
            const hijasNavbar = todas
                .filter(cat => cat.id_padre !== null)
                .slice(0, 5)
                .map(h => ({
                    id: h.id,
                    nombre: h.nombre,
                    link: `productos.html?categoria=${encodeURIComponent(h.nombre)}`
                }));

            // 3. Estructuramos los PADRES con sus HIJAS (Para el Dropdown y el Burger)
            const categoriasEstructuradas = todas
                .filter(cat => cat.id_padre === null) // Buscamos solo los padres
                .map(padre => ({
                    id: padre.id,
                    nombre: padre.nombre,
                    link: `productos.html?categoria=${encodeURIComponent(padre.nombre)}`,
                    // Mapeamos sus subcategorías correspondientes
                    subcategorias: todas
                        .filter(h => h.id_padre === padre.id)
                        .map(h => ({
                            id: h.id,
                            nombre: h.nombre,
                            link: `productos.html?categoria=${encodeURIComponent(h.nombre)}`
                        }))
                }));

            // 4. Enviamos los datos a la Vista
            // NavbarView se encargará de inyectar el HTML en los IDs:
            // - main-nav-links (Desktop horizontal)
            // - dropdown-links-container (Desktop dropdown)
            // - mobile-accordion-links (Mobile Burger)
            if (NavbarView && typeof NavbarView.render === 'function') {
                NavbarView.render(categoriasEstructuradas, hijasNavbar);
            }

        } catch (error) {
            console.error("Error crítico en CategoriasController:", error);
        }
    },

    /**
     * Método auxiliar para cargar productos de una categoría específica
     * Útil cuando el usuario navega profundamente en el menú.
     */
    async obtenerProductosPorCategoria(categoriaId) {
        try {
            // Ejemplo de integración con un modelo de productos futuro
            // const productos = await ProductosModel.getByCategory(categoriaId);
            // return productos;
            return []; 
        } catch (error) {
            console.error("Error al obtener productos:", error);
            return [];
        }
    }
};