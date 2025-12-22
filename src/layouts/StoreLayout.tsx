import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/Navbar';

export function StoreLayout() {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />
            <main className="flex-1">
                <Outlet />
            </main>
            <footer className="bg-white border-t border-gray-200 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-500">
                    &copy; {new Date().getFullYear()} E-Store. All rights reserved.
                </div>
            </footer>
        </div>
    );
}
