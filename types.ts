export enum UnitType {
  GRAMS = 'g',
  KILOGRAMS = 'kg',
  MILLILITERS = 'ml',
  LITERS = 'l',
  UNITS = 'un',
}

export enum ProductCategory {
  CANDLE = 'Vela',
  AROMA_DIFFUSER = 'Difusor',
  HOME_SPRAY = 'Home Spray',
  WAX_MELT = 'Wax Melt',
}

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: UnitType;
  minThreshold: number;
}

export interface SaleItem {
  id: string;
  date: string; // ISO string
  customerName: string;
  products: string; // Simplified for MVP (comma separated or description)
  totalValue: number;
}

export enum OrderStatus {
  PENDING = 'Pendente',
  IN_PROGRESS = 'Em Produção',
  COMPLETED = 'Concluído',
  DELIVERED = 'Entregue',
}

export interface Order {
  id: string;
  customerName: string;
  description: string;
  deadline: string; // ISO date string
  status: OrderStatus;
  estimatedValue: number;
}
