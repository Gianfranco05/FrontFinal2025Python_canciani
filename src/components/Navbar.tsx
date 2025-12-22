import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { ShoppingCart, User, LogIn } from 'lucide-react';

export function Navbar() {
    const { items } = useCart();
    const cartCount = items.reduce((acc, item) => acc + item.quantity, 0);

    return (
        <nav className="bg-white shadow-sm sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex">
                        <Link to="/" className="flex-shrink-0 flex items-center">
                            <span className="font-bold text-xl text-indigo-600">Store</span>
                        </Link>
                        <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                            <Link to="/" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                                Home
                            </Link>
                            <Link to="/shop" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                                Shop
                            </Link>
                        </div>
                    </div>
                    <div className="flex items-center space-x-4">
                        <Link to="/admin" className="text-sm font-medium text-gray-500 hover:text-gray-900 flex items-center">
                             <LogIn className="w-4 h-4 mr-1"/> Admin Panel
                        </Link>
                        <Link to="/cart" className="relative p-2 text-gray-400 hover:text-gray-500">
                            <span className="sr-only">View cart</span>
                            <ShoppingCart className="h-6 w-6" />
                            {cartCount > 0 && (
                                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-600 rounded-full">
                                    {cartCount}
                                </span>
                            )}
                        </Link>
                        <Link to="/profile" className="p-2 text-gray-400 hover:text-gray-500">
                            <span className="sr-only">Profile</span>
                            <User className="h-6 w-6" />
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    );
}
