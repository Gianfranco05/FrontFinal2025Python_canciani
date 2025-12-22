import api from './axios';
import type { Product, Category, Client, Address, Bill, Order, OrderDetail, Review } from '../types';

// Generic CRUD helper
const createCrudService = <T>(endpoint: string) => ({
    getAll: async () => {
        // Backend requirement: Trailing slash for lists
        const { data } = await api.get<T[]>(`${endpoint}/`);
        return data;
    },
    getOne: async (id: number) => {
        const { data } = await api.get<T>(`${endpoint}/${id}`);
        return data;
    },
    create: async (item: Partial<T>) => {
        // Backend requirement: Trailing slash for create
        const { data } = await api.post<T>(`${endpoint}/`, item);
        return data;
    },
    update: async (id: number, item: Partial<T>) => {
        const { data } = await api.put<T>(`${endpoint}/${id}`, item);
        return data;
    },
    delete: async (id: number) => {
        await api.delete(`${endpoint}/${id}`);
    }
});

export const productService = createCrudService<Product>('/products');
export const categoryService = createCrudService<Category>('/categories');
export const clientService = createCrudService<Client>('/clients');
export const addressService = createCrudService<Address>('/addresses');
export const billService = createCrudService<Bill>('/bills');
export const orderService = createCrudService<Order>('/orders');
export const orderDetailService = createCrudService<OrderDetail>('/order_details');
export const reviewService = createCrudService<Review>('/reviews');
