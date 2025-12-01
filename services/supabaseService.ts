import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { InventoryItem, SaleItem, Order, Product } from '../types';

// Inicializar cliente Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

let supabase: SupabaseClient | null = null;

if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
}

// Verificar se Supabase está disponível
const isSupabaseAvailable = (): boolean => {
  return supabase !== null && !!supabaseUrl && !!supabaseAnonKey;
};

// Converter tipos do app para tipos do Supabase
const convertInventoryFromDB = (row: any): InventoryItem => ({
  id: row.id,
  name: row.name,
  category: row.category,
  quantity: Number(row.quantity),
  unit: row.unit,
  minThreshold: Number(row.min_threshold),
});

const convertInventoryToDB = (item: InventoryItem): any => ({
  id: item.id,
  name: item.name,
  category: item.category,
  quantity: item.quantity,
  unit: item.unit,
  min_threshold: item.minThreshold,
});

const convertSaleFromDB = (row: any): SaleItem => ({
  id: row.id,
  date: row.date,
  customerName: row.customer_name,
  products: row.products,
  totalValue: Number(row.total_value),
});

const convertSaleToDB = (item: SaleItem): any => ({
  id: item.id,
  date: item.date,
  customer_name: item.customerName,
  products: item.products,
  total_value: item.totalValue,
});

const convertOrderFromDB = (row: any): Order => ({
  id: row.id,
  customerName: row.customer_name,
  description: row.description,
  deadline: row.deadline,
  status: row.status,
  estimatedValue: Number(row.estimated_value),
});

const convertOrderToDB = (item: Order): any => ({
  id: item.id,
  customer_name: item.customerName,
  description: item.description,
  deadline: item.deadline,
  status: item.status,
  estimated_value: item.estimatedValue,
});

const convertProductFromDB = (row: any): Product => ({
  id: row.id,
  name: row.name,
  price: Number(row.price),
  recipe: row.recipe || [],
});

const convertProductToDB = (item: Product): any => ({
  id: item.id,
  name: item.name,
  price: item.price,
  recipe: item.recipe || [],
});

export const SupabaseService = {
  // Inventory
  async getInventory(): Promise<InventoryItem[]> {
    if (!isSupabaseAvailable()) return [];
    
    try {
      const { data, error } = await supabase!
        .from('inventory')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return (data || []).map(convertInventoryFromDB);
    } catch (error) {
      console.error('Error fetching inventory from Supabase:', error);
      return [];
    }
  },

  async saveInventory(items: InventoryItem[]): Promise<boolean> {
    if (!isSupabaseAvailable()) return false;
    
    try {
      // Deletar todos os itens existentes e inserir os novos
      // (Para simplificar, podemos fazer upsert por item)
      for (const item of items) {
        const dbItem = convertInventoryToDB(item);
        const { error } = await supabase!
          .from('inventory')
          .upsert(dbItem, { onConflict: 'id' });
        
        if (error) throw error;
      }
      
      // Remover itens que não estão mais na lista
      const currentIds = items.map(i => i.id);
      const { data: existing } = await supabase!
        .from('inventory')
        .select('id');
      
      if (existing) {
        const toDelete = existing
          .map(r => r.id)
          .filter(id => !currentIds.includes(id));
        
        if (toDelete.length > 0) {
          await supabase!
            .from('inventory')
            .delete()
            .in('id', toDelete);
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error saving inventory to Supabase:', error);
      return false;
    }
  },

  // Sales
  async getSales(): Promise<SaleItem[]> {
    if (!isSupabaseAvailable()) return [];
    
    try {
      const { data, error } = await supabase!
        .from('sales')
        .select('*')
        .order('date', { ascending: false });
      
      if (error) throw error;
      return (data || []).map(convertSaleFromDB);
    } catch (error) {
      console.error('Error fetching sales from Supabase:', error);
      return [];
    }
  },

  async saveSales(items: SaleItem[]): Promise<boolean> {
    if (!isSupabaseAvailable()) return false;
    
    try {
      for (const item of items) {
        const dbItem = convertSaleToDB(item);
        const { error } = await supabase!
          .from('sales')
          .upsert(dbItem, { onConflict: 'id' });
        
        if (error) throw error;
      }
      
      return true;
    } catch (error) {
      console.error('Error saving sales to Supabase:', error);
      return false;
    }
  },

  // Orders
  async getOrders(): Promise<Order[]> {
    if (!isSupabaseAvailable()) return [];
    
    try {
      const { data, error } = await supabase!
        .from('orders')
        .select('*')
        .order('deadline', { ascending: true });
      
      if (error) throw error;
      return (data || []).map(convertOrderFromDB);
    } catch (error) {
      console.error('Error fetching orders from Supabase:', error);
      return [];
    }
  },

  async saveOrders(items: Order[]): Promise<boolean> {
    if (!isSupabaseAvailable()) return false;
    
    try {
      for (const item of items) {
        const dbItem = convertOrderToDB(item);
        const { error } = await supabase!
          .from('orders')
          .upsert(dbItem, { onConflict: 'id' });
        
        if (error) throw error;
      }
      
      return true;
    } catch (error) {
      console.error('Error saving orders to Supabase:', error);
      return false;
    }
  },

  // Products
  async getProducts(): Promise<Product[]> {
    if (!isSupabaseAvailable()) return [];
    
    try {
      const { data, error } = await supabase!
        .from('products')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return (data || []).map(convertProductFromDB);
    } catch (error) {
      console.error('Error fetching products from Supabase:', error);
      return [];
    }
  },

  async saveProducts(items: Product[]): Promise<boolean> {
    if (!isSupabaseAvailable()) return false;
    
    try {
      for (const item of items) {
        const dbItem = convertProductToDB(item);
        const { error } = await supabase!
          .from('products')
          .upsert(dbItem, { onConflict: 'id' });
        
        if (error) throw error;
      }
      
      return true;
    } catch (error) {
      console.error('Error saving products to Supabase:', error);
      return false;
    }
  },

  // Verificar disponibilidade
  isAvailable: isSupabaseAvailable,
};

