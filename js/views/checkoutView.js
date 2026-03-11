// js/views/checkoutView.js

export const CheckoutView = {
    renderResumen(carrito) {
        const container = document.getElementById('contenedor-resumen');
        if (!container) return;

        if (!carrito || carrito.length === 0) {
            container.innerHTML = `
                <div class="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300">
                    <span class="material-icons text-6xl text-gray-200 mb-4">shopping_cart</span>
                    <p class="text-gray-500 font-medium">Tu carrito está vacío.</p>
                    <a href="productos.html" class="text-primary hover:underline font-bold mt-2 inline-block">Volver a la tienda</a>
                </div>`;
            return;
        }

        let total = 0;
        const itemsHtml = carrito.map(item => {
            const subtotal = item.precio * item.cantidad;
            total += subtotal;
            return this._registroProducto(item, subtotal);
        }).join('');

        container.innerHTML = `
            <div class="bg-white dark:bg-surface-dark rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <div class="overflow-x-auto">
                    <table class="w-full text-left">
                        <thead class="bg-gray-50 dark:bg-gray-800/50">
                            <tr>
                                <th class="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Producto</th>
                                <th class="px-6 py-4 text-xs font-bold text-gray-400 uppercase text-center">Cant.</th>
                                <th class="px-6 py-4 text-xs font-bold text-gray-400 uppercase text-right">Subtotal</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-50">
                            ${itemsHtml}
                        </tbody>
                    </table>
                </div>
                <div class="p-8 bg-gray-50/50 flex flex-col items-end">
                    <span class="text-gray-400 text-xs font-bold uppercase tracking-widest">Total de Cotización</span>
                    <span class="text-4xl font-black text-primary">
                        Bs. ${total.toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                </div>
            </div>
        `;
    },

    _registroProducto(item, subtotal) {
        return `
            <tr class="hover:bg-gray-50/50 transition-colors">
                <td class="px-6 py-4 flex items-center gap-4">
                    <div class="w-16 h-16 rounded-2xl bg-gray-100 p-2 shrink-0">
                        <img src="${item.imagen}" alt="${item.nombre}" class="w-full h-full object-contain">
                    </div>
                    <div>
                        <h4 class="font-bold text-gray-800 text-sm line-clamp-1">${item.nombre}</h4>
                        <p class="text-xs text-gray-400 font-medium">
                            Precio unitario: Bs. ${Number(item.precio).toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                    </div>
                </td>
                <td class="px-6 py-4 text-center font-bold text-gray-700">${item.cantidad}</td>
                <td class="px-6 py-4 text-right font-black text-primary">
                    Bs. ${subtotal.toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
            </tr>
        `;
    },

    getFormData() {
        return {
            nombre: document.getElementById('cliente-nombre').value.trim(),
            apellido: document.getElementById('cliente-apellido').value.trim(),
            correo: document.getElementById('cliente-correo').value.trim(),
            ciudad: document.getElementById('cliente-ciudad').value.trim(),
            empresa: document.getElementById('cliente-empresa').value.trim()
        };
    },

    async validarFormulario() {
        const datos = this.getFormData();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        // Validación de campos vacíos
        if (!datos.nombre || !datos.apellido || !datos.correo || !datos.ciudad) {
            await Swal.fire({
                icon: 'warning',
                title: 'Campos incompletos',
                text: 'Por favor, complete todos los campos marcados como obligatorios (*)',
                confirmButtonColor: '#3085d6', // Ajusta al color de tu marca
            });
            return false;
        }

        // Validación de formato de correo
        if (!emailRegex.test(datos.correo)) {
            await Swal.fire({
                icon: 'error',
                title: 'Correo inválido',
                text: 'Por favor, ingresa una dirección de correo electrónico válida',
                confirmButtonColor: '#d33',
            });
            return false;
        }

        return true;
    },

    showSuccess() {
        return Swal.fire({
            icon: 'success',
            title: '¡Cotización preparada!',
            text: 'Te estamos redirigiendo a WhatsApp para finalizar.',
            showConfirmButton: false,
            timer: 2000
        });
    }
};