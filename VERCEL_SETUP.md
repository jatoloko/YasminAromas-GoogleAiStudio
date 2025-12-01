# Configuração do Vercel

## 🚀 Deploy no Vercel

### Passo 1: Conectar o Repositório

1. Acesse [vercel.com](https://vercel.com)
2. Faça login com sua conta GitHub
3. Clique em "Add New Project"
4. Importe o repositório `YasminAromas-GoogleAiStudio`

### Passo 2: Configurar Variáveis de Ambiente

No painel do Vercel, vá em **Settings > Environment Variables** e adicione:

#### Variáveis Obrigatórias (para Supabase):

1. Clique em **Add New**
2. Adicione cada variável:

**Variável 1:**
- **Key:** `VITE_SUPABASE_URL`
- **Value:** `https://ldwtehzvknruvllylgsr.supabase.co`
- **Environments:** Marque Production, Preview e Development
- Clique em **Save**

**Variável 2:**
- **Key:** `VITE_SUPABASE_ANON_KEY`
- **Value:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxkd3RlaHp2a25ydXZsbHlsZ3NyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ2MTA5OTksImV4cCI6MjA4MDE4Njk5OX0.PQAqVBJuEfH3QosxrcBiYxxbaS7dgSDH0AASAOfP5u8`
- **Environments:** Marque Production, Preview e Development
- Clique em **Save**

#### Variáveis Opcionais (para Assistente IA):

**Variável 3:**
- **Key:** `GEMINI_API_KEY`
- **Value:** `sua_chave_gemini_aqui`
- **Environments:** Marque Production, Preview e Development
- Clique em **Save**

**⚠️ IMPORTANTE:**
- Após adicionar as variáveis, você DEVE fazer um novo deploy
- As variáveis não são aplicadas em deploys existentes
- Vá em **Deployments** e clique em **Redeploy** ou faça um novo commit

### Passo 3: Configurar Build Settings

O Vercel deve detectar automaticamente que é um projeto Vite, mas verifique:

- **Framework Preset:** Vite
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`

### Passo 4: Deploy

1. Clique em **Deploy**
2. Aguarde o build completar
3. Se houver erros, verifique os logs no painel do Vercel

## 🔧 Troubleshooting - Tela Branca

### Problema: Tela branca após deploy

**Soluções (em ordem de prioridade):**

1. **Verificar Console do Navegador (PRIMEIRO PASSO):**
   - Abra DevTools (F12)
   - Vá na aba **Console**
   - Procure por mensagens de debug que começam com:
     - `🔍 Debug - Variáveis de ambiente:` - Verifica se as env vars estão configuradas
     - `✅ Elemento root encontrado` - Confirma que o DOM está OK
     - `✅ Aplicação renderizada com sucesso!` - Confirma que o React renderizou
     - `✅ App component montado` - Confirma que o App carregou
     - `✅ Cliente Supabase inicializado` - Confirma que Supabase está OK
   - Se ver `❌` ou erros em vermelho, anote a mensagem

2. **Verificar Variáveis de Ambiente:**
   - Certifique-se de que todas as variáveis estão configuradas no Vercel
   - As variáveis devem começar com `VITE_` para serem expostas no cliente
   - **IMPORTANTE:** Após adicionar variáveis, você DEVE fazer um novo deploy
   - No console, verifique se aparece `✅ Configurada` para cada variável

3. **Verificar Build Logs:**
   - No painel do Vercel, vá em **Deployments**
   - Clique no último deployment
   - Veja os logs de build para erros
   - Verifique se o build completou com sucesso (deve terminar com "Build Completed")

4. **Verificar se o Build Funciona Localmente:**
   ```bash
   npm run build
   npm run preview
   ```
   - Se funcionar localmente mas não no Vercel, é problema de configuração
   - Se não funcionar localmente, corrija os erros primeiro

5. **Verificar Network Tab:**
   - No DevTools, vá na aba **Network**
   - Recarregue a página
   - Verifique se há requisições falhando (vermelho)
   - Verifique se os arquivos JS estão carregando (index.tsx, App.js, etc.)

6. **Problemas Comuns:**

   **Erro: "Cannot read property of undefined"**
   - Verifique se as variáveis de ambiente estão configuradas
   - O Supabase pode não estar inicializando corretamente

   **Erro: "Module not found"**
   - Verifique se todas as dependências estão no `package.json`
   - Execute `npm install` localmente para verificar

   **Erro: "Failed to fetch"**
   - Verifique as URLs do Supabase
   - Verifique as políticas de CORS no Supabase

5. **Testar Localmente:**
   ```bash
   npm run build
   npm run preview
   ```
   Se funcionar localmente, o problema é de configuração no Vercel

## 🔐 Configuração do Supabase

### 1. Criar Schema no Supabase (PRIMEIRO PASSO)

**IMPORTANTE:** Antes de fazer deploy, você DEVE executar o schema SQL no Supabase:

1. Acesse o [Dashboard do Supabase](https://supabase.com/dashboard)
2. Selecione seu projeto
3. Vá em **SQL Editor** (menu lateral)
4. Clique em **New Query**
5. Copie TODO o conteúdo do arquivo `supabase-schema.sql` do projeto
6. Cole no editor SQL
7. Clique em **Run** (ou pressione Ctrl+Enter)
8. Aguarde a confirmação de sucesso

**Tabelas que serão criadas:**
- `users` - Usuários do sistema
- `inventory` - Controle de estoque
- `sales` - Vendas
- `orders` - Encomendas
- `products` - Produtos

**Verificar se foi criado:**
- Vá em **Table Editor** no menu lateral
- Você deve ver todas as 5 tabelas listadas

### 2. Configurar CORS no Supabase

No painel do Supabase:
1. Vá em **Settings > API**
2. Em **CORS**, adicione o domínio do Vercel:
   - `https://seu-projeto.vercel.app`
   - `https://*.vercel.app` (para previews)

### 3. Verificar Row Level Security (RLS)

O schema SQL já configura RLS automaticamente, mas você pode verificar:
1. Vá em **Authentication > Policies**
2. Certifique-se de que as políticas estão ativas para todas as tabelas

### 4. Atualizar Credenciais no Vercel

Se você mudou de projeto Supabase ou precisa atualizar as credenciais:

1. No Vercel Dashboard, vá em **Settings > Environment Variables**
2. Encontre `VITE_SUPABASE_URL` e clique em **Edit**
3. Atualize o valor para: `https://ldwtehzvknruvllylgsr.supabase.co`
4. Encontre `VITE_SUPABASE_ANON_KEY` e clique em **Edit**
5. Atualize o valor para: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxkd3RlaHp2a25ydXZsbHlsZ3NyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ2MTA5OTksImV4cCI6MjA4MDE4Njk5OX0.PQAqVBJuEfH3QosxrcBiYxxbaS7dgSDH0AASAOfP5u8`
6. **IMPORTANTE:** Após atualizar, vá em **Deployments** e faça um **Redeploy**

## 📝 Checklist de Deploy

- [ ] Schema SQL executado no Supabase (SQL Editor)
- [ ] Tabelas criadas e visíveis no Table Editor do Supabase
- [ ] Variáveis de ambiente configuradas no Vercel
- [ ] CORS configurado no Supabase
- [ ] RLS configurado corretamente (automático pelo schema)
- [ ] Testado localmente com `npm run build && npm run preview`
- [ ] Build passa sem erros no Vercel
- [ ] Aplicação funcionando no Vercel

## 🆘 Ainda com Problemas?

1. Verifique os logs do Vercel
2. Verifique o console do navegador
3. Teste localmente primeiro
4. Verifique se o Supabase está acessível
5. Abra uma issue no GitHub com os erros encontrados

