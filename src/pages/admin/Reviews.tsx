import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DataTable } from '../../components/DataTable';
import { Modal } from '../../components/Modal';
import { FormField } from '../../components/FormField';
import { reviewService, productService } from '../../api/services';
import type { Review } from '../../types';
import { useForm, FormProvider } from 'react-hook-form';
import { toast } from 'sonner';

export function Reviews() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<Review | null>(null);
    const queryClient = useQueryClient();
    
    const methods = useForm<Review>();
    const { reset, handleSubmit } = methods;

    const { data: reviews = [], isLoading: isLoadingReviews } = useQuery({
        queryKey: ['reviews'],
        queryFn: () => reviewService.getAll()
    });

    const { data: products = [], isLoading: isLoadingProducts } = useQuery({
        queryKey: ['products'],
        queryFn: () => productService.getAll()
    });

    const createMutation = useMutation({
        mutationFn: reviewService.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['reviews'] });
            toast.success('Review created successfully');
            closeModal();
        },
        onError: () => toast.error('Failed to create review')
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: Partial<Review> }) => reviewService.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['reviews'] });
            toast.success('Review updated successfully');
            closeModal();
        },
        onError: () => toast.error('Failed to update review')
    });

    const deleteMutation = useMutation({
        mutationFn: reviewService.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['reviews'] });
            toast.success('Review deleted successfully');
        },
        onError: () => toast.error('Failed to delete review')
    });

    const openCreateModal = () => {
        setEditingItem(null);
        reset({ rating: 5, comment: '', product_id: undefined });
        setIsModalOpen(true);
    };

    const openEditModal = (item: Review) => {
        setEditingItem(item);
        reset(item);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingItem(null);
        reset({});
    };

    const onSubmit = (data: Review) => {
        data.product_id = Number(data.product_id);
        data.rating = Number(data.rating);
        
        if (editingItem) {
            updateMutation.mutate({ id: editingItem.id_key, data });
        } else {
            createMutation.mutate(data);
        }
    };

    const handleDelete = (item: Review) => {
        if (window.confirm('Are you sure you want to delete this review?')) {
            deleteMutation.mutate(item.id_key);
        }
    };

    const columns = [
        { header: 'ID', accessorKey: 'id_key' as keyof Review },
        { header: 'Rating', accessorKey: 'rating' as keyof Review },
        { header: 'Comment', accessorKey: 'comment' as keyof Review },
        { 
            header: 'Product', 
            accessorKey: (item: Review) => {
                const product = products.find(p => p.id_key === item.product_id);
                return product ? product.name : item.product_id;
            }
        },
    ];

    if (isLoadingReviews || isLoadingProducts) return <div>Loading...</div>;

    const productOptions = products.map(p => ({ label: p.name, value: p.id_key }));

    return (
        <div>
            <DataTable 
                title="Reviews" 
                data={reviews} 
                columns={columns}
                onCreate={openCreateModal}
                onEdit={openEditModal}
                onDelete={handleDelete}
                keyField="id_key"
            />

            <Modal
                isOpen={isModalOpen}
                onClose={closeModal}
                title={editingItem ? 'Edit Review' : 'Create Review'}
            >
                <FormProvider {...methods}>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <FormField 
                            name="rating" 
                            label="Rating" 
                            type="number"
                            rules={{ required: 'Rating is required', min: 1, max: 5 }} 
                        />
                         <FormField 
                            name="comment" 
                            label="Comment" 
                        />
                         <FormField 
                            name="product_id" 
                            label="Product"
                            type="select"
                            options={productOptions}
                            rules={{ required: 'Product is required' }} 
                        />

                        <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                            <button
                                type="submit"
                                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:col-start-2 sm:text-sm cursor-pointer"
                            >
                                {editingItem ? 'Update' : 'Create'}
                            </button>
                            <button
                                type="button"
                                onClick={closeModal}
                                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:col-start-1 sm:text-sm cursor-pointer"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </FormProvider>
            </Modal>
        </div>
    );
}
