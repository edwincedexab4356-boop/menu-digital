import { 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  onSnapshot, 
  serverTimestamp, 
  Timestamp 
} from 'firebase/firestore';
import { db } from '../firebase.js';
import { Sale, Gasto } from '../types/finance';

/**
 * Service to manage Sales in Firestore collection 'ventas'
 */

export async function createSale(saleData: Omit<Sale, 'id' | 'creadoEn'>): Promise<string> {
  const ventasRef = collection(db, 'ventas');
  const docRef = await addDoc(ventasRef, {
    ...saleData,
    total: Number(saleData.total),
    fecha: saleData.fecha || new Date().toISOString().split('T')[0],
    creadoEn: serverTimestamp(),
  });
  return docRef.id;
}

export async function updateSale(saleId: string, saleData: Partial<Omit<Sale, 'id' | 'creadoEn'>>): Promise<void> {
  const saleRef = doc(db, 'ventas', saleId);
  await updateDoc(saleRef, {
    ...saleData,
    ...(saleData.total !== undefined ? { total: Number(saleData.total) } : {}),
    actualizadoEn: serverTimestamp(),
  });
}

export async function deleteSale(saleId: string): Promise<void> {
  const saleRef = doc(db, 'ventas', saleId);
  await deleteDoc(saleRef);
}

export function subscribeToSales(onUpdate: (sales: Sale[]) => void, onError?: (error: Error) => void): () => void {
  const ventasRef = collection(db, 'ventas');
  // Order by creadoEn descending or fallback
  const q = query(ventasRef, orderBy('creadoEn', 'desc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const sales: Sale[] = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          items: Array.isArray(data.items) ? data.items : [],
          total: typeof data.total === 'number' ? data.total : Number(data.total) || 0,
          metodoPago: data.metodoPago || 'efectivo',
          clienteNombre: data.clienteNombre || '',
          mesa: data.mesa || '',
          notas: data.notas || '',
          fecha: data.fecha || (data.creadoEn ? new Date(data.creadoEn.toDate()).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]),
          creadoEn: data.creadoEn,
          creadoPor: data.creadoPor || '',
        };
      });
      onUpdate(sales);
    },
    (err) => {
      console.warn('Error fetching sales ordered by creadoEn, falling back to unordered query:', err);
      // Fallback in case index or null timestamp on local creation
      const fallbackUnsub = onSnapshot(collection(db, 'ventas'), (snapshot) => {
        const sales: Sale[] = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            items: Array.isArray(data.items) ? data.items : [],
            total: typeof data.total === 'number' ? data.total : Number(data.total) || 0,
            metodoPago: data.metodoPago || 'efectivo',
            clienteNombre: data.clienteNombre || '',
            mesa: data.mesa || '',
            notas: data.notas || '',
            fecha: data.fecha || new Date().toISOString().split('T')[0],
            creadoEn: data.creadoEn,
            creadoPor: data.creadoPor || '',
          };
        }).sort((a, b) => {
          const tA = a.creadoEn?.toMillis?.() || new Date(a.fecha).getTime() || 0;
          const tB = b.creadoEn?.toMillis?.() || new Date(b.fecha).getTime() || 0;
          return tB - tA;
        });
        onUpdate(sales);
      }, onError);
      return fallbackUnsub;
    }
  );
}

/**
 * Service to manage Expenses in Firestore collection 'gastos'
 */

export async function createExpense(gastoData: Omit<Gasto, 'id' | 'creadoEn'>): Promise<string> {
  const gastosRef = collection(db, 'gastos');
  const docRef = await addDoc(gastosRef, {
    ...gastoData,
    monto: Number(gastoData.monto),
    fecha: gastoData.fecha || new Date().toISOString().split('T')[0],
    creadoEn: serverTimestamp(),
  });
  return docRef.id;
}

export async function updateExpense(gastoId: string, gastoData: Partial<Omit<Gasto, 'id' | 'creadoEn'>>): Promise<void> {
  const gastoRef = doc(db, 'gastos', gastoId);
  await updateDoc(gastoRef, {
    ...gastoData,
    ...(gastoData.monto !== undefined ? { monto: Number(gastoData.monto) } : {}),
    actualizadoEn: serverTimestamp(),
  });
}

export async function deleteExpense(gastoId: string): Promise<void> {
  const gastoRef = doc(db, 'gastos', gastoId);
  await deleteDoc(gastoRef);
}

export function subscribeToExpenses(onUpdate: (gastos: Gasto[]) => void, onError?: (error: Error) => void): () => void {
  const gastosRef = collection(db, 'gastos');
  const q = query(gastosRef, orderBy('creadoEn', 'desc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const gastos: Gasto[] = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          descripcion: data.descripcion || '',
          categoria: data.categoria || 'Otros',
          monto: typeof data.monto === 'number' ? data.monto : Number(data.monto) || 0,
          fecha: data.fecha || (data.creadoEn ? new Date(data.creadoEn.toDate()).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]),
          nota: data.nota || '',
          comprobanteUrl: data.comprobanteUrl || '',
          creadoEn: data.creadoEn,
          creadoPor: data.creadoPor || '',
        };
      });
      onUpdate(gastos);
    },
    (err) => {
      console.warn('Error fetching expenses ordered by creadoEn, falling back:', err);
      return onSnapshot(collection(db, 'gastos'), (snapshot) => {
        const gastos: Gasto[] = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            descripcion: data.descripcion || '',
            categoria: data.categoria || 'Otros',
            monto: typeof data.monto === 'number' ? data.monto : Number(data.monto) || 0,
            fecha: data.fecha || new Date().toISOString().split('T')[0],
            nota: data.nota || '',
            comprobanteUrl: data.comprobanteUrl || '',
            creadoEn: data.creadoEn,
            creadoPor: data.creadoPor || '',
          };
        }).sort((a, b) => {
          const tA = a.creadoEn?.toMillis?.() || new Date(a.fecha).getTime() || 0;
          const tB = b.creadoEn?.toMillis?.() || new Date(b.fecha).getTime() || 0;
          return tB - tA;
        });
        onUpdate(gastos);
      }, onError);
    }
  );
}
