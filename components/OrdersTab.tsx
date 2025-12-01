import React, { useState, useEffect } from 'react';
import { Plus, Clock, CheckCircle, Package, Truck } from 'lucide-react';
import { Order, OrderStatus } from '../types';
import { StorageService } from '../services/storageService';

const OrdersTab: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [newOrder, setNewOrder] = useState<Partial<Order>>({
    customerName: '',
    description: '',
    deadline: '',
    status: OrderStatus.PENDING,
    estimatedValue: 0,
  });

  useEffect(() => {
    setOrders(StorageService.getOrders());
  }, []);

  const handleAddOrder = () => {
    if (!newOrder.customerName || !newOrder.description) return;

    const orderToAdd: Order = {
      id: Date.now().toString(),
      customerName: newOrder.customerName,
      description: newOrder.description,
      deadline: newOrder.deadline || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      status: newOrder.status || OrderStatus.PENDING,
      estimatedValue: Number(newOrder.estimatedValue) || 0,
    };

    const updatedOrders = [...orders, orderToAdd];
    setOrders(updatedOrders);
    StorageService.saveOrders(updatedOrders);
    setNewOrder({
      customerName: '',
      description: '',
      deadline: '',
      status: OrderStatus.PENDING,
      estimatedValue: 0,
    });
    setShowForm(false);
  };

  const handleUpdateStatus = (id: string, newStatus: OrderStatus) => {
    const updatedOrders = orders.map(o => o.id === id ? { ...o, status: newStatus } : o);
    setOrders(updatedOrders);
    StorageService.saveOrders(updatedOrders);
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case OrderStatus.IN_PROGRESS: return 'bg-blue-100 text-blue-800 border-blue-200';
      case OrderStatus.COMPLETED: return 'bg-green-100 text-green-800 border-green-200';
      case OrderStatus.DELIVERED: return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING: return <Clock size={16} />;
      case OrderStatus.IN_PROGRESS: return <Package size={16} />;
      case OrderStatus.COMPLETED: return <CheckCircle size={16} />;
      case OrderStatus.DELIVERED: return <Truck size={16} />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">Encomendas</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-brand-500 text-white px-4 py-2 rounded-lg hover:bg-brand-600 transition-colors flex items-center gap-2 font-medium"
        >
          <Plus size={18} /> Nova Encomenda
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-brand-100 animate-fade-in-down">
          <h3 className="font-bold text-lg mb-4 text-gray-800">Detalhes da Encomenda</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Nome do Cliente"
              className="bg-white text-gray-900 border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-brand-400 outline-none"
              value={newOrder.customerName}
              onChange={e => setNewOrder({ ...newOrder, customerName: e.target.value })}
            />
            <input
              type="date"
              className="bg-white text-gray-900 border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-brand-400 outline-none"
              value={newOrder.deadline?.split('T')[0]}
              onChange={e => setNewOrder({ ...newOrder, deadline: e.target.value })}
            />
            <textarea
              placeholder="Descrição do Pedido (ex: 50 velas mini para lembrancinha)"
              className="bg-white text-gray-900 border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-brand-400 outline-none md:col-span-2"
              rows={3}
              value={newOrder.description}
              onChange={e => setNewOrder({ ...newOrder, description: e.target.value })}
            />
            <div className="flex items-center gap-2 md:col-span-2">
              <span className="text-gray-500">Valor Estimado: R$</span>
              <input
                type="number"
                placeholder="0.00"
                className="bg-white text-gray-900 border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-brand-400 outline-none flex-1"
                value={newOrder.estimatedValue || ''}
                onChange={e => setNewOrder({ ...newOrder, estimatedValue: parseFloat(e.target.value) })}
              />
            </div>
            <button
              onClick={handleAddOrder}
              className="bg-brand-500 text-white p-2 rounded-lg hover:bg-brand-600 transition-colors font-bold md:col-span-2"
            >
              Salvar Encomenda
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.values(OrderStatus).map((status) => (
          <div key={status} className="bg-gray-50 p-4 rounded-xl border border-gray-200 flex flex-col h-full min-h-[300px]">
            <div className={`flex items-center gap-2 mb-4 p-2 rounded-lg border ${getStatusColor(status)} bg-opacity-50`}>
              {getStatusIcon(status)}
              <h3 className="font-bold text-sm uppercase">{status}</h3>
            </div>
            
            <div className="space-y-3 flex-1">
              {orders.filter(o => o.status === status).map(order => (
                <div key={order.id} className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-bold text-gray-800 text-sm truncate w-2/3">{order.customerName}</span>
                    <span className="text-xs text-gray-400">
                      {new Date(order.deadline).toLocaleDateString('pt-BR', {day: '2-digit', month: '2-digit'})}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mb-3 line-clamp-2">{order.description}</p>
                  
                  <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                    <span className="text-xs font-semibold text-brand-600">
                       {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(order.estimatedValue)}
                    </span>
                    
                    {/* Status Mover Controls */}
                    <div className="flex gap-1">
                      {status !== OrderStatus.PENDING && (
                         <button 
                           onClick={() => handleUpdateStatus(order.id, 
                             status === OrderStatus.DELIVERED ? OrderStatus.COMPLETED : 
                             status === OrderStatus.COMPLETED ? OrderStatus.IN_PROGRESS : OrderStatus.PENDING
                           )}
                           className="text-gray-400 hover:text-brand-500 p-1" title="Voltar"
                         >
                           ←
                         </button>
                      )}
                      {status !== OrderStatus.DELIVERED && (
                        <button 
                          onClick={() => handleUpdateStatus(order.id, 
                             status === OrderStatus.PENDING ? OrderStatus.IN_PROGRESS : 
                             status === OrderStatus.IN_PROGRESS ? OrderStatus.COMPLETED : OrderStatus.DELIVERED
                           )}
                          className="text-gray-400 hover:text-brand-500 p-1" title="Avançar"
                        >
                          →
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {orders.filter(o => o.status === status).length === 0 && (
                <div className="text-center py-8 text-gray-300 text-sm italic">
                  Vazio
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrdersTab;