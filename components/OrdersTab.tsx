import React, { useState, useEffect, useRef } from 'react';
import { Plus, Clock, CheckCircle, Package, Truck, Trash2, Edit2, Search, Loader, Info } from 'lucide-react';
import { Order, OrderStatus } from '../types';
import { StorageService, isSupabaseUnavailableError } from '../services/storageService';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import { validateOrder } from '../utils/validation';
import { ListSkeleton } from './Skeleton';
import ConfirmDialog from './ConfirmDialog';
import { generateUUID } from '../utils/uuid';

const OrdersTab: React.FC = () => {
  const toast = useToast();
  const { user } = useAuth();
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
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [supabaseUnavailable, setSupabaseUnavailable] = useState(false);
  const [supabaseMessage, setSupabaseMessage] = useState<string | null>(null);
  const supabaseWarningShown = useRef(false);
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);

  useEffect(() => {
    if (!user?.id) return;
    
    const loadData = async () => {
      try {
        setIsLoading(true);
        const data = await StorageService.getOrders(user.id);
        setOrders(data);
        setSupabaseUnavailable(false);
        setSupabaseMessage(null);
        supabaseWarningShown.current = false;
      } catch (error) {
        console.error('Erro ao carregar encomendas:', error);
        if (isSupabaseUnavailableError(error)) {
          setOrders([]);
          setSupabaseUnavailable(true);
          const message = 'Supabase não está configurado ou está indisponível. Suas encomendas serão salvas apenas localmente.';
          setSupabaseMessage(message);
          if (!supabaseWarningShown.current) {
            toast.showWarning(message);
            supabaseWarningShown.current = true;
          }
        } else {
          toast.showError('Erro ao carregar encomendas.');
        }
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [user?.id]);

  const handleAddOrder = async () => {
    const errors: Record<string, string> = {};
    const validations = {
      customerName: validateOrder.customerName(newOrder.customerName || ''),
      description: validateOrder.description(newOrder.description || ''),
      deadline: validateOrder.deadline(newOrder.deadline || ''),
      estimatedValue: validateOrder.estimatedValue(newOrder.estimatedValue ?? ''),
    };

    (Object.keys(validations) as Array<keyof typeof validations>).forEach(key => {
      const result = validations[key];
      if (!result.isValid) {
        errors[key] = result.error || '';
      }
    });

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
      let updatedOrders: Order[];

      if (editingOrder) {
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
        const orderToAdd: Order = {
          id: generateUUID(),
          customerName: newOrder.customerName!,
          description: newOrder.description!,
          deadline: newOrder.deadline || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          status: newOrder.status || OrderStatus.PENDING,
          estimatedValue: Number(newOrder.estimatedValue) || 0,
        };
        updatedOrders = [orderToAdd, ...orders];
      }

      setOrders(updatedOrders);
      const saved = await StorageService.saveOrders(updatedOrders, user.id);
      if (saved) {
        toast.showSuccess(editingOrder ? 'Encomenda atualizada com sucesso!' : 'Encomenda criada com sucesso!');
      } else {
        toast.showError('Não foi possível salvar a encomenda no Supabase.');
      }

      setNewOrder({
        customerName: '',
        description: '',
        deadline: '',
        status: OrderStatus.PENDING,
        estimatedValue: 0,
      });
      setShowForm(false);
      setEditingOrder(null);
      setFormErrors({});
    } catch (error) {
      console.error('Erro ao salvar encomenda:', error);
      toast.showError('Erro ao salvar encomenda.');
    } finally {
      setIsSaving(false);
    }
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
    setFormErrors({});
  };

  const handleUpdateStatus = async (id: string, newStatus: OrderStatus) => {
    const updatedOrders = orders.map(o => o.id === id ? { ...o, status: newStatus } : o);
    setOrders(updatedOrders);
    if (user?.id) {
      const saved = await StorageService.saveOrders(updatedOrders, user.id);
      if (!saved) {
        toast.showError('Não foi possível atualizar o status no Supabase.');
      }
    }
  };

  const handleDeleteOrder = async () => {
    if (!orderToDelete || !user?.id) {
      setOrderToDelete(null);
      return;
    }
    const updatedOrders = orders.filter(o => o.id !== orderToDelete.id);
    setOrders(updatedOrders);
    const saved = await StorageService.saveOrders(updatedOrders, user.id);
    if (saved) {
      toast.showSuccess('Encomenda excluída com sucesso!');
    } else {
      toast.showError('Não foi possível excluir a encomenda no Supabase.');
    }
    setOrderToDelete(null);
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
      {supabaseUnavailable && supabaseMessage && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg flex items-start gap-3">
          <Info className="w-5 h-5 mt-0.5" />
          <div>
            <p className="font-semibold">Modo offline</p>
            <p className="text-sm">{supabaseMessage} Consulte o arquivo SUPABASE_SETUP.md para ativar a sincronização.</p>
          </div>
        </div>
      )}
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cliente <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Nome do Cliente"
                className={`bg-white text-gray-900 border p-2 rounded-lg focus:ring-2 focus:ring-brand-400 outline-none w-full ${formErrors.customerName ? 'border-red-500' : 'border-gray-300'}`}
                value={newOrder.customerName}
                onChange={e => {
                  setNewOrder({ ...newOrder, customerName: e.target.value });
                  setFormErrors({ ...formErrors, customerName: '' });
                }}
              />
              {formErrors.customerName && <p className="text-red-500 text-xs mt-1">{formErrors.customerName}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prazo de Entrega <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                className={`bg-white text-gray-900 border p-2 rounded-lg focus:ring-2 focus:ring-brand-400 outline-none w-full ${formErrors.deadline ? 'border-red-500' : 'border-gray-300'}`}
                value={newOrder.deadline ? newOrder.deadline.split('T')[0] : ''}
                onChange={e => {
                  setNewOrder({ ...newOrder, deadline: e.target.value });
                  setFormErrors({ ...formErrors, deadline: '' });
                }}
              />
              {formErrors.deadline && <p className="text-red-500 text-xs mt-1">{formErrors.deadline}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descrição do Pedido <span className="text-red-500">*</span>
              </label>
              <textarea
                placeholder="Ex: 50 velas mini para lembrancinha"
                className={`bg-white text-gray-900 border p-2 rounded-lg focus:ring-2 focus:ring-brand-400 outline-none w-full ${formErrors.description ? 'border-red-500' : 'border-gray-300'}`}
                rows={3}
                value={newOrder.description}
                onChange={e => {
                  setNewOrder({ ...newOrder, description: e.target.value });
                  setFormErrors({ ...formErrors, description: '' });
                }}
              />
              {formErrors.description && <p className="text-red-500 text-xs mt-1">{formErrors.description}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Valor Estimado (opcional)
              </label>
              <div className="flex items-center gap-2">
                <span className="text-gray-500">R$</span>
                <input
                  type="number"
                  placeholder="0,00"
                  className={`bg-white text-gray-900 border p-2 rounded-lg focus:ring-2 focus:ring-brand-400 outline-none flex-1 ${formErrors.estimatedValue ? 'border-red-500' : 'border-gray-300'}`}
                  value={newOrder.estimatedValue || ''}
                  onChange={e => {
                    setNewOrder({ ...newOrder, estimatedValue: parseFloat(e.target.value) });
                    setFormErrors({ ...formErrors, estimatedValue: '' });
                  }}
                />
              </div>
              {formErrors.estimatedValue && <p className="text-red-500 text-xs mt-1">{formErrors.estimatedValue}</p>}
            </div>

            <button
              onClick={handleAddOrder}
              disabled={isSaving}
              className="bg-brand-500 text-white p-2 rounded-lg hover:bg-brand-600 transition-colors font-bold md:col-span-2 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSaving ? (
                <>
                  <Loader size={18} className="animate-spin" /> Salvando...
                </>
              ) : (
                'Salvar Encomenda'
              )}
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

      {isLoading ? (
        <div className="bg-white p-6 rounded-xl border border-brand-100">
          <ListSkeleton items={4} />
        </div>
      ) : (
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
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setOrderToDelete(order);
                          }}
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
      )}
      <ConfirmDialog
        open={!!orderToDelete}
        title="Excluir encomenda"
        description={`Tem certeza que deseja excluir "${orderToDelete?.customerName}"? Esta ação não pode ser desfeita.`}
        confirmLabel="Excluir"
        onConfirm={handleDeleteOrder}
        onCancel={() => setOrderToDelete(null)}
      />
    </div>
  );
};

export default OrdersTab;