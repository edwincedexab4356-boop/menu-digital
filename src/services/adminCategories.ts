import { useState, useEffect } from 'react';
import { collection, onSnapshot, doc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase.js';

export interface CategoryItem {
  id: string; // usually normalized slug e.g. "helados", "dulces"
  nombre: string;
  orden?: number;
}

// Standard fallback categories
export const DEFAULT_CATEGORIES: CategoryItem[] = [
  { id: 'entradas', nombre: 'Entradas' },
  { id: 'platos_fuertes', nombre: 'Platos Fuertes' },
  { id: 'postres', nombre: 'Postres' },
];

/**
 * Hook to manage custom sections/categories stored in Firestore collection 'categorias'
 */
export function useFirestoreCategories(existingProductCategories: string[] = []) {
  const [categories, setCategories] = useState<CategoryItem[]>(DEFAULT_CATEGORIES);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribe: (() => void) | null = null;
    try {
      const colRef = collection(db, 'categorias');
      unsubscribe = onSnapshot(colRef, (snapshot) => {
        if (!snapshot.empty) {
          const fetched = snapshot.docs.map((d) => {
            const data = d.data();
            return {
              id: d.id,
              nombre: data.nombre || data.name || d.id,
              orden: data.orden ?? 100,
            };
          });

          // Sort by orden, then name
          fetched.sort((a, b) => (a.orden ?? 100) - (b.orden ?? 100) || a.nombre.localeCompare(b.nombre));
          setCategories(fetched);
        } else {
          // If Firestore collection doesn't have documents yet, merge default with any found in products
          const derived = [...DEFAULT_CATEGORIES];
          existingProductCategories.forEach((cat) => {
            const normalized = cat.trim().toLowerCase();
            if (!derived.some((d) => d.id === normalized)) {
              derived.push({
                id: normalized,
                nombre: normalized.charAt(0).toUpperCase() + normalized.slice(1).replace('_', ' '),
              });
            }
          });
          setCategories(derived);
        }
        setLoading(false);
      }, (err) => {
        console.warn('Could not read categorias collection:', err);
        setLoading(false);
      });
    } catch (err) {
      console.warn('Error connecting to categorias collection:', err);
      setLoading(false);
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [existingProductCategories.join(',')]);

  /**
   * Add or update a section/category in Firestore
   */
  const addCategory = async (rawName: string) => {
    const trimmed = rawName.trim();
    if (!trimmed) throw new Error('El nombre de la sección no puede estar vacío');
    const slug = trimmed.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
    if (!slug) throw new Error('Nombre de sección inválido');

    const catDoc = doc(db, 'categorias', slug);
    await setDoc(catDoc, {
      nombre: trimmed,
      creadoEn: serverTimestamp(),
    }, { merge: true });

    return slug;
  };

  /**
   * Edit/Rename an existing section/category in Firestore
   */
  const updateCategory = async (id: string, newName: string) => {
    const trimmed = newName.trim();
    if (!trimmed) throw new Error('El nombre de la sección no puede estar vacío');
    const catDoc = doc(db, 'categorias', id);
    await setDoc(catDoc, {
      nombre: trimmed,
      actualizadoEn: serverTimestamp(),
    }, { merge: true });
  };

  /**
   * Delete a section/category from Firestore
   */
  const removeCategory = async (id: string) => {
    const catDoc = doc(db, 'categorias', id);
    await deleteDoc(catDoc);
  };

  return {
    categories,
    loading,
    addCategory,
    updateCategory,
    removeCategory,
  };
}
