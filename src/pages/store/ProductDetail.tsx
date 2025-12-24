import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { productService, categoryService } from '../../api/services';
import { useCart } from '../../context/CartContext';
import { ArrowLeft, ShoppingCart, Tag, Star, Truck, ShieldCheck, RefreshCw } from 'lucide-react';

// Diccionario de traducción local
const categoryTranslations: Record<string, string> = {
    'Electronics': 'Electrónica',
    'Clothing': 'Ropa',
    'Home': 'Hogar',
    'Sports': 'Deporte'
};

export function ProductDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const productId = Number(id);

    const { data: product, isLoading } = useQuery({
        queryKey: ['product', productId],
        queryFn: () => productService.getOne(productId),
        enabled: !!productId
    });

    const { data: categories = [] } = useQuery({
        queryKey: ['categories'],
        queryFn: () => categoryService.getAll()
    });

    // Función auxiliar para generar descripción en ESPAÑOL
    const getProductDescription = (categoryName: string = 'General') => {
        const descriptions: Record<string, string> = {
            'Electronics': 'Experimenta la tecnología de vanguardia con este dispositivo electrónico premium. Diseñado para ofrecer rendimiento y fiabilidad.',
            'Clothing': 'Mejora tu estilo con esta pieza de fabricación experta. Fabricada con materiales de alta calidad para máxima comodidad y durabilidad.',
            'Home': 'Transforma tu espacio vital con este complemento elegante y funcional. Perfecto para hogares modernos.',
            'Sports': 'Supera tus límites con equipos diseñados para un rendimiento óptimo. Diseñados para complementar tu estilo de vida activo.',
            'default': 'Este producto representa nuestro compromiso con la calidad y la satisfacción del cliente. Cuidadosamente seleccionado para ti.'
        };
        return descriptions[categoryName] || descriptions['default'];
    };

    if (isLoading) return <div className="min-h-screen flex items-center justify-center text-gray-400">Cargando detalles...</div>;
    if (!product) return <div className="min-h-screen flex items-center justify-center">Producto no encontrado</div>;

    const rawCategoryName = categories.find(c => c.id_key === product.category_id)?.name;
    const displayCategoryName = categoryTranslations[rawCategoryName || ''] || rawCategoryName || 'General';

    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                
                {/* Back Button */}
                <button 
                    onClick={() => navigate(-1)}
                    className="flex items-center text-gray-500 hover:text-indigo-600 transition-colors mb-8 group"
                >
                    <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                    Volver a la Tienda
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                    
                    {/* Left: Typography Visual */}
                    <div className="bg-gray-50 rounded-3xl p-12 aspect-square flex flex-col justify-center relative overflow-hidden border border-gray-100">
                         <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-indigo-100 rounded-full blur-3xl opacity-50"></div>
                         <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-60 h-60 bg-purple-100 rounded-full blur-3xl opacity-50"></div>
                         
                         <div className="relative z-10">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-white text-indigo-700 shadow-sm mb-6 w-fit uppercase tracking-wider">
                                <Tag size={12} className="mr-2" />
                                {displayCategoryName}
                            </span>
                            <h1 className="text-5xl sm:text-7xl font-black text-gray-900 tracking-tight leading-none mb-4 break-words">
                                {product.name}
                            </h1>
                            <div className="flex items-center space-x-2 mb-8">
                                <div className="flex">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} size={20} className="text-yellow-400 fill-current" />
                                    ))}
                                </div>
                                <span className="text-gray-500 text-sm font-medium">(128 reseñas)</span>
                            </div>
                         </div>
                    </div>

                    {/* Right: Info & Actions */}
                    <div className="lg:py-8 space-y-8">
                        <div>
                            <h2 className="sr-only">Información del Producto</h2>
                            <p className="text-4xl font-extrabold text-gray-900">
                                ${product.price.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                            </p>
                            <p className="mt-4 text-lg text-gray-500 leading-relaxed">
                                {getProductDescription(rawCategoryName)}
                            </p>
                        </div>

                        {/* Features Grid (Traducido) */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-6 border-t border-b border-gray-100">
                            <div className="flex items-start">
                                <Truck className="w-6 h-6 text-indigo-600 mt-1" />
                                <div className="ml-4">
                                    <h3 className="font-bold text-gray-900">Envío Gratis</h3>
                                    <p className="text-sm text-gray-500">En pedidos mayores a $100</p>
                                </div>
                            </div>
                            <div className="flex items-start">
                                <ShieldCheck className="w-6 h-6 text-indigo-600 mt-1" />
                                <div className="ml-4">
                                    <h3 className="font-bold text-gray-900">Garantía de 2 Años</h3>
                                    <p className="text-sm text-gray-500">Protección completa</p>
                                </div>
                            </div>
                             <div className="flex items-start">
                                <RefreshCw className="w-6 h-6 text-indigo-600 mt-1" />
                                <div className="ml-4">
                                    <h3 className="font-bold text-gray-900">Devoluciones Fáciles</h3>
                                    <p className="text-sm text-gray-500">30 días de política de devolución</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 pt-4">
                            <button
                                onClick={() => addToCart(product)}
                                className="flex-1 bg-gray-900 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-indigo-600 hover:shadow-indigo-200 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center"
                            >
                                <ShoppingCart className="w-5 h-5 mr-2" />
                                Agregar al Carrito
                            </button>
                            <button className="px-8 py-4 rounded-xl font-bold text-lg border-2 border-gray-200 text-gray-700 hover:border-gray-900 hover:text-gray-900 transition-colors">
                                Guardar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}