import { InventoryItem, SaleItem, Order, Product } from '../types';
import { SupabaseService } from './supabaseService';

export const StorageService = {
  // Inventory
  async getInventory(userId: string): Promise<InventoryItem[]> {
    if (!userId) return [];
    
    if (!SupabaseService.isAvailable()) {
      console.warn('Supabase não disponível');
      return [];
    }

    return await SupabaseService.getInventory(userId);
  },

  async saveInventory(items: InventoryItem[], userId: string): Promise<void> {
    if (!userId) {
      console.error('UserId é obrigatório para salvar inventory');
      return;
    }

    if (!SupabaseService.isAvailable()) {
      console.error('Supabase não disponível - não é possível salvar');
      return;
    }

    await SupabaseService.saveInventory(items, userId).catch(error => {
      console.error('Failed to save inventory to Supabase:', error);
      throw error;
    });
  },

  // Sales
  async getSales(userId: string): Promise<SaleItem[]> {
    if (!userId) return [];
    
    if (!SupabaseService.isAvailable()) {
      console.warn('Supabase não disponível');
      return [];
    }

    return await SupabaseService.getSales(userId);
  },

  async saveSales(items: SaleItem[], userId: string): Promise<void> {
    if (!userId) {
      console.error('UserId é obrigatório para salvar sales');
      return;
    }

    if (!SupabaseService.isAvailable()) {
      console.error('Supabase não disponível - não é possível salvar');
      return;
    }

    await SupabaseService.saveSales(items, userId).catch(error => {
      console.error('Failed to save sales to Supabase:', error);
      throw error;
    });
  },

  // Orders
  async getOrders(userId: string): Promise<Order[]> {
    if (!userId) return [];
    
    if (!SupabaseService.isAvailable()) {
      console.warn('Supabase não disponível');
      return [];
    }

    return await SupabaseService.getOrders(userId);
  },

  async saveOrders(items: Order[], userId: string): Promise<void> {
    if (!userId) {
      console.error('UserId é obrigatório para salvar orders');
      return;
    }

    if (!SupabaseService.isAvailable()) {
      console.error('Supabase não disponível - não é possível salvar');
      return;
    }

    await SupabaseService.saveOrders(items, userId).catch(error => {
      console.error('Failed to save orders to Supabase:', error);
      throw error;
    });
  },

  // Products
  async getProducts(userId: string): Promise<Product[]> {
    if (!userId) return [];
    
    if (!SupabaseService.isAvailable()) {
      console.warn('Supabase não disponível');
      return [];
    }

    return await SupabaseService.getProducts(userId);
  },

  async saveProducts(items: Product[], userId: string): Promise<void> {
    if (!userId) {
      console.error('UserId é obrigatório para salvar products');
      return;
    }

    if (!SupabaseService.isAvailable()) {
      console.error('Supabase não disponível - não é possível salvar');
      return;
    }

    await SupabaseService.saveProducts(items, userId).catch(error => {
      console.error('Failed to save products to Supabase:', error);
      throw error;
    });
  },
};
