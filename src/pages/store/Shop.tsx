import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { productService, categoryService } from '../../api/services';
import { useCart } from '../../context/CartContext';
import { Filter, ShoppingCart, Tag, ArrowRight, Sparkles, LayoutGrid, Shirt, Laptop, Home as HomeIcon, Watch, Headphones, Trophy } from 'lucide-react';

// Diccionario para traducir los nombres de las categorías (Backend -> Frontend)
const categoryTranslations: Record<string, string> = {
    'Ropa': 'Ropa',
    'Tecnología': 'Tecnología',
    'Hogar': 'Hogar',
    'Accesorios': 'Accesorios',
    'Audio': 'Audio',
    'Deportivo': 'Deportivo'
};

// Mapeo de iconos para las categorías
const categoryIcons: Record<string, any> = {
    'Ropa': Shirt,
    'Tecnología': Laptop,
    'Hogar': HomeIcon,
    'Accesorios': Watch,
    'Audio': Headphones,
    'Deportivo': Trophy,
    'default': Tag
};

// Función con las descripciones en ESPAÑOL
const getProductDescription = (categoryName: string = 'General') => {
    const descriptions: Record<string, string> = {
        'Tecnología': 'Tecnología de última generación.',
        'Ropa': 'Moda y tendencia premium.',
        'Hogar': 'Diseño y confort para tu hogar.',
        'Accesorios': 'Complementos con estilo.',
        'Audio': 'Sonido de alta fidelidad.',
        'Deportivo': 'Rendimiento y calidad deportiva.',
        'default': 'Calidad y estilo garantizado.'
    };
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

            {/* Header Premium */}
            <div className="relative overflow-hidden bg-white border-b border-gray-100 py-16 px-4 sm:px-6 lg:px-8">
                {/* Elementos decorativos de fondo */}
                <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-96 h-96 bg-indigo-50 rounded-full blur-3xl opacity-50"></div>
                <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-64 h-64 bg-purple-50 rounded-full blur-3xl opacity-50"></div>

                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10">
                        <div className="space-y-4">
                            <div className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold uppercase tracking-wider">
                                <Sparkles size={14} className="mr-2" />
                                Curated Collection
                            </div>
                            <h1 className="text-5xl font-black text-gray-900 tracking-tight sm:text-6xl">
                                La <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Colección</span>
                            </h1>
                            <p className="text-lg text-gray-500 max-w-2xl leading-relaxed">
                                Descubre nuestra selección exclusiva de productos diseñados para elevar tu estilo de vida.
                                <span className="hidden sm:inline"> Calidad excepcional en cada detalle.</span>
                            </p>
                        </div>

                        {/* Filtros de Categoría (Desplegable Premium) */}
                        <div className="w-full md:w-auto">
                            <div className="flex items-center gap-2 mb-4 text-sm font-bold text-gray-400 uppercase tracking-widest">
                                <Filter size={14} />
                                <span>Filtrar por</span>
                            </div>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-500 pointer-events-none group-focus-within:text-indigo-600 transition-colors">
                                    <LayoutGrid size={18} />
                                </div>
                                <select
                                    value={selectedCategory || ''}
                                    onChange={(e) => setSelectedCategory(e.target.value ? Number(e.target.value) : null)}
                                    className="appearance-none w-full md:w-64 pl-12 pr-10 py-3.5 bg-white border border-gray-200 rounded-2xl text-sm font-bold text-gray-700 shadow-sm hover:border-indigo-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 transition-all outline-none cursor-pointer"
                                >
                                    <option value="">Todas las Categorías</option>
                                    {categories.map(category => (
                                        <option key={category.id_key} value={category.id_key}>
                                            {categoryTranslations[category.name] || category.name}
                                        </option>
                                    ))}
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none group-hover:text-indigo-500 transition-colors">
                                    <ArrowRight size={16} className="rotate-90" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Grid de Productos */}
            <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
                {isLoadingProducts ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="h-[400px] bg-white rounded-3xl border border-gray-100 animate-pulse"></div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        {filteredProducts.map((product) => {
                            const rawCategoryName = categories.find(c => c.id_key === product.category_id)?.name;
                            const displayCategoryName = categoryTranslations[rawCategoryName || ''] || rawCategoryName || 'Producto';
                            const CategoryIcon = categoryIcons[rawCategoryName || ''] || categoryIcons.default;

                            return (
                                <div
                                    key={product.id_key}
                                    className="group relative flex flex-col justify-between bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-2xl hover:shadow-indigo-100/50 transition-all duration-500 hover:-translate-y-2"
                                >
                                    <div>
                                        {/* Cabecera de la tarjeta */}
                                        <div className="flex justify-between items-start mb-8">
                                            <span className="inline-flex items-center px-4 py-1.5 rounded-full text-[10px] font-black bg-indigo-50 text-indigo-700 tracking-[0.1em] uppercase">
                                                <CategoryIcon size={12} className="mr-2" />
                                                {displayCategoryName}
                                            </span>
                                            {product.stock < 5 && (
                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black bg-orange-50 text-orange-600 tracking-[0.1em] uppercase">
                                                    <Sparkles size={12} className="mr-1.5" />
                                                    Limited Stock
                                                </span>
                                            )}
                                        </div>

                                        {/* Título y Precio */}
                                        <Link to={`/shop/${product.id_key}`} className="block mb-4">
                                            <h3 className="text-2xl font-black text-gray-900 leading-tight group-hover:text-indigo-600 transition-colors duration-300">
                                                {product.name}
                                            </h3>
                                        </Link>

                                        <div className="flex items-baseline gap-2 mb-8">
                                            <span className="text-3xl font-black text-gray-900 tracking-tight">
                                                ${product.price.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                                            </span>
                                        </div>

                                        {/* Descripción Generada en Español */}
                                        <div className="relative mb-4">
                                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-100 rounded-full group-hover:bg-indigo-500 transition-colors duration-300"></div>
                                            <p className="pl-5 text-sm text-gray-500 leading-relaxed font-medium italic">
                                                "{getProductDescription(rawCategoryName)}"
                                            </p>
                                        </div>
                                    </div>

                                    {/* Acciones */}
                                    <div className="mt-8 pt-8 border-t border-gray-50 flex items-center justify-between gap-4">
                                        <button
                                            onClick={() => addToCart(product)}
                                            className="flex-1 flex items-center justify-center bg-gray-900 text-white px-6 py-4 rounded-2xl font-black text-sm shadow-xl shadow-gray-200 hover:bg-indigo-600 hover:shadow-indigo-200 transition-all duration-300 active:scale-95"
                                        >
                                            <ShoppingCart size={18} className="mr-2" />
                                            Añadir al Carrito
                                        </button>

                                        <Link
                                            to={`/shop/${product.id_key}`}
                                            className="p-4 rounded-2xl bg-gray-50 text-gray-400 hover:bg-indigo-50 hover:text-indigo-600 transition-all duration-300"
                                        >
                                            <ArrowRight size={22} />
                                        </Link>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {!isLoadingProducts && filteredProducts.length === 0 && (
                    <div className="text-center py-32 bg-white rounded-[3rem] border border-dashed border-gray-200">
                        <div className="inline-flex p-6 bg-gray-50 rounded-full mb-6">
                            <Filter size={48} className="text-gray-300" />
                        </div>
                        <h3 className="text-2xl font-black text-gray-900 mb-2">No se encontraron productos</h3>
                        <p className="text-gray-500 mb-8 max-w-xs mx-auto">Prueba seleccionando otra categoría o limpiando los filtros.</p>
                        <button
                            onClick={() => setSelectedCategory(null)}
                            className="inline-flex items-center px-8 py-3 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                        >
                            Ver toda la colección
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}