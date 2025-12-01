import React, { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, AlertTriangle, Package, X, Edit2, Search, Filter, Loader, Info } from 'lucide-react';
import { InventoryItem, UnitType } from '../types';
import { StorageService, isSupabaseUnavailableError } from '../services/storageService';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import { validateInventory } from '../utils/validation';
import { ListSkeleton } from './Skeleton';
import ConfirmDialog from './ConfirmDialog';

const InventoryTab: React.FC = () => {
  const toast = useToast();
  const { user } = useAuth();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [newItem, setNewItem] = useState<Partial<InventoryItem>>({
    name: '',
    category: 'Cera',
    quantity: 0,
    unit: UnitType.KILOGRAMS,
    minThreshold: 1,
  });
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [supabaseUnavailable, setSupabaseUnavailable] = useState(false);
  const [supabaseMessage, setSupabaseMessage] = useState<string | null>(null);
  const supabaseWarningShown = useRef(false);
  const [itemToDelete, setItemToDelete] = useState<InventoryItem | null>(null);

  useEffect(() => {
    if (!user?.id) return;
    
    const loadData = async () => {
      try {
        setIsLoading(true);
        const data = await StorageService.getInventory(user.id);
        setItems(data);
        setSupabaseUnavailable(false);
        setSupabaseMessage(null);
        supabaseWarningShown.current = false;
      } catch (error) {
        console.error('Erro ao carregar inventário:', error);
        if (isSupabaseUnavailableError(error)) {
          setItems([]);
          setSupabaseUnavailable(true);
          const message = 'Supabase não está configurado ou está indisponível. Seus dados não serão sincronizados.';
          setSupabaseMessage(message);
          if (!supabaseWarningShown.current) {
            toast.showWarning(message);
            supabaseWarningShown.current = true;
          }
        } else {
          toast.showError('Erro ao carregar itens de estoque.');
        }
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [user?.id]);

  const handleAddItem = async () => {
    const errors: Record<string, string> = {};

    const nameValidation = validateInventory.name(newItem.name || '');
    if (!nameValidation.isValid) {
      errors.name = nameValidation.error || '';
    }

    const quantityValidation = validateInventory.quantity(newItem.quantity ?? '');
    if (!quantityValidation.isValid) {
      errors.quantity = quantityValidation.error || '';
    }

    const minValidation = validateInventory.minThreshold(newItem.minThreshold ?? '');
    if (!minValidation.isValid) {
      errors.minThreshold = minValidation.error || '';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      toast.showError('Por favor, corrija os erros antes de salvar.');
      return;
    }

    if (!user?.id) {
      toast.showError('Usuário não autenticado.');
      return;
    }

    try {
      setIsSaving(true);
      const normalizedName = newItem.name!.trim();
      const category = newItem.category || 'Geral';

      // Check if item exists
      const existingItemIndex = items.findIndex(
        i => i.name.toLowerCase() === normalizedName.toLowerCase() && i.category === category
      );

      let updatedItems: InventoryItem[];

      if (existingItemIndex >= 0) {
        // Update existing item
        updatedItems = [...items];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + Number(newItem.quantity)
        };
      } else {
        // Add new item
        const itemToAdd: InventoryItem = {
          id: generateUUID(),
          name: normalizedName,
          category: category,
          quantity: Number(newItem.quantity),
          unit: newItem.unit || UnitType.UNITS,
          minThreshold: Number(newItem.minThreshold) || 0,
        };
        updatedItems = [...items, itemToAdd];
      }

      setItems(updatedItems);
      const saved = await StorageService.saveInventory(updatedItems, user.id);
      if (saved) {
        toast.showSuccess(existingItemIndex >= 0 ? 'Item atualizado com sucesso!' : 'Item adicionado com sucesso!');
      } else {
        toast.showError('Não foi possível salvar no Supabase.');
      }
      
      // Reset form
      setNewItem({ name: '', category: 'Cera', quantity: 0, unit: UnitType.KILOGRAMS, minThreshold: 1 });
      setIsCustomCategory(false);
      setFormErrors({});
    } catch (error) {
      console.error('Erro ao salvar item:', error);
      toast.showError('Erro ao salvar item. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteItem = async () => {
    if (!itemToDelete) return;
    const updatedItems = items.filter(i => i.id !== itemToDelete.id);
    setItems(updatedItems);
    if (user?.id) {
      const saved = await StorageService.saveInventory(updatedItems, user.id);
      if (saved) {
        toast.showSuccess('Item excluído com sucesso!');
      } else {
        toast.showError('Não foi possível excluir o item no Supabase.');
      }
    }
    setItemToDelete(null);
  };

  const handleEditItem = (item: InventoryItem) => {
    setEditingItem(item);
    setNewItem({
      name: item.name,
      category: item.category,
      quantity: item.quantity,
      unit: item.unit,
      minThreshold: item.minThreshold,
    });
  };

  const handleUpdateItem = async () => {
    if (!editingItem) return;

    const errors: Record<string, string> = {};
    const nameValidation = validateInventory.name(newItem.name || '');
    if (!nameValidation.isValid) {
      errors.name = nameValidation.error || '';
    }
    const quantityValidation = validateInventory.quantity(newItem.quantity ?? '');
    if (!quantityValidation.isValid) {
      errors.quantity = quantityValidation.error || '';
    }
    const minValidation = validateInventory.minThreshold(newItem.minThreshold ?? '');
    if (!minValidation.isValid) {
      errors.minThreshold = minValidation.error || '';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      toast.showError('Por favor, corrija os erros antes de salvar.');
      return;
    }

    if (!user?.id) {
      toast.showError('Usuário não autenticado.');
      return;
    }

    try {
      setIsSaving(true);
      const updatedItems = items.map(item =>
        item.id === editingItem.id
          ? {
              ...item,
              name: newItem.name!,
              category: newItem.category || 'Geral',
              quantity: Number(newItem.quantity),
              unit: newItem.unit || UnitType.UNITS,
              minThreshold: Number(newItem.minThreshold) || 0,
            }
          : item
      );

      setItems(updatedItems);
      const saved = await StorageService.saveInventory(updatedItems, user.id);
      if (saved) {
        toast.showSuccess('Item atualizado com sucesso!');
      } else {
        toast.showError('Não foi possível atualizar o item no Supabase.');
      }
      setEditingItem(null);
      setNewItem({ name: '', category: 'Cera', quantity: 0, unit: UnitType.KILOGRAMS, minThreshold: 1 });
      setIsCustomCategory(false);
      setFormErrors({});
    } catch (error) {
      console.error('Erro ao atualizar item:', error);
      toast.showError('Erro ao atualizar item.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingItem(null);
    setNewItem({ name: '', category: 'Cera', quantity: 0, unit: UnitType.KILOGRAMS, minThreshold: 1 });
    setIsCustomCategory(false);
    setFormErrors({});
  };

  const getLowStockItems = () => items.filter(i => i.quantity <= i.minThreshold);

  // Dynamic list of categories based on defaults and existing items
  const defaultCategories = ['Cera', 'Essência', 'Pavio', 'Recipiente', 'Embalagem', 'Outros'];
  const availableCategories = Array.from(new Set([...defaultCategories, ...items.map(i => i.category)]));

  // Filter items based on search and category
  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {supabaseUnavailable && supabaseMessage && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg flex items-start gap-3">
          <Info className="w-5 h-5 mt-0.5" />
          <div>
            <p className="font-semibold">Modo offline</p>
            <p className="text-sm">{supabaseMessage} Consulte o arquivo SUPABASE_SETUP.md para configurar.</p>
          </div>
        </div>
      )}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-brand-100">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Package className="text-brand-500" />
          {editingItem ? 'Editar Item' : 'Adicionar Novo Item'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome do Item <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Nome do Item (ex: Cera de Coco)"
              className={`bg-white text-gray-900 border p-2 rounded-lg focus:ring-2 focus:ring-brand-400 outline-none w-full ${formErrors.name ? 'border-red-500' : 'border-gray-300'}`}
              value={newItem.name}
              onChange={e => {
                setNewItem({ ...newItem, name: e.target.value });
                setFormErrors({ ...formErrors, name: '' });
              }}
            />
            {formErrors.name && <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>}
          </div>
          
          {/* Category Selection Logic */}
          {isCustomCategory ? (
            <div className="flex gap-1">
              <input
                type="text"
                placeholder="Nova Categoria"
                className="bg-white text-gray-900 border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-brand-400 outline-none w-full"
                value={newItem.category}
                onChange={e => setNewItem({ ...newItem, category: e.target.value })}
                autoFocus
              />
              <button
                onClick={() => {
                  setIsCustomCategory(false);
                  setNewItem({ ...newItem, category: 'Cera' });
                }}
                className="p-2 text-gray-400 hover:text-red-500 transition-colors border border-gray-200 rounded-lg hover:bg-gray-50"
                title="Cancelar"
              >
                <X size={18} />
              </button>
            </div>
          ) : (
            <select
              className="bg-white text-gray-900 border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-brand-400 outline-none"
              value={newItem.category}
              onChange={e => {
                if (e.target.value === '__NEW__') {
                  setIsCustomCategory(true);
                  setNewItem({ ...newItem, category: '' });
                } else {
                  setNewItem({ ...newItem, category: e.target.value });
                }
              }}
            >
              {availableCategories.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
              <option value="__NEW__" className="font-bold text-brand-600 bg-brand-50">+ Nova Categoria...</option>
            </select>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quantidade <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Qtd"
                className={`bg-white text-gray-900 border p-2 rounded-lg w-full focus:ring-2 focus:ring-brand-400 outline-none ${formErrors.quantity ? 'border-red-500' : 'border-gray-300'}`}
                value={newItem.quantity}
                onChange={e => {
                  setNewItem({ ...newItem, quantity: parseFloat(e.target.value) });
                  setFormErrors({ ...formErrors, quantity: '' });
                }}
              />
              <select
                className="bg-white text-gray-900 border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-brand-400 outline-none"
                value={newItem.unit}
                onChange={e => setNewItem({ ...newItem, unit: e.target.value as UnitType })}
              >
                {Object.values(UnitType).map(u => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>
            {formErrors.quantity && <p className="text-red-500 text-xs mt-1">{formErrors.quantity}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estoque mínimo (alerta)
            </label>
            <input
              type="number"
              placeholder="Ex: 2"
              className={`bg-white text-gray-900 border p-2 rounded-lg w-full focus:ring-2 focus:ring-brand-400 outline-none ${formErrors.minThreshold ? 'border-red-500' : 'border-gray-300'}`}
              value={newItem.minThreshold}
              onChange={e => {
                setNewItem({ ...newItem, minThreshold: parseFloat(e.target.value) });
                setFormErrors({ ...formErrors, minThreshold: '' });
              }}
            />
            {formErrors.minThreshold && <p className="text-red-500 text-xs mt-1">{formErrors.minThreshold}</p>}
          </div>
          {editingItem ? (
            <>
              <button
                onClick={handleUpdateItem}
                disabled={isSaving}
                className="bg-green-500 text-white p-2 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-2 font-medium disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSaving ? <Loader size={18} className="animate-spin" /> : <Edit2 size={18} />}
                {isSaving ? 'Salvando...' : 'Salvar'}
              </button>
              <button
                onClick={handleCancelEdit}
                className="bg-gray-500 text-white p-2 rounded-lg hover:bg-gray-600 transition-colors flex items-center justify-center gap-2 font-medium"
              >
                <X size={18} /> Cancelar
              </button>
            </>
          ) : (
            <button
              onClick={handleAddItem}
              disabled={isSaving}
              className="bg-brand-500 text-white p-2 rounded-lg hover:bg-brand-600 transition-colors flex items-center justify-center gap-2 font-medium disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <>
                  <Loader size={18} className="animate-spin" /> Salvando...
                </>
              ) : (
                <>
                  <Plus size={18} /> Adicionar
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {getLowStockItems().length > 0 && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />
            <p className="text-sm text-yellow-700 font-medium">
              Atenção: Existem itens com estoque baixo!
            </p>
          </div>
        </div>
      )}

      {/* Search and Filter */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-brand-100">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Buscar por nome ou categoria..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-400 outline-none"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <select
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-400 outline-none"
              value={filterCategory}
              onChange={e => setFilterCategory(e.target.value)}
            >
              <option value="all">Todas as categorias</option>
              {availableCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-brand-100 overflow-hidden">
        {isLoading ? (
          <div className="p-6">
            <ListSkeleton items={5} />
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-brand-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoria</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantidade</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredItems.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                  {items.length === 0 
                    ? 'Nenhum item no estoque. Adicione o primeiro acima!'
                    : 'Nenhum item encontrado com os filtros aplicados.'}
                </td>
              </tr>
            ) : (
              filteredItems.map(item => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{item.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                      {item.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                    {item.quantity} <span className="text-gray-400 text-sm">{item.unit}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {item.quantity <= item.minThreshold ? (
                      <span className="text-red-500 font-bold text-xs flex items-center gap-1">
                        <AlertTriangle size={12} /> Baixo
                      </span>
                    ) : (
                      <span className="text-green-500 font-bold text-xs">OK</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEditItem(item)}
                        className="text-blue-400 hover:text-blue-600 transition-colors"
                        title="Editar"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => setItemToDelete(item)}
                        className="text-red-400 hover:text-red-600 transition-colors"
                        title="Excluir"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
          </table>
        )}
      </div>
      <ConfirmDialog
        open={!!itemToDelete}
        title="Excluir item"
        description={`Tem certeza que deseja excluir "${itemToDelete?.name}" do estoque? Esta ação não pode ser desfeita.`}
        confirmLabel="Excluir"
        onConfirm={handleDeleteItem}
        onCancel={() => setItemToDelete(null)}
      />
    </div>
  );
};

export default InventoryTab;