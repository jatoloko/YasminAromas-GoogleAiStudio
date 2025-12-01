import React, { useState, Suspense } from 'react';
import { LayoutDashboard, ShoppingBag, Package, Calculator, Tag, Menu, X, Sparkles } from 'lucide-react';

// Lazy load components para reduzir bundle inicial e evitar problemas de inicialização
const SalesTab = React.lazy(() => import('./components/SalesTab'));
const OrdersTab = React.lazy(() => import('./components/OrdersTab'));
const InventoryTab = React.lazy(() => import('./components/InventoryTab'));
const ConverterTab = React.lazy(() => import('./components/ConverterTab'));
const ProductsTab = React.lazy(() => import('./components/ProductsTab'));
const AIAssistantTab = React.lazy(() => import('./components/AIAssistantTab'));

// Enum for Tab management
enum Tab {
  SALES = 'vendas',
  ORDERS = 'encomendas',
  INVENTORY = 'estoque',
  PRODUCTS = 'produtos',
  CONVERTER = 'calculadora',
  AI_ASSISTANT = 'assistente',
}

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.SALES);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Debug: Verificar se o componente está sendo renderizado
  React.useEffect(() => {
    console.log('✅ App component montado com sucesso');
  }, []);

  const menuItems = [
    { id: Tab.SALES, label: 'Minhas Vendas', icon: LayoutDashboard },
    { id: Tab.ORDERS, label: 'Encomendas', icon: ShoppingBag },
    { id: Tab.INVENTORY, label: 'Controle de Estoque', icon: Package },
    { id: Tab.PRODUCTS, label: 'Meus Produtos', icon: Tag },
    { id: Tab.CONVERTER, label: 'Calculadora', icon: Calculator },
    { id: Tab.AI_ASSISTANT, label: 'Assistente IA', icon: Sparkles },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case Tab.SALES: return <SalesTab />;
      case Tab.ORDERS: return <OrdersTab />;
      case Tab.INVENTORY: return <InventoryTab />;
      case Tab.PRODUCTS: return <ProductsTab />;
      case Tab.CONVERTER: return <ConverterTab />;
      case Tab.AI_ASSISTANT: return <AIAssistantTab />;
      default: return <SalesTab />;
    }
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-6 flex items-center gap-3">
        <div className="bg-brand-500 p-2 rounded-lg">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C13.0524 4.38234 14.3823 5.71228 16.7647 6.76471C14.3823 7.81713 13.0524 9.14708 12 11.5294C10.9476 9.14708 9.61767 7.81713 7.23529 6.76471C9.61767 5.71228 10.9476 4.38234 12 2Z" fill="white"/>
            <path d="M5 10C5.70161 11.6935 6.69355 12.6855 8.3871 13.3871C6.69355 14.0887 5.70161 15.0806 5 16.7742C4.29839 15.0806 3.30645 14.0887 1.6129 13.3871C3.30645 12.6855 4.29839 11.6935 5 10Z" fill="white"/>
            <path d="M19 14C19.7016 15.6935 20.6935 16.6855 22.3871 17.3871C20.6935 18.0887 19.7016 19.0806 19 20.7742C18.2984 19.0806 17.3065 18.0887 15.6129 17.3871C17.3065 16.6855 18.2984 15.6935 19 14Z" fill="white"/>
          </svg>
        </div>
        <div>
          <h1 className="text-xl font-bold text-brand-800">YasminAromas</h1>
          <p className="text-sm text-gray-500">Gestão Inteligente</p>
        </div>
      </div>
      <nav className="flex-1 px-4 py-2">
        <ul className="space-y-2">
          {menuItems.map(item => (
            <li key={item.id}>
              <button
                onClick={() => {
                  setActiveTab(item.id);
                  setIsMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
                  activeTab === item.id 
                    ? 'bg-brand-100 text-brand-700 font-bold' 
                    : 'text-gray-600 hover:bg-brand-50 hover:text-brand-600'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
      <div className="p-4 mt-auto">
        <p className="text-xs text-center text-gray-400">v1.0.0 • YasminAromas</p>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar for Desktop */}
      <aside className="hidden lg:block w-64 bg-white border-r border-gray-200 flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-40 flex lg:hidden" role="dialog" aria-modal="true">
          <div 
            className="fixed inset-0 bg-gray-600 bg-opacity-75 transition-opacity" 
            aria-hidden="true"
            onClick={() => setIsMenuOpen(false)}
          ></div>
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                type="button"
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={() => setIsMenuOpen(false)}
              >
                <span className="sr-only">Close sidebar</span>
                <X className="h-6 w-6 text-white" aria-hidden="true" />
              </button>
            </div>
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <header className="sticky top-0 bg-white/80 backdrop-blur-sm z-10 p-4 border-b border-gray-200 flex items-center lg:hidden">
          <button onClick={() => setIsMenuOpen(true)} className="text-gray-500">
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex-1 text-center">
            <h1 className="text-lg font-bold text-brand-800">YasminAromas</h1>
          </div>
        </header>
        <div className="p-4 md:p-6 lg:p-8">
          <Suspense fallback={
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-brand-200 border-t-brand-500 rounded-full animate-spin"></div>
                <p className="text-gray-600">Carregando...</p>
              </div>
            </div>
          }>
            {renderTabContent()}
          </Suspense>
        </div>
      </main>
    </div>
  );
};

export default App;
