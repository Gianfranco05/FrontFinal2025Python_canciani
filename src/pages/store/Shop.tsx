import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { productService, categoryService } from '../../api/services';
import { useCart } from '../../context/CartContext';
import { Filter, ShoppingCart } from 'lucide-react';

export function Shop() {
    const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
    const { addToCart } = useCart();

    const { data: products = [], isLoading: isLoadingProducts } = useQuery({
        queryKey: ['products'],
        queryFn: () => productService.getAll()
    });

    const { data: categories = [] } = useQuery({
        queryKey: ['categories'],
        queryFn: () => categoryService.getAll()
    });

    const filteredProducts = selectedCategory
        ? products.filter(p => p.category_id === selectedCategory)
        : products;

    if (isLoadingProducts) return <div className="text-center py-10">Loading products...</div>;

    return (
        <div className="bg-white">
            <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
                    <h2 className="text-3xl font-extrabold tracking-tight text-gray-900">Shop All Products</h2>
                    <div className="mt-4 md:mt-0 flex items-center space-x-4">
                        <div className="flex items-center">
                            <Filter className="h-5 w-5 text-gray-400 mr-2" />
                            <select
                                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                                value={selectedCategory || ''}
                                onChange={(e) => setSelectedCategory(e.target.value ? Number(e.target.value) : null)}
                            >
                                <option value="">All Categories</option>
                                {categories.map(category => (
                                    <option key={category.id_key} value={category.id_key}>
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-y-10 sm:grid-cols-2 gap-x-6 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">
                    {filteredProducts.map((product) => (
                        <div key={product.id_key} className="group relative border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                            <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-lg bg-gray-200 xl:aspect-w-7 xl:aspect-h-8">
                                <div className="h-full w-full flex items-center justify-center bg-gray-100 text-gray-400 font-bold text-4xl">
                                    {product.name.charAt(0)}
                                </div>
                            </div>
                            <div className="mt-4 flex justify-between">
                                <div>
                                    <h3 className="text-sm text-gray-700">
                                        <Link to={`/shop/${product.id_key}`}>
                                            <span aria-hidden="true" className="absolute inset-0" />
                                            {product.name}
                                        </Link>
                                    </h3>
                                    <p className="mt-1 text-sm text-gray-500">{categories.find(c => c.id_key === product.category_id)?.name}</p>
                                </div>
                                <p className="text-sm font-medium text-gray-900">${product.price}</p>
                            </div>
                            <div className="mt-4">
                                <button
                                    onClick={(e) => {
                                        e.preventDefault(); 
                                        e.stopPropagation();
                                        addToCart(product); 
                                    }}
                                    className="w-full flex items-center justify-center bg-indigo-600 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 cursor-pointer z-10 relative"
                                >
                                    <ShoppingCart className="w-4 h-4 mr-2" /> Add to Cart
                                </button>
                            </div>
                        </div>
                    ))}
                    {filteredProducts.length === 0 && (
                        <div className="col-span-full text-center text-gray-500 py-10">
                            No products found.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
