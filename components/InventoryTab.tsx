import React, { useState, useEffect } from 'react';
import { Plus, Trash2, AlertTriangle, Package } from 'lucide-react';
import { InventoryItem, UnitType } from '../types';
import { StorageService } from '../services/storageService';

const InventoryTab: React.FC = () => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [newItem, setNewItem] = useState<Partial<InventoryItem>>({
    name: '',
    category: 'Cera',
    quantity: 0,
    unit: UnitType.KILOGRAMS,
    minThreshold: 1,
  });

  useEffect(() => {
    setItems(StorageService.getInventory());
  }, []);

  const handleAddItem = () => {
    if (!newItem.name || newItem.quantity === undefined) return;

    const itemToAdd: InventoryItem = {
      id: Date.now().toString(),
      name: newItem.name,
      category: newItem.category || 'Geral',
      quantity: Number(newItem.quantity),
      unit: newItem.unit || UnitType.UNITS,
      minThreshold: Number(newItem.minThreshold) || 0,
    };

    const updatedItems = [...items, itemToAdd];
    setItems(updatedItems);
    StorageService.saveInventory(updatedItems);
    setNewItem({ name: '', category: 'Cera', quantity: 0, unit: UnitType.KILOGRAMS, minThreshold: 1 });
  };

  const handleDeleteItem = (id: string) => {
    const updatedItems = items.filter(i => i.id !== id);
    setItems(updatedItems);
    StorageService.saveInventory(updatedItems);
  };

  const getLowStockItems = () => items.filter(i => i.quantity <= i.minThreshold);

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-brand-100">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Package className="text-brand-500" />
          Adicionar Novo Item
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <input
            type="text"
            placeholder="Nome do Item (ex: Cera de Coco)"
            className="border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-brand-400 outline-none lg:col-span-2"
            value={newItem.name}
            onChange={e => setNewItem({ ...newItem, name: e.target.value })}
          />
          <select
            className="border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-brand-400 outline-none"
            value={newItem.category}
            onChange={e => setNewItem({ ...newItem, category: e.target.value })}
          >
            <option value="Cera">Cera</option>
            <option value="Essência">Essência</option>
            <option value="Pavio">Pavio</option>
            <option value="Recipiente">Recipiente</option>
            <option value="Embalagem">Embalagem</option>
            <option value="Outros">Outros</option>
          </select>
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Qtd"
              className="border border-gray-300 p-2 rounded-lg w-full focus:ring-2 focus:ring-brand-400 outline-none"
              value={newItem.quantity}
              onChange={e => setNewItem({ ...newItem, quantity: parseFloat(e.target.value) })}
            />
            <select
              className="border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-brand-400 outline-none"
              value={newItem.unit}
              onChange={e => setNewItem({ ...newItem, unit: e.target.value as UnitType })}
            >
              {Object.values(UnitType).map(u => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
          </div>
          <button
            onClick={handleAddItem}
            className="bg-brand-500 text-white p-2 rounded-lg hover:bg-brand-600 transition-colors flex items-center justify-center gap-2 font-medium"
          >
            <Plus size={18} /> Adicionar
          </button>
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

      <div className="bg-white rounded-xl shadow-sm border border-brand-100 overflow-hidden">
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
            {items.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                  Nenhum item no estoque. Adicione o primeiro acima!
                </td>
              </tr>
            ) : (
              items.map(item => (
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
                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      className="text-red-400 hover:text-red-600 transition-colors"
                      title="Excluir"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InventoryTab;
