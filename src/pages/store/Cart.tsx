import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { Trash2, ArrowRight } from 'lucide-react';

export function Cart() {
    const { items, removeFromCart, updateQuantity, total, clearCart } = useCart();
    const navigate = useNavigate();

    if (items.length === 0) {
        return (
            <div className="text-center py-16">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
                <p className="text-gray-500 mb-8">Looks like you haven't added anything to your cart yet.</p>
                <Link to="/shop" className="text-indigo-600 font-medium hover:text-indigo-500">
                    Continue Shopping &rarr;
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
             <div className="bg-white shadow overflow-hidden rounded-lg">
                <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                    <h2 className="text-lg leading-6 font-medium text-gray-900">Shopping Cart</h2>
                </div>
                <ul className="divide-y divide-gray-200">
                    {items.map((item) => (
                        <li key={item.id_key} className="px-4 py-4 sm:px-6 flex items-center justify-between">
                            <div className="flex items-center flex-1">
                                <div className="h-16 w-16 bg-gray-100 rounded-md flex items-center justify-center text-gray-400 font-bold text-xl">
                                    {item.name.charAt(0)}
                                </div>
                                <div className="ml-4 flex-1">
                                    <div className="flex justify-between">
                                        <h3 className="text-sm font-medium text-indigo-600 truncate">
                                            <Link to={`/shop/${item.id_key}`}>{item.name}</Link>
                                        </h3>
                                        <p className="ml-2 text-sm text-gray-500">${(item.price * item.quantity).toFixed(2)}</p>
                                    </div>
                                    <div className="mt-2 flex justify-between items-center">
                                        <div className="flex items-center border border-gray-300 rounded-md">
                                            <button
                                                className="px-2 py-1 text-gray-600 hover:bg-gray-100 cursor-pointer"
                                                onClick={() => updateQuantity(item.id_key, item.quantity - 1)}
                                            >-</button>
                                            <span className="px-2 py-1 text-sm font-medium text-gray-900 border-l border-r border-gray-300 min-w-[2rem] text-center">
                                                {item.quantity}
                                            </span>
                                            <button
                                                className="px-2 py-1 text-gray-600 hover:bg-gray-100 cursor-pointer"
                                                onClick={() => updateQuantity(item.id_key, item.quantity + 1)}
                                            >+</button>
                                        </div>
                                        <button
                                            onClick={() => removeFromCart(item.id_key)}
                                            className="text-red-600 hover:text-red-900 p-2 cursor-pointer"
                                            title="Remove"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
                <div className="bg-gray-50 px-4 py-5 sm:px-6">
                    <div className="flex justify-between text-base font-medium text-gray-900 mb-4">
                        <p>Subtotal</p>
                        <p>${total.toFixed(2)}</p>
                    </div>
                    <div className="flex justify-between items-center">
                        <button
                            onClick={clearCart}
                            className="text-sm text-red-600 hover:text-red-800 cursor-pointer"
                        >
                            Clear Cart
                        </button>
                        <button
                            onClick={() => navigate('/checkout')}
                            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 cursor-pointer"
                        >
                            Checkout <ArrowRight className="ml-2 w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
