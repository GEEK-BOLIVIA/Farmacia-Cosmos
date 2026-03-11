import { supabase } from '../config/supabaseClient.js';

export const detalleProductoModel = {
    async getProductoCompleto(id, categoriaSugerida) {
        const { data, error } = await supabase
            .from('producto')
            .select(`
            *,
            producto_categorias_rel (
                categoria (
                    id,
                    nombre,
                    id_padre,
                    padre:categoria!id_padre (id, nombre)
                )
            ),
            galeria_producto (url, tipo, orden, visible)
        `)
            .eq('id', id)
            .eq('galeria_producto.visible', true)
            .order('orden', { foreignTable: 'galeria_producto', ascending: true })
            .single();

        if (error) {
            console.error("Error en detalleProductoModel:", error.message);
            return null;
        }

        return this._transformarDatos(data, categoriaSugerida);
    },

    _transformarDatos(data, categoriaSugerida) {
        if (!data) return null;

        const relaciones = data.producto_categorias_rel || [];
        const sugeridaLower = categoriaSugerida?.toLowerCase();

        // --- PASO 1: ENCONTRAR LA CATEGORÍA CORRECTA BASADA EN EL CONTEXTO ---
        let relElegida = null;

        // A. Buscamos si la categoría sugerida es una de las categorías del producto
        relElegida = relaciones.find(r =>
            r.categoria?.nombre.toLowerCase() === sugeridaLower
        )?.categoria;

        // B. Si no, buscamos si alguna categoría del producto TIENE como padre a la sugerida
        if (!relElegida) {
            relElegida = relaciones.find(r => {
                const padre = Array.isArray(r.categoria?.padre) ? r.categoria.padre[0] : r.categoria?.padre;
                return padre?.nombre.toLowerCase() === sugeridaLower;
            })?.categoria;
        }

        // C. Si aún no hay match, buscamos si la sugerida es el PADRE del PADRE (Abuelo)
        // Esto es por si la jerarquía es muy profunda
        if (!relElegida) {
            relElegida = relaciones.find(r => {
                const padre = Array.isArray(r.categoria?.padre) ? r.categoria.padre[0] : r.categoria?.padre;
                // Si el padre de la categoría actual tiene un ID de padre, podríamos seguir buscando, 
                // pero por ahora tomaremos la que más se acerque.
                return false;
            })?.categoria;
        }

        // D. Fallback: Si nada coincide con la URL, tomamos la primera pero avisamos
        if (!relElegida) {
            relElegida = relaciones[0]?.categoria;
            console.warn("[Modelo] No hubo coincidencia con la URL. Usando categoría por defecto de DB.");
        }

        // --- PASO 2: CONSTRUIR LA JERARQUÍA FINAL ---

        let padreRealDB = Array.isArray(relElegida?.padre) ? relElegida.padre[0] : relElegida?.padre;
        let nombrePadreFinal;
        let categoriaActualFinal = relElegida?.nombre || 'Producto';

        // Lógica Maestra: Si la URL dice "Bodega", el padre DEBE ser "Bodega"
        if (categoriaSugerida && categoriaSugerida !== 'Catálogo') {
            // Si entramos a una hija (ej: Singanis), el padre es la sugerida (Bodega)
            if (categoriaActualFinal.toLowerCase() !== sugeridaLower) {
                nombrePadreFinal = categoriaSugerida;
            } else {
                // Si la sugerida es la categoría actual, el padre es el nivel superior de la DB
                nombrePadreFinal = padreRealDB?.nombre || null;
            }
        } else {
            nombrePadreFinal = padreRealDB?.nombre || null;
        }

        return {
            id: data.id,
            nombre: data.nombre,
            descripcion: data.descripcion,
            precio: data.precio,
            stock: data.stock,
            imagen_url: data.imagen_url,
            mostrar_precio: data.mostrar_precio ?? true,
            habilitar_whatsapp: data.habilitar_whatsapp ?? false,

            // Datos para Breadcrumb
            categoria_actual: categoriaActualFinal,
            categoria_padre: nombrePadreFinal,
            id_categoria: relElegida?.id || null,

            multimedia: [
                { url: data.imagen_url, tipo: 'imagen', orden: -1 },
                ...(data.galeria_producto || [])
            ]
        };
    }
};