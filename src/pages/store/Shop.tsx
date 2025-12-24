import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { productService, categoryService } from '../../api/services';
import { useCart } from '../../context/CartContext';
import { Filter, ShoppingCart, Tag, ArrowRight, Sparkles } from 'lucide-react';

// Diccionario para traducir los nombres de las categorías (Backend -> Frontend)
const categoryTranslations: Record<string, string> = {
    'Electronics': 'Electrónica',
    'Clothing': 'Ropa',
    'Home': 'Hogar',
    'Sports': 'Deporte'
};

// Función con las descripciones en ESPAÑOL
const getProductDescription = (categoryName: string = 'General') => {
    const descriptions: Record<string, string> = {
        'Electronics': 'Experimenta la tecnología de vanguardia con este dispositivo electrónico premium. Diseñado para ofrecer rendimiento y fiabilidad.',
        'Clothing': 'Mejora tu estilo con esta pieza de fabricación experta. Fabricada con materiales de alta calidad para máxima comodidad y durabilidad.',
        'Home': 'Transforma tu espacio vital con este complemento elegante y funcional. Perfecto para hogares modernos.',
        'Sports': 'Supera tus límites con equipos diseñados para un rendimiento óptimo. Diseñados para complementar tu estilo de vida activo.',
        'default': 'Este producto representa nuestro compromiso con la calidad y la satisfacción del cliente. Cuidadosamente seleccionado para ti.'
    };
    // Intentamos buscar por el nombre en inglés (que viene de la BD)
    return descriptions[categoryName] || descriptions['default'];
};

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

    return (
        <div className="min-h-screen bg-gray-50 font-sans selection:bg-indigo-100 selection:text-indigo-800">
            
            {/* Header Minimalista */}
            <div className="bg-white border-b border-gray-100 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-end gap-6">
                    <div>
                        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl">
                            La Colección
                        </h1>
                        <p className="mt-3 text-lg text-gray-500 max-w-xl">
                            Artículos seleccionados para personas exigentes. Calidad sobre cantidad.
                        </p>
                    </div>

                    {/* Selector de Categoría */}
                    <div className="flex items-center space-x-2 bg-gray-50 p-1.5 rounded-full border border-gray-200">
                        <div className="pl-3 pr-2 text-gray-400">
                            <Filter size={18} />
                        </div>
                        <select
                            className="bg-transparent border-none text-sm font-medium text-gray-700 focus:ring-0 cursor-pointer py-1 pr-8"
                            value={selectedCategory || ''}
                            onChange={(e) => setSelectedCategory(e.target.value ? Number(e.target.value) : null)}
                        >
                            <option value="">Todas las Categorías</option>
                            {categories.map(category => (
                                <option key={category.id_key} value={category.id_key}>
                                    {/* Traducimos el nombre en el selector también */}
                                    {categoryTranslations[category.name] || category.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Grid de Productos */}
            <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                {isLoadingProducts ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="h-64 bg-gray-100 rounded-xl animate-pulse"></div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredProducts.map((product) => {
                            const rawCategoryName = categories.find(c => c.id_key === product.category_id)?.name;
                            const displayCategoryName = categoryTranslations[rawCategoryName || ''] || rawCategoryName || 'Producto';
                            
                            return (
                                <div 
                                    key={product.id_key} 
                                    className="group relative flex flex-col justify-between bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all duration-300"
                                >
                                    <div>
                                        {/* Cabecera de la tarjeta */}
                                        <div className="flex justify-between items-start mb-6">
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 tracking-wide uppercase">
                                                <Tag size={10} className="mr-1.5" />
                                                {displayCategoryName}
                                            </span>
                                            {product.stock < 5 && (
                                                <span className="text-xs font-bold text-orange-500 flex items-center">
                                                    <Sparkles size={12} className="mr-1" />
                                                    Poco Stock
                                                </span>
                                            )}
                                        </div>

                                        {/* Título y Precio */}
                                        <Link to={`/shop/${product.id_key}`} className="block group-hover:text-indigo-600 transition-colors duration-200">
                                            <h3 className="text-2xl font-bold text-gray-900 leading-tight mb-2">
                                                {product.name}
                                            </h3>
                                        </Link>
                                        
                                        <p className="text-3xl font-extrabold text-gray-900 mb-6 tracking-tight">
                                            ${product.price.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                                        </p>

                                        {/* Descripción Generada en Español */}
                                        <div className="relative">
                                            <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gray-100 group-hover:bg-indigo-500 transition-colors duration-300"></div>
                                            <p className="pl-4 text-sm text-gray-500 leading-relaxed italic">
                                                "{getProductDescription(rawCategoryName)}"
                                            </p>
                                        </div>
                                    </div>

                                    {/* Acciones */}
                                    <div className="mt-8 pt-6 border-t border-gray-50 flex items-center justify-between gap-4">
                                        <button
                                            onClick={() => addToCart(product)}
                                            className="flex-1 flex items-center justify-center bg-gray-900 text-white px-4 py-3 rounded-xl font-bold text-sm shadow-md hover:bg-indigo-600 hover:shadow-indigo-200 hover:-translate-y-0.5 transition-all duration-300 active:scale-95"
                                        >
                                            <ShoppingCart size={18} className="mr-2" />
                                            Agregar
                                        </button>
                                        
                                        <Link 
                                            to={`/shop/${product.id_key}`}
                                            className="p-3 rounded-xl bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-indigo-600 transition-colors"
                                        >
                                            <ArrowRight size={20} />
                                        </Link>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
                
                {!isLoadingProducts && filteredProducts.length === 0 && (
                     <div className="text-center py-20">
                        <p className="text-gray-500 text-lg">No se encontraron productos en esta categoría.</p>
                        <button onClick={() => setSelectedCategory(null)} className="mt-4 text-indigo-600 font-medium hover:underline">
                            Ver todos los productos
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}