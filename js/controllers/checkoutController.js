// js/controllers/checkoutController.js
import { CheckoutView } from '../views/checkoutView.js';

const CheckoutController = {
    init() {
        const carrito = this._obtenerCarrito();
        CheckoutView.renderResumen(carrito);
        this._setupEvents();
    },

    _obtenerCarrito() {
        try {
            return JSON.parse(localStorage.getItem('cart_items')) || [];
        } catch (error) {
            console.error("Error al obtener el carrito:", error);
            return [];
        }
    },

    _setupEvents() {
        const btnEnviar = document.getElementById('btn-enviar-cotizacion');
        if (btnEnviar) {
            btnEnviar.addEventListener('click', async (e) => {
                e.preventDefault();
                await this._procesarEnvio();
            });
        }
    },
    async _procesarEnvio() {
        const carrito = this._obtenerCarrito();

        if (carrito.length === 0) {
            Swal.fire({ icon: 'info', title: 'Carrito vacío', text: 'Agrega productos primero.' });
            return;
        }

        const esValido = await CheckoutView.validarFormulario();
        if (!esValido) return;

        const datos = CheckoutView.getFormData();

        await Swal.fire({
            title: '¡Cotización Enviada!',
            text: 'Tu carrito ha sido vaciado y los datos enviados.',
            icon: 'success',
            timer: 2500,
            showConfirmButton: false
        });

        // Ejecutamos el envío
        this._enviarAWhatsApp(datos, carrito);

        // LIMPIEZA POST-ENVÍO
        this._limpiarTodo();
    },

    _limpiarTodo() {
        // 1. Borrar del localStorage
        localStorage.removeItem('cart_items');

        // 2. Limpiar el formulario en el HTML
        const form = document.getElementById('form-cotizacion');
        if (form) form.reset();

        // 3. Notificar al CartController para que actualice los iconos (círculo rojo, etc.)
        if (window.CartController) {
            window.CartController.items = [];
            window.CartController.save(); // Esto asegura que se limpie el storage y la UI
            window.CartController.updateUI();
        }

        // 4. Refrescar la vista del resumen (mostrará el mensaje de "Carrito vacío")
        CheckoutView.renderResumen([]);
    },
    _enviarAWhatsApp(cliente, productos) {
        // Encabezado profesional con emojis
        let mensaje = `*📦 NUEVA SOLICITUD DE COTIZACIÓN - FARMACIA COSMOS*%0A%0A`;

        mensaje += `*👤 DATOS DEL CLIENTE*%0A`;
        mensaje += `━━━━━━━━━━━━━━━━━━━━%0A`;
        mensaje += `*Nombre:* ${cliente.nombre} ${cliente.apellido}%0A`;
        mensaje += `*Correo:* ${cliente.correo}%0A`;
        mensaje += `*Ciudad:* ${cliente.ciudad || 'No especificada'}%0A`;
        if (cliente.empresa) mensaje += `*Empresa:* ${cliente.empresa}%0A`;

        mensaje += `%0A*🛍️ DETALLE DEL PEDIDO*%0A`;
        mensaje += `━━━━━━━━━━━━━━━━━━━━%0A`;

        let granTotal = 0;

        productos.forEach((p, index) => {
            const sub = p.precio * p.cantidad;
            granTotal += sub;
            const subFormateado = sub.toLocaleString('es-BO', { minimumFractionDigits: 2 });

            // Link del producto (asumiendo que usas el ID para la URL)
            // Ajusta 'detalle-producto.html' a tu nombre de archivo real
            const urlProducto = `${window.location.origin}/detalle-producto.html?id=${p.id}`;

            mensaje += `*${index + 1}.* ${p.nombre}%0A`;
            mensaje += `🔹 Cantidad: ${p.cantidad}%0A`;
            mensaje += `🔹 Subtotal: Bs. ${subFormateado}%0A`;
            mensaje += `🔗 _Ver producto:_ ${urlProducto}%0A%0A`;
        });

        const totalFinal = granTotal.toLocaleString('es-BO', { minimumFractionDigits: 2 });

        mensaje += `━━━━━━━━━━━━━━━━━━━━%0A`;
        mensaje += `*💰 TOTAL ESTIMADO: Bs. ${totalFinal}*%0A%0A`;
        mensaje += `_Enviado desde el Catálogo Web de Farmacia Cosmos_ 🚀`;

        // CONFIGURACIÓN DE ENVÍO (Reemplaza con tu número)
        const phone = "59167540115";
        window.open(`https://wa.me/${phone}?text=${mensaje}`, '_blank');
    }
};

document.addEventListener('DOMContentLoaded', () => CheckoutController.init());