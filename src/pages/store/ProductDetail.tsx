import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, FormProvider } from 'react-hook-form';
import { toast } from 'sonner';
import { productService, reviewService, categoryService } from '../../api/services';
import { useCart } from '../../context/CartContext';
import { Star, ShoppingCart, ArrowLeft } from 'lucide-react';
import { FormField } from '../../components/FormField';
import type { Review } from '../../types';

export function ProductDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const queryClient = useQueryClient();
    const [quantity, setQuantity] = useState(1);
    
    const productId = Number(id);

    const methods = useForm<Review>();
    const { handleSubmit, reset } = methods;

    const { data: product, isLoading: isLoadingProduct } = useQuery({
        queryKey: ['product', productId],
        queryFn: () => productService.getOne(productId),
        enabled: !!productId
    });

    const { data: categories = [] } = useQuery({
        queryKey: ['categories'],
        queryFn: () => categoryService.getAll()
    });

    const { data: reviews = [] } = useQuery({
        queryKey: ['reviews'],
        queryFn: () => reviewService.getAll()
    });

    const productReviews = reviews.filter(r => r.product_id === productId);

    const createReviewMutation = useMutation({
        mutationFn: reviewService.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['reviews'] });
            toast.success('Review added successfully');
            reset({ rating: 5, comment: '' });
        },
        onError: () => toast.error('Failed to add review')
    });

    const onSubmitReview = (data: Review) => {
        data.product_id = productId;
        data.rating = Number(data.rating);
        createReviewMutation.mutate(data);
    };

    if (isLoadingProduct) return <div>Loading...</div>;
    if (!product) return <div>Product not found</div>;

    const category = categories.find(c => c.id_key === product.category_id);

    return (
        <div className="bg-white">
            <div className="max-w-2xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:max-w-7xl lg:px-8">
                <button 
                    onClick={() => navigate(-1)}
                    className="flex items-center text-indigo-600 hover:text-indigo-500 mb-8"
                >
                    <ArrowLeft className="w-4 h-4 mr-1" /> Back to Shop
                </button>

                <div className="lg:grid lg:grid-cols-2 lg:gap-x-8 lg:items-start">
                    {/* Image gallery */}
                    <div className="flex flex-col-reverse">
                         <div className="w-full aspect-w-1 aspect-h-1 bg-gray-200 rounded-lg overflow-hidden sm:aspect-w-2 sm:aspect-h-3">
                             <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold text-9xl bg-gray-100">
                                {product.name.charAt(0)}
                             </div>
                        </div>
                    </div>

                    {/* Product info */}
                    <div className="mt-10 px-4 sm:px-0 sm:mt-16 lg:mt-0">
                        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">{product.name}</h1>
                        
                        <div className="mt-3">
                            <h2 className="sr-only">Product information</h2>
                            <p className="text-3xl text-gray-900">${product.price}</p>
                        </div>

                         {/* Reviews */}
                         <div className="mt-3">
                            <h3 className="sr-only">Reviews</h3>
                            <div className="flex items-center">
                                <div className="flex items-center">
                                    {[0, 1, 2, 3, 4].map((rating) => (
                                        <Star
                                            key={rating}
                                            className={`${
                                                (productReviews.reduce((acc, r) => acc + r.rating, 0) / (productReviews.length || 1)) > rating
                                                    ? 'text-indigo-500'
                                                    : 'text-gray-300'
                                            } h-5 w-5 flex-shrink-0`}
                                            aria-hidden="true"
                                        />
                                    ))}
                                </div>
                                <p className="sr-only">{productReviews.length} reviews</p>
                                <a href="#reviews" className="ml-3 text-sm font-medium text-indigo-600 hover:text-indigo-500">
                                    {productReviews.length} reviews
                                </a>
                            </div>
                        </div>

                        <div className="mt-6">
                            <h3 className="sr-only">Description</h3>
                            <div className="text-base text-gray-700 space-y-6">
                                <p>Category: {category?.name || 'Uncategorized'}</p>
                                <p>Stock: {product.stock} units available</p>
                            </div>
                        </div>

                        <div className="mt-6">
                             <div className="flex items-center space-x-4">
                                <div className="w-24">
                                    <label htmlFor="quantity" className="sr-only">Quantity</label>
                                    <input
                                        id="quantity"
                                        type="number"
                                        min="1"
                                        max={product.stock}
                                        value={quantity}
                                        onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => addToCart(product, quantity)}
                                    className="max-w-xs flex-1 bg-indigo-600 border border-transparent rounded-md py-3 px-8 flex items-center justify-center text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-50 focus:ring-indigo-500 sm:w-full cursor-pointer"
                                >
                                    <ShoppingCart className="w-5 h-5 mr-2" />
                                    Add to Cart
                                </button>
                             </div>
                        </div>
                    </div>
                </div>

                {/* Reviews Section */}
                <div id="reviews" className="mt-16 pt-10 border-t">
                    <h3 className="text-2xl font-bold mb-6">Customer Reviews</h3>
                    
                    <div className="grid md:grid-cols-2 gap-10">
                        <div>
                            {productReviews.length === 0 ? (
                                <p className="text-gray-500">No reviews yet. Be the first to review!</p>
                            ) : (
                                <ul className="space-y-4">
                                    {productReviews.map((review) => (
                                        <li key={review.id_key} className="bg-gray-50 p-4 rounded-lg">
                                            <div className="flex items-center mb-2">
                                                 <div className="flex text-yellow-400">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star 
                                                            key={i} 
                                                            className={`w-4 h-4 ${i < review.rating ? 'fill-current' : 'text-gray-300'}`} 
                                                        />
                                                    ))}
                                                 </div>
                                            </div>
                                            <p className="text-gray-700">{review.comment}</p>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                        
                        <div className="bg-gray-50 p-6 rounded-lg">
                            <h4 className="text-lg font-medium mb-4">Write a Review</h4>
                            <FormProvider {...methods}>
                                <form onSubmit={handleSubmit(onSubmitReview)}>
                                    <FormField 
                                        name="rating" 
                                        label="Rating (1-5)" 
                                        type="number" 
                                        rules={{ required: true, min: 1, max: 5 }}
                                    />
                                    <FormField 
                                        name="comment" 
                                        label="Comment" 
                                        rules={{ required: true }}
                                    />
                                    <button 
                                        type="submit" 
                                        className="mt-4 w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 cursor-pointer"
                                    >
                                        Submit Review
                                    </button>
                                </form>
                            </FormProvider>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
