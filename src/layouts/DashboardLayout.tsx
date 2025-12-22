import { Outlet, Link } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { Home } from 'lucide-react';

export function DashboardLayout() {
    return (
        <div className="flex h-screen bg-gray-100">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="bg-white shadow-sm z-10">
                    <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
                        <h1 className="text-2xl font-semibold text-gray-900">Admin Dashboard</h1>
                         <div className="flex items-center space-x-4">
                            <Link to="/" className="text-gray-500 hover:text-gray-700 flex items-center gap-1">
                                <Home className="w-4 h-4" /> Back to Store
                            </Link>
                        </div>
                    </div>
                </header>
                <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
