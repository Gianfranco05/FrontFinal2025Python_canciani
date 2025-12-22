// Matching backend schemas
// Crucial: Backend uses id_key instead of id

export interface Category {
    id_key: number;
    name: string;
}

export interface Product {
    id_key: number;
    name: string;
    price: number;
    stock: number;
    category_id: number;
}

export interface Client {
    id_key: number;
    name: string;
    lastname: string;
    email: string;
    telephone: string;
    addresses: Address[];
}

export interface Address {
    id_key: number;
    street: string;
    number: string;
    city: string;
    client_id: number;
}

export const DeliveryMethod = {
    DRIVE_THRU: 1,
    ON_HAND: 2,
    HOME_DELIVERY: 3
} as const;
export type DeliveryMethod = typeof DeliveryMethod[keyof typeof DeliveryMethod];

export const Status = {
    PENDING: 1,
    IN_PROGRESS: 2,
    DELIVERED: 3,
    CANCELED: 4
} as const;
export type Status = typeof Status[keyof typeof Status];

export const PaymentType = {
    CASH: 1,
    CARD: 2,
    DEBIT: 3,
    CREDIT: 4,
    BANK_TRANSFER: 5
} as const;
export type PaymentType = typeof PaymentType[keyof typeof PaymentType];

export interface Bill {
    id_key: number;
    bill_number: string;
    date: string;
    total: number;
    payment_type: PaymentType;
    client_id: number;
    discount?: number;
}

export interface Order {
    id_key: number;
    date: string;
    total: number;
    delivery_method: DeliveryMethod;
    status: Status;
    client_id: number;
    bill_id: number;
}

export interface OrderDetail {
    id_key: number;
    quantity: number;
    price?: number;
    order_id: number;
    product_id: number;
}

export interface Review {
    id_key: number;
    rating: number;
    comment: string;
    product_id: number;
}
