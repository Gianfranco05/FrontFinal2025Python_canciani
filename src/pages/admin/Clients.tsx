import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DataTable } from '../../components/DataTable';
import { Modal } from '../../components/Modal';
import { FormField } from '../../components/FormField';
import { clientService } from '../../api/services';
import type { Client } from '../../types';
import { useForm, FormProvider } from 'react-hook-form';
import { toast } from 'sonner';

export function Clients() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<Client | null>(null);
    const queryClient = useQueryClient();
    
    const methods = useForm<Client>();
    const { reset, handleSubmit } = methods;

    const { data: clients = [], isLoading } = useQuery({
        queryKey: ['clients'],
        queryFn: () => clientService.getAll()
    });

    const createMutation = useMutation({
        mutationFn: clientService.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['clients'] });
            toast.success('Client created successfully');
            closeModal();
        },
        onError: () => toast.error('Failed to create client')
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: Partial<Client> }) => clientService.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['clients'] });
            toast.success('Client updated successfully');
            closeModal();
        },
        onError: () => toast.error('Failed to update client')
    });

    const deleteMutation = useMutation({
        mutationFn: clientService.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['clients'] });
            toast.success('Client deleted successfully');
        },
        onError: () => toast.error('Failed to delete client')
    });

    const openCreateModal = () => {
        setEditingItem(null);
        reset({ name: '', lastname: '', email: '', telephone: '' });
        setIsModalOpen(true);
    };

    const openEditModal = (item: Client) => {
        setEditingItem(item);
        reset(item);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingItem(null);
        reset({});
    };

    const onSubmit = (data: Client) => {
        if (editingItem) {
            updateMutation.mutate({ id: editingItem.id_key, data });
        } else {
            createMutation.mutate(data);
        }
    };

    const handleDelete = (item: Client) => {
        if (window.confirm('Are you sure you want to delete this client?')) {
            deleteMutation.mutate(item.id_key);
        }
    };

    const columns = [
        { header: 'ID', accessorKey: 'id_key' as keyof Client },
        { header: 'Name', accessorKey: 'name' as keyof Client },
        { header: 'Lastname', accessorKey: 'lastname' as keyof Client },
        { header: 'Email', accessorKey: 'email' as keyof Client },
        { header: 'Telephone', accessorKey: 'telephone' as keyof Client },
    ];

    if (isLoading) return <div>Loading...</div>;

    return (
        <div>
            <DataTable 
                title="Clients" 
                data={clients} 
                columns={columns}
                onCreate={openCreateModal}
                onEdit={openEditModal}
                onDelete={handleDelete}
                keyField="id_key"
            />

            <Modal
                isOpen={isModalOpen}
                onClose={closeModal}
                title={editingItem ? 'Edit Client' : 'Create Client'}
            >
                <FormProvider {...methods}>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <FormField 
                            name="name" 
                            label="Name" 
                            rules={{ required: 'Name is required' }} 
                        />
                        <FormField 
                            name="lastname" 
                            label="Lastname" 
                            rules={{ required: 'Lastname is required' }} 
                        />
                        <FormField 
                            name="email" 
                            label="Email" 
                            type="email"
                            rules={{ required: 'Email is required' }} 
                        />
                        <FormField 
                            name="telephone" 
                            label="Telephone" 
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
