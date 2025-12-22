import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DataTable } from '../../components/DataTable';
import { Modal } from '../../components/Modal';
import { FormField } from '../../components/FormField';
import { orderService, clientService, billService } from '../../api/services';
import { type Order, DeliveryMethod, Status } from '../../types';
import { useForm, FormProvider } from 'react-hook-form';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { Eye } from 'lucide-react';

export function Orders() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<Order | null>(null);
    const queryClient = useQueryClient();
    
    const methods = useForm<Order>();
    const { reset, handleSubmit } = methods;

    const { data: orders = [], isLoading: isLoadingOrders } = useQuery({
        queryKey: ['orders'],
        queryFn: () => orderService.getAll()
    });

    const { data: clients = [], isLoading: isLoadingClients } = useQuery({
        queryKey: ['clients'],
        queryFn: () => clientService.getAll()
    });

    const { data: bills = [], isLoading: isLoadingBills } = useQuery({
        queryKey: ['bills'],
        queryFn: () => billService.getAll()
    });

    const createMutation = useMutation({
        mutationFn: orderService.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['orders'] });
            toast.success('Order created successfully');
            closeModal();
        },
        onError: () => toast.error('Failed to create order')
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: Partial<Order> }) => orderService.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['orders'] });
            toast.success('Order updated successfully');
            closeModal();
        },
        onError: () => toast.error('Failed to update order')
    });

    const deleteMutation = useMutation({
        mutationFn: orderService.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['orders'] });
            toast.success('Order deleted successfully');
        },
        onError: () => toast.error('Failed to delete order')
    });

    const openCreateModal = () => {
        setEditingItem(null);
        reset({ 
            date: new Date().toISOString().slice(0, 16),
            total: 0, 
            delivery_method: DeliveryMethod.HOME_DELIVERY, 
            status: Status.PENDING,
            client_id: undefined,
            bill_id: undefined
        });
        setIsModalOpen(true);
    };

    const openEditModal = (item: Order) => {
        setEditingItem(item);
        reset({
            ...item,
            // Format date for datetime-local input
            date: new Date(item.date).toISOString().slice(0, 16)
        });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingItem(null);
        reset({});
    };

    const onSubmit = (data: Order) => {
        data.client_id = Number(data.client_id);
        data.bill_id = Number(data.bill_id);
        data.total = Number(data.total);
        data.delivery_method = Number(data.delivery_method) as DeliveryMethod;
        data.status = Number(data.status) as Status;
        
        // Ensure date is ISO string
        data.date = new Date(data.date).toISOString();

        if (editingItem) {
            updateMutation.mutate({ id: editingItem.id_key, data });
        } else {
            createMutation.mutate(data);
        }
    };

    const handleDelete = (item: Order) => {
        if (window.confirm('Are you sure you want to delete this order?')) {
            deleteMutation.mutate(item.id_key);
        }
    };

    const columns = [
        { header: 'ID', accessorKey: 'id_key' as keyof Order },
        { 
            header: 'Date', 
            accessorKey: (item: Order) => new Date(item.date).toLocaleDateString()
        },
        { header: 'Total', accessorKey: 'total' as keyof Order },
        { 
            header: 'Status', 
            accessorKey: (item: Order) => {
                const statusMap = {
                    [Status.PENDING]: 'Pending',
                    [Status.IN_PROGRESS]: 'In Progress',
                    [Status.DELIVERED]: 'Delivered',
                    [Status.CANCELED]: 'Canceled'
                };
                return statusMap[item.status] || item.status;
            }
        },
        { 
            header: 'Client', 
            accessorKey: (item: Order) => {
                const client = clients.find(c => c.id_key === item.client_id);
                return client ? `${client.name} ${client.lastname}` : item.client_id;
            }
        },
        {
            header: 'Items',
            accessorKey: (item: Order) => (
                <Link
                    to={`/admin/orders/${item.id_key}/items`}
                    className="text-indigo-600 hover:text-indigo-900 flex items-center gap-1"
                >
                    <Eye className="w-4 h-4" /> View Items
                </Link>
            )
        }
    ];

    if (isLoadingOrders || isLoadingClients || isLoadingBills) return <div>Loading...</div>;

    const clientOptions = clients.map(c => ({ label: `${c.name} ${c.lastname}`, value: c.id_key }));
    const billOptions = bills.map(b => ({ label: `Bill #${b.bill_number}`, value: b.id_key }));
    
    const deliveryMethodOptions = [
        { label: 'DRIVE THRU', value: DeliveryMethod.DRIVE_THRU },
        { label: 'ON HAND', value: DeliveryMethod.ON_HAND },
        { label: 'HOME DELIVERY', value: DeliveryMethod.HOME_DELIVERY },
    ];

    const statusOptions = [
        { label: 'PENDING', value: Status.PENDING },
        { label: 'IN PROGRESS', value: Status.IN_PROGRESS },
        { label: 'DELIVERED', value: Status.DELIVERED },
        { label: 'CANCELED', value: Status.CANCELED },
    ];

    return (
        <div>
            <DataTable 
                title="Orders" 
                data={orders} 
                columns={columns}
                onCreate={openCreateModal}
                onEdit={openEditModal}
                onDelete={handleDelete}
                keyField="id_key"
            />

            <Modal
                isOpen={isModalOpen}
                onClose={closeModal}
                title={editingItem ? 'Edit Order' : 'Create Order'}
            >
                <FormProvider {...methods}>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <FormField 
                            name="date" 
                            label="Date" 
                            type="datetime-local"
                            rules={{ required: 'Date is required' }}
                        />
                        <FormField 
                            name="total" 
                            label="Total" 
                            type="number"
                            rules={{ required: 'Total is required', min: 0 }} 
                        />
                        <FormField 
                            name="delivery_method" 
                            label="Delivery Method"
                            type="select"
                            options={deliveryMethodOptions}
                            rules={{ required: 'Delivery method is required' }} 
                        />
                         <FormField 
                            name="status" 
                            label="Status"
                            type="select"
                            options={statusOptions}
                            rules={{ required: 'Status is required' }} 
                        />
                        <FormField 
                            name="client_id" 
                            label="Client"
                            type="select"
                            options={clientOptions}
                            rules={{ required: 'Client is required' }} 
                        />
                        <FormField 
                            name="bill_id" 
                            label="Bill"
                            type="select"
                            options={billOptions}
                            rules={{ required: 'Bill is required' }} 
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
