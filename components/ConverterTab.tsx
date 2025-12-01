import React, { useState } from 'react';
import { Calculator, Plus, Trash2, DollarSign, Package, ArrowRight, Save, RotateCcw } from 'lucide-react';
import { generateUUID } from '../utils/uuid';

type UnitGroup = 'mass' | 'volume' | 'unit';

interface UnitDef {
  label: string;
  value: string;
  factor: number; // Factor to convert to base unit (g, ml, un)
  group: UnitGroup;
}

const UNITS: UnitDef[] = [
  { label: 'Quilograma (kg)', value: 'kg', factor: 1000, group: 'mass' },
  { label: 'Grama (g)', value: 'g', factor: 1, group: 'mass' },
  { label: 'Litro (l)', value: 'l', factor: 1000, group: 'volume' },
  { label: 'Mililitro (ml)', value: 'ml', factor: 1, group: 'volume' },
  { label: 'Unidade (un)', value: 'un', factor: 1, group: 'unit' },
];

interface MaterialItem {
  id: string;
  name: string;
  cost: number;
  details: string; // "90g de Cera (Comprou 1kg a R$50)"
}

const ConverterTab: React.FC = () => {
  // Material Calculator State
  const [materialName, setMaterialName] = useState('');
  const [purchasePrice, setPurchasePrice] = useState<number | ''>('');
  const [purchaseQty, setPurchaseQty] = useState<number | ''>('');
  const [purchaseUnit, setPurchaseUnit] = useState<string>('kg');
  const [usageQty, setUsageQty] = useState<number | ''>('');
  const [usageUnit, setUsageUnit] = useState<string>('g');

  // Product Builder State
  const [productList, setProductList] = useState<MaterialItem[]>([]);
  const [profitMargin, setProfitMargin] = useState<number>(100); // %

  // Helper to find unit definition
  const getUnit = (val: string) => UNITS.find(u => u.value === val);

  // Calculate Cost Logic
  const calculateMaterialCost = (): number | null => {
    if (!purchasePrice || !purchaseQty || !usageQty) return null;
    
    const pUnit = getUnit(purchaseUnit);
    const uUnit = getUnit(usageUnit);

    if (!pUnit || !uUnit) return null;

    // Simple validation: warn if groups differ (e.g. kg -> ml), but allow for now (assuming 1g ~= 1ml roughly for water-like, but strictly speaking incorrect)
    // For this MVP, we will just calculate based on factors.
    
    const totalBaseUnits = Number(purchaseQty) * pUnit.factor; // e.g., 1kg * 1000 = 1000g
    const pricePerBaseUnit = Number(purchasePrice) / totalBaseUnits; // 50 / 1000 = 0.05 per g
    
    const usedBaseUnits = Number(usageQty) * uUnit.factor; // 90g * 1 = 90g
    const finalCost = pricePerBaseUnit * usedBaseUnits; // 0.05 * 90 = 4.50

    return finalCost;
  };

  const calculatedCost = calculateMaterialCost();
  const pUnitObj = getUnit(purchaseUnit);
  const uUnitObj = getUnit(usageUnit);
  const isUnitMismatch = pUnitObj?.group !== uUnitObj?.group;

  const handleAddMaterial = () => {
    if (!materialName || calculatedCost === null) return;

    const newItem: MaterialItem = {
      id: generateUUID(),
      name: materialName,
      cost: calculatedCost,
      details: `${usageQty}${usageUnit} (Base: ${purchaseQty}${purchaseUnit} a ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(purchasePrice))})`
    };

    setProductList([...productList, newItem]);
    
    // Reset form partially for next entry
    setMaterialName('');
    // Keep purchase info often useful if adding multiple parts from same bulk, but maybe reset usage
    setUsageQty(''); 
  };

  const handleRemoveMaterial = (id: string) => {
    setProductList(productList.filter(item => item.id !== id));
  };

  const handleClearAll = () => {
    setProductList([]);
    setMaterialName('');
    setPurchasePrice('');
    setPurchaseQty('');
    setUsageQty('');
  };

  // Totals
  const totalCost = productList.reduce((acc, item) => acc + item.cost, 0);
  const sellingPrice = totalCost * (1 + (profitMargin / 100));
  const profit = sellingPrice - totalCost;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* LEFT COLUMN: Calculator */}
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-brand-100">
          <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <Calculator className="text-brand-500" /> 
            Calculadora de Custo Unitário
          </h2>
          
          <div className="space-y-6">
            {/* Input Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Material</label>
              <input
                type="text"
                placeholder="Ex: Cera de Coco, Essência Lavanda, Pavio..."
                className="w-full bg-white text-gray-900 border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-brand-400 outline-none"
                value={materialName}
                onChange={e => setMaterialName(e.target.value)}
              />
            </div>

            {/* Purchase Data */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 relative">
              <span className="absolute -top-3 left-4 bg-gray-50 px-2 text-xs font-bold text-gray-500 uppercase">Compra (Atacado)</span>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs text-gray-500 mb-1">Preço Pago (R$)</label>
                  <input
                    type="number"
                    placeholder="0.00"
                    className="w-full bg-white text-gray-900 border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-brand-400 outline-none"
                    value={purchasePrice}
                    onChange={e => setPurchasePrice(Number(e.target.value) || '')}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Quantidade</label>
                  <input
                    type="number"
                    placeholder="1"
                    className="w-full bg-white text-gray-900 border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-brand-400 outline-none"
                    value={purchaseQty}
                    onChange={e => setPurchaseQty(Number(e.target.value) || '')}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Unidade</label>
                  <select
                    className="w-full bg-white text-gray-900 border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-brand-400 outline-none"
                    value={purchaseUnit}
                    onChange={e => {
                        setPurchaseUnit(e.target.value);
                        // Auto-adjust usage unit to match group if possible
                        const newGroup = getUnit(e.target.value)?.group;
                        if (newGroup === 'mass') setUsageUnit('g');
                        if (newGroup === 'volume') setUsageUnit('ml');
                        if (newGroup === 'unit') setUsageUnit('un');
                    }}
                  >
                    {UNITS.map(u => (
                      <option key={u.value} value={u.value}>{u.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Usage Data */}
            <div className="bg-brand-50 p-4 rounded-lg border border-brand-100 relative">
              <span className="absolute -top-3 left-4 bg-brand-50 px-2 text-xs font-bold text-brand-600 uppercase">Uso na Receita</span>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-brand-700 mb-1">Qtd. Usada</label>
                  <input
                    type="number"
                    placeholder="Ex: 90"
                    className="w-full bg-white text-gray-900 border border-brand-200 p-2 rounded-lg focus:ring-2 focus:ring-brand-400 outline-none"
                    value={usageQty}
                    onChange={e => setUsageQty(Number(e.target.value) || '')}
                  />
                </div>
                <div>
                  <label className="block text-xs text-brand-700 mb-1">Unidade</label>
                  <select
                    className="w-full bg-white text-gray-900 border border-brand-200 p-2 rounded-lg focus:ring-2 focus:ring-brand-400 outline-none"
                    value={usageUnit}
                    onChange={e => setUsageUnit(e.target.value)}
                  >
                     {UNITS.map(u => (
                      <option key={u.value} value={u.value}>{u.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            
            {isUnitMismatch && (
              <div className="text-xs text-yellow-600 flex items-center gap-1 bg-yellow-50 p-2 rounded">
                 ⚠️ Atenção: Você está convertendo grandezas diferentes ({pUnitObj?.group} para {uUnitObj?.group}). O cálculo pode não ser exato sem considerar a densidade.
              </div>
            )}

            {/* Result & Add Button */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <div className="flex flex-col">
                <span className="text-sm text-gray-500">Custo calculado:</span>
                <span className="text-2xl font-bold text-brand-600">
                  {calculatedCost !== null 
                    ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(calculatedCost)
                    : 'R$ 0,00'}
                </span>
              </div>
              <button
                onClick={handleAddMaterial}
                disabled={!materialName || calculatedCost === null}
                className="bg-gray-900 text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium"
              >
                <Plus size={18} /> Adicionar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Product Composition */}
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-brand-100 h-full flex flex-col">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <Package className="text-brand-500" /> 
              Precificação do Item
            </h2>
            <button 
              onClick={handleClearAll}
              className="text-xs text-red-400 hover:text-red-600 flex items-center gap-1"
              title="Limpar tudo"
            >
              <RotateCcw size={14} /> Reiniciar
            </button>
          </div>

          {/* List of Materials */}
          <div className="flex-1 bg-gray-50 rounded-xl border border-gray-200 p-4 mb-6 overflow-y-auto min-h-[200px]">
            {productList.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-2">
                <Package size={48} className="opacity-20" />
                <p className="text-sm text-center">Adicione materiais usando a<br/>calculadora ao lado.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {productList.map(item => (
                  <div key={item.id} className="bg-white p-3 rounded-lg shadow-sm border border-gray-100 flex justify-between items-center group">
                    <div>
                      <h4 className="font-bold text-gray-800">{item.name}</h4>
                      <p className="text-xs text-gray-500">{item.details}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-gray-700">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.cost)}
                      </span>
                      <button 
                        onClick={() => handleRemoveMaterial(item.id)}
                        className="text-gray-300 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pricing Summary */}
          <div className="border-t border-gray-100 pt-6 space-y-4">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Custo Total (CMV):</span>
              <span className="font-bold text-gray-900 text-lg">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalCost)}
              </span>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="block text-xs text-gray-500 mb-1">Margem de Lucro (%)</label>
                <div className="relative">
                  <input
                    type="number"
                    className="w-full bg-white text-gray-900 border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-brand-400 outline-none"
                    value={profitMargin}
                    onChange={e => setProfitMargin(Number(e.target.value))}
                  />
                  <span className="absolute right-3 top-2 text-gray-400 text-sm">%</span>
                </div>
              </div>
              <div className="flex items-center pt-6 text-gray-400">
                <ArrowRight size={20} />
              </div>
              <div className="flex-1 text-right">
                <label className="block text-xs text-gray-500 mb-1">Lucro Estimado</label>
                <span className="text-green-600 font-bold block">
                   {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(profit)}
                </span>
              </div>
            </div>

            <div className="bg-brand-500 text-white p-4 rounded-xl flex justify-between items-center shadow-md mt-4">
              <span className="font-medium text-brand-100">Preço de Venda Sugerido</span>
              <span className="font-bold text-2xl">
                 {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(sellingPrice)}
              </span>
            </div>
            
             <p className="text-xs text-center text-gray-400 mt-2">
               * Este é apenas um preço sugerido baseado na sua margem. Lembre-se de considerar custos fixos e impostos.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConverterTab;