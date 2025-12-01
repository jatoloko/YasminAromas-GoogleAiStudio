import React, { useState, useEffect } from 'react';
import { Plus, TrendingUp, DollarSign, Calendar, Trash2, ShoppingCart, Tag, Package, Search } from 'lucide-react';
import { SaleItem, InventoryItem, Product } from '../types';
import { StorageService } from '../services/storageService';
import { useToast } from '../contexts/ToastContext';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

type CartItemType = 'PRODUCT' | 'INVENTORY_ITEM';

interface CartItem {
  id: string; // Product ID or Inventory ID
  name: string;
  type: CartItemType;
  quantity: number;
  unitPrice?: number;
}

const SalesTab: React.FC = () => {
  const toast = useToast();
  const [sales, setSales] = useState<SaleItem[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  
  // Form State
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [customerName, setCustomerName] = useState('');
  const [totalValue, setTotalValue] = useState<number | ''>('');
  
  // Cart State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectionType, setSelectionType] = useState<CartItemType>('PRODUCT');
  const [selectedId, setSelectedId] = useState('');
  const [qtyToAdd, setQtyToAdd] = useState(1);
  const [manualProductNotes, setManualProductNotes] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [periodFilter, setPeriodFilter] = useState<string>('week');

  useEffect(() => {
    const loadData = async () => {
      const [salesData, inventoryData, productsData] = await Promise.all([
        StorageService.getSales(),
        StorageService.getInventory(),
        StorageService.getProducts()
      ]);
      setSales(salesData);
      setInventory(inventoryData);
      setProducts(productsData);
    };
    loadData();
  }, []);

  // Update total value whenever cart changes
  useEffect(() => {
    const cartTotal = cart.reduce((acc, item) => {
      return acc + (item.unitPrice ? item.unitPrice * item.quantity : 0);
    }, 0);
    
    if (cartTotal > 0) {
      setTotalValue(cartTotal);
    }
  }, [cart]);

  const handleAddToCart = () => {
    if (!selectedId || qtyToAdd <= 0) return;

    let itemToAdd: CartItem | null = null;

    if (selectionType === 'PRODUCT') {
      const prod = products.find(p => p.id === selectedId);
      if (prod) {
        itemToAdd = {
          id: prod.id,
          name: prod.name,
          type: 'PRODUCT',
          quantity: qtyToAdd,
          unitPrice: prod.price
        };
      }
    } else {
      const invItem = inventory.find(i => i.id === selectedId);
      if (invItem) {
        itemToAdd = {
          id: invItem.id,
          name: invItem.name,
          type: 'INVENTORY_ITEM',
          quantity: qtyToAdd,
          unitPrice: 0 // We don't track selling price of raw items usually, unless specified
        };
      }
    }

    if (itemToAdd) {
      const existingIndex = cart.findIndex(c => c.id === itemToAdd!.id && c.type === itemToAdd!.type);
      if (existingIndex >= 0) {
        const newCart = [...cart];
        newCart[existingIndex].quantity += qtyToAdd;
        setCart(newCart);
      } else {
        setCart([...cart, itemToAdd]);
      }
      setSelectedId('');
      setQtyToAdd(1);
    }
  };

  const handleRemoveFromCart = (index: number) => {
    setCart(cart.filter((_, i) => i !== index));
  };

  const handleAddSale = async () => {
    if (!customerName || !totalValue) {
      toast.showError("Por favor, preencha o cliente e o valor total.");
      return;
    }

    // 1. Build Product Description String
    let productsDescription = cart.map(c => `${c.quantity}x ${c.name}`).join(', ');
    if (manualProductNotes) {
      productsDescription += productsDescription ? `, ${manualProductNotes}` : manualProductNotes;
    }
    if (!productsDescription) productsDescription = "Venda Diversa";

    // 2. Deduct from Stock logic
    if (cart.length > 0) {
      const currentInventory = [...inventory]; // Copy to mutate
      
      cart.forEach(cartItem => {
        if (cartItem.type === 'INVENTORY_ITEM') {
          // Direct deduction
          const invIndex = currentInventory.findIndex(i => i.id === cartItem.id);
          if (invIndex >= 0) {
            currentInventory[invIndex].quantity = Math.max(0, currentInventory[invIndex].quantity - cartItem.quantity);
          }
        } else if (cartItem.type === 'PRODUCT') {
          // Recipe deduction
          const product = products.find(p => p.id === cartItem.id);
          if (product && product.recipe) {
            product.recipe.forEach(ingredient => {
              const invIndex = currentInventory.findIndex(i => i.id === ingredient.inventoryItemId);
              if (invIndex >= 0) {
                // Deduct: Ingredient Qty per unit * Sold Units
                const totalToDeduct = ingredient.quantity * cartItem.quantity;
                currentInventory[invIndex].quantity = Math.max(0, currentInventory[invIndex].quantity - totalToDeduct);
              }
            });
          }
        }
      });

      await StorageService.saveInventory(currentInventory);
      setInventory(currentInventory); 
    }

    // 3. Save Sale
    const saleToAdd: SaleItem = {
      id: Date.now().toString(),
      date: date || new Date().toISOString(),
      customerName,
      products: productsDescription,
      totalValue: Number(totalValue),
    };

    const updatedSales = [saleToAdd, ...sales];
    setSales(updatedSales);
    await StorageService.saveSales(updatedSales);
    toast.showSuccess('Venda registrada com sucesso!');

    // 4. Reset Form
    setCustomerName('');
    setTotalValue('');
    setCart([]);
    setManualProductNotes('');
    setDate(new Date().toISOString().split('T')[0]);
  };

  const totalRevenue = filteredSales.reduce((acc, curr) => acc + curr.totalValue, 0);

  // Filter sales based on search and date
  const filteredSales = React.useMemo(() => {
    let filtered = sales;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(sale =>
        sale.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.products.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      filtered = filtered.filter(sale => {
        const saleDate = new Date(sale.date);
        switch (dateFilter) {
          case 'today':
            return saleDate.toDateString() === now.toDateString();
          case 'week':
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            return saleDate >= weekAgo;
          case 'month':
            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            return saleDate >= monthAgo;
          default:
            return true;
        }
      });
    }

    return filtered;
  }, [sales, searchTerm, dateFilter]);

  // Prepare data for chart
  const chartData = React.useMemo(() => {
    const data: Record<string, number> = {};
    filteredSales.forEach(sale => {
      const date = sale.date.split('T')[0];
      data[date] = (data[date] || 0) + sale.totalValue;
    });
    return Object.entries(data)
      .map(([date, amount]) => ({ date: date.split('-').slice(1).join('/'), amount }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-7);
  }, [filteredSales]);

  // Calculate period metrics
  const periodMetrics = React.useMemo(() => {
    const now = new Date();
    let periodStart: Date;
    
    switch (periodFilter) {
      case 'week':
        periodStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        periodStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'year':
        periodStart = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        periodStart = new Date(0);
    }

    const periodSales = filteredSales.filter(sale => new Date(sale.date) >= periodStart);
    const periodRevenue = periodSales.reduce((acc, curr) => acc + curr.totalValue, 0);
    const previousPeriodStart = new Date(periodStart.getTime() - (now.getTime() - periodStart.getTime()));
    const previousPeriodSales = filteredSales.filter(sale => {
      const saleDate = new Date(sale.date);
      return saleDate >= previousPeriodStart && saleDate < periodStart;
    });
    const previousPeriodRevenue = previousPeriodSales.reduce((acc, curr) => acc + curr.totalValue, 0);
    
    const growth = previousPeriodRevenue > 0 
      ? ((periodRevenue - previousPeriodRevenue) / previousPeriodRevenue) * 100 
      : 0;

    return {
      periodRevenue,
      previousPeriodRevenue,
      growth,
      periodSalesCount: periodSales.length,
    };
  }, [filteredSales, periodFilter]);

  // Top products (simplified - based on product names in sales)
  const topProducts = React.useMemo(() => {
    const productCounts: Record<string, number> = {};
    filteredSales.forEach(sale => {
      const products = sale.products.split(',').map(p => p.trim());
      products.forEach(product => {
        // Extract product name (remove quantity prefix like "2x ")
        const productName = product.replace(/^\d+x\s*/, '');
        productCounts[productName] = (productCounts[productName] || 0) + 1;
      });
    });
    
    return Object.entries(productCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [filteredSales]);

  return (
    <div className="space-y-6">
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
            <p className="text-2xl font-bold text-gray-800">{filteredSales.length}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-brand-100 flex items-center">
          <div className="bg-green-100 p-3 rounded-full mr-4">
            <DollarSign className="text-green-600 w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Faturamento do Período</p>
            <p className="text-2xl font-bold text-gray-800">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(periodMetrics.periodRevenue)}
            </p>
            <p className={`text-xs ${periodMetrics.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {periodMetrics.growth >= 0 ? '↑' : '↓'} {Math.abs(periodMetrics.growth).toFixed(1)}% vs período anterior
            </p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-brand-100 flex items-center">
          <div className="bg-purple-100 p-3 rounded-full mr-4">
            <Calendar className="text-purple-600 w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Última Venda</p>
            <p className="text-lg font-bold text-gray-800">
              {filteredSales.length > 0 ? new Date(filteredSales[0].date).toLocaleDateString('pt-BR') : '-'}
            </p>
          </div>
        </div>
      </div>

      {/* Period Filter */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-brand-100">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700">Período de Análise:</label>
          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-400 outline-none"
            value={periodFilter}
            onChange={e => setPeriodFilter(e.target.value)}
          >
            <option value="week">Últimos 7 dias</option>
            <option value="month">Últimos 30 dias</option>
            <option value="year">Últimos 12 meses</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Input Form */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-brand-100 h-fit">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Registrar Venda</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data</label>
                <input
                  type="date"
                  className="w-full bg-white text-gray-900 border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-brand-400 outline-none"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Valor Total (R$)</label>
                <input
                  type="number"
                  placeholder="0.00"
                  className="w-full bg-white text-gray-900 border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-brand-400 outline-none"
                  value={totalValue}
                  onChange={e => setTotalValue(parseFloat(e.target.value) || '')}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
              <input
                type="text"
                placeholder="Nome do Cliente"
                className="w-full bg-white text-gray-900 border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-brand-400 outline-none"
                value={customerName}
                onChange={e => setCustomerName(e.target.value)}
              />
            </div>

            {/* Product Selection (Stock Deduction) */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                <ShoppingCart size={16} /> Carrinho (Baixa no Estoque)
              </label>
              
              <div className="flex gap-2 mb-2">
                 <button
                    onClick={() => { setSelectionType('PRODUCT'); setSelectedId(''); }}
                    className={`flex-1 py-1 text-xs font-bold rounded ${selectionType === 'PRODUCT' ? 'bg-brand-500 text-white' : 'bg-gray-200 text-gray-600'}`}
                 >
                   Produto Pronto
                 </button>
                 <button
                    onClick={() => { setSelectionType('INVENTORY_ITEM'); setSelectedId(''); }}
                    className={`flex-1 py-1 text-xs font-bold rounded ${selectionType === 'INVENTORY_ITEM' ? 'bg-brand-500 text-white' : 'bg-gray-200 text-gray-600'}`}
                 >
                   Item Avulso
                 </button>
              </div>

              <div className="flex gap-2 mb-2">
                <select 
                  className="flex-1 bg-white text-gray-900 border border-gray-300 p-2 rounded-lg outline-none text-sm"
                  value={selectedId}
                  onChange={e => setSelectedId(e.target.value)}
                >
                  <option value="">
                    {selectionType === 'PRODUCT' ? 'Selecione um produto...' : 'Selecione um item...'}
                  </option>
                  
                  {selectionType === 'PRODUCT' ? (
                     products.map(p => (
                       <option key={p.id} value={p.id}>{p.name} - R${p.price.toFixed(2)}</option>
                     ))
                  ) : (
                    inventory.map(item => (
                      <option key={item.id} value={item.id}>
                        {item.name} ({item.quantity}{item.unit})
                      </option>
                    ))
                  )}
                </select>
                <input 
                  type="number" 
                  className="w-20 bg-white text-gray-900 border border-gray-300 p-2 rounded-lg outline-none text-sm"
                  placeholder="Qtd"
                  min="1"
                  value={qtyToAdd}
                  onChange={e => setQtyToAdd(Number(e.target.value))}
                />
                <button 
                  onClick={handleAddToCart}
                  className="bg-brand-500 text-white p-2 rounded-lg hover:bg-brand-600"
                >
                  <Plus size={20} />
                </button>
              </div>

              {/* Cart List */}
              {cart.length > 0 && (
                <ul className="space-y-2 mb-2">
                  {cart.map((item, idx) => (
                    <li key={idx} className="flex justify-between items-center text-sm bg-white p-2 rounded border border-gray-200">
                      <div className="flex items-center gap-2">
                        {item.type === 'PRODUCT' ? <Tag size={12} className="text-brand-500" /> : <Package size={12} className="text-blue-500" />}
                        <span><span className="font-bold">{item.quantity}x</span> {item.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                         {item.unitPrice && <span className="text-xs text-gray-500">R${(item.unitPrice * item.quantity).toFixed(2)}</span>}
                         <button onClick={() => handleRemoveFromCart(idx)} className="text-red-400 hover:text-red-600">
                           <Trash2 size={14} />
                         </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Manual Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Outros Detalhes / Obs</label>
              <textarea
                placeholder="Ex: Embalagem especial, brindes..."
                rows={2}
                className="w-full bg-white text-gray-900 border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-brand-400 outline-none"
                value={manualProductNotes}
                onChange={e => setManualProductNotes(e.target.value)}
              />
            </div>

            <button
              onClick={handleAddSale}
              className="w-full bg-brand-500 text-white p-3 rounded-lg hover:bg-brand-600 transition-colors font-bold flex items-center justify-center gap-2"
            >
              <Plus size={20} /> Finalizar Venda
            </button>
          </div>
        </div>

        {/* Charts */}
        <div className="space-y-6">
          {/* Line Chart */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-brand-100 flex flex-col">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Tendência de Vendas</h2>
            <div className="h-[300px] w-full">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                    <XAxis dataKey="date" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `R$${value}`} />
                    <Tooltip
                      cursor={{ stroke: '#f43f5e', strokeWidth: 1 }}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Line type="monotone" dataKey="amount" stroke="#f43f5e" strokeWidth={2} dot={{ fill: '#f43f5e', r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400">
                  Sem dados suficientes para o gráfico.
                </div>
              )}
            </div>
          </div>

          {/* Bar Chart */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-brand-100 flex flex-col">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Vendas por Data</h2>
            <div className="h-[300px] w-full">
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

          {/* Top Products */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-brand-100">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Produtos Mais Vendidos</h2>
            {topProducts.length > 0 ? (
              <div className="space-y-3">
                {topProducts.map((product, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 font-bold text-sm">
                        {index + 1}
                      </div>
                      <span className="font-medium text-gray-800">{product.name}</span>
                    </div>
                    <span className="text-brand-600 font-bold">{product.count} vendas</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-center py-4">Sem dados de produtos vendidos.</p>
            )}
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-brand-100">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Buscar por cliente ou produtos..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-400 outline-none"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-400 outline-none"
            value={dateFilter}
            onChange={e => setDateFilter(e.target.value)}
          >
            <option value="all">Todas as datas</option>
            <option value="today">Hoje</option>
            <option value="week">Últimos 7 dias</option>
            <option value="month">Últimos 30 dias</option>
          </select>
        </div>
      </div>

      {/* Recent Sales List */}
      <div className="bg-white rounded-xl shadow-sm border border-brand-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-800">Histórico de Vendas {filteredSales.length !== sales.length ? `(${filteredSales.length} de ${sales.length})` : ''}</h3>
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
              {filteredSales.slice(0, 10).map((sale) => (
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
              {filteredSales.length === 0 && (
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