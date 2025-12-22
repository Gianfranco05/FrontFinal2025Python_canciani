import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { DataTable } from '../../components/DataTable';
import { Modal } from '../../components/Modal';
import { FormField } from '../../components/FormField';
import { orderDetailService, productService } from '../../api/services';
import type { OrderDetail } from '../../types';
import { useForm, FormProvider } from 'react-hook-form';
import { toast } from 'sonner';

export function OrderDetails() {
    const { orderId } = useParams<{ orderId: string }>();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<OrderDetail | null>(null);
    const queryClient = useQueryClient();
    
    const methods = useForm<OrderDetail>();
    const { reset, handleSubmit } = methods;

    const { data: orderDetails = [], isLoading: isLoadingDetails } = useQuery({
        queryKey: ['order_details', orderId],
        queryFn: async () => {
            const all = await orderDetailService.getAll();
            return all.filter(od => od.order_id === Number(orderId));
        }
    });

    const { data: products = [], isLoading: isLoadingProducts } = useQuery({
        queryKey: ['products'],
        queryFn: () => productService.getAll()
    });

    const createMutation = useMutation({
        mutationFn: orderDetailService.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['order_details', orderId] });
            toast.success('Order detail created successfully');
            closeModal();
        },
        onError: () => toast.error('Failed to create order detail')
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: Partial<OrderDetail> }) => orderDetailService.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['order_details', orderId] });
            toast.success('Order detail updated successfully');
            closeModal();
        },
        onError: () => toast.error('Failed to update order detail')
    });

    const deleteMutation = useMutation({
        mutationFn: orderDetailService.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['order_details', orderId] });
            toast.success('Order detail deleted successfully');
        },
        onError: () => toast.error('Failed to delete order detail')
    });

    const openCreateModal = () => {
        setEditingItem(null);
        reset({ quantity: 1, product_id: undefined, order_id: Number(orderId) });
        setIsModalOpen(true);
    };

    const openEditModal = (item: OrderDetail) => {
        setEditingItem(item);
        reset(item);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingItem(null);
        reset({});
    };

    const onSubmit = (data: OrderDetail) => {
        data.product_id = Number(data.product_id);
        data.quantity = Number(data.quantity);
        data.order_id = Number(orderId);
        
        if (editingItem) {
            updateMutation.mutate({ id: editingItem.id_key, data });
        } else {
            createMutation.mutate(data);
        }
    };

    const handleDelete = (item: OrderDetail) => {
        if (window.confirm('Are you sure you want to delete this item?')) {
            deleteMutation.mutate(item.id_key);
        }
    };

    const columns = [
        { header: 'ID', accessorKey: 'id_key' as keyof OrderDetail },
        { 
            header: 'Product', 
            accessorKey: (item: OrderDetail) => {
                const product = products.find(p => p.id_key === item.product_id);
                return product ? product.name : item.product_id;
            }
        },
        { header: 'Quantity', accessorKey: 'quantity' as keyof OrderDetail },
        { header: 'Price', accessorKey: 'price' as keyof OrderDetail },
    ];

    if (isLoadingDetails || isLoadingProducts) return <div>Loading...</div>;

    const productOptions = products.map(p => ({ label: `${p.name} ($${p.price})`, value: p.id_key }));

    return (
        <div>
            <div className="mb-4">
                 <h2 className="text-xl font-semibold">Order #{orderId} Items</h2>
            </div>

            <DataTable 
                title="Order Items" 
                data={orderDetails} 
                columns={columns}
                onCreate={openCreateModal}
                onEdit={openEditModal}
                onDelete={handleDelete}
                keyField="id_key"
            />

            <Modal
                isOpen={isModalOpen}
                onClose={closeModal}
                title={editingItem ? 'Edit Item' : 'Add Item'}
            >
                <FormProvider {...methods}>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <FormField 
                            name="product_id" 
                            label="Product"
                            type="select"
                            options={productOptions}
                            rules={{ required: 'Product is required' }} 
                        />
                        <FormField 
                            name="quantity" 
                            label="Quantity" 
                            type="number"
                            rules={{ required: 'Quantity is required', min: 1 }} 
                        />
                        
                        <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                            <button
                                type="submit"
                                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:col-start-2 sm:text-sm cursor-pointer"
                            >
                                {editingItem ? 'Update' : 'Add'}
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
