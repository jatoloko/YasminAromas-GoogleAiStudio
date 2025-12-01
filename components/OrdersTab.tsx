import React, { useState, useEffect } from 'react';
import { Plus, Clock, CheckCircle, Package, Truck, Trash2, Edit2, Search } from 'lucide-react';
import { Order, OrderStatus } from '../types';
import { StorageService } from '../services/storageService';
import { useToast } from '../contexts/ToastContext';

const OrdersTab: React.FC = () => {
  const toast = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [newOrder, setNewOrder] = useState<Partial<Order>>({
    customerName: '',
    description: '',
    deadline: '',
    status: OrderStatus.PENDING,
    estimatedValue: 0,
  });

  useEffect(() => {
    const loadData = async () => {
      const data = await StorageService.getOrders();
      setOrders(data);
    };
    loadData();
  }, []);

  const handleAddOrder = async () => {
    if (!newOrder.customerName || !newOrder.description) return;

    let updatedOrders: Order[];

    if (editingOrder) {
      // Update existing order
      updatedOrders = orders.map(o =>
        o.id === editingOrder.id
          ? {
              id: editingOrder.id,
              customerName: newOrder.customerName!,
              description: newOrder.description!,
              deadline: newOrder.deadline || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
              status: newOrder.status || OrderStatus.PENDING,
              estimatedValue: Number(newOrder.estimatedValue) || 0,
            }
          : o
      );
    } else {
      // Add new order
      const orderToAdd: Order = {
        id: Date.now().toString(),
        customerName: newOrder.customerName,
        description: newOrder.description,
        deadline: newOrder.deadline || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        status: newOrder.status || OrderStatus.PENDING,
        estimatedValue: Number(newOrder.estimatedValue) || 0,
      };
      updatedOrders = [...orders, orderToAdd];
    }

    setOrders(updatedOrders);
    await StorageService.saveOrders(updatedOrders);
    toast.showSuccess(editingOrder ? 'Encomenda atualizada com sucesso!' : 'Encomenda criada com sucesso!');
    setNewOrder({
      customerName: '',
      description: '',
      deadline: '',
      status: OrderStatus.PENDING,
      estimatedValue: 0,
    });
    setShowForm(false);
    setEditingOrder(null);
  };

  const handleEditOrder = (order: Order) => {
    setEditingOrder(order);
    setNewOrder({
      customerName: order.customerName,
      description: order.description,
      deadline: order.deadline.split('T')[0],
      status: order.status,
      estimatedValue: order.estimatedValue,
    });
    setShowForm(true);
  };

  const handleCancelEdit = () => {
    setEditingOrder(null);
    setNewOrder({
      customerName: '',
      description: '',
      deadline: '',
      status: OrderStatus.PENDING,
      estimatedValue: 0,
    });
    setShowForm(false);
  };

  const handleUpdateStatus = async (id: string, newStatus: OrderStatus) => {
    const updatedOrders = orders.map(o => o.id === id ? { ...o, status: newStatus } : o);
    setOrders(updatedOrders);
    await StorageService.saveOrders(updatedOrders);
  };

  const handleDeleteOrder = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm("Tem certeza que deseja excluir esta encomenda? Esta ação não pode ser desfeita.")) {
      const updatedOrders = orders.filter(o => o.id !== id);
      setOrders(updatedOrders);
      await StorageService.saveOrders(updatedOrders);
      toast.showSuccess('Encomenda excluída com sucesso!');
    }
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

  // Filter orders based on search
  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">Encomendas</h2>
        <button
          onClick={() => {
            if (showForm) handleCancelEdit();
            else setShowForm(true);
          }}
          className="bg-brand-500 text-white px-4 py-2 rounded-lg hover:bg-brand-600 transition-colors flex items-center gap-2 font-medium"
        >
          <Plus size={18} /> {showForm ? 'Cancelar' : 'Nova Encomenda'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-brand-100 animate-fade-in-down">
          <h3 className="font-bold text-lg mb-4 text-gray-800">
            {editingOrder ? 'Editar Encomenda' : 'Detalhes da Encomenda'}
          </h3>
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

      {/* Search and Filter */}
      {!showForm && (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-brand-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Buscar por cliente ou descrição..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-400 outline-none"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-400 outline-none"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
            >
              <option value="all">Todos os status</option>
              {Object.values(OrderStatus).map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
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
              {filteredOrders.filter(o => o.status === status).map(order => (
                <div key={order.id} className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow relative">
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
                    
                    <div className="flex items-center gap-1">
                       <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleEditOrder(order);
                          }}
                          className="text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full p-2 transition-colors z-10"
                          title="Editar Encomenda"
                        >
                          <Edit2 size={18} />
                        </button>
                       <button
                          type="button"
                          onClick={(e) => handleDeleteOrder(e, order.id)}
                          className="text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full p-2 transition-colors z-10"
                          title="Excluir Encomenda"
                        >
                          <Trash2 size={18} />
                        </button>
                      {/* Status Mover Controls */}
                      <div className="flex">
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
                </div>
              ))}
              {filteredOrders.filter(o => o.status === status).length === 0 && (
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