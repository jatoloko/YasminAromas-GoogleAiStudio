import { InventoryItem, SaleItem, Order, Product } from '../types';

const KEYS = {
  INVENTORY: 'yasmin_inventory',
  SALES: 'yasmin_sales',
  ORDERS: 'yasmin_orders',
  PRODUCTS: 'yasmin_products',
};

// Generic helper to get data
const getData = <T,>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading ${key} from localStorage`, error);
    return defaultValue;
  }
};

// Generic helper to set data
const setData = <T,>(key: string, data: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving ${key} to localStorage`, error);
  }
};

export const StorageService = {
  getInventory: (): InventoryItem[] => getData(KEYS.INVENTORY, []),
  saveInventory: (items: InventoryItem[]) => setData(KEYS.INVENTORY, items),

  getSales: (): SaleItem[] => getData(KEYS.SALES, []),
  saveSales: (items: SaleItem[]) => setData(KEYS.SALES, items),

  getOrders: (): Order[] => getData(KEYS.ORDERS, []),
  saveOrders: (items: Order[]) => setData(KEYS.ORDERS, items),

  getProducts: (): Product[] => getData(KEYS.PRODUCTS, []),
  saveProducts: (items: Product[]) => setData(KEYS.PRODUCTS, items),
};