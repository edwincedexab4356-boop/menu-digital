/**
 * Utility module for food and category photography.
 * Ensures every single dish, category, cart item, and order has an appetizing,
 * high-definition image, with smart matching based on dish name and category keywords.
 */

export interface FoodImagePreset {
  id: string;
  name: string;
  category: string;
  url: string;
}

export const FOOD_PRESETS: FoodImagePreset[] = [
  // Entradas & Tapas
  {
    id: 'ent-carpaccio',
    name: 'Carpaccio de Res',
    category: 'entradas',
    url: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1000&q=80',
  },
  {
    id: 'ent-burrata',
    name: 'Burrata & Ensalada Fresca',
    category: 'entradas',
    url: 'https://images.unsplash.com/photo-1592417817098-8f3d6910985c?auto=format&fit=crop&w=1000&q=80',
  },
  {
    id: 'ent-croquetas',
    name: 'Croquetas & Tapas',
    category: 'entradas',
    url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=1000&q=80',
  },
  {
    id: 'ent-pulpo',
    name: 'Pulpo a la Brasa',
    category: 'entradas',
    url: 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&w=1000&q=80',
  },
  {
    id: 'ent-tartar',
    name: 'Tartar de Atún / Salmón',
    category: 'entradas',
    url: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=1000&q=80',
  },
  {
    id: 'ent-ensalada',
    name: 'Ensalada Mediterránea',
    category: 'entradas',
    url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1000&q=80',
  },

  // Platos Fuertes
  {
    id: 'plt-carne',
    name: 'Corte de Carne / Bife Asado',
    category: 'platos_fuertes',
    url: 'https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&w=1000&q=80',
  },
  {
    id: 'plt-burger',
    name: 'Hamburguesa Gourmet',
    category: 'platos_fuertes',
    url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1000&q=80',
  },
  {
    id: 'plt-pasta',
    name: 'Pasta Fresca & Salsa Casera',
    category: 'platos_fuertes',
    url: 'https://images.unsplash.com/photo-1621996346565-e3d5d6281643?auto=format&fit=crop&w=1000&q=80',
  },
  {
    id: 'plt-risotto',
    name: 'Risotto de Hongos & Trufa',
    category: 'platos_fuertes',
    url: 'https://images.unsplash.com/photo-1633964913295-ceb43826e7c9?auto=format&fit=crop&w=1000&q=80',
  },
  {
    id: 'plt-pescado',
    name: 'Pescado Fresco / Salmón a la Plancha',
    category: 'platos_fuertes',
    url: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=1000&q=80',
  },
  {
    id: 'plt-pizza',
    name: 'Pizza Artesanal al Horno',
    category: 'platos_fuertes',
    url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1000&q=80',
  },

  // Postres & Dulces
  {
    id: 'pos-cheesecake',
    name: 'Tarta de Queso / Cheesecake',
    category: 'postres',
    url: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=1000&q=80',
  },
  {
    id: 'pos-coulant',
    name: 'Volcán de Chocolate Fundido',
    category: 'postres',
    url: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=1000&q=80',
  },
  {
    id: 'pos-tiramisu',
    name: 'Tiramisú Tradicional al Café',
    category: 'postres',
    url: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=1000&q=80',
  },
  {
    id: 'pos-helado',
    name: 'Helado Artesanal & Gelato',
    category: 'postres',
    url: 'https://images.unsplash.com/photo-1501443762994-82bd5dace89a?auto=format&fit=crop&w=1000&q=80',
  },
  {
    id: 'pos-churros',
    name: 'Churros con Chocolate',
    category: 'postres',
    url: 'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?auto=format&fit=crop&w=1000&q=80',
  },
  {
    id: 'pos-waffles',
    name: 'Waffles & Gofres con Frutas',
    category: 'postres',
    url: 'https://images.unsplash.com/photo-1562376552-0d160a2f238d?auto=format&fit=crop&w=1000&q=80',
  },

  // Bebidas & Cafetería
  {
    id: 'beb-cafe',
    name: 'Café Espresso & Cappuccino',
    category: 'bebidas',
    url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=1000&q=80',
  },
  {
    id: 'beb-coctel',
    name: 'Cócteles & Mocktails',
    category: 'bebidas',
    url: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=1000&q=80',
  },
  {
    id: 'beb-jugo',
    name: 'Jugos Naturales & Smoothies',
    category: 'bebidas',
    url: 'https://images.unsplash.com/photo-1505252585461-04db1eb84625?auto=format&fit=crop&w=1000&q=80',
  },
  {
    id: 'beb-cerveza',
    name: 'Cerveza Fría Artesanal',
    category: 'bebidas',
    url: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?auto=format&fit=crop&w=1000&q=80',
  },
  {
    id: 'beb-vino',
    name: 'Vino Tinto & Blanco',
    category: 'bebidas',
    url: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=1000&q=80',
  },
];

/**
 * Returns a high-resolution, appetizing image for any dish based on its existing URL,
 * or by analyzing dish title, keywords and category.
 */
export function getProductImage(existingImage?: string | null, name: string = '', category: string = ''): string {
  if (existingImage && typeof existingImage === 'string' && existingImage.trim().length > 10) {
    return existingImage.trim();
  }

  const text = `${name} ${category}`.toLowerCase();

  // Keyword-based matching
  if (text.includes('hamburguesa') || text.includes('burger')) {
    return 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1000&q=80';
  }
  if (text.includes('bife') || text.includes('carne') || text.includes('res') || text.includes('asado') || text.includes('steak') || text.includes('angus') || text.includes('wagyu') || text.includes('costilla')) {
    return 'https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&w=1000&q=80';
  }
  if (text.includes('carpaccio')) {
    return 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1000&q=80';
  }
  if (text.includes('burrata') || text.includes('mozzarella') || text.includes('queso frito')) {
    return 'https://images.unsplash.com/photo-1592417817098-8f3d6910985c?auto=format&fit=crop&w=1000&q=80';
  }
  if (text.includes('pulpo') || text.includes('calamar') || text.includes('marisco')) {
    return 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&w=1000&q=80';
  }
  if (text.includes('salmon') || text.includes('salmón') || text.includes('tiradito') || text.includes('ceviche') || text.includes('sashimi')) {
    return 'https://images.unsplash.com/photo-1535400255456-984241443b29?auto=format&fit=crop&w=1000&q=80';
  }
  if (text.includes('lubina') || text.includes('pescado') || text.includes('corvina') || text.includes('filete')) {
    return 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=1000&q=80';
  }
  if (text.includes('tartar') || text.includes('atun') || text.includes('atún')) {
    return 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=1000&q=80';
  }
  if (text.includes('croqueta') || text.includes('tapa') || text.includes('jamon') || text.includes('jamón')) {
    return 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=1000&q=80';
  }
  if (text.includes('risotto') || text.includes('arroz') || text.includes('paella')) {
    return 'https://images.unsplash.com/photo-1633964913295-ceb43826e7c9?auto=format&fit=crop&w=1000&q=80';
  }
  if (text.includes('pasta') || text.includes('pappardelle') || text.includes('spaghetti') || text.includes('espagueti') || text.includes('ravioli') || text.includes('fettuccine')) {
    return 'https://images.unsplash.com/photo-1621996346565-e3d5d6281643?auto=format&fit=crop&w=1000&q=80';
  }
  if (text.includes('pizza')) {
    return 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1000&q=80';
  }
  if (text.includes('papa') || text.includes('patata') || text.includes('fritas')) {
    return 'https://images.unsplash.com/photo-1576107232684-1279f3908594?auto=format&fit=crop&w=1000&q=80';
  }
  if (text.includes('ensalada') || text.includes('salad')) {
    return 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1000&q=80';
  }

  // Postres & Heladería
  if (text.includes('helado') || text.includes('gelato') || text.includes('nieve') || text.includes('paleta')) {
    return 'https://images.unsplash.com/photo-1501443762994-82bd5dace89a?auto=format&fit=crop&w=1000&q=80';
  }
  if (text.includes('cheesecake') || text.includes('tarta de queso') || text.includes('tarta') || text.includes('pastel') || text.includes('cake')) {
    return 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=1000&q=80';
  }
  if (text.includes('coulant') || text.includes('chocolate') || text.includes('brownie') || text.includes('volcan') || text.includes('volcán')) {
    return 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=1000&q=80';
  }
  if (text.includes('tiramisu') || text.includes('tiramisú')) {
    return 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=1000&q=80';
  }
  if (text.includes('churro')) {
    return 'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?auto=format&fit=crop&w=1000&q=80';
  }
  if (text.includes('waffle') || text.includes('gofre')) {
    return 'https://images.unsplash.com/photo-1562376552-0d160a2f238d?auto=format&fit=crop&w=1000&q=80';
  }
  if (text.includes('crepa') || text.includes('crepe')) {
    return 'https://images.unsplash.com/photo-1519676867240-f03562e64548?auto=format&fit=crop&w=1000&q=80';
  }
  if (text.includes('milhoja') || text.includes('frambuesa') || text.includes('fresa') || text.includes('hojaldre')) {
    return 'https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&w=1000&q=80';
  }
  if (text.includes('pavlova') || text.includes('merengue') || text.includes('maracuya') || text.includes('mango')) {
    return 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1000&q=80';
  }

  // Bebidas
  if (text.includes('cafe') || text.includes('café') || text.includes('espresso') || text.includes('capuchino') || text.includes('latte')) {
    return 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=1000&q=80';
  }
  if (text.includes('cerveza') || text.includes('beer')) {
    return 'https://images.unsplash.com/photo-1608270586620-248524c67de9?auto=format&fit=crop&w=1000&q=80';
  }
  if (text.includes('vino') || text.includes('wine')) {
    return 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=1000&q=80';
  }
  if (text.includes('jugo') || text.includes('smoothie') || text.includes('limonada') || text.includes('batido')) {
    return 'https://images.unsplash.com/photo-1505252585461-04db1eb84625?auto=format&fit=crop&w=1000&q=80';
  }
  if (text.includes('coctel') || text.includes('cóctel') || text.includes('trago') || text.includes('bebida') || text.includes('mojito') || text.includes('gin')) {
    return 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=1000&q=80';
  }

  // Category fallbacks
  const normCat = category.toLowerCase().trim();
  if (normCat.includes('entrada') || normCat.includes('starter') || normCat.includes('tapa')) {
    return 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1000&q=80';
  }
  if (normCat.includes('postre') || normCat.includes('dulce') || normCat.includes('dessert') || normCat.includes('reposteria') || normCat.includes('helad')) {
    return 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=1000&q=80';
  }
  if (normCat.includes('bebida') || normCat.includes('drink') || normCat.includes('bar')) {
    return 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=1000&q=80';
  }

  // Default main dish
  return 'https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&w=1000&q=80';
}

/**
 * Returns a high-res category preview photo for category pills and headers
 */
export function getCategoryPhoto(categoryId: string): string {
  const cat = categoryId.toLowerCase();
  if (cat === 'todas') {
    return 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=400&q=80';
  }
  if (cat === 'entradas') {
    return 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=400&q=80';
  }
  if (cat === 'platos_fuertes' || cat === 'platos' || cat === 'principales') {
    return 'https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&w=400&q=80';
  }
  if (cat === 'postres' || cat === 'dulces') {
    return 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=400&q=80';
  }
  if (cat === 'bebidas' || cat === 'cafes' || cat === 'cocteles') {
    return 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=400&q=80';
  }
  return 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80';
}
