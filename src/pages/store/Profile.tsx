import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, FormProvider } from 'react-hook-form';
import { toast } from 'sonner';
import { clientService, addressService, orderService, billService } from '../../api/services';
import type { Client, Address } from '../../types';
import { FormField } from '../../components/FormField';
import { User, MapPin, Package, CreditCard, Plus, Edit, Trash2 } from 'lucide-react';
import { Modal } from '../../components/Modal';

export function Profile() {
    const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
    const [view, setView] = useState<'details' | 'addresses' | 'orders' | 'bills'>('details');
    const [editingAddress, setEditingAddress] = useState<Address | null>(null);
    const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
    
    const queryClient = useQueryClient();
    const addressMethods = useForm<Address>();

    // 1. Fetch Clients to simulate "Login" (Select a user)
    const { data: clients = [], isLoading: isLoadingClients } = useQuery({
        queryKey: ['clients'],
        queryFn: () => clientService.getAll()
    });

    const client = clients.find(c => c.id_key === selectedClientId);

    // 2. Fetch related data
    const { data: addresses = [] } = useQuery({
        queryKey: ['addresses'],
        queryFn: () => addressService.getAll(),
        enabled: !!selectedClientId
    });

    const { data: orders = [] } = useQuery({
        queryKey: ['orders'],
        queryFn: () => orderService.getAll(),
        enabled: !!selectedClientId
    });

    const { data: bills = [] } = useQuery({
        queryKey: ['bills'],
        queryFn: () => billService.getAll(),
        enabled: !!selectedClientId
    });

    // Address Mutations
    const createAddressMutation = useMutation({
        mutationFn: addressService.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['addresses'] });
            toast.success('Address added');
            setIsAddressModalOpen(false);
        }
    });

    const updateAddressMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: Partial<Address> }) => addressService.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['addresses'] });
            toast.success('Address updated');
            setIsAddressModalOpen(false);
        }
    });

    const deleteAddressMutation = useMutation({
        mutationFn: addressService.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['addresses'] });
            toast.success('Address deleted');
        }
    });

    // Client Update Mutation
    const updateClientMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: Partial<Client> }) => clientService.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['clients'] });
            toast.success('Profile updated');
        }
    });


    const handleAddressSubmit = (data: Address) => {
        if (!selectedClientId) return;
        data.client_id = selectedClientId;
        
        if (editingAddress) {
            updateAddressMutation.mutate({ id: editingAddress.id_key, data });
        } else {
            createAddressMutation.mutate(data);
        }
    };

    const handleClientUpdate = (data: Partial<Client>) => {
        if (!client) return;
        updateClientMutation.mutate({ id: client.id_key, data });
    };

    // Filter data for selected client
    const myAddresses = addresses.filter(a => a.client_id === selectedClientId);
    const myOrders = orders.filter(o => o.client_id === selectedClientId);
    const myBills = bills.filter(b => b.client_id === selectedClientId);

    if (isLoadingClients) return <div>Loading...</div>;

    if (!selectedClientId) {
        return (
            <div className="max-w-md mx-auto py-12 text-center px-4">
                <h2 className="text-2xl font-bold mb-6">Select a Profile</h2>
                <p className="text-gray-500 mb-6">Simulating login by selecting a client from the database.</p>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                    {clients.map(c => (
                        <button
                            key={c.id_key}
                            onClick={() => setSelectedClientId(c.id_key)}
                            className="w-full p-4 text-left border rounded-lg hover:bg-gray-50 flex justify-between items-center group cursor-pointer"
                        >
                            <span className="font-medium text-gray-900">{c.name} {c.lastname}</span>
                            <span className="text-sm text-gray-500 group-hover:text-indigo-600">Select &rarr;</span>
                        </button>
                    ))}
                    {clients.length === 0 && (
                        <p>No clients found. Go to Admin Panel or Checkout to create one.</p>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <div className="md:grid md:grid-cols-12 md:gap-6">
                {/* Sidebar */}
                <div className="md:col-span-3">
                    <nav className="space-y-1">
                         <button
                            onClick={() => setView('details')}
                            className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md cursor-pointer ${
                                view === 'details' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-900 hover:bg-gray-50'
                            }`}
                        >
                            <User className="flex-shrink-0 -ml-1 mr-3 h-6 w-6 text-gray-400" />
                            <span className="truncate">My Details</span>
                        </button>
                        <button
                            onClick={() => setView('addresses')}
                            className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md cursor-pointer ${
                                view === 'addresses' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-900 hover:bg-gray-50'
                            }`}
                        >
                            <MapPin className="flex-shrink-0 -ml-1 mr-3 h-6 w-6 text-gray-400" />
                            <span className="truncate">Addresses</span>
                        </button>
                         <button
                            onClick={() => setView('orders')}
                            className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md cursor-pointer ${
                                view === 'orders' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-900 hover:bg-gray-50'
                            }`}
                        >
                            <Package className="flex-shrink-0 -ml-1 mr-3 h-6 w-6 text-gray-400" />
                            <span className="truncate">Order History</span>
                        </button>
                        <button
                            onClick={() => setView('bills')}
                            className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md cursor-pointer ${
                                view === 'bills' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-900 hover:bg-gray-50'
                            }`}
                        >
                            <CreditCard className="flex-shrink-0 -ml-1 mr-3 h-6 w-6 text-gray-400" />
                            <span className="truncate">Bills</span>
                        </button>
                        <button
                            onClick={() => setSelectedClientId(null)}
                            className="w-full flex items-center px-3 py-2 text-sm font-medium text-red-600 rounded-md hover:bg-red-50 cursor-pointer mt-8"
                        >
                            Sign Out
                        </button>
                    </nav>
                </div>

                {/* Content */}
                <div className="mt-5 md:mt-0 md:col-span-9">
                    {view === 'details' && client && (
                        <div className="bg-white shadow sm:rounded-lg">
                            <div className="px-4 py-5 sm:p-6">
                                <h3 className="text-lg leading-6 font-medium text-gray-900">Personal Information</h3>
                                <div className="mt-5">
                                    <ClientForm client={client} onSubmit={handleClientUpdate} />
                                </div>
                            </div>
                        </div>
                    )}

                    {view === 'addresses' && (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg leading-6 font-medium text-gray-900">My Addresses</h3>
                                <button
                                    onClick={() => { setEditingAddress(null); addressMethods.reset({street: '', number: '', city: ''}); setIsAddressModalOpen(true); }}
                                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 cursor-pointer"
                                >
                                    <Plus className="h-4 w-4 mr-1" /> Add New
                                </button>
                            </div>
                            <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                {myAddresses.map(address => (
                                    <li key={address.id_key} className="col-span-1 bg-white rounded-lg shadow divide-y divide-gray-200">
                                        <div className="w-full p-6 flex items-center justify-between space-x-6">
                                            <div className="flex-1 truncate">
                                                <div className="flex items-center space-x-3">
                                                    <h3 className="text-gray-900 text-sm font-medium truncate">{address.street} {address.number}</h3>
                                                </div>
                                                <p className="mt-1 text-gray-500 text-sm truncate">{address.city}</p>
                                            </div>
                                            <div className="flex-shrink-0 flex flex-col space-y-2">
                                                 <button 
                                                    onClick={() => { setEditingAddress(address); addressMethods.reset(address); setIsAddressModalOpen(true); }}
                                                    className="bg-gray-100 rounded-full p-2 hover:bg-gray-200 cursor-pointer text-indigo-600"
                                                 >
                                                     <Edit className="w-4 h-4" />
                                                 </button>
                                                 <button 
                                                    onClick={() => { if(window.confirm('Delete?')) deleteAddressMutation.mutate(address.id_key) }}
                                                    className="bg-gray-100 rounded-full p-2 hover:bg-gray-200 cursor-pointer text-red-600"
                                                 >
                                                     <Trash2 className="w-4 h-4" />
                                                 </button>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {view === 'orders' && (
                        <div className="bg-white shadow overflow-hidden sm:rounded-md">
                            <ul className="divide-y divide-gray-200">
                                {myOrders.map(order => (
                                    <li key={order.id_key}>
                                        <div className="px-4 py-4 sm:px-6">
                                            <div className="flex items-center justify-between">
                                                <p className="text-sm font-medium text-indigo-600 truncate">Order #{order.id_key}</p>
                                                <div className="ml-2 flex-shrink-0 flex">
                                                    <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                        {['PENDING', 'IN PROGRESS', 'DELIVERED', 'CANCELED'][order.status - 1]}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="mt-2 sm:flex sm:justify-between">
                                                <div className="sm:flex">
                                                    <p className="flex items-center text-sm text-gray-500">
                                                        Total: ${order.total}
                                                    </p>
                                                </div>
                                                <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                                                    <p>
                                                        Placed on <time dateTime={order.date}>{new Date(order.date).toLocaleDateString()}</time>
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                                {myOrders.length === 0 && <p className="p-4 text-gray-500">No orders found.</p>}
                            </ul>
                        </div>
                    )}

                    {view === 'bills' && (
                         <div className="bg-white shadow overflow-hidden sm:rounded-md">
                         <ul className="divide-y divide-gray-200">
                             {myBills.map(bill => (
                                 <li key={bill.id_key}>
                                     <div className="px-4 py-4 sm:px-6">
                                         <div className="flex items-center justify-between">
                                             <p className="text-sm font-medium text-indigo-600 truncate">{bill.bill_number}</p>
                                             <p className="text-sm text-gray-500">${bill.total}</p>
                                         </div>
                                         <div className="mt-2">
                                             <p className="text-sm text-gray-500">
                                                Date: {new Date(bill.date).toLocaleDateString()}
                                             </p>
                                         </div>
                                     </div>
                                 </li>
                             ))}
                             {myBills.length === 0 && <p className="p-4 text-gray-500">No bills found.</p>}
                         </ul>
                     </div>
                    )}
                </div>
            </div>

            <Modal
                isOpen={isAddressModalOpen}
                onClose={() => setIsAddressModalOpen(false)}
                title={editingAddress ? "Edit Address" : "Add New Address"}
            >
                <FormProvider {...addressMethods}>
                    <form onSubmit={addressMethods.handleSubmit(handleAddressSubmit)}>
                        <FormField name="street" label="Street" rules={{ required: true }} />
                        <FormField name="number" label="Number" rules={{ required: true }} />
                        <FormField name="city" label="City" rules={{ required: true }} />
                        <div className="mt-4 flex justify-end space-x-2">
                            <button
                                type="button"
                                onClick={() => setIsAddressModalOpen(false)}
                                className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 cursor-pointer"
                            >
                                Save
                            </button>
                        </div>
                    </form>
                </FormProvider>
            </Modal>
        </div>
    );
}

function ClientForm({ client, onSubmit }: { client: Client; onSubmit: (data: Partial<Client>) => void }) {
    const methods = useForm<Client>({ defaultValues: client });
    return (
        <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                    <div className="sm:col-span-3">
                        <FormField name="name" label="First Name" />
                    </div>
                    <div className="sm:col-span-3">
                        <FormField name="lastname" label="Last Name" />
                    </div>
                    <div className="sm:col-span-4">
                        <FormField name="email" label="Email" type="email" />
                    </div>
                    <div className="sm:col-span-3">
                        <FormField name="telephone" label="Telephone" />
                    </div>
                </div>
                <div className="flex justify-end">
                    <button
                        type="submit"
                        className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 cursor-pointer"
                    >
                        Save Details
                    </button>
                </div>
            </form>
        </FormProvider>
    );
}
