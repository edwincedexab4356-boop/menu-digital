import { useState, useEffect } from 'react';
import { collection, onSnapshot, getDocs, doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase.js';
import { MenuItem } from '../types';
import { menuItems as defaultMenuItems } from '../data/menuData';

/**
 * Normalizes any category string from Firestore into standard categories or preserves custom ones
 */
export function normalizeCategory(rawCategory: any): string {
  if (!rawCategory || typeof rawCategory !== 'string') return 'entradas';
  const cat = rawCategory.trim().toLowerCase();
  if (cat === 'entradas' || cat === 'entrada' || cat === 'starters' || cat === 'aperitivos') {
    return 'entradas';
  }
  if (
    cat === 'platos_fuertes' ||
    cat === 'platos fuertes' ||
    cat === 'plato fuerte' ||
    cat === 'platos' ||
    cat === 'fuertes' ||
    cat === 'principales' ||
    cat === 'mains'
  ) {
    return 'platos_fuertes';
  }
  if (cat === 'postres' || cat === 'postre' || cat === 'desserts' || cat === 'dulces') {
    return 'postres';
  }
  return cat;
}

/**
 * Maps a Firestore document data object into a typed MenuItem
 */
export function mapDocToMenuItem(id: string, data: Record<string, any>): MenuItem {
  // 1. Nombre
  const name = data.nombre || data.name || data.titulo || 'Sin nombre';

  // 2. Precio en USD
  let price = 0;
  const rawPrice = data.precio ?? data.price ?? data.valor ?? 0;
  if (typeof rawPrice === 'number') {
    price = rawPrice;
  } else if (typeof rawPrice === 'string') {
    const cleaned = rawPrice.replace(/[^0-9.]/g, '');
    price = parseFloat(cleaned) || 0;
  }

  // 3. Descripción
  const description = data.descripcion || data.description || data.detalle || '';
  const longDescription = data.descripcion_larga || data.longDescription || data.detalles || description;

  // 4. Categoría
  const category = normalizeCategory(data.categoria || data.category);

  // 5. Imagen si existe
  const image = data.imagen || data.image || data.foto || data.url || data.photo || undefined;

  // 6. Estado disponible / no disponible
  let available = true;
  if (data.disponible !== undefined) {
    if (typeof data.disponible === 'boolean') {
      available = data.disponible;
    } else if (typeof data.disponible === 'string') {
      const s = data.disponible.toLowerCase().trim();
      available = s === 'true' || s === 'si' || s === 'sí' || s === 'disponible' || s === 'activo';
    }
  } else if (data.estado !== undefined) {
    if (typeof data.estado === 'boolean') {
      available = data.estado;
    } else if (typeof data.estado === 'string') {
      const s = data.estado.toLowerCase().trim();
      available = s === 'disponible' || s === 'activo' || s === 'si' || s === 'sí' || s === 'true';
    }
  } else if (data.available !== undefined) {
    if (typeof data.available === 'boolean') {
      available = data.available;
    } else if (typeof data.available === 'string') {
      available = data.available.toLowerCase().trim() === 'true';
    }
  } else if (data.activo !== undefined) {
    available = Boolean(data.activo);
  }

  // Tags
  let tags: string[] = [];
  if (Array.isArray(data.tags)) tags = data.tags;
  else if (Array.isArray(data.etiquetas)) tags = data.etiquetas;
  else if (typeof data.etiquetas === 'string') {
    tags = data.etiquetas.split(',').map((s) => s.trim()).filter(Boolean);
  }

  // Ingredientes
  let ingredients: string[] = [];
  if (Array.isArray(data.ingredientes)) ingredients = data.ingredientes;
  else if (Array.isArray(data.ingredients)) ingredients = data.ingredients;
  else if (typeof data.ingredientes === 'string') {
    ingredients = data.ingredientes.split(',').map((s) => s.trim()).filter(Boolean);
  }

  return {
    id,
    name,
    category,
    description,
    longDescription,
    price,
    image,
    available,
    prepTime: data.prepTime || data.tiempo || data.tiempo_preparacion || '10-15 min',
    calories: data.calories || data.calorias,
    rating: data.rating || data.calificacion || 4.9,
    reviewCount: data.reviewCount || data.reviews || 45,
    tags,
    ingredients,
    allergens: Array.isArray(data.alergenos) ? data.alergenos : Array.isArray(data.allergens) ? data.allergens : undefined,
    winePairing: data.maridaje || data.winePairing,
    portionSize: data.porcion || data.portionSize,
  };
}

/**
 * Custom React Hook to subscribe in real-time to the 'productos' collection in Cloud Firestore
 */
export function useFirestoreProducts() {
  const [products, setProducts] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [firestoreCount, setFirestoreCount] = useState<number>(0);
  const [isFirestoreConnected, setIsFirestoreConnected] = useState(false);

  useEffect(() => {
    let unsubscribe: (() => void) | null = null;

    try {
      const productosRef = collection(db, 'productos');

      unsubscribe = onSnapshot(
        productosRef,
        (snapshot) => {
          setIsFirestoreConnected(true);
          setError(null);
          setLoading(false);
          setFirestoreCount(snapshot.docs.length);

          if (!snapshot.empty) {
            const firestoreItems: MenuItem[] = snapshot.docs.map((docSnap) =>
              mapDocToMenuItem(docSnap.id, docSnap.data())
            );
            setProducts(firestoreItems);
          } else {
            // Collection exists and is connected, but has 0 documents currently
            setProducts([]);
          }
        },
        (err) => {
          console.warn('Firestore onSnapshot error or permission restriction:', err);
          setError(err.message);
          setLoading(false);
          setIsFirestoreConnected(false);
        }
      );
    } catch (err: any) {
      console.error('Error connecting to Firestore productos:', err);
      setError(err?.message || 'Error al conectar a Firestore');
      setLoading(false);
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  /**
   * Helper to seed sample dishes into Firestore 'productos' if collection is currently empty
   */
  const seedSampleProducts = async () => {
    try {
      setLoading(true);
      for (const item of defaultMenuItems) {
        const itemRef = doc(db, 'productos', item.id);
        await setDoc(itemRef, {
          nombre: item.name,
          precio: item.price,
          descripcion: item.description,
          descripcion_larga: item.longDescription,
          categoria: item.category,
          imagen: item.image,
          disponible: true,
          prepTime: item.prepTime,
          calories: item.calories,
          rating: item.rating,
          reviewCount: item.reviewCount,
          tags: item.tags,
          ingredientes: item.ingredients,
          alergenos: item.allergens || [],
          maridaje: item.winePairing || '',
          porcion: item.portionSize || '',
        });
      }
      setLoading(false);
    } catch (err: any) {
      console.error('Error seeding sample products to Firestore:', err);
      setError(err?.message || 'Error al guardar productos en Firestore');
      setLoading(false);
    }
  };

  return {
    products,
    loading,
    error,
    firestoreCount,
    isFirestoreConnected,
    seedSampleProducts,
    defaultFallbackItems: defaultMenuItems,
  };
}
