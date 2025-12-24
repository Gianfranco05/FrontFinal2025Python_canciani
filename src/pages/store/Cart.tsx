import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { Trash2, ArrowRight, Minus, Plus, ShoppingBag } from 'lucide-react';

export function Cart() {
    // Usamos 'cart' en lugar de 'items' para coincidir con el Context
    const { cart, removeFromCart, updateQuantity, total, clearCart } = useCart();
    const navigate = useNavigate();

    if (cart.length === 0) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
                <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6 animate-pulse">
                    <ShoppingBag className="w-10 h-10 text-gray-300" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-3">Your cart is empty</h2>
                <p className="text-gray-500 mb-8 max-w-md">Looks like you haven't added anything yet. Discover our premium collection and find what you love.</p>
                <Link 
                    to="/shop" 
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-full text-white bg-indigo-600 hover:bg-indigo-700 transition-all shadow-lg hover:shadow-indigo-200"
                >
                    Start Shopping &rarr;
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-extrabold text-gray-900 mb-10 flex items-center">
                    Shopping Cart
                    <span className="ml-4 text-sm font-normal text-gray-500 bg-white px-3 py-1 rounded-full border border-gray-200">
                        {cart.length} items
                    </span>
                </h1>

                <div className="lg:grid lg:grid-cols-12 lg:gap-x-12 lg:items-start">
                    {/* Lista de productos */}
                    <section className="lg:col-span-7">
                        <ul className="space-y-4">
                            {cart.map((item) => (
                                <li key={item.id_key} className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
                                    
                                    {/* Info del Producto */}
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-lg font-bold text-gray-900 truncate">
                                            <Link to={`/shop/${item.id_key}`} className="hover:text-indigo-600 transition-colors">
                                                {item.name}
                                            </Link>
                                        </h3>
                                        <p className="mt-1 text-sm text-gray-500">
                                            Price: <span className="font-medium text-gray-900">${item.price.toFixed(2)}</span>
                                        </p>
                                    </div>

                                    {/* Controles de Cantidad y Subtotal */}
                                    <div className="mt-4 sm:mt-0 flex items-center justify-between w-full sm:w-auto sm:space-x-8">
                                        
                                        {/* Selector de Cantidad */}
                                        <div className="flex items-center bg-gray-50 rounded-lg p-1 border border-gray-200">
                                            <button
                                                className="p-1 text-gray-400 hover:text-indigo-600 hover:bg-white rounded-md transition-all disabled:opacity-50"
                                                onClick={() => updateQuantity(item.id_key, item.quantity - 1)}
                                                disabled={item.quantity <= 1}
                                            >
                                                <Minus size={16} />
                                            </button>
                                            <span className="w-8 text-center text-sm font-semibold text-gray-900">
                                                {item.quantity}
                                            </span>
                                            <button
                                                className="p-1 text-gray-400 hover:text-indigo-600 hover:bg-white rounded-md transition-all"
                                                onClick={() => updateQuantity(item.id_key, item.quantity + 1)}
                                            >
                                                <Plus size={16} />
                                            </button>
                                        </div>

                                        {/* Precio Total Item */}
                                        <div className="flex flex-col items-end min-w-[5rem]">
                                            <span className="text-lg font-bold text-gray-900">
                                                ${(item.price * item.quantity).toFixed(2)}
                                            </span>
                                        </div>

                                        {/* Botón Eliminar */}
                                        <button
                                            onClick={() => removeFromCart(item.id_key)}
                                            className="ml-4 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                                            title="Remove item"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                        
                        <div className="mt-6 flex justify-end">
                            <button
                                onClick={clearCart}
                                className="text-sm font-medium text-red-500 hover:text-red-700 transition-colors flex items-center px-4 py-2 rounded-lg hover:bg-red-50"
                            >
                                <Trash2 size={14} className="mr-2" />
                                Clear Cart
                            </button>
                        </div>
                    </section>

                    {/* Resumen del Pedido (Sticky) */}
                    <section className="lg:col-span-5 mt-10 lg:mt-0">
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sm:p-8 sticky top-24">
                            <h2 className="text-lg font-bold text-gray-900 mb-6">Order Summary</h2>
                            
                            <dl className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <dt className="text-gray-500">Subtotal</dt>
                                    <dd className="font-medium text-gray-900">${total.toFixed(2)}</dd>
                                </div>
                                <div className="flex items-center justify-between">
                                    <dt className="text-gray-500">Shipping Estimate</dt>
                                    <dd className="font-medium text-green-600">Free</dd>
                                </div>
                                <div className="flex items-center justify-between">
                                    <dt className="text-gray-500">Tax Estimate</dt>
                                    <dd className="font-medium text-gray-900">${(total * 0.21).toFixed(2)}</dd>
                                </div>
                                
                                <div className="border-t border-gray-200 pt-4 flex items-center justify-between">
                                    <dt className="text-xl font-extrabold text-gray-900">Total</dt>
                                    <dd className="text-xl font-extrabold text-indigo-600">
                                        ${(total * 1.21).toFixed(2)}
                                    </dd>
                                </div>
                            </dl>

                            <div className="mt-8">
                                <button
                                    onClick={() => navigate('/checkout')}
                                    className="w-full flex items-center justify-center px-6 py-4 border border-transparent text-lg font-bold rounded-xl text-white bg-gray-900 hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
                                >
                                    Proceed to Checkout
                                    <ArrowRight className="ml-2 w-5 h-5" />
                                </button>
                                <p className="mt-4 text-center text-xs text-gray-400">
                                    Secure Checkout powered by Stripe
                                </p>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}