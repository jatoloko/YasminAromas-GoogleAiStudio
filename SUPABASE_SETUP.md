# Configuração do Supabase

## 🚀 Passo 1: Executar o Schema SQL (OBRIGATÓRIO)

**IMPORTANTE:** Este passo DEVE ser executado antes de usar a aplicação!

1. Acesse o [Dashboard do Supabase](https://supabase.com/dashboard)
2. Selecione seu projeto: `https://ldwtehzvknruvllylgsr.supabase.co`
3. No menu lateral, clique em **SQL Editor**
4. Clique em **New Query** (ou use o editor que já está aberto)
5. Abra o arquivo `supabase-schema.sql` deste projeto
6. **Copie TODO o conteúdo** do arquivo
7. Cole no SQL Editor do Supabase
8. Clique em **Run** (ou pressione `Ctrl+Enter` / `Cmd+Enter`)
9. Aguarde a mensagem de sucesso: "Success. No rows returned"

**Verificar se foi criado:**
- No menu lateral, clique em **Table Editor**
- Você deve ver 4 tabelas:
  - ✅ `inventory` - Controle de estoque
  - ✅ `sales` - Vendas
  - ✅ `orders` - Encomendas
  - ✅ `products` - Produtos

## 🔐 Passo 2: Ativar Autenticação (Email + Senha)

1. No painel do Supabase, vá em **Authentication > Providers**
2. Habilite o provedor **Email**
3. (Opcional, mas recomendado para testes locais) Desative a confirmação obrigatória de e-mail em **Authentication > Providers > Email** (`Disable email confirmations`). Caso mantenha a confirmação, os usuários precisarão validar o e-mail antes de acessar o app.
4. Em **Authentication > Policies**, confirme que `Enable Email Signup` está ativo.

> O login do app utiliza e-mail + senha do Supabase Auth. O campo "Nome de Usuário" é salvo no `user_metadata` e exibido apenas na interface.

## ⚙️ Passo 3: Configurar Variáveis de Ambiente Local

Crie um arquivo `.env.local` na raiz do projeto com o seguinte conteúdo:

```env
VITE_SUPABASE_URL=https://ldwtehzvknruvllylgsr.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxkd3RlaHp2a25ydXZsbHlsZ3NyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ2MTA5OTksImV4cCI6MjA4MDE4Njk5OX0.PQAqVBJuEfH3QosxrcBiYxxbaS7dgSDH0AASAOfP5u8

# Opcional: Para usar o Assistente IA
GEMINI_API_KEY=sua_chave_gemini_aqui
```

**Como criar o arquivo:**
- No Windows: Crie um novo arquivo de texto chamado `.env.local` (com o ponto no início)
- No VS Code: Clique com botão direito na raiz do projeto > New File > `.env.local`
- Ou copie o arquivo `.env.example` (se existir) e renomeie para `.env.local`

## 🧪 Passo 4: Testar Localmente

Após criar o `.env.local`, reinicie o servidor de desenvolvimento:

```bash
npm run dev
```

**O que verificar:**
1. A aplicação deve abrir em `http://localhost:5173`
2. Você deve ver a tela de login/registro
3. Crie uma conta de teste
4. Verifique se consegue acessar as abas (Vendas, Encomendas, etc.)
5. Abra o Console do navegador (F12) e verifique se há erros

## 📦 Passo 5: Configurar no Vercel (Produção)

Veja as instruções completas no arquivo `VERCEL_SETUP.md`.

**Resumo rápido:**
1. No Vercel Dashboard, vá em **Settings > Environment Variables**
2. Adicione `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` com os valores acima
3. Faça um novo deploy

## 🔍 Como Funciona

- O sistema usa **100% Supabase** como banco de dados
- Cada usuário tem seus próprios dados isolados (multi-tenancy)
- Todas as operações são sincronizadas automaticamente com o Supabase
- Row Level Security (RLS) garante que usuários só vejam seus próprios dados

## ⚠️ Troubleshooting

### Erro: "Supabase não configurado"
- Verifique se o arquivo `.env.local` existe na raiz do projeto
- Verifique se as variáveis começam com `VITE_`
- Reinicie o servidor após criar/editar o `.env.local`

### Erro: "relation does not exist"
- Você não executou o schema SQL no Supabase
- Volte ao **Passo 1** e execute o `supabase-schema.sql`

### Erro: "Email not confirmed" ou "Email confirmação obrigatória"
- Se estiver usando e-mails reais, confirme a conta clicando no link enviado pelo Supabase
- Para ambientes de testes, considere desativar a confirmação obrigatória conforme descrito no Passo 2

### Erro: "Failed to fetch" ou "Network error"
- Verifique se a URL do Supabase está correta
- Verifique se o projeto Supabase está ativo
- Verifique as políticas RLS no Supabase Dashboard

### Tela branca no Vercel
- Verifique se as variáveis de ambiente estão configuradas no Vercel
- Verifique se fez um novo deploy após adicionar as variáveis
- Veja `VERCEL_SETUP.md` para mais detalhes

## 📚 Estrutura do Banco de Dados

### Tabela `inventory`
- Controle de estoque de ingredientes
- Vinculado ao usuário via `user_id`

### Tabela `sales`
- Registro de vendas
- Vinculado ao usuário via `user_id`

### Tabela `orders`
- Encomendas de clientes
- Vinculado ao usuário via `user_id`

### Tabela `products`
- Produtos cadastrados com receitas
- Vinculado ao usuário via `user_id`

> Todas as tabelas usam `user_id` referenciando `auth.users(id)` e as políticas RLS garantem que `auth.uid()` só acesse seus próprios registros.
