import { getCyodaConfig } from '@/config/cyoda.config';
import { Product, Cart, Order, User, Address } from '@/types';

export class CyodaApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public response?: any
  ) {
    super(message);
    this.name = 'CyodaApiError';
  }
}

// Base fetch wrapper with auth
export async function cyodaFetch<T = any>(
  path: string,
  init: RequestInit = {}
): Promise<T> {
  const config = getCyodaConfig();
  const url = `${config.apiBase}${path}`;
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init.headers as Record<string, string>),
  };

  if (config.token) {
    headers.Authorization = `Bearer ${config.token}`;
  }

  const response = await fetch(url, {
    ...init,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new CyodaApiError(
      response.status,
      errorData.message || `HTTP ${response.status}: ${response.statusText}`,
      errorData
    );
  }

  return response.json();
}

// Entity Management Operations
export interface EntityOperation<T> {
  entityName: string;
  modelVersion?: string;
  data: T;
}

export interface QueryOptions {
  limit?: number;
  offset?: number;
  orderBy?: string;
  pointInTime?: string;
}

export interface SearchCondition {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'like' | 'in';
  value: any;
}

export interface SearchRequest {
  conditions?: SearchCondition[];
  limit?: number;
  offset?: number;
  orderBy?: string;
}

// Generic CRUD operations
export async function saveEntity<T>(
  entityName: string,
  data: T,
  modelVersion?: string
): Promise<{ id: string; version: string }> {
  return cyodaFetch(`/entity/${entityName}${modelVersion ? `/${modelVersion}` : ''}`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getEntity<T>(
  entityName: string,
  id: string,
  modelVersion?: string
): Promise<T> {
  return cyodaFetch(`/entity/${entityName}${modelVersion ? `/${modelVersion}` : ''}/${id}`);
}

export async function updateEntity<T>(
  entityName: string,
  id: string,
  data: Partial<T>,
  modelVersion?: string
): Promise<{ id: string; version: string }> {
  return cyodaFetch(`/entity/${entityName}${modelVersion ? `/${modelVersion}` : ''}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteEntity(
  entityName: string,
  id: string,
  modelVersion?: string
): Promise<void> {
  return cyodaFetch(`/entity/${entityName}${modelVersion ? `/${modelVersion}` : ''}/${id}`, {
    method: 'DELETE',
  });
}

export async function searchEntities<T>(
  entityName: string,
  searchRequest: SearchRequest = {},
  modelVersion?: string
): Promise<{ items: T[]; total: number }> {
  const queryParams = new URLSearchParams();
  if (searchRequest.limit) queryParams.set('limit', searchRequest.limit.toString());
  if (searchRequest.offset) queryParams.set('offset', searchRequest.offset.toString());
  if (searchRequest.orderBy) queryParams.set('orderBy', searchRequest.orderBy);

  const url = `/entity/${entityName}${modelVersion ? `/${modelVersion}` : ''}?${queryParams}`;
  
  if (searchRequest.conditions && searchRequest.conditions.length > 0) {
    return cyodaFetch(url, {
      method: 'POST',
      body: JSON.stringify({ conditions: searchRequest.conditions }),
    });
  }
  
  return cyodaFetch(url);
}

// SQL Query support
export async function querySql<T = any>(sql: string, parameters?: Record<string, any>): Promise<T[]> {
  return cyodaFetch('/sql/query', {
    method: 'POST',
    body: JSON.stringify({
      query: sql,
      parameters: parameters || {},
    }),
  });
}

// Specific entity operations for our OMS
export const ProductService = {
  list: (options: QueryOptions = {}) => 
    searchEntities<Product>('Product', options),
  
  get: (id: string) => 
    getEntity<Product>('Product', id),
  
  create: (product: Omit<Product, 'sku'>) => 
    saveEntity('Product', product),
  
  update: (sku: string, product: Partial<Product>) => 
    updateEntity('Product', sku, product),
  
  search: (searchTerm: string, category?: string) => 
    searchEntities<Product>('Product', {
      conditions: [
        ...(searchTerm ? [{
          field: 'name',
          operator: 'like' as const,
          value: `%${searchTerm}%`
        }] : []),
        ...(category && category !== 'All' ? [{
          field: 'category',
          operator: 'eq' as const,
          value: category
        }] : [])
      ]
    })
};

export const CartService = {
  get: (cartId: string) => 
    getEntity<Cart>('Cart', cartId),
  
  create: (cart: Omit<Cart, 'cartId'>) => 
    saveEntity('Cart', cart),
  
  update: (cartId: string, cart: Partial<Cart>) => 
    updateEntity('Cart', cartId, cart),
  
  delete: (cartId: string) => 
    deleteEntity('Cart', cartId)
};

export const OrderService = {
  get: (orderId: string) => 
    getEntity<Order>('Order', orderId),
  
  create: (order: Omit<Order, 'orderId'>) => 
    saveEntity('Order', order),
  
  update: (orderId: string, order: Partial<Order>) => 
    updateEntity('Order', orderId, order),
  
  list: (userId?: string, options: QueryOptions = {}) => 
    searchEntities<Order>('Order', {
      ...options,
      ...(userId ? { conditions: [{ field: 'userId', operator: 'eq', value: userId }] } : {})
    })
};

export const UserService = {
  get: (userId: string) => 
    getEntity<User>('User', userId),
  
  create: (user: Omit<User, 'userId'>) => 
    saveEntity('User', user),
  
  update: (userId: string, user: Partial<User>) => 
    updateEntity('User', userId, user),
  
  findByEmail: (email: string) => 
    searchEntities<User>('User', {
      conditions: [{ field: 'email', operator: 'eq', value: email }],
      limit: 1
    })
};

export const AddressService = {
  get: (addressId: string) => 
    getEntity<Address>('Address', addressId),
  
  create: (address: Omit<Address, 'addressId'>) => 
    saveEntity('Address', address),
  
  update: (addressId: string, address: Partial<Address>) => 
    updateEntity('Address', addressId, address)
};