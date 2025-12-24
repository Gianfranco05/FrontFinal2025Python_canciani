import { useForm } from 'react-hook-form';
import { useCart } from '../../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowRight, CreditCard, MapPin, ShieldCheck, ShoppingBag, User, Banknote, Wallet } from 'lucide-react';
import { useState } from 'react';
import { PaymentType, DeliveryMethod, Status } from '../../types';
// Agregamos addressService a las importaciones
import { billService, orderService, clientService, orderDetailService, addressService } from '../../api/services';

interface CheckoutForm {
    firstName: string;
    lastName: string;
    email: string;
    address: string;
    city: string;
    zipCode: string;
    paymentMethod: string;
    cardNumber?: string;
    expiryDate?: string;
    cvv?: string;
}

export function Checkout() {
    const { cart, clearCart } = useCart();
    const navigate = useNavigate();
    const { register, handleSubmit, watch, formState: { errors } } = useForm<CheckoutForm>({
        defaultValues: {
            paymentMethod: PaymentType.CREDIT.toString()
        }
    });
    const [isProcessing, setIsProcessing] = useState(false);

    // --- CÁLCULOS ---
    const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const taxRate = 0.21;
    const taxAmount = Number((subtotal * taxRate).toFixed(2));
    const finalTotal = Number((subtotal + taxAmount).toFixed(2));

    const selectedPaymentMethod = watch('paymentMethod');
    const isCardPayment = ['2', '3', '4'].includes(selectedPaymentMethod);

    // --- RENDERIZADO SI CARRITO VACÍO ---
    if (cart.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <ShoppingBag className="mx-auto h-12 w-12 text-gray-300" />
                    <h2 className="mt-2 text-lg font-medium text-gray-900">Tu carrito está vacío</h2>
                    <button onClick={() => navigate('/shop')} className="mt-4 text-indigo-600 font-medium hover:underline">
                        Volver a la tienda
                    </button>
                </div>
            </div>
        );
    }

    const onSubmit = async (data: CheckoutForm) => {
        setIsProcessing(true);

        try {
            // 0. VALIDACIÓN DE STOCK (Front-end Check)
            const stockErrors = cart.filter(item => item.quantity > item.stock);
            if (stockErrors.length > 0) {
                const names = stockErrors.map(i => i.name).join(", ");
                throw new Error(`Stock insuficiente para: ${names}. Por favor reduce la cantidad.`);
            }

            const today = new Date().toISOString().split('T')[0];

            // 1. CREAR CLIENTE (Sin addresses para evitar error de tipos)
            const clientPayload = {
                name: data.firstName,
                lastname: data.lastName,
                email: data.email,
                telephone: "0000000000" // Placeholder si no es requerido
                // No enviamos addresses aquí para evitar el error de id_key faltante
            };

            console.log("1. Creando Cliente...", clientPayload);
            const createdClient = await clientService.create(clientPayload);

            if (!createdClient || !createdClient.id_key) throw new Error("Error al registrar cliente.");
            const clientId = createdClient.id_key;

            // 1.5 CREAR DIRECCIÓN (Vinculada al cliente creado)
            // Esto soluciona el error de la línea 88 limpiamente
            const addressPayload = {
                street: data.address,
                city: data.city,
                number: "S/N", // Placeholder si no tienes campo número en el form
                client_id: clientId
            };
            console.log("1.5. Registrando Dirección...", addressPayload);
            await addressService.create(addressPayload);

            // 2. CREAR FACTURA (Bill)
            const generatedBillNumber = `FAC-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

            const billPayload = {
                bill_number: generatedBillNumber,
                date: today,
                total: finalTotal,
                payment_type: Number(data.paymentMethod) as PaymentType,
                client_id: clientId
            };

            console.log("2. Creando Factura...", billPayload);
            const createdBill = await billService.create(billPayload);

            if (!createdBill || !createdBill.id_key) throw new Error("Error al generar factura.");

            // 3. CREAR ORDEN (Order Header)
            const orderPayload = {
                bill_id: createdBill.id_key,
                client_id: clientId,
                date: today,
                total: finalTotal,
                status: Status.PENDING,
                delivery_method: DeliveryMethod.HOME_DELIVERY
            };

            console.log("3. Creando Orden...", orderPayload);
            const createdOrder = await orderService.create(orderPayload);

            if (!createdOrder || !createdOrder.id_key) throw new Error("Error al crear la orden.");

            // 4. CREAR DETALLES DE ORDEN (Items)
            console.log("4. Guardando items...");
            const detailPromises = cart.map(item => {
                return orderDetailService.create({
                    order_id: createdOrder.id_key,
                    product_id: item.id_key,
                    quantity: item.quantity,
                    price: item.price
                });
            });

            await Promise.all(detailPromises);

            // ÉXITO
            toast.success('¡Orden procesada con éxito!');
            clearCart();
            navigate('/');

        } catch (error: any) {
            console.error("Error Checkout:", error);
            const msg = error.message || 'Hubo un error procesando tu compra.';
            toast.error(msg);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-10 text-center">
                    <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">Finalizar Compra</h1>
                    <p className="mt-2 text-lg text-gray-500">Completa los detalles de tu pedido</p>
                </div>

                <div className="lg:grid lg:grid-cols-2 lg:gap-x-12 xl:gap-x-16">
                    {/* Formulario */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">

                            {/* 1. Datos Personales */}
                            <section>
                                <div className="flex items-center mb-6">
                                    <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600 mr-4">
                                        <User size={20} />
                                    </div>
                                    <h2 className="text-xl font-bold text-gray-900">Información de Contacto</h2>
                                </div>
                                <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Nombre</label>
                                        <input
                                            type="text"
                                            {...register('firstName', { required: true })}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3 border"
                                        />
                                        {errors.firstName && <span className="text-red-500 text-xs">Requerido</span>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Apellido</label>
                                        <input
                                            type="text"
                                            {...register('lastName', { required: true })}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3 border"
                                        />
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700">Email</label>
                                        <input
                                            type="email"
                                            {...register('email', { required: true })}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3 border"
                                        />
                                    </div>
                                </div>
                            </section>

                            {/* 2. Envío */}
                            <section>
                                <div className="flex items-center mb-6 pt-6 border-t border-gray-100">
                                    <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600 mr-4">
                                        <MapPin size={20} />
                                    </div>
                                    <h2 className="text-xl font-bold text-gray-900">Dirección de Envío</h2>
                                </div>
                                <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
                                    <div className="sm:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700">Calle y Número</label>
                                        <input
                                            type="text"
                                            {...register('address', { required: true })}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3 border"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Ciudad</label>
                                        <input
                                            type="text"
                                            {...register('city', { required: true })}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3 border"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Código Postal</label>
                                        <input
                                            type="text"
                                            {...register('zipCode', { required: true })}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3 border"
                                        />
                                    </div>
                                </div>
                            </section>

                            {/* 3. Método de Pago */}
                            <section>
                                <div className="flex items-center mb-6 pt-6 border-t border-gray-100">
                                    <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600 mr-4">
                                        <Wallet size={20} />
                                    </div>
                                    <h2 className="text-xl font-bold text-gray-900">Método de Pago</h2>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                                    <label className={`border rounded-xl p-4 cursor-pointer flex flex-col items-center justify-center transition-all ${selectedPaymentMethod === PaymentType.CREDIT.toString() ? 'border-indigo-600 bg-indigo-50 text-indigo-700 ring-1 ring-indigo-600' : 'border-gray-200 hover:border-indigo-200'}`}>
                                        <input type="radio" value={PaymentType.CREDIT} {...register('paymentMethod')} className="sr-only" />
                                        <CreditCard className="mb-2" />
                                        <span className="text-sm font-bold">Crédito</span>
                                    </label>

                                    <label className={`border rounded-xl p-4 cursor-pointer flex flex-col items-center justify-center transition-all ${selectedPaymentMethod === PaymentType.DEBIT.toString() ? 'border-indigo-600 bg-indigo-50 text-indigo-700 ring-1 ring-indigo-600' : 'border-gray-200 hover:border-indigo-200'}`}>
                                        <input type="radio" value={PaymentType.DEBIT} {...register('paymentMethod')} className="sr-only" />
                                        <CreditCard className="mb-2" />
                                        <span className="text-sm font-bold">Débito</span>
                                    </label>

                                    <label className={`border rounded-xl p-4 cursor-pointer flex flex-col items-center justify-center transition-all ${selectedPaymentMethod === PaymentType.CASH.toString() ? 'border-indigo-600 bg-indigo-50 text-indigo-700 ring-1 ring-indigo-600' : 'border-gray-200 hover:border-indigo-200'}`}>
                                        <input type="radio" value={PaymentType.CASH} {...register('paymentMethod')} className="sr-only" />
                                        <Banknote className="mb-2" />
                                        <span className="text-sm font-bold">Efectivo</span>
                                    </label>
                                </div>

                                {/* Formulario Tarjeta */}
                                {isCardPayment && (
                                    <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 animate-fade-in">
                                        <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
                                            <div className="sm:col-span-2">
                                                <label className="block text-sm font-medium text-gray-700">Número de Tarjeta</label>
                                                <input
                                                    type="text"
                                                    {...register('cardNumber', { required: isCardPayment })}
                                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3 border"
                                                    placeholder="0000 0000 0000 0000"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Vencimiento</label>
                                                <input
                                                    type="text"
                                                    {...register('expiryDate', { required: isCardPayment })}
                                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3 border"
                                                    placeholder="MM/YY"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">CVC</label>
                                                <input
                                                    type="text"
                                                    {...register('cvv', { required: isCardPayment })}
                                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3 border"
                                                    placeholder="123"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {selectedPaymentMethod === PaymentType.CASH.toString() && (
                                    <div className="bg-green-50 p-4 rounded-xl border border-green-100 text-green-800 text-sm">
                                        <p className="flex items-center">
                                            <Banknote className="w-4 h-4 mr-2" />
                                            Por favor ten el monto exacto al momento de la entrega.
                                        </p>
                                    </div>
                                )}
                            </section>

                            <div className="pt-6 border-t border-gray-100">
                                <button
                                    type="submit"
                                    disabled={isProcessing}
                                    className="w-full flex items-center justify-center px-8 py-4 border border-transparent text-lg font-bold rounded-xl text-white bg-gray-900 hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 shadow-lg transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {isProcessing ? (
                                        <span className="flex items-center">Procesando Orden...</span>
                                    ) : (
                                        <>
                                            Confirmar Pago ${finalTotal.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                                            <ArrowRight className="ml-2 w-5 h-5" />
                                        </>
                                    )}
                                </button>
                                <div className="mt-4 flex items-center justify-center text-sm text-gray-500">
                                    <ShieldCheck className="w-4 h-4 mr-1 text-green-500" />
                                    Transacción Segura SSL Encriptada
                                </div>
                            </div>
                        </form>
                    </div>

                    {/* Resumen Lateral */}
                    <div className="mt-10 lg:mt-0">
                        <div className="bg-gray-50 rounded-2xl border border-gray-200 p-6 sm:p-8 sticky top-8">
                            <h3 className="text-xl font-bold text-gray-900 mb-6">Resumen de Orden</h3>
                            <ul className="divide-y divide-gray-200">
                                {cart.map((item) => (
                                    <li key={item.id_key} className="py-4 flex">
                                        <div className="flex-1">
                                            <h4 className="text-sm font-bold text-gray-900">{item.name}</h4>
                                            <p className="mt-1 text-xs text-gray-500">Cant: {item.quantity}</p>
                                        </div>
                                        <p className="text-sm font-medium text-gray-900">
                                            ${(item.price * item.quantity).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                                        </p>
                                    </li>
                                ))}
                            </ul>

                            <dl className="mt-6 space-y-4 pt-6 border-t border-gray-200">
                                <div className="flex items-center justify-between">
                                    <dt className="text-sm text-gray-600">Subtotal</dt>
                                    <dd className="text-sm font-medium text-gray-900">${subtotal.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</dd>
                                </div>
                                <div className="flex items-center justify-between">
                                    <dt className="text-sm text-gray-600">Impuestos (21%)</dt>
                                    <dd className="text-sm font-medium text-gray-900">${taxAmount.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</dd>
                                </div>
                                <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                                    <dt className="text-lg font-bold text-gray-900">Total</dt>
                                    <dd className="text-lg font-bold text-indigo-600">${finalTotal.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</dd>
                                </div>
                            </dl>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .animate-fade-in {
                    animation: fadeIn 0.5s ease-in-out;
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}