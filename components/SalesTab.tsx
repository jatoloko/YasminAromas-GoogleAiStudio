import React, { useState, useEffect } from 'react';
import { Plus, TrendingUp, DollarSign, Calendar } from 'lucide-react';
import { SaleItem } from '../types';
import { StorageService } from '../services/storageService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const SalesTab: React.FC = () => {
  const [sales, setSales] = useState<SaleItem[]>([]);
  const [newSale, setNewSale] = useState<Partial<SaleItem>>({
    customerName: '',
    products: '',
    totalValue: 0,
    date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    setSales(StorageService.getSales());
  }, []);

  const handleAddSale = () => {
    if (!newSale.customerName || !newSale.totalValue) return;

    const saleToAdd: SaleItem = {
      id: Date.now().toString(),
      date: newSale.date || new Date().toISOString(),
      customerName: newSale.customerName,
      products: newSale.products || 'Venda Diversa',
      totalValue: Number(newSale.totalValue),
    };

    const updatedSales = [saleToAdd, ...sales];
    setSales(updatedSales);
    StorageService.saveSales(updatedSales);
    setNewSale({
      customerName: '',
      products: '',
      totalValue: 0,
      date: new Date().toISOString().split('T')[0],
    });
  };

  const totalRevenue = sales.reduce((acc, curr) => acc + curr.totalValue, 0);

  // Prepare data for chart (Last 7 days or simply by date)
  const chartData = React.useMemo(() => {
    const data: Record<string, number> = {};
    sales.forEach(sale => {
      const date = sale.date.split('T')[0];
      data[date] = (data[date] || 0) + sale.totalValue;
    });
    return Object.entries(data)
      .map(([date, amount]) => ({ date: date.split('-').slice(1).join('/'), amount }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-7); // Last 7 entries to keep chart clean
  }, [sales]);

  return (
    <div className="space-y-6">
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-brand-100 flex items-center">
          <div className="bg-brand-100 p-3 rounded-full mr-4">
            <DollarSign className="text-brand-600 w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Faturamento Total</p>
            <p className="text-2xl font-bold text-gray-800">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalRevenue)}
            </p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-brand-100 flex items-center">
          <div className="bg-blue-100 p-3 rounded-full mr-4">
            <TrendingUp className="text-blue-600 w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total de Vendas</p>
            <p className="text-2xl font-bold text-gray-800">{sales.length}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-brand-100 flex items-center">
          <div className="bg-purple-100 p-3 rounded-full mr-4">
            <Calendar className="text-purple-600 w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Última Venda</p>
            <p className="text-lg font-bold text-gray-800">
              {sales.length > 0 ? new Date(sales[0].date).toLocaleDateString('pt-BR') : '-'}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Form */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-brand-100 h-fit">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Registrar Venda</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data</label>
              <input
                type="date"
                className="w-full bg-white text-gray-900 border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-brand-400 outline-none"
                value={newSale.date}
                onChange={e => setNewSale({ ...newSale, date: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
              <input
                type="text"
                placeholder="Nome do Cliente"
                className="w-full bg-white text-gray-900 border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-brand-400 outline-none"
                value={newSale.customerName}
                onChange={e => setNewSale({ ...newSale, customerName: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Produtos</label>
              <textarea
                placeholder="Ex: 2x Vela Lavanda, 1x Home Spray"
                rows={2}
                className="w-full bg-white text-gray-900 border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-brand-400 outline-none"
                value={newSale.products}
                onChange={e => setNewSale({ ...newSale, products: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Valor Total (R$)</label>
              <input
                type="number"
                placeholder="0.00"
                className="w-full bg-white text-gray-900 border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-brand-400 outline-none"
                value={newSale.totalValue || ''}
                onChange={e => setNewSale({ ...newSale, totalValue: parseFloat(e.target.value) })}
              />
            </div>
            <button
              onClick={handleAddSale}
              className="w-full bg-brand-500 text-white p-3 rounded-lg hover:bg-brand-600 transition-colors font-bold flex items-center justify-center gap-2"
            >
              <Plus size={20} /> Registrar Venda
            </button>
          </div>
        </div>

        {/* Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-brand-100 flex flex-col">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Visão Geral de Vendas</h2>
          <div className="flex-1 min-h-[300px]">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                  <XAxis dataKey="date" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `R$${value}`} />
                  <Tooltip
                    cursor={{ fill: 'transparent' }}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="amount" fill="#f43f5e" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">
                Sem dados suficientes para o gráfico.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Sales List */}
      <div className="bg-white rounded-xl shadow-sm border border-brand-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-800">Histórico de Vendas Recentes</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Produtos</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Valor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sales.slice(0, 10).map((sale) => (
                <tr key={sale.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {new Date(sale.date).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {sale.customerName}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                    {sale.products}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-brand-600">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(sale.totalValue)}
                  </td>
                </tr>
              ))}
              {sales.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-400">
                    Nenhuma venda registrada ainda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SalesTab;