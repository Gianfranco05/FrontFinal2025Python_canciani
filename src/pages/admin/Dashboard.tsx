import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { 
    BarChart, 
    Bar, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    Legend, 
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from 'recharts';
import { 
    Package, 
    Users, 
    ShoppingCart, 
    TrendingUp,
    AlertCircle
} from 'lucide-react';
import { 
    productService, 
    categoryService, 
    clientService, 
    orderService, 
    billService 
} from '../../api/services';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export function Dashboard() {
    // 1. Fetch Data
    const { data: products = [] } = useQuery({ queryKey: ['products'], queryFn: () => productService.getAll() });
    const { data: categories = [] } = useQuery({ queryKey: ['categories'], queryFn: () => categoryService.getAll() });
    const { data: clients = [] } = useQuery({ queryKey: ['clients'], queryFn: () => clientService.getAll() });
    const { data: orders = [] } = useQuery({ queryKey: ['orders'], queryFn: () => orderService.getAll() });
    const { data: bills = [] } = useQuery({ queryKey: ['bills'], queryFn: () => billService.getAll() });

    // 2. Compute Stats
    const totalRevenue = bills.reduce((acc, bill) => acc + bill.total, 0);
    const totalOrders = orders.length;
    const totalClients = clients.length;
    const totalProducts = products.length;
    const lowStockCount = products.filter(p => p.stock < 10).length;

    // 3. Prepare Chart Data
    // Products per Category
    const productsByCategory = categories.map(cat => ({
        name: cat.name,
        value: products.filter(p => p.category_id === cat.id_key).length
    })).filter(item => item.value > 0);

    // Recent Orders (Last 5)
    const recentOrders = [...orders]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5);

    // Revenue Trend (Simple: Last 5 Bills) - Ideally grouped by date
    const revenueTrend = [...bills]
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(-7)
        .map(bill => ({
            date: new Date(bill.date).toLocaleDateString(),
            amount: bill.total
        }));

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Dashboard Overview</h2>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {/* Revenue */}
                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <TrendingUp className="h-6 w-6 text-gray-400" aria-hidden="true" />
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">Total Revenue</dt>
                                    <dd className="text-lg font-medium text-gray-900">${totalRevenue.toLocaleString()}</dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-50 px-5 py-3">
                        <div className="text-sm">
                            <Link to="/admin/bills" className="font-medium text-indigo-600 hover:text-indigo-500">
                                View all bills
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Orders */}
                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <ShoppingCart className="h-6 w-6 text-gray-400" aria-hidden="true" />
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">Total Orders</dt>
                                    <dd className="text-lg font-medium text-gray-900">{totalOrders}</dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-50 px-5 py-3">
                        <div className="text-sm">
                            <Link to="/admin/orders" className="font-medium text-indigo-600 hover:text-indigo-500">
                                View all orders
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Clients */}
                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <Users className="h-6 w-6 text-gray-400" aria-hidden="true" />
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">Total Clients</dt>
                                    <dd className="text-lg font-medium text-gray-900">{totalClients}</dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-50 px-5 py-3">
                        <div className="text-sm">
                            <Link to="/admin/clients" className="font-medium text-indigo-600 hover:text-indigo-500">
                                View all clients
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Products */}
                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <Package className="h-6 w-6 text-gray-400" aria-hidden="true" />
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">Total Products</dt>
                                    <dd className="text-lg font-medium text-gray-900">{totalProducts}</dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-50 px-5 py-3">
                        <div className="text-sm">
                            <Link to="/admin/products" className="font-medium text-indigo-600 hover:text-indigo-500">
                                View all products
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue Chart */}
                <div className="bg-white shadow rounded-lg p-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Revenue Trend (Last Bills)</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={revenueTrend}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="amount" fill="#4F46E5" name="Amount ($)" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Categories Pie Chart */}
                <div className="bg-white shadow rounded-lg p-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Products per Category</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={productsByCategory}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {productsByCategory.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Recent Orders & Low Stock */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Orders */}
                <div className="bg-white shadow rounded-lg overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-medium text-gray-900">Recent Orders</h3>
                    </div>
                    <ul className="divide-y divide-gray-200">
                        {recentOrders.map((order) => (
                            <li key={order.id_key} className="px-6 py-4">
                                <div className="flex items-center justify-between">
                                    <div className="text-sm font-medium text-indigo-600">
                                        Order #{order.id_key}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        {new Date(order.date).toLocaleDateString()}
                                    </div>
                                </div>
                                <div className="mt-1 flex justify-between">
                                    <p className="text-sm text-gray-500">Total: ${order.total}</p>
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                        ${order.status === 3 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                        {order.status === 3 ? 'Delivered' : 'Pending'}
                                    </span>
                                </div>
                            </li>
                        ))}
                        {recentOrders.length === 0 && (
                            <li className="px-6 py-4 text-center text-gray-500">No orders yet</li>
                        )}
                    </ul>
                    <div className="bg-gray-50 px-6 py-3 text-right">
                        <Link to="/admin/orders" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                            View all
                        </Link>
                    </div>
                </div>

                {/* Low Stock Alerts */}
                <div className="bg-white shadow rounded-lg overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                        <h3 className="text-lg font-medium text-gray-900">Low Stock Alert</h3>
                        {lowStockCount > 0 && (
                            <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-bold">
                                {lowStockCount} Items
                            </span>
                        )}
                    </div>
                    <ul className="divide-y divide-gray-200">
                        {products.filter(p => p.stock < 10).slice(0, 5).map(product => (
                            <li key={product.id_key} className="px-6 py-4 flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-900">{product.name}</p>
                                    <p className="text-xs text-gray-500">Category: {categories.find(c => c.id_key === product.category_id)?.name}</p>
                                </div>
                                <div className="flex items-center text-red-600">
                                    <AlertCircle className="w-4 h-4 mr-1" />
                                    <span className="text-sm font-bold">{product.stock} left</span>
                                </div>
                            </li>
                        ))}
                        {lowStockCount === 0 && (
                            <li className="px-6 py-4 text-center text-green-600 font-medium">All stock levels good</li>
                        )}
                    </ul>
                    <div className="bg-gray-50 px-6 py-3 text-right">
                        <Link to="/admin/products" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                            Manage Inventory
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
