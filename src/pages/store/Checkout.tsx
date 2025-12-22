import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, FormProvider } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useCart } from '../../context/CartContext';
import { clientService, addressService, billService, orderService, orderDetailService } from '../../api/services';
import { type Client, type Address, PaymentType, DeliveryMethod, Status } from '../../types';
import { FormField } from '../../components/FormField';
import { ArrowRight } from 'lucide-react';

export function Checkout() {
    const { items, total, clearCart } = useCart();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [step, setStep] = useState<1 | 2 | 3>(1); // 1: Client, 2: Address, 3: Review/Pay
    const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
    const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);

    const clientMethods = useForm<Client>();
    const addressMethods = useForm<Address>();

    // Queries
    const { data: clients = [] } = useQuery({ queryKey: ['clients'], queryFn: () => clientService.getAll() });
    const { data: addresses = [] } = useQuery({ queryKey: ['addresses'], queryFn: () => addressService.getAll() });

    // Client Mutations
    const createClientMutation = useMutation({
        mutationFn: clientService.create,
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['clients'] });
            setSelectedClientId(data.id_key);
            setStep(2);
        },
         onError: () => toast.error('Failed to create client')
    });

    // Address Mutations
    const createAddressMutation = useMutation({
        mutationFn: addressService.create,
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['addresses'] });
            setSelectedAddressId(data.id_key);
            setStep(3);
        },
        onError: () => toast.error('Failed to create address')
    });

    // Final Order Mutations
    const createBillMutation = useMutation({ mutationFn: billService.create });
    const createOrderMutation = useMutation({ mutationFn: orderService.create });
    const createOrderDetailMutation = useMutation({ mutationFn: orderDetailService.create });

    const handleClientSubmit = (data: Client) => {
        createClientMutation.mutate(data);
    };

    const handleClientSelect = (clientId: number) => {
        setSelectedClientId(clientId);
        setStep(2);
    };

    const handleAddressSubmit = (data: Address) => {
        if (!selectedClientId) return;
        createAddressMutation.mutate({ ...data, client_id: selectedClientId });
    };

    const handleAddressSelect = (addressId: number) => {
        setSelectedAddressId(addressId);
        setStep(3);
    };

    const handlePlaceOrder = async () => {
        if (!selectedClientId) return;

        try {
            // 1. Create Bill
            const bill = await createBillMutation.mutateAsync({
                bill_number: `BILL-${Date.now()}`,
                date: new Date().toISOString(),
                total: total,
                payment_type: PaymentType.CARD, // Hardcoded for demo
                client_id: selectedClientId
            });

            // 2. Create Order
            const order = await createOrderMutation.mutateAsync({
                date: new Date().toISOString(),
                total: total,
                delivery_method: DeliveryMethod.HOME_DELIVERY,
                status: Status.PENDING,
                client_id: selectedClientId,
                bill_id: bill.id_key
            });

            // 3. Create Order Details
            const orderId = order.id_key;
            for (const item of items) {
                await createOrderDetailMutation.mutateAsync({
                    quantity: item.quantity,
                    price: item.price,
                    order_id: orderId,
                    product_id: item.id_key
                });
            }

            toast.success('Order placed successfully!');
            clearCart();
            navigate('/profile');

        } catch (error) {
            console.error(error);
            toast.error('Failed to place order');
        }
    };

    const clientOptions = clients.map(c => ({ label: `${c.name} ${c.lastname}`, value: c.id_key }));
    // Filter addresses for selected client
    const relevantAddresses = addresses.filter(a => a.client_id === selectedClientId);

    if (items.length === 0) {
        return <div className="p-8 text-center">Your cart is empty</div>;
    }

    return (
        <div className="max-w-2xl mx-auto py-8 px-4">
            <h1 className="text-2xl font-bold mb-6">Checkout</h1>
            
            {/* Steps Indicator */}
            <div className="flex mb-8">
                <div className={`flex-1 text-center border-b-2 pb-2 ${step >= 1 ? 'border-indigo-600 text-indigo-600' : 'border-gray-200'}`}>1. Client</div>
                <div className={`flex-1 text-center border-b-2 pb-2 ${step >= 2 ? 'border-indigo-600 text-indigo-600' : 'border-gray-200'}`}>2. Address</div>
                <div className={`flex-1 text-center border-b-2 pb-2 ${step >= 3 ? 'border-indigo-600 text-indigo-600' : 'border-gray-200'}`}>3. Pay</div>
            </div>

            {step === 1 && (
                <div className="bg-white p-6 shadow rounded-lg">
                    <h2 className="text-xl font-medium mb-4">Client Information</h2>
                    
                    {/* Select Existing */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Select Existing Client</label>
                        <select 
                            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                            onChange={(e) => handleClientSelect(Number(e.target.value))}
                            defaultValue=""
                        >
                            <option value="" disabled>Select a client...</option>
                            {clientOptions.map(c => (
                                <option key={c.value} value={c.value}>{c.label}</option>
                            ))}
                        </select>
                    </div>

                    <div className="relative mb-6">
                        <div className="absolute inset-0 flex items-center" aria-hidden="true">
                            <div className="w-full border-t border-gray-300" />
                        </div>
                        <div className="relative flex justify-center">
                            <span className="px-2 bg-white text-sm text-gray-500">Or create new</span>
                        </div>
                    </div>

                    {/* Create New */}
                    <FormProvider {...clientMethods}>
                        <form onSubmit={clientMethods.handleSubmit(handleClientSubmit)}>
                            <FormField name="name" label="Name" rules={{ required: 'Name is required' }} />
                            <FormField name="lastname" label="Lastname" rules={{ required: 'Lastname is required' }} />
                            <FormField name="email" label="Email" type="email" rules={{ required: 'Email is required' }} />
                            <FormField name="telephone" label="Telephone" />
                            <button type="submit" className="mt-4 w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 cursor-pointer">
                                Continue
                            </button>
                        </form>
                    </FormProvider>
                </div>
            )}

            {step === 2 && (
                <div className="bg-white p-6 shadow rounded-lg">
                    <h2 className="text-xl font-medium mb-4">Shipping Address</h2>

                     {/* Select Existing */}
                     {relevantAddresses.length > 0 && (
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Select Existing Address</label>
                             <ul className="space-y-2">
                                {relevantAddresses.map(a => (
                                    <li 
                                        key={a.id_key} 
                                        className={`p-3 border rounded-md hover:bg-gray-50 cursor-pointer flex justify-between items-center ${selectedAddressId === a.id_key ? 'border-indigo-500 bg-indigo-50' : ''}`}
                                        onClick={() => handleAddressSelect(a.id_key)}
                                    >
                                        <span>{a.street} {a.number}, {a.city}</span>
                                        <ArrowRight className="w-4 h-4 text-gray-400" />
                                    </li>
                                ))}
                            </ul>
                        </div>
                     )}

                     <div className="relative mb-6">
                        <div className="absolute inset-0 flex items-center" aria-hidden="true">
                            <div className="w-full border-t border-gray-300" />
                        </div>
                        <div className="relative flex justify-center">
                            <span className="px-2 bg-white text-sm text-gray-500">Or add new address</span>
                        </div>
                    </div>

                    <FormProvider {...addressMethods}>
                        <form onSubmit={addressMethods.handleSubmit(handleAddressSubmit)}>
                            <FormField name="street" label="Street" rules={{ required: 'Street is required' }} />
                            <FormField name="number" label="Number" rules={{ required: 'Number is required' }} />
                            <FormField name="city" label="City" rules={{ required: 'City is required' }} />
                            <button type="submit" className="mt-4 w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 cursor-pointer">
                                Continue
                            </button>
                        </form>
                    </FormProvider>
                </div>
            )}

            {step === 3 && (
                <div className="bg-white p-6 shadow rounded-lg">
                    <h2 className="text-xl font-medium mb-4">Order Summary</h2>
                    <ul className="divide-y divide-gray-200 mb-6">
                        {items.map(item => (
                            <li key={item.id_key} className="py-2 flex justify-between">
                                <span>{item.name} x {item.quantity}</span>
                                <span>${(item.price * item.quantity).toFixed(2)}</span>
                            </li>
                        ))}
                    </ul>
                    <div className="flex justify-between font-bold text-lg mb-6">
                        <span>Total</span>
                        <span>${total.toFixed(2)}</span>
                    </div>
                    <button 
                        onClick={handlePlaceOrder}
                        className="w-full bg-indigo-600 text-white py-3 px-4 rounded-md hover:bg-indigo-700 font-medium cursor-pointer"
                    >
                        Place Order & Pay
                    </button>
                </div>
            )}
        </div>
    );
}
