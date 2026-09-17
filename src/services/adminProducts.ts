import { collection, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase.js';

export interface ProductFormData {
  nombre: string;
  precio: number;
  categoria: string;
  descripcion: string;
  imagen: string;
  disponible: boolean;
  prepTime?: string;
}

/**
 * Creates a new product in Firestore 'productos' collection with automatic ID
 * Enforces precio as number and disponible as boolean
 */
export async function createProduct(data: ProductFormData): Promise<string> {
  const collectionRef = collection(db, 'productos');
  const docRef = await addDoc(collectionRef, {
    nombre: data.nombre.trim(),
    precio: Number(data.precio) || 0,
    categoria: data.categoria.trim().toLowerCase(),
    descripcion: data.descripcion.trim(),
    imagen: data.imagen.trim(),
    disponible: Boolean(data.disponible),
    prepTime: data.prepTime?.trim() || '10-15 min',
    creadoEn: serverTimestamp(),
  });
  return docRef.id;
}

/**
 * Updates an existing product document in Firestore
 */
export async function updateProduct(id: string, data: Partial<ProductFormData>): Promise<void> {
  const docRef = doc(db, 'productos', id);
  const updatePayload: Record<string, any> = {
    actualizadoEn: serverTimestamp(),
  };

  if (data.nombre !== undefined) updatePayload.nombre = data.nombre.trim();
  if (data.precio !== undefined) updatePayload.precio = Number(data.precio) || 0;
  if (data.categoria !== undefined) updatePayload.categoria = data.categoria.trim().toLowerCase();
  if (data.descripcion !== undefined) updatePayload.descripcion = data.descripcion.trim();
  if (data.imagen !== undefined) updatePayload.imagen = data.imagen.trim();
  if (data.disponible !== undefined) updatePayload.disponible = Boolean(data.disponible);
  if (data.prepTime !== undefined) updatePayload.prepTime = data.prepTime.trim();

  await updateDoc(docRef, updatePayload);
}

/**
 * Toggles product availability directly in Firestore
 */
export async function setProductAvailability(id: string, disponible: boolean): Promise<void> {
  const docRef = doc(db, 'productos', id);
  await updateDoc(docRef, {
    disponible: Boolean(disponible),
    actualizadoEn: serverTimestamp(),
  });
}

/**
 * Deletes a product document from Firestore
 */
export async function deleteProduct(id: string): Promise<void> {
  const docRef = doc(db, 'productos', id);
  await deleteDoc(docRef);
}
