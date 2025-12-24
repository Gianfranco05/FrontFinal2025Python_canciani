import { Link } from 'react-router-dom';
import { ShoppingCart, Menu, X, User, LayoutDashboard } from 'lucide-react';
import { useState } from 'react';
import { useCart } from '../context/CartContext';

export function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { itemCount, total } = useCart();

    return (
        <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 bg-opacity-80 backdrop-blur-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    {/* Logo */}
                    <div className="flex items-center">
                        <Link to="/" className="flex items-center">
                            <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                                STORE.
                            </span>
                        </Link>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center space-x-8">
                        <Link to="/" className="text-gray-600 hover:text-indigo-600 font-medium transition-colors">Home</Link>
                        <Link to="/shop" className="text-gray-600 hover:text-indigo-600 font-medium transition-colors">Shop</Link>
                        
                        {/* Cart, Profile & Admin Section */}
                        <div className="flex items-center space-x-6 pl-6 border-l border-gray-200">
                            
                            {/* Carrito con Total */}
                            <Link to="/cart" className="group flex items-center bg-gray-50 rounded-full px-4 py-2 hover:bg-indigo-50 transition-all">
                                <div className="relative">
                                    <ShoppingCart className="h-5 w-5 text-gray-600 group-hover:text-indigo-600" />
                                    {itemCount > 0 && (
                                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
                                            {itemCount}
                                        </span>
                                    )}
                                </div>
                                <div className="ml-3 flex flex-col items-end">
                                    <span className="text-xs text-gray-500 font-medium uppercase">Total</span>
                                    <span className="text-sm font-bold text-gray-900 group-hover:text-indigo-700">
                                        ${total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                    </span>
                                </div>
                            </Link>

                            <div className="flex items-center space-x-2">
                                {/* Botón Dashboard (Admin) */}
                                <Link 
                                    to="/admin" 
                                    className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all"
                                    title="Admin Dashboard"
                                >
                                    <LayoutDashboard className="h-6 w-6" />
                                </Link>

                                {/* Botón Perfil */}
                                <Link 
                                    to="/profile" 
                                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-full transition-colors"
                                    title="User Profile"
                                >
                                    <User className="h-6 w-6" />
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="flex items-center md:hidden">
                        <Link to="/cart" className="mr-4 flex flex-col items-end">
                             <span className="text-xs font-bold text-indigo-600">
                                ${total.toFixed(2)}
                             </span>
                        </Link>
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="text-gray-500 hover:text-gray-700 focus:outline-none"
                        >
                            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="md:hidden bg-white border-t border-gray-100 shadow-xl">
                    <div className="pt-2 pb-3 space-y-1 px-4">
                        <Link
                            to="/"
                            className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Home
                        </Link>
                        <Link
                            to="/shop"
                            className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Shop
                        </Link>
                        <Link
                            to="/cart"
                            className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Cart (Total: ${total.toFixed(2)})
                        </Link>
                        <div className="border-t border-gray-100 my-2 pt-2">
                             <Link
                                to="/admin"
                                className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                <LayoutDashboard className="h-5 w-5 mr-3" />
                                Admin Dashboard
                            </Link>
                             <Link
                                to="/profile"
                                className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                <User className="h-5 w-5 mr-3" />
                                My Profile
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
}