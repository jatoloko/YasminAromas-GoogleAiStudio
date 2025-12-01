import React, { useState } from 'react';
import { LayoutDashboard, ShoppingBag, Package, Calculator, Sparkles, Menu, X } from 'lucide-react';
import SalesTab from './components/SalesTab';
import OrdersTab from './components/OrdersTab';
import InventoryTab from './components/InventoryTab';
import ConverterTab from './components/ConverterTab';
import AIAssistantTab from './components/AIAssistantTab';

// Enum for Tab management
enum Tab {
  SALES = 'vendas',
  ORDERS = 'encomendas',
  INVENTORY = 'estoque',
  CONVERTER = 'calculadora',
  AI = 'ia'
}

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.SALES);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = [
    { id: Tab.SALES, label: 'Minhas Vendas', icon: <LayoutDashboard size={20} /> },
    { id: Tab.ORDERS, label: 'Encomendas', icon: <ShoppingBag size={20} /> },
    { id: Tab.INVENTORY, label: 'Controle de Estoque', icon: <Package size={20} /> },
    { id: Tab.CONVERTER, label: 'Calculadora', icon: <Calculator size={20} /> },
    { id: Tab.AI, label: 'Yasmin IA', icon: <Sparkles size={20} /> },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case Tab.SALES: return <SalesTab />;
      case Tab.ORDERS: return <OrdersTab />;
      case Tab.INVENTORY: return <InventoryTab />;
      case Tab.CONVERTER: return <ConverterTab />;
      case Tab.AI: return <AIAssistantTab />;
      default: return <SalesTab />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row font-sans">
      {/* Sidebar Navigation (Desktop) */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 h-screen sticky top-0">
        <div className="p-6 border-b border-gray-100 flex items-center gap-3">
          <div className="w-10 h-10 bg-brand-100 rounded-full flex items-center justify-center text-brand-600">
            <Sparkles size={24} />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-gray-800 tracking-tight">Yasmin<span className="text-brand-500">Aromas</span></h1>
            <p className="text-xs text-gray-400 font-medium">Gestão Inteligente</p>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium ${
                activeTab === item.id
                  ? 'bg-brand-50 text-brand-600 shadow-sm'
                  : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <span className={activeTab === item.id ? 'text-brand-500' : 'text-gray-400'}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-400">v1.0.0 • YasminAromas</p>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden bg-white border-b border-gray-200 p-4 flex justify-between items-center sticky top-0 z-20">
        <div className="flex items-center gap-2">
          <Sparkles className="text-brand-500" />
          <h1 className="text-lg font-bold text-gray-800">Yasmin<span className="text-brand-500">Aromas</span></h1>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-gray-600 p-2">
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-10 bg-gray-800 bg-opacity-50" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="bg-white w-3/4 h-full shadow-xl p-4 flex flex-col" onClick={e => e.stopPropagation()}>
             <div className="mb-6 flex items-center gap-2 px-2">
               <Sparkles className="text-brand-500" />
               <span className="font-bold text-lg">Menu</span>
             </div>
             <nav className="space-y-2">
              {menuItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium ${
                    activeTab === item.id
                      ? 'bg-brand-50 text-brand-600'
                      : 'text-gray-600'
                  }`}
                >
                  <span className={activeTab === item.id ? 'text-brand-500' : 'text-gray-400'}>{item.icon}</span>
                  {item.label}
                </button>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
        <header className="mb-8 hidden md:block">
           <h2 className="text-2xl font-bold text-gray-800">
             {menuItems.find(i => i.id === activeTab)?.label}
           </h2>
           <p className="text-gray-500">Gerencie seu negócio de forma simples e eficiente.</p>
        </header>
        
        <div className="animate-fade-in">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;
