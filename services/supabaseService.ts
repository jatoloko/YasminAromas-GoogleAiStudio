import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { InventoryItem, SaleItem, Order, Product } from '../types';

// Lazy initialization do cliente Supabase para evitar problemas de ordem
let supabase: SupabaseClient | null = null;
let supabaseInitialized = false;

// Função para inicializar o cliente Supabase de forma lazy
const initializeSupabase = (): SupabaseClient | null => {
  if (supabaseInitialized) {
    return supabase;
  }

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

  // Debug
  if (typeof window !== 'undefined') {
    console.log('🔍 Supabase Service - Debug:', {
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseAnonKey,
      urlLength: supabaseUrl.length,
      keyLength: supabaseAnonKey.length,
    });
  }

  if (supabaseUrl && supabaseAnonKey) {
    try {
      supabase = createClient(supabaseUrl, supabaseAnonKey);
      supabaseInitialized = true;
      console.log('✅ Cliente Supabase inicializado com sucesso');
    } catch (error) {
      console.error('❌ Erro ao inicializar cliente Supabase:', error);
      supabaseInitialized = true; // Marcar como inicializado mesmo em erro para não tentar novamente
    }
  } else {
    console.warn('⚠️ Supabase não configurado - usando apenas localStorage');
    supabaseInitialized = true;
  }

  return supabase;
};

// Verificar se Supabase está disponível
const isSupabaseAvailable = (): boolean => {
  const client = initializeSupabase();
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
  return client !== null && !!supabaseUrl && !!supabaseAnonKey;
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
  async getInventory(userId: string): Promise<InventoryItem[]> {
    if (!isSupabaseAvailable() || !userId) return [];
    
    const client = initializeSupabase();
    if (!client) return [];
    
    try {
      const { data, error } = await client
        .from('inventory')
        .select('*')
        .eq('user_id', userId)
        .order('name');
      
      if (error) throw error;
      return (data || []).map(convertInventoryFromDB);
    } catch (error) {
      console.error('Error fetching inventory from Supabase:', error);
      return [];
    }
  },

  async saveInventory(items: InventoryItem[], userId: string): Promise<boolean> {
    if (!isSupabaseAvailable() || !userId) return false;
    
    const client = initializeSupabase();
    if (!client) return false;
    
    try {
      // Deletar todos os itens existentes do usuário e inserir os novos
      for (const item of items) {
        const dbItem = convertInventoryToDB(item);
        dbItem.user_id = userId;
        const { error } = await client
        .from('inventory')
        .upsert(dbItem, { onConflict: 'id' });
        
        if (error) throw error;
      }
      
      // Remover itens que não estão mais na lista
      const currentIds = items.map(i => i.id);
      const { data: existing } = await client
        .from('inventory')
        .select('id')
        .eq('user_id', userId);
      
      if (existing) {
        const toDelete = existing
          .map(r => r.id)
          .filter(id => !currentIds.includes(id));
        
        if (toDelete.length > 0) {
          await client
            .from('inventory')
            .delete()
            .in('id', toDelete)
            .eq('user_id', userId);
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error saving inventory to Supabase:', error);
      return false;
    }
  },

  // Sales
  async getSales(userId: string): Promise<SaleItem[]> {
    if (!isSupabaseAvailable() || !userId) return [];
    
    try {
      const client = initializeSupabase();
      if (!client) return [];
      const { data, error } = await client
        .from('sales')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });
      
      if (error) throw error;
      return (data || []).map(convertSaleFromDB);
    } catch (error) {
      console.error('Error fetching sales from Supabase:', error);
      return [];
    }
  },

  async saveSales(items: SaleItem[], userId: string): Promise<boolean> {
    if (!isSupabaseAvailable() || !userId) return false;
    
    const client = initializeSupabase();
    if (!client) return false;
    
    try {
      for (const item of items) {
        const dbItem = convertSaleToDB(item);
        dbItem.user_id = userId;
        const { error } = await client
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
  async getOrders(userId: string): Promise<Order[]> {
    if (!isSupabaseAvailable() || !userId) return [];
    
    try {
      const client = initializeSupabase();
      if (!client) return [];
      const { data, error } = await client
        .from('orders')
        .select('*')
        .eq('user_id', userId)
        .order('deadline', { ascending: true });
      
      if (error) throw error;
      return (data || []).map(convertOrderFromDB);
    } catch (error) {
      console.error('Error fetching orders from Supabase:', error);
      return [];
    }
  },

  async saveOrders(items: Order[], userId: string): Promise<boolean> {
    if (!isSupabaseAvailable() || !userId) return false;
    
    const client = initializeSupabase();
    if (!client) return false;
    
    try {
      for (const item of items) {
        const dbItem = convertOrderToDB(item);
        dbItem.user_id = userId;
        const { error } = await client
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
  async getProducts(userId: string): Promise<Product[]> {
    if (!isSupabaseAvailable() || !userId) return [];
    
    try {
      const client = initializeSupabase();
      if (!client) return [];
      const { data, error } = await client
        .from('products')
        .select('*')
        .eq('user_id', userId)
        .order('name');
      
      if (error) throw error;
      return (data || []).map(convertProductFromDB);
    } catch (error) {
      console.error('Error fetching products from Supabase:', error);
      return [];
    }
  },

  async saveProducts(items: Product[], userId: string): Promise<boolean> {
    if (!isSupabaseAvailable() || !userId) return false;
    
    const client = initializeSupabase();
    if (!client) return false;
    
    try {
      for (const item of items) {
        const dbItem = convertProductToDB(item);
        dbItem.user_id = userId;
        const { error } = await client
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

