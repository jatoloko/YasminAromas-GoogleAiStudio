import { InventoryItem, SaleItem, Order, Product } from '../types';
import { SupabaseService } from './supabaseService';

const KEYS = {
  INVENTORY: 'yasmin_inventory',
  SALES: 'yasmin_sales',
  ORDERS: 'yasmin_orders',
  PRODUCTS: 'yasmin_products',
  MIGRATED: 'yasmin_migrated_to_supabase',
};

// Generic helper to get data from localStorage
const getData = <T,>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading ${key} from localStorage`, error);
    return defaultValue;
  }
};

// Generic helper to set data to localStorage
const setData = <T,>(key: string, data: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving ${key} to localStorage`, error);
  }
};

// Migrar dados do localStorage para Supabase (executar uma vez)
const migrateToSupabase = async (): Promise<void> => {
  const alreadyMigrated = getData(KEYS.MIGRATED, false);
  if (alreadyMigrated || !SupabaseService.isAvailable()) return;

  try {
    const inventory = getData<InventoryItem[]>(KEYS.INVENTORY, []);
    const sales = getData<SaleItem[]>(KEYS.SALES, []);
    const orders = getData<Order[]>(KEYS.ORDERS, []);
    const products = getData<Product[]>(KEYS.PRODUCTS, []);

    if (inventory.length > 0) await SupabaseService.saveInventory(inventory);
    if (sales.length > 0) await SupabaseService.saveSales(sales);
    if (orders.length > 0) await SupabaseService.saveOrders(orders);
    if (products.length > 0) await SupabaseService.saveProducts(products);

    setData(KEYS.MIGRATED, true);
    console.log('Migration to Supabase completed');
  } catch (error) {
    console.error('Error migrating to Supabase:', error);
  }
};

// Executar migração na primeira carga
let migrationPromise: Promise<void> | null = null;
const ensureMigration = (): Promise<void> => {
  if (!migrationPromise) {
    migrationPromise = migrateToSupabase();
  }
  return migrationPromise;
};

export const StorageService = {
  // Inventory
  async getInventory(): Promise<InventoryItem[]> {
    await ensureMigration();
    
    if (SupabaseService.isAvailable()) {
      const supabaseData = await SupabaseService.getInventory();
      if (supabaseData.length > 0) {
        // Sincronizar com localStorage como backup
        setData(KEYS.INVENTORY, supabaseData);
        return supabaseData;
      }
    }
    
    // Fallback para localStorage
    return getData<InventoryItem[]>(KEYS.INVENTORY, []);
  },

  async saveInventory(items: InventoryItem[]): Promise<void> {
    // Salvar no localStorage primeiro (rápido)
    setData(KEYS.INVENTORY, items);
    
    // Tentar salvar no Supabase (assíncrono)
    if (SupabaseService.isAvailable()) {
      await SupabaseService.saveInventory(items).catch(error => {
        console.error('Failed to save inventory to Supabase, using localStorage only:', error);
      });
    }
  },

  // Sales
  async getSales(): Promise<SaleItem[]> {
    await ensureMigration();
    
    if (SupabaseService.isAvailable()) {
      const supabaseData = await SupabaseService.getSales();
      if (supabaseData.length > 0) {
        setData(KEYS.SALES, supabaseData);
        return supabaseData;
      }
    }
    
    return getData<SaleItem[]>(KEYS.SALES, []);
  },

  async saveSales(items: SaleItem[]): Promise<void> {
    setData(KEYS.SALES, items);
    
    if (SupabaseService.isAvailable()) {
      await SupabaseService.saveSales(items).catch(error => {
        console.error('Failed to save sales to Supabase, using localStorage only:', error);
      });
    }
  },

  // Orders
  async getOrders(): Promise<Order[]> {
    await ensureMigration();
    
    if (SupabaseService.isAvailable()) {
      const supabaseData = await SupabaseService.getOrders();
      if (supabaseData.length > 0) {
        setData(KEYS.ORDERS, supabaseData);
        return supabaseData;
      }
    }
    
    return getData<Order[]>(KEYS.ORDERS, []);
  },

  async saveOrders(items: Order[]): Promise<void> {
    setData(KEYS.ORDERS, items);
    
    if (SupabaseService.isAvailable()) {
      await SupabaseService.saveOrders(items).catch(error => {
        console.error('Failed to save orders to Supabase, using localStorage only:', error);
      });
    }
  },

  // Products
  async getProducts(): Promise<Product[]> {
    await ensureMigration();
    
    if (SupabaseService.isAvailable()) {
      const supabaseData = await SupabaseService.getProducts();
      if (supabaseData.length > 0) {
        setData(KEYS.PRODUCTS, supabaseData);
        return supabaseData;
      }
    }
    
    return getData<Product[]>(KEYS.PRODUCTS, []);
  },

  async saveProducts(items: Product[]): Promise<void> {
    setData(KEYS.PRODUCTS, items);
    
    if (SupabaseService.isAvailable()) {
      await SupabaseService.saveProducts(items).catch(error => {
        console.error('Failed to save products to Supabase, using localStorage only:', error);
      });
    }
  },

  // Métodos síncronos para compatibilidade (usar localStorage apenas)
  getInventorySync: (): InventoryItem[] => getData(KEYS.INVENTORY, []),
  getSalesSync: (): SaleItem[] => getData(KEYS.SALES, []),
  getOrdersSync: (): Order[] => getData(KEYS.ORDERS, []),
  getProductsSync: (): Product[] => getData(KEYS.PRODUCTS, []),
};