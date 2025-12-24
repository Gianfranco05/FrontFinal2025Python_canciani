import { Link } from 'react-router-dom';
import { ShoppingBag, ArrowRight, Star, TrendingUp, ShieldCheck } from 'lucide-react';

export function Home() {
    return (
        <div className="relative min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 overflow-hidden selection:bg-indigo-100 selection:text-indigo-700">
            {/* Elementos decorativos de fondo (Blobs animados) */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute -top-24 -left-24 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
                <div className="absolute top-0 -right-4 w-72 h-72 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col lg:flex-row items-center justify-between min-h-[calc(100vh-80px)] pt-10 pb-20">
                
                {/* Sección de Texto (Izquierda) */}
                <div className="lg:w-1/2 text-center lg:text-left space-y-8">
                    <div className="inline-flex items-center px-3 py-1 rounded-full border border-indigo-100 bg-white/80 backdrop-blur-sm shadow-sm text-indigo-600 text-sm font-medium mb-4 animate-fade-in">
                        <span className="flex h-2 w-2 rounded-full bg-indigo-600 mr-2 animate-pulse"></span>
                        Nueva Coleccion 2025
                    </div>
                    
                    <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-gray-900 leading-tight">
                        Bienvenido a <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                            Utn Store
                        </span>
                    </h1>
                    
                    <p className="mt-6 text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
Descubre productos increíbles a precios inmejorables. Desde electrónica de vanguardia hasta moda de tendencia, definimos calidad y estilo.                    </p>
                    
                    <div className="mt-10 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                        <Link
                            to="/shop"
                            className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white transition-all duration-300 bg-indigo-600 rounded-full hover:bg-indigo-700 hover:shadow-xl hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600"
                        >
                            <ShoppingBag className="w-6 h-6 mr-2 transition-transform group-hover:rotate-12" />
                            Comenzar a comprar
                            <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
                        </Link>
                        
                        <button className="px-8 py-4 text-lg font-medium text-indigo-700 bg-white border border-indigo-100 rounded-full hover:bg-indigo-50 hover:shadow-md transition-all duration-300">
                            Aprender Mas
                        </button>
                    </div>

                    <div className="pt-8 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-gray-500 text-sm font-medium opacity-80">
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-green-100 rounded-full text-green-600">
                                <ShieldCheck size={18} />
                            </div>
                            <span>Pago Seguro</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-blue-100 rounded-full text-blue-600">
                                <TrendingUp size={18} />
                            </div>
                            <span>Top Marcas</span>
                        </div>
                         <div className="flex items-center gap-2">
                             <div className="p-2 bg-yellow-100 rounded-full text-yellow-600">
                                <Star size={18} />
                            </div>
                            <span>Calificacion 5 Estrellas</span>
                        </div>
                    </div>
                </div>

                {/* Sección Visual (Derecha) */}
                <div className="lg:w-1/2 mt-16 lg:mt-0 relative flex justify-center lg:justify-end">
                    <div className="relative w-full max-w-md aspect-square">
                        {/* Círculo brillante detrás */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-indigo-400 to-purple-400 rounded-full opacity-20 blur-3xl animate-pulse"></div>
                        
                        {/* Contenedor principal de imagen con efecto cristal (Glassmorphism) */}
                        <div className="relative w-full h-full bg-white/30 backdrop-blur-md border border-white/50 rounded-[2rem] shadow-2xl flex items-center justify-center transform transition-transform hover:scale-[1.02] duration-500">
                             
                             {/* Decoración interna */}
                             <div className="absolute top-10 right-10 w-24 h-24 bg-gradient-to-br from-yellow-300 to-orange-400 rounded-full blur-2xl opacity-40"></div>
                             
                             {/* Icono Principal Flotante */}
                             <ShoppingBag className="w-64 h-64 text-indigo-600 drop-shadow-2xl relative z-10 animate-float" strokeWidth={1.5} />
                             
                             {/* Tarjeta Flotante 1: Hot Sale */}
                             <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-2xl shadow-xl border border-gray-100 animate-bounce-slow flex items-center gap-4 z-20">
                                <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center text-red-500">
                                    <span className="text-xl">🔥</span>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Hot Sale</p>
                                    <p className="font-bold text-gray-900 text-lg">50% Off</p>
                                </div>
                             </div>

                             {/* Tarjeta Flotante 2: Reviews */}
                             <div className="absolute -top-6 -right-6 bg-white p-4 rounded-2xl shadow-xl border border-gray-100 animate-bounce-delayed flex items-center gap-4 z-20">
                                <div className="h-12 w-12 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600">
                                    <Star size={24} fill="currentColor" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Reviews</p>
                                    <p className="font-bold text-gray-900 text-lg">4.9/5.0</p>
                                </div>
                             </div>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Estilos CSS en línea para las animaciones personalizadas */}
            <style>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-20px); }
                }
                .animate-float {
                    animation: float 6s ease-in-out infinite;
                }
                .animate-bounce-slow {
                    animation: float 5s ease-in-out infinite;
                }
                .animate-bounce-delayed {
                    animation: float 7s ease-in-out infinite;
                    animation-delay: 1.5s;
                }
                @keyframes blob {
                    0% { transform: translate(0px, 0px) scale(1); }
                    33% { transform: translate(30px, -50px) scale(1.1); }
                    66% { transform: translate(-20px, 20px) scale(0.9); }
                    100% { transform: translate(0px, 0px) scale(1); }
                }
                .animate-blob {
                    animation: blob 7s infinite;
                }
                .animation-delay-2000 {
                    animation-delay: 2s;
                }
                .animation-delay-4000 {
                    animation-delay: 4s;
                }
            `}</style>
        </div>
    );
}