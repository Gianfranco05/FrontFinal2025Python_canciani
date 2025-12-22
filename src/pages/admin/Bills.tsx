import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DataTable } from '../../components/DataTable';
import { Modal } from '../../components/Modal';
import { FormField } from '../../components/FormField';
import { billService, clientService } from '../../api/services';
import { type Bill, PaymentType } from '../../types';
import { useForm, FormProvider } from 'react-hook-form';
import { toast } from 'sonner';

export function Bills() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<Bill | null>(null);
    const queryClient = useQueryClient();
    
    const methods = useForm<Bill>();
    const { reset, handleSubmit } = methods;

    const { data: bills = [], isLoading: isLoadingBills } = useQuery({
        queryKey: ['bills'],
        queryFn: () => billService.getAll()
    });

    const { data: clients = [], isLoading: isLoadingClients } = useQuery({
        queryKey: ['clients'],
        queryFn: () => clientService.getAll()
    });

    const createMutation = useMutation({
        mutationFn: billService.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['bills'] });
            toast.success('Bill created successfully');
            closeModal();
        },
        onError: () => toast.error('Failed to create bill')
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: Partial<Bill> }) => billService.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['bills'] });
            toast.success('Bill updated successfully');
            closeModal();
        },
        onError: () => toast.error('Failed to update bill')
    });

    const deleteMutation = useMutation({
        mutationFn: billService.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['bills'] });
            toast.success('Bill deleted successfully');
        },
        onError: () => toast.error('Failed to delete bill')
    });

    const openCreateModal = () => {
        setEditingItem(null);
        reset({ 
            bill_number: '', 
            discount: 0, 
            date: new Date().toISOString().slice(0, 16), 
            total: 0, 
            payment_type: PaymentType.CASH, 
            client_id: undefined 
        });
        setIsModalOpen(true);
    };

    const openEditModal = (item: Bill) => {
        setEditingItem(item);
        reset({
            ...item,
            date: new Date(item.date).toISOString().slice(0, 16)
        });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingItem(null);
        reset({});
    };

    const onSubmit = (data: Bill) => {
        data.client_id = Number(data.client_id);
        data.payment_type = Number(data.payment_type) as PaymentType;
        data.total = Number(data.total);
        data.discount = Number(data.discount);
        
        data.date = new Date(data.date).toISOString();

        if (editingItem) {
            updateMutation.mutate({ id: editingItem.id_key, data });
        } else {
            createMutation.mutate(data);
        }
    };

    const handleDelete = (item: Bill) => {
        if (window.confirm('Are you sure you want to delete this bill?')) {
            deleteMutation.mutate(item.id_key);
        }
    };

    const columns = [
        { header: 'ID', accessorKey: 'id_key' as keyof Bill },
        { header: 'Number', accessorKey: 'bill_number' as keyof Bill },
        { 
            header: 'Date', 
            accessorKey: (item: Bill) => new Date(item.date).toLocaleDateString() 
        },
        { header: 'Total', accessorKey: 'total' as keyof Bill },
        { 
            header: 'Payment', 
            accessorKey: (item: Bill) => {
                const paymentMap = {
                    [PaymentType.CASH]: 'Cash',
                    [PaymentType.CARD]: 'Card',
                    [PaymentType.DEBIT]: 'Debit',
                    [PaymentType.CREDIT]: 'Credit',
                    [PaymentType.BANK_TRANSFER]: 'Transfer'
                };
                return paymentMap[item.payment_type] || item.payment_type;
            }
        },
        { 
            header: 'Client', 
            accessorKey: (item: Bill) => {
                const client = clients.find(c => c.id_key === item.client_id);
                return client ? `${client.name} ${client.lastname}` : item.client_id;
            }
        },
    ];

    if (isLoadingBills || isLoadingClients) return <div>Loading...</div>;

    const clientOptions = clients.map(c => ({ label: `${c.name} ${c.lastname}`, value: c.id_key }));
    
    const paymentTypeOptions = [
        { label: 'CASH', value: PaymentType.CASH },
        { label: 'CARD', value: PaymentType.CARD },
        { label: 'DEBIT', value: PaymentType.DEBIT },
        { label: 'CREDIT', value: PaymentType.CREDIT },
        { label: 'BANK TRANSFER', value: PaymentType.BANK_TRANSFER },
    ];

    return (
        <div>
            <DataTable 
                title="Bills" 
                data={bills} 
                columns={columns}
                onCreate={openCreateModal}
                onEdit={openEditModal}
                onDelete={handleDelete}
                keyField="id_key"
            />

            <Modal
                isOpen={isModalOpen}
                onClose={closeModal}
                title={editingItem ? 'Edit Bill' : 'Create Bill'}
            >
                <FormProvider {...methods}>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <FormField 
                            name="bill_number" 
                            label="Bill Number" 
                            rules={{ required: 'Bill number is required' }} 
                        />
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
                            name="discount" 
                            label="Discount" 
                            type="number"
                            rules={{ min: 0 }} 
                        />
                         <FormField 
                            name="payment_type" 
                            label="Payment Type"
                            type="select"
                            options={paymentTypeOptions}
                            rules={{ required: 'Payment type is required' }} 
                        />
                        <FormField 
                            name="client_id" 
                            label="Client"
                            type="select"
                            options={clientOptions}
                            rules={{ required: 'Client is required' }} 
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
