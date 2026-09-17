```typescript
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase.js';

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Order {
  items: OrderItem[];
  total: number;
  status: 'pendiente' | 'preparando' | 'listo' | 'entregado' | 'cancelado';
  createdAt: any;
}

/**
 * Guarda un nuevo pedido en Firestore.
 */
export async function createOrder(
  items: OrderItem[],
  total: number
) {
  try {
    const orderData: Order = {
      items,
      total,
      status: 'pendiente',
      createdAt: serverTimestamp(),
    };

    const orderRef = await addDoc(
      collection(db, 'pedidos'),
      orderData
    );

    return orderRef.id;
  } catch (error) {
    console.error('Error al crear el pedido:', error);
    throw error;
  }
}
```
