import { Link, useLocation } from 'react-router-dom';
import { cn } from '../lib/utils';
import { 
    LayoutDashboard, 
    Package, 
    Tags, 
    Users, 
    MapPin, 
    ShoppingCart, 
    Receipt, 
    Star 
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Products', href: '/admin/products', icon: Package },
  { name: 'Categories', href: '/admin/categories', icon: Tags },
  { name: 'Clients', href: '/admin/clients', icon: Users },
  { name: 'Addresses', href: '/admin/addresses', icon: MapPin },
  { name: 'Orders', href: '/admin/orders', icon: ShoppingCart },
  { name: 'Bills', href: '/admin/bills', icon: Receipt },
  { name: 'Reviews', href: '/admin/reviews', icon: Star },
];

export function Sidebar() {
  const location = useLocation();

  return (
    <div className="flex flex-col w-64 bg-slate-900 text-white min-h-screen flex-shrink-0">
      <div className="flex items-center justify-center h-16 border-b border-slate-800">
        <Link to="/admin" className="text-2xl font-bold text-indigo-500">E-Com Admin</Link>
      </div>
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="px-2 space-y-1">
            {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                    <Link
                        key={item.name}
                        to={item.href}
                        className={cn(
                            "group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors",
                            isActive 
                                ? "bg-indigo-600 text-white" 
                                : "text-slate-300 hover:bg-slate-800 hover:text-white"
                        )}
                    >
                        <item.icon className="mr-3 h-6 w-6 flex-shrink-0" aria-hidden="true" />
                        {item.name}
                    </Link>
                )
            })}
        </nav>
      </div>
    </div>
  );
}
