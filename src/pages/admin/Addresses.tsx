import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DataTable } from '../../components/DataTable';
import { Modal } from '../../components/Modal';
import { FormField } from '../../components/FormField';
import { addressService, clientService } from '../../api/services';
import type { Address } from '../../types';
import { useForm, FormProvider } from 'react-hook-form';
import { toast } from 'sonner';

export function Addresses() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<Address | null>(null);
    const queryClient = useQueryClient();
    
    const methods = useForm<Address>();
    const { reset, handleSubmit } = methods;

    const { data: addresses = [], isLoading: isLoadingAddresses } = useQuery({
        queryKey: ['addresses'],
        queryFn: () => addressService.getAll()
    });

    const { data: clients = [], isLoading: isLoadingClients } = useQuery({
        queryKey: ['clients'],
        queryFn: () => clientService.getAll()
    });

    const createMutation = useMutation({
        mutationFn: addressService.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['addresses'] });
            toast.success('Address created successfully');
            closeModal();
        },
        onError: () => toast.error('Failed to create address')
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: Partial<Address> }) => addressService.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['addresses'] });
            toast.success('Address updated successfully');
            closeModal();
        },
        onError: () => toast.error('Failed to update address')
    });

    const deleteMutation = useMutation({
        mutationFn: addressService.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['addresses'] });
            toast.success('Address deleted successfully');
        },
        onError: () => toast.error('Failed to delete address')
    });

    const openCreateModal = () => {
        setEditingItem(null);
        reset({ street: '', number: '', city: '', client_id: undefined });
        setIsModalOpen(true);
    };

    const openEditModal = (item: Address) => {
        setEditingItem(item);
        reset(item);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingItem(null);
        reset({});
    };

    const onSubmit = (data: Address) => {
        data.client_id = Number(data.client_id);
        
        if (editingItem) {
            updateMutation.mutate({ id: editingItem.id_key, data });
        } else {
            createMutation.mutate(data);
        }
    };

    const handleDelete = (item: Address) => {
        if (window.confirm('Are you sure you want to delete this address?')) {
            deleteMutation.mutate(item.id_key);
        }
    };

    const columns = [
        { header: 'ID', accessorKey: 'id_key' as keyof Address },
        { header: 'Street', accessorKey: 'street' as keyof Address },
        { header: 'Number', accessorKey: 'number' as keyof Address },
        { header: 'City', accessorKey: 'city' as keyof Address },
        { 
            header: 'Client', 
            accessorKey: (item: Address) => {
                const client = clients.find(c => c.id_key === item.client_id);
                return client ? `${client.name} ${client.lastname}` : item.client_id;
            }
        },
    ];

    if (isLoadingAddresses || isLoadingClients) return <div>Loading...</div>;

    const clientOptions = clients.map(c => ({ label: `${c.name} ${c.lastname}`, value: c.id_key }));

    return (
        <div>
            <DataTable 
                title="Addresses" 
                data={addresses} 
                columns={columns}
                onCreate={openCreateModal}
                onEdit={openEditModal}
                onDelete={handleDelete}
                keyField="id_key"
            />

            <Modal
                isOpen={isModalOpen}
                onClose={closeModal}
                title={editingItem ? 'Edit Address' : 'Create Address'}
            >
                <FormProvider {...methods}>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <FormField 
                            name="street" 
                            label="Street" 
                            rules={{ required: 'Street is required' }} 
                        />
                         <FormField 
                            name="number" 
                            label="Number" 
                            rules={{ required: 'Number is required' }} 
                        />
                         <FormField 
                            name="city" 
                            label="City" 
                            rules={{ required: 'City is required' }} 
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
