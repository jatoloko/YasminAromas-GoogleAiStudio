import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Package, Save, Beaker, X, Edit2, Search } from 'lucide-react';
import { InventoryItem, Product, ProductRecipeItem } from '../types';
import { StorageService } from '../services/storageService';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';

const ProductsTab: React.FC = () => {
  const toast = useToast();
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // New Product Form State
  const [newProductName, setNewProductName] = useState('');
  const [newProductPrice, setNewProductPrice] = useState<number | ''>('');
  const [recipe, setRecipe] = useState<ProductRecipeItem[]>([]);

  // Recipe Builder State
  const [selectedIngredientId, setSelectedIngredientId] = useState('');
  const [ingredientQty, setIngredientQty] = useState<number | ''>('');

  useEffect(() => {
    if (!user?.id) return;
    
    const loadData = async () => {
      const [productsData, inventoryData] = await Promise.all([
        StorageService.getProducts(user.id),
        StorageService.getInventory(user.id)
      ]);
      setProducts(productsData);
      setInventory(inventoryData);
    };
    loadData();
  }, [user?.id]);

  const handleAddIngredient = () => {
    if (!selectedIngredientId || !ingredientQty) return;

    // Check if already in recipe
    if (recipe.find(r => r.inventoryItemId === selectedIngredientId)) {
      alert("Este item já está na receita.");
      return;
    }

    setRecipe([...recipe, { inventoryItemId: selectedIngredientId, quantity: Number(ingredientQty) }]);
    setSelectedIngredientId('');
    setIngredientQty('');
  };

  const handleRemoveIngredient = (id: string) => {
    setRecipe(recipe.filter(r => r.inventoryItemId !== id));
  };

  const handleSaveProduct = async () => {
    if (!newProductName || !newProductPrice) {
      alert("Nome e Preço são obrigatórios.");
      return;
    }

    let updatedProducts: Product[];

    if (editingProduct) {
      // Update existing product
      updatedProducts = products.map(p =>
        p.id === editingProduct.id
          ? {
              id: editingProduct.id,
              name: newProductName,
              price: Number(newProductPrice),
              recipe: recipe,
            }
          : p
      );
    } else {
      // Add new product
      const newProduct: Product = {
        id: Date.now().toString(),
        name: newProductName,
        price: Number(newProductPrice),
        recipe: recipe,
      };
      updatedProducts = [...products, newProduct];
    }

    setProducts(updatedProducts);
    if (user?.id) {
      await StorageService.saveProducts(updatedProducts, user.id);
      toast.showSuccess(editingProduct ? 'Produto atualizado com sucesso!' : 'Produto cadastrado com sucesso!');
    }

    // Reset Form
    setNewProductName('');
    setNewProductPrice('');
    setRecipe([]);
    setShowForm(false);
    setEditingProduct(null);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setNewProductName(product.name);
    setNewProductPrice(product.price);
    setRecipe(product.recipe);
    setShowForm(true);
  };

  const handleCancelEdit = () => {
    setEditingProduct(null);
    setNewProductName('');
    setNewProductPrice('');
    setRecipe([]);
    setShowForm(false);
  };

  const handleDeleteProduct = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir este produto?")) {
      const updated = products.filter(p => p.id !== id);
      setProducts(updated);
      if (user?.id) {
        await StorageService.saveProducts(updated, user.id);
        toast.showSuccess('Produto excluído com sucesso!');
      }
    }
  };

  const getInventoryItemName = (id: string) => {
    const item = inventory.find(i => i.id === id);
    return item ? `${item.name} (${item.unit})` : 'Item desconhecido';
  };

  // Filter products based on search
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Meus Produtos</h2>
          <p className="text-sm text-gray-500">Cadastre seus produtos e suas receitas para baixa automática no estoque.</p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-brand-500 text-white px-4 py-2 rounded-lg hover:bg-brand-600 transition-colors flex items-center gap-2 font-medium"
          >
            <Plus size={18} /> Novo Produto
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-brand-100 animate-fade-in-down">
          <div className="flex justify-between items-start mb-4">
            <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
              <Package className="text-brand-500" /> {editingProduct ? 'Editar Produto' : 'Cadastro de Produto'}
            </h3>
            <button onClick={handleCancelEdit} className="text-gray-400 hover:text-gray-600">
              <X size={20} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Produto</label>
                <input
                  type="text"
                  placeholder="Ex: Vela Lavanda 200g"
                  className="w-full bg-white text-gray-900 border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-brand-400 outline-none"
                  value={newProductName}
                  onChange={e => setNewProductName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Preço de Venda (R$)</label>
                <input
                  type="number"
                  placeholder="0.00"
                  className="w-full bg-white text-gray-900 border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-brand-400 outline-none"
                  value={newProductPrice}
                  onChange={e => setNewProductPrice(Number(e.target.value) || '')}
                />
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                <Beaker size={16} /> Receita (Composição)
              </label>
              <div className="flex gap-2 mb-3">
                <select
                  className="flex-1 bg-white text-gray-900 border border-gray-300 p-2 rounded-lg outline-none text-sm"
                  value={selectedIngredientId}
                  onChange={e => setSelectedIngredientId(e.target.value)}
                >
                  <option value="">Escolha um item do estoque...</option>
                  {inventory.map(item => (
                    <option key={item.id} value={item.id}>{item.name} ({item.unit})</option>
                  ))}
                </select>
                <input
                  type="number"
                  placeholder="Qtd"
                  className="w-20 bg-white text-gray-900 border border-gray-300 p-2 rounded-lg outline-none text-sm"
                  value={ingredientQty}
                  onChange={e => setIngredientQty(Number(e.target.value) || '')}
                />
                <button
                  onClick={handleAddIngredient}
                  className="bg-gray-800 text-white p-2 rounded-lg hover:bg-gray-700"
                >
                  <Plus size={18} />
                </button>
              </div>

              {recipe.length > 0 ? (
                <ul className="space-y-2 max-h-40 overflow-y-auto">
                  {recipe.map(item => (
                    <li key={item.inventoryItemId} className="flex justify-between items-center text-sm bg-white p-2 rounded border border-gray-200">
                      <span>{getInventoryItemName(item.inventoryItemId)}</span>
                      <div className="flex items-center gap-3">
                        <span className="font-bold">{item.quantity}</span>
                        <button onClick={() => handleRemoveIngredient(item.inventoryItemId)} className="text-red-400 hover:text-red-600">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-center text-gray-400 py-4">Nenhum ingrediente adicionado.</p>
              )}
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={handleSaveProduct}
              className="bg-brand-500 text-white px-6 py-2 rounded-lg hover:bg-brand-600 transition-colors font-bold flex items-center gap-2"
            >
              <Save size={18} /> Salvar Produto
            </button>
          </div>
        </div>
      )}

      {/* Search */}
      {!showForm && (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-brand-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Buscar produtos..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-400 outline-none"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProducts.map(product => (
          <div key={product.id} className="bg-white p-5 rounded-xl shadow-sm border border-brand-100 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-bold text-gray-800 text-lg">{product.name}</h3>
              <div className="flex items-center gap-2">
                <button onClick={() => handleEditProduct(product)} className="text-gray-300 hover:text-blue-500">
                  <Edit2 size={18} />
                </button>
                <button onClick={() => handleDeleteProduct(product.id)} className="text-gray-300 hover:text-red-500">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
            <p className="text-brand-600 font-bold text-xl mb-4">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price)}
            </p>
            
            <div className="bg-gray-50 rounded-lg p-3 text-sm">
              <p className="text-xs font-bold text-gray-500 uppercase mb-2">Receita / Baixa Estoque:</p>
              {product.recipe.length > 0 ? (
                <ul className="space-y-1">
                  {product.recipe.map((r, idx) => (
                    <li key={idx} className="flex justify-between text-gray-600 text-xs">
                      <span>{getInventoryItemName(r.inventoryItemId).split('(')[0]}</span>
                      <span className="font-medium">{r.quantity} {getInventoryItemName(r.inventoryItemId).split('(')[1]?.replace(')', '')}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <span className="text-xs text-gray-400 italic">Sem receita definida.</span>
              )}
            </div>
          </div>
        ))}
        {filteredProducts.length === 0 && !showForm && (
          <div className="col-span-full text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
            <Package size={48} className="mx-auto text-gray-300 mb-2" />
            <p className="text-gray-500">Nenhum produto cadastrado ainda.</p>
            <button onClick={() => setShowForm(true)} className="text-brand-500 font-bold hover:underline mt-2">
              Cadastrar Primeiro Produto
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductsTab;