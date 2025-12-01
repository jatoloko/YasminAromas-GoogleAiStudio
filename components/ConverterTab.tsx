import React, { useState } from 'react';
import { Beaker, Calculator, Info } from 'lucide-react';

const ConverterTab: React.FC = () => {
  const [containerSize, setContainerSize] = useState<number>(0);
  const [fragrancePercentage, setFragrancePercentage] = useState<number>(10);
  const [quantity, setQuantity] = useState<number>(1);
  
  // Results
  const totalMix = containerSize * quantity;
  const waxAmount = totalMix / (1 + (fragrancePercentage / 100));
  const fragranceAmount = totalMix - waxAmount;

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center justify-center gap-2">
          <Calculator className="text-brand-500" /> Calculadora de Produção
        </h2>
        <p className="text-gray-500 mt-2">Calcule a quantidade exata de cera e essência para suas velas.</p>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-brand-100">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Capacidade do Recipiente (g)
            </label>
            <div className="relative">
              <input
                type="number"
                className="w-full border-gray-300 border p-3 rounded-lg focus:ring-2 focus:ring-brand-400 outline-none text-lg font-medium"
                value={containerSize || ''}
                onChange={(e) => setContainerSize(parseFloat(e.target.value))}
                placeholder="Ex: 150"
              />
              <span className="absolute right-3 top-3.5 text-gray-400 text-sm">g</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Carga de Essência (%)
            </label>
            <div className="relative">
              <input
                type="number"
                className="w-full border-gray-300 border p-3 rounded-lg focus:ring-2 focus:ring-brand-400 outline-none text-lg font-medium"
                value={fragrancePercentage || ''}
                onChange={(e) => setFragrancePercentage(parseFloat(e.target.value))}
                placeholder="Ex: 10"
              />
              <span className="absolute right-3 top-3.5 text-gray-400 text-sm">%</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quantidade de Velas
            </label>
            <input
              type="number"
              className="w-full border-gray-300 border p-3 rounded-lg focus:ring-2 focus:ring-brand-400 outline-none text-lg font-medium"
              value={quantity || ''}
              onChange={(e) => setQuantity(parseFloat(e.target.value))}
              placeholder="Ex: 5"
            />
          </div>
        </div>

        <div className="bg-brand-50 rounded-xl p-6 border border-brand-100">
          <h3 className="text-brand-800 font-bold text-lg mb-4 flex items-center gap-2">
            <Beaker className="w-5 h-5" /> Resultado da Receita
          </h3>
          
          <div className="grid grid-cols-2 gap-8">
            <div className="text-center p-4 bg-white rounded-lg shadow-sm">
              <p className="text-gray-500 text-sm mb-1">Cera Necessária</p>
              <p className="text-3xl font-bold text-brand-600">
                {waxAmount.toFixed(1)}g
              </p>
            </div>
            
            <div className="text-center p-4 bg-white rounded-lg shadow-sm">
              <p className="text-gray-500 text-sm mb-1">Essência Necessária</p>
              <p className="text-3xl font-bold text-purple-600">
                {fragranceAmount.toFixed(1)}g
              </p>
            </div>
          </div>
          
          <div className="mt-6 pt-6 border-t border-brand-200 text-center text-brand-700">
            <p className="font-medium">
              Peso Total da Mistura: <span className="font-bold">{totalMix.toFixed(1)}g</span>
            </p>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 p-4 rounded-lg flex items-start gap-3">
        <Info className="text-blue-500 flex-shrink-0 mt-0.5" size={20} />
        <div className="text-sm text-blue-700">
          <p className="font-bold mb-1">Dica Pro:</p>
          <p>
            A fórmula usada é: <strong>Total = Cera + (Cera × %)</strong>. Isso garante que a porcentagem de essência seja baseada no peso da cera (carga), que é o padrão da indústria, ou no peso total dependendo da sua técnica. Aqui usamos o cálculo reverso do peso total do recipiente para garantir que a vela caiba perfeitamente.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ConverterTab;
