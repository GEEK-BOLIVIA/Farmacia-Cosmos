import { SearchView } from '../views/searchView.js';
import { supabase } from '../config/supabaseClient.js';

export const SearchController = {
    isSearching: false,
    debounceTimer: null,
    abortController: null, // Para cancelar peticiones obsoletas
    cache: {}, // Almacena búsquedas recientes para velocidad instantánea

    async init() {
        await SearchView.init();
        this.setupEvents();
    },

    setupEvents() {
        const input = SearchView.elements.input;
        const modal = SearchView.elements.modal;

        input?.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            clearTimeout(this.debounceTimer);

            if (query.length > 1) {
                // Si el resultado está en cache, renderizamos de inmediato
                if (this.cache[query]) {
                    const { productos, catsPadre, subCats } = this.cache[query];
                    SearchView.render(productos, catsPadre, subCats);
                    return;
                }

                this.debounceTimer = setTimeout(() => {
                    this.ejecutarBusquedaBD(query);
                }, 300);
            } else {
                SearchView.toggleModal(false);
            }
        });

        SearchView.elements.clearBtn?.addEventListener('click', () => {
            input.value = '';
            SearchView.toggleModal(false);
            input.focus();
        });

        // Cerrar al hacer click fuera
        document.addEventListener('mousedown', (e) => {
            if (!modal.classList.contains('hidden') && 
                !modal.contains(e.target) && 
                !input.contains(e.target)) {
                SearchView.toggleModal(false);
            }
        });

        // Cerrar con tecla ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                SearchView.toggleModal(false);
                input.blur();
            }
        });
    },

    async ejecutarBusquedaBD(query) {
        // Si hay una búsqueda en curso del mismo tipo, la abortamos para priorizar la nueva
        if (this.abortController) {
            this.abortController.abort();
        }

        this.abortController = new AbortController();
        this.isSearching = true;
        
        // Mostrar spinner en la vista
        SearchView.setLoading(true);

        try {
            // Ejecutamos consultas en paralelo para máxima velocidad
            const [prodRes, catRes] = await Promise.all([
                supabase
                    .from('producto')
                    .select('id, nombre, precio, imagen_url, visible')
                    .eq('visible', true)
                    .ilike('nombre', `%${query}%`)
                    .limit(6)
                    .abortSignal(this.abortController.signal),
                
                supabase
                    .from('categoria')
                    .select('id, nombre, id_padre, visible')
                    .eq('visible', true)
                    .ilike('nombre', `%${query}%`)
                    .limit(10)
                    .abortSignal(this.abortController.signal)
            ]);

            if (prodRes.error || catRes.error) throw new Error("Error en Supabase");

            const productos = prodRes.data || [];
            const categorias = catRes.data || [];

            // Clasificar categorías
            const catsPadre = [];
            const subCats = [];

            categorias.forEach(cat => {
                if (cat.id_padre === null) {
                    catsPadre.push(cat);
                } else {
                    subCats.push({ 
                        ...cat, 
                        padreNombre: 'Categoría' 
                    });
                }
            });

            // Guardar en cache para futuras consultas idénticas
            this.cache[query] = { productos, catsPadre, subCats };

            // Renderizar
            SearchView.render(productos, catsPadre, subCats);

        } catch (error) {
            if (error.name === 'AbortError') {
                console.log("[Search] Petición anterior cancelada");
            } else {
                console.error("[SearchController] Error crítico:", error);
            }
        } finally {
            this.isSearching = false;
        }
    }
};