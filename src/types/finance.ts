export interface SaleItem {
  productId: string;
  nombre: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  categoria?: string;
}

export type MetodoPago = 'efectivo' | 'tarjeta' | 'transferencia' | 'otro';

export interface Sale {
  id: string;
  items: SaleItem[];
  total: number;
  metodoPago: MetodoPago;
  clienteNombre?: string;
  mesa?: string;
  notas?: string;
  fecha: string; // ISO String (YYYY-MM-DD or full ISO)
  creadoEn?: any; // Firestore Timestamp
  creadoPor?: string; // Admin UID or email
}

export type GastoCategoria = 
  | 'Ingredientes'
  | 'Empaques'
  | 'Servicios'
  | 'Transporte'
  | 'Publicidad'
  | 'Personal'
  | 'Otros';

export interface Gasto {
  id: string;
  descripcion: string;
  categoria: GastoCategoria | string;
  monto: number;
  fecha: string; // YYYY-MM-DD
  nota?: string;
  comprobanteUrl?: string;
  creadoEn?: any; // Firestore Timestamp
  creadoPor?: string;
}

export interface FinancialSummary {
  ventasHoy: number;
  ventasSemana: number;
  ventasMes: number;
  gastosMes: number;
  gananciaMes: number;
  cantidadVentasTotal: number;
  cantidadVentasMes: number;
  totalVentasHistorico: number;
  totalGastosHistorico: number;
  gananciaTotalHistorica: number;
}
