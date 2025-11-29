export type OrderStatus = 'pending' | 'processing' | 'completed' | 'cancelled';

export interface Order {
  id: string;
  userId: string;
  productTitle: string;
  productImage?: string;
  quantity: number;
  amount: number;
  paymentMethod: string;
  status: OrderStatus;
  createdAt: string;
  shippingAddress: {
    fullName: string;
    email: string;
    phone?: string;
    street: string;
    city: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
}

const STORAGE_KEY = 'royal_orders';

export const saveOrder = (order: Order) => {
  try {
    const existing = localStorage.getItem(STORAGE_KEY);
    const parsed: Order[] = existing ? JSON.parse(existing) : [];
    parsed.unshift(order);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
  } catch (error) {
    console.error('Failed to save order to localStorage', error);
  }
};

export const getOrdersForUser = (userId: string): Order[] => {
  try {
    const existing = localStorage.getItem(STORAGE_KEY);
    const parsed: Order[] = existing ? JSON.parse(existing) : [];
    return parsed.filter((order) => order.userId === userId);
  } catch (error) {
    console.error('Failed to read user orders from localStorage', error);
    return [];
  }
};

export const getAllOrders = (): Order[] => {
  try {
    const existing = localStorage.getItem(STORAGE_KEY);
    const parsed: Order[] = existing ? JSON.parse(existing) : [];
    return parsed;
  } catch (error) {
    console.error('Failed to read orders from localStorage', error);
    return [];
  }
};


