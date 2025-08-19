// Cyoda OMS Entity Types

export interface Product {
  sku: string;
  name: string;
  description: string;
  price: number;
  quantityAvailable: number;
  category?: string;
  imageUrl?: string;
}

export interface CartLine {
  sku: string;
  name: string;
  price: number;
  qty: number;
  lineTotal: number;
}

export interface Cart {
  cartId: string;
  userId?: string;
  lines: CartLine[];
  totalItems: number;
  grandTotal: number;
  status: 'NEW' | 'ACTIVE' | 'CHECKING_OUT' | 'CONVERTED';
}

export interface User {
  userId: string;
  name: string;
  email: string;
  phone: string;
}

export interface Address {
  addressId: string;
  userId: string;
  line1: string;
  city: string;
  postcode: string;
  country: string;
}

export interface OrderLine {
  sku: string;
  name: string;
  unitPrice: number;
  qty: number;
  lineTotal: number;
}

export interface OrderTotals {
  items: number;
  grand: number;
}

export interface Order {
  orderId: string;
  orderNumber: string;
  userId: string;
  shippingAddressId: string;
  lines: OrderLine[];
  totals: OrderTotals;
  status: 'WAITING_TO_FULFILL' | 'PICKING' | 'SENT';
  createdAt: string;
}

export interface CheckoutForm {
  name: string;
  email: string;
  phone: string;
  address: {
    line1: string;
    city: string;
    postcode: string;
    country: string;
  };
}