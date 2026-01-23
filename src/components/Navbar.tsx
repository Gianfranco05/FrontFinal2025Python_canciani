import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, Menu, X, User, LayoutDashboard, Sparkles } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';

export function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const { itemCount, total } = useCart();
    const location = useLocation();

    // Efecto de scroll para cambiar la apariencia de la navbar
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const isActive = (path: string) => location.pathname === path;

    return (
        <nav className={`sticky top-0 z-50 transition-all duration-500 ${isScrolled
                ? 'bg-white/80 backdrop-blur-lg shadow-lg py-2'
                : 'bg-white py-4'
            }`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo con Animación */}
                    <div className="flex items-center">
                        <Link to="/" className="group flex items-center space-x-2">
                            <div className="p-2 bg-indigo-600 rounded-xl group-hover:rotate-12 transition-transform duration-300 shadow-indigo-200 shadow-lg">
                                <Sparkles className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-2xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 group-hover:opacity-80 transition-opacity">
                                Utn Store
                            </span>
                        </Link>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center space-x-1">
                        <div className="flex items-center space-x-1 bg-gray-100/50 p-1 rounded-full mr-6">
                            {[
                                { name: 'Home', path: '/' },
                                { name: 'Shop', path: '/shop' }
                            ].map((link) => (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    className={`px-6 py-2 rounded-full text-sm font-bold transition-all duration-300 ${isActive(link.path)
                                            ? 'bg-white text-indigo-600 shadow-sm'
                                            : 'text-gray-500 hover:text-gray-900 hover:bg-white/40'
                                        }`}
                                >
                                    {link.name}
                                </Link>
                            ))}
                        </div>

                        {/* Actions Section */}
                        <div className="flex items-center space-x-4 pl-6 border-l border-gray-100">

                            {/* Carrito Dinámico */}
                            <Link to="/cart" className="group relative flex items-center bg-gray-900 text-white rounded-2xl px-5 py-2.5 hover:bg-indigo-600 hover:shadow-xl hover:shadow-indigo-100 hover:-translate-y-0.5 transition-all duration-300">
                                <div className="relative mr-3">
                                    <ShoppingCart className={`h-5 w-5 ${itemCount > 0 ? 'animate-bounce-short' : ''}`} />
                                    {itemCount > 0 && (
                                        <span className="absolute -top-3 -right-3 bg-pink-500 text-white text-[10px] font-black h-5 w-5 rounded-full flex items-center justify-center border-2 border-gray-900 group-hover:border-indigo-600 transition-colors">
                                            {itemCount}
                                        </span>
                                    )}
                                </div>
                                <div className="flex flex-col items-start leading-none">
                                    <span className="text-[10px] text-indigo-200 font-bold uppercase tracking-wider">Mi Carrito</span>
                                    <span className="text-sm font-black whitespace-nowrap">
                                        ${total.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                                    </span>
                                </div>
                            </Link>

                            <div className="flex items-center space-x-2">
                                <Link
                                    to="/admin"
                                    className="p-3 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-2xl transition-all duration-300 transform hover:scale-110 active:scale-95"
                                    title="Admin Dashboard"
                                >
                                    <LayoutDashboard className="h-6 w-6" />
                                </Link>

                                <Link
                                    to="/profile"
                                    className="p-3 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-2xl transition-all duration-300 transform hover:scale-110 active:scale-95 border border-transparent hover:border-purple-100"
                                    title="User Profile"
                                >
                                    <User className="h-6 w-6" />
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="flex items-center md:hidden space-x-4">
                        <Link to="/cart" className="relative p-2 bg-gray-100 rounded-xl">
                            <ShoppingCart className="h-6 w-6 text-gray-700" />
                            {itemCount > 0 && <span className="absolute top-0 right-0 h-3 w-3 bg-indigo-600 rounded-full border-2 border-white"></span>}
                        </Link>
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="p-2 rounded-xl bg-gray-900 text-white hover:bg-indigo-600 transition-colors shadow-lg"
                        >
                            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu con Animación de Slide/Fade */}
            <div className={`md:hidden absolute w-full transition-all duration-500 ease-in-out ${isMenuOpen ? 'top-full opacity-100' : '-top-96 opacity-0 pointer-events-none'
                }`}>
                <div className="mx-4 mt-2 p-4 bg-white rounded-3xl shadow-2xl border border-gray-100 space-y-2">
                    <Link
                        to="/"
                        className={`flex items-center px-4 py-4 rounded-2xl text-lg font-bold transition-all ${isActive('/') ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-50'
                            }`}
                        onClick={() => setIsMenuOpen(false)}
                    >
                        Home
                    </Link>
                    <Link
                        to="/shop"
                        className={`flex items-center px-4 py-4 rounded-2xl text-lg font-bold transition-all ${isActive('/shop') ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-50'
                            }`}
                        onClick={() => setIsMenuOpen(false)}
                    >
                        Shop
                    </Link>

                    <div className="pt-4 mt-4 border-t border-gray-100 grid grid-cols-2 gap-3">
                        <Link
                            to="/admin"
                            className="flex flex-col items-center justify-center p-4 rounded-2xl bg-gray-50 text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 transition-all font-bold text-sm"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            <LayoutDashboard className="h-6 w-6 mb-2" />
                            Admin
                        </Link>
                        <Link
                            to="/profile"
                            className="flex flex-col items-center justify-center p-4 rounded-2xl bg-gray-50 text-gray-600 hover:bg-purple-50 hover:text-purple-600 transition-all font-bold text-sm"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            <User className="h-6 w-6 mb-2" />
                            Perfil
                        </Link>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes bounce-short {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-4px); }
                }
                .animate-bounce-short {
                    animation: bounce-short 1s ease-in-out infinite;
                }
            `}</style>
        </nav>
    );
}