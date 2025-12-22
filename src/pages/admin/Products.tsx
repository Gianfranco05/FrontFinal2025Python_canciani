import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DataTable } from '../../components/DataTable';
import { Modal } from '../../components/Modal';
import { FormField } from '../../components/FormField';
import { productService, categoryService } from '../../api/services';
import type { Product } from '../../types';
import { useForm, FormProvider } from 'react-hook-form';
import { toast } from 'sonner';

export function Products() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<Product | null>(null);
    const queryClient = useQueryClient();
    
    const methods = useForm<Product>();
    const { reset, handleSubmit } = methods;

    const { data: products = [], isLoading: isLoadingProducts } = useQuery({
        queryKey: ['products'],
        queryFn: () => productService.getAll()
    });

    const { data: categories = [], isLoading: isLoadingCategories } = useQuery({
        queryKey: ['categories'],
        queryFn: () => categoryService.getAll()
    });

    const createMutation = useMutation({
        mutationFn: productService.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            toast.success('Product created successfully');
            closeModal();
        },
        onError: () => toast.error('Failed to create product')
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: Partial<Product> }) => productService.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            toast.success('Product updated successfully');
            closeModal();
        },
        onError: () => toast.error('Failed to update product')
    });

    const deleteMutation = useMutation({
        mutationFn: productService.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            toast.success('Product deleted successfully');
        },
        onError: () => toast.error('Failed to delete product')
    });

    const openCreateModal = () => {
        setEditingItem(null);
        reset({ name: '', price: 0, stock: 0, category_id: undefined });
        setIsModalOpen(true);
    };

    const openEditModal = (item: Product) => {
        setEditingItem(item);
        // Important: Reset form with item data for editing
        reset(item);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingItem(null);
        reset({});
    };

    const onSubmit = (data: Product) => {
        // Ensure numbers are numbers and construct clean payload
        const payload = {
            name: data.name,
            price: Number(data.price),
            stock: Number(data.stock),
            category_id: Number(data.category_id)
        };

        if (editingItem) {
            updateMutation.mutate({ id: editingItem.id_key, data: payload });
        } else {
            createMutation.mutate(payload as any);
        }
    };

    const handleDelete = (item: Product) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            deleteMutation.mutate(item.id_key);
        }
    };

    const columns = [
        { header: 'ID', accessorKey: 'id_key' as keyof Product },
        { header: 'Name', accessorKey: 'name' as keyof Product },
        { header: 'Price', accessorKey: 'price' as keyof Product },
        { header: 'Stock', accessorKey: 'stock' as keyof Product },
        { 
            header: 'Category', 
            accessorKey: (item: Product) => categories.find(c => c.id_key === item.category_id)?.name || item.category_id
        },
    ];

    if (isLoadingProducts || isLoadingCategories) return <div>Loading...</div>;

    const categoryOptions = categories.map(c => ({ label: c.name, value: c.id_key }));

    return (
        <div>
            <DataTable 
                title="Products" 
                data={products} 
                columns={columns}
                onCreate={openCreateModal}
                onEdit={openEditModal}
                onDelete={handleDelete}
                keyField="id_key"
            />

            <Modal
                isOpen={isModalOpen}
                onClose={closeModal}
                title={editingItem ? 'Edit Product' : 'Create Product'}
            >
                <FormProvider {...methods}>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <FormField 
                            name="name" 
                            label="Name" 
                            rules={{ required: 'Name is required' }} 
                        />
                         <FormField 
                            name="price" 
                            label="Price" 
                            type="number"
                            rules={{ required: 'Price is required', min: 0 }} 
                        />
                         <FormField 
                            name="stock" 
                            label="Stock" 
                            type="number"
                            rules={{ required: 'Stock is required', min: 0 }} 
                        />
                         <FormField 
                            name="category_id" 
                            label="Category"
                            type="select"
                            options={categoryOptions}
                            rules={{ required: 'Category is required' }} 
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
