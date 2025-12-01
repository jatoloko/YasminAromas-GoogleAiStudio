-- ============================================
-- SCHEMA SQL COMPLETO PARA YASMINAROMAS
-- Execute este script no SQL Editor do Supabase
-- ============================================

-- Tabela de Inventário
CREATE TABLE inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  quantity NUMERIC NOT NULL DEFAULT 0,
  unit TEXT NOT NULL,
  min_threshold NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Vendas
CREATE TABLE sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  customer_name TEXT NOT NULL,
  products TEXT NOT NULL,
  total_value NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Encomendas
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  description TEXT NOT NULL,
  deadline TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL,
  estimated_value NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Produtos
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price NUMERIC NOT NULL DEFAULT 0,
  recipe JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para melhor performance
CREATE INDEX idx_inventory_user_id ON inventory(user_id);
CREATE INDEX idx_inventory_category ON inventory(category);
CREATE INDEX idx_sales_user_id ON sales(user_id);
CREATE INDEX idx_sales_date ON sales(date);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_deadline ON orders(deadline);
CREATE INDEX idx_products_user_id ON products(user_id);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar updated_at
CREATE TRIGGER update_inventory_updated_at 
  BEFORE UPDATE ON inventory
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at 
  BEFORE UPDATE ON orders
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at 
  BEFORE UPDATE ON products
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Habilitar Row Level Security (RLS)
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para inventory (usuários só veem seus próprios dados)
CREATE POLICY "Users can view own inventory" 
  ON inventory FOR SELECT 
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own inventory" 
  ON inventory FOR INSERT 
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own inventory" 
  ON inventory FOR UPDATE 
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own inventory" 
  ON inventory FOR DELETE 
  USING (user_id = auth.uid());

-- Políticas RLS para sales (usuários só veem suas próprias vendas)
CREATE POLICY "Users can view own sales" 
  ON sales FOR SELECT 
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own sales" 
  ON sales FOR INSERT 
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own sales" 
  ON sales FOR UPDATE 
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own sales" 
  ON sales FOR DELETE 
  USING (user_id = auth.uid());

-- Políticas RLS para orders (usuários só veem suas próprias encomendas)
CREATE POLICY "Users can view own orders" 
  ON orders FOR SELECT 
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own orders" 
  ON orders FOR INSERT 
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own orders" 
  ON orders FOR UPDATE 
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own orders" 
  ON orders FOR DELETE 
  USING (user_id = auth.uid());

-- Políticas RLS para products (usuários só veem seus próprios produtos)
CREATE POLICY "Users can view own products" 
  ON products FOR SELECT 
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own products" 
  ON products FOR INSERT 
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own products" 
  ON products FOR UPDATE 
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own products" 
  ON products FOR DELETE 
  USING (user_id = auth.uid());

-- ============================================
-- ✅ Schema criado com sucesso!
-- ============================================
