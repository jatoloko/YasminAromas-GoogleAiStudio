import { InventoryItem, SaleItem, Order, Product } from '../types';
import { SupabaseService } from './supabaseService';

export const SUPABASE_UNAVAILABLE_ERROR = 'SUPABASE_UNAVAILABLE';

const createSupabaseUnavailableError = (): Error => {
  const error = new Error(SUPABASE_UNAVAILABLE_ERROR);
  (error as Error & { code?: string }).code = SUPABASE_UNAVAILABLE_ERROR;
  return error;
};

export const isSupabaseUnavailableError = (error: unknown): boolean => {
  if (error instanceof Error) {
    const errWithCode = error as Error & { code?: string };
    return error.message === SUPABASE_UNAVAILABLE_ERROR || errWithCode.code === SUPABASE_UNAVAILABLE_ERROR;
  }
  return false;
};

export const StorageService = {
  // Inventory
  async getInventory(userId: string): Promise<InventoryItem[]> {
    if (!userId) return [];
    
    if (!SupabaseService.isAvailable()) {
      throw createSupabaseUnavailableError();
    }

    try {
      return await SupabaseService.getInventory(userId);
    } catch (error) {
      console.error('Erro ao buscar inventário no Supabase:', error);
      throw error;
    }
  },

  async saveInventory(items: InventoryItem[], userId: string): Promise<boolean> {
    if (!userId) {
      console.error('UserId é obrigatório para salvar inventory');
      return false;
    }

    if (!SupabaseService.isAvailable()) {
      console.error('Supabase não disponível - não é possível salvar');
      return false;
    }

    try {
      await SupabaseService.saveInventory(items, userId);
      return true;
    } catch (error) {
      console.error('Failed to save inventory to Supabase:', error);
      return false;
    }
  },

  // Sales
  async getSales(userId: string): Promise<SaleItem[]> {
    if (!userId) return [];
    
    if (!SupabaseService.isAvailable()) {
      throw createSupabaseUnavailableError();
    }

    try {
      return await SupabaseService.getSales(userId);
    } catch (error) {
      console.error('Erro ao buscar vendas no Supabase:', error);
      throw error;
    }
  },

  async saveSales(items: SaleItem[], userId: string): Promise<boolean> {
    if (!userId) {
      console.error('UserId é obrigatório para salvar sales');
      return false;
    }

    if (!SupabaseService.isAvailable()) {
      console.error('Supabase não disponível - não é possível salvar');
      return false;
    }

    try {
      await SupabaseService.saveSales(items, userId);
      return true;
    } catch (error) {
      console.error('Failed to save sales to Supabase:', error);
      return false;
    }
  },

  // Orders
  async getOrders(userId: string): Promise<Order[]> {
    if (!userId) return [];
    
    if (!SupabaseService.isAvailable()) {
      throw createSupabaseUnavailableError();
    }

    try {
      return await SupabaseService.getOrders(userId);
    } catch (error) {
      console.error('Erro ao buscar encomendas no Supabase:', error);
      throw error;
    }
  },

  async saveOrders(items: Order[], userId: string): Promise<boolean> {
    if (!userId) {
      console.error('UserId é obrigatório para salvar orders');
      return false;
    }

    if (!SupabaseService.isAvailable()) {
      console.error('Supabase não disponível - não é possível salvar');
      return false;
    }

    try {
      await SupabaseService.saveOrders(items, userId);
      return true;
    } catch (error) {
      console.error('Failed to save orders to Supabase:', error);
      return false;
    }
  },

  // Products
  async getProducts(userId: string): Promise<Product[]> {
    if (!userId) return [];
    
    if (!SupabaseService.isAvailable()) {
      throw createSupabaseUnavailableError();
    }

    try {
      return await SupabaseService.getProducts(userId);
    } catch (error) {
      console.error('Erro ao buscar produtos no Supabase:', error);
      throw error;
    }
  },

  async saveProducts(items: Product[], userId: string): Promise<boolean> {
    if (!userId) {
      console.error('UserId é obrigatório para salvar products');
      return false;
    }

    if (!SupabaseService.isAvailable()) {
      console.error('Supabase não disponível - não é possível salvar');
      return false;
    }

    try {
      await SupabaseService.saveProducts(items, userId);
      return true;
    } catch (error) {
      console.error('Failed to save products to Supabase:', error);
      return false;
    }
  },
};
