<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# 🌸 YasminAromas Manager

Sistema completo de gestão para negócios de velas aromáticas artesanais. Gerencie vendas, estoque, encomendas, produtos e muito mais com uma interface moderna e intuitiva.

[![React](https://img.shields.io/badge/React-19.2.0-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.2-blue)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Enabled-green)](https://supabase.com/)
[![Vite](https://img.shields.io/badge/Vite-6.2.0-purple)](https://vitejs.dev/)

## ✨ Funcionalidades

### 📊 Gestão de Vendas
- Registro completo de vendas com carrinho de compra
- Baixa automática no estoque ao finalizar venda
- Dashboard com gráficos de tendência e métricas
- Análise de faturamento por período
- Top produtos mais vendidos
- Filtros por data e busca por cliente/produto

### 📦 Controle de Estoque
- Cadastro de itens com categorias personalizadas
- Alertas de estoque baixo
- Edição e exclusão de itens
- Busca e filtros por categoria
- Unidades de medida flexíveis (kg, g, l, ml, un)

### 🛍️ Gestão de Produtos
- Cadastro de produtos com receitas
- Precificação automática baseada em receitas
- Baixa automática de ingredientes ao vender
- Edição e exclusão de produtos
- Busca de produtos

### 📋 Encomendas
- Sistema Kanban para acompanhamento de encomendas
- Status: Pendente, Em Produção, Concluído, Entregue
- Prazos e valores estimados
- Busca e filtros por status
- Edição e exclusão de encomendas

### 🧮 Calculadora de Custos
- Cálculo de custo unitário de materiais
- Conversão automática de unidades
- Precificação com margem de lucro configurável
- Composição de produtos com múltiplos materiais

### 🤖 Assistente IA
- Assistente criativo integrado com Gemini 2.5
- Ideias para nomes de produtos
- Descrições para redes sociais
- Dicas de produção e negócios

### ☁️ Sincronização em Nuvem
- Integração com Supabase para backup automático
- Sincronização bidirecional
- Migração automática de dados locais
- Fallback para localStorage quando offline

### 🎨 Interface Moderna
- Design responsivo (mobile-first)
- Sistema de notificações toast
- Feedback visual em todas as operações
- Animações suaves
- Tema personalizado com cores da marca

## 🚀 Tecnologias

- **React 19.2.0** - Biblioteca UI
- **TypeScript 5.8.2** - Tipagem estática
- **Vite 6.2.0** - Build tool e dev server
- **Supabase** - Backend as a Service (BaaS)
- **Recharts** - Gráficos e visualizações
- **Lucide React** - Ícones modernos
- **Tailwind CSS** - Estilização utilitária
- **Google Gemini AI** - Assistente inteligente

## 📋 Pré-requisitos

- Node.js 18+ instalado
- Conta no Supabase (opcional, mas recomendado)
- Chave de API do Google Gemini (para o Assistente IA)

## 🔧 Instalação

1. **Clone o repositório:**
```bash
git clone https://github.com/jatoloko/YasminAromas-GoogleAiStudio.git
cd YasminAromas-GoogleAiStudio
```

2. **Instale as dependências:**
```bash
npm install
```

3. **Configure as variáveis de ambiente:**

Crie um arquivo `.env.local` na raiz do projeto:

```env
# Google Gemini API (para Assistente IA)
GEMINI_API_KEY=sua_chave_aqui

# Supabase (opcional, mas recomendado)
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_anon_aqui
```

4. **Configure o Supabase (opcional):**

Veja as instruções detalhadas em [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)

5. **Execute o projeto:**
```bash
npm run dev
```

O aplicativo estará disponível em `http://localhost:3000`

## 📁 Estrutura do Projeto

```
YasminAromas-GoogleAiStudio/
├── components/          # Componentes React
│   ├── SalesTab.tsx     # Gestão de vendas
│   ├── InventoryTab.tsx # Controle de estoque
│   ├── ProductsTab.tsx  # Gestão de produtos
│   ├── OrdersTab.tsx    # Encomendas
│   ├── ConverterTab.tsx # Calculadora de custos
│   ├── AIAssistantTab.tsx # Assistente IA
│   └── Toast.tsx        # Componente de notificação
├── contexts/            # Contextos React
│   └── ToastContext.tsx # Contexto de notificações
├── services/            # Serviços
│   ├── storageService.ts    # Gerenciamento de dados
│   ├── supabaseService.ts   # Integração Supabase
│   └── geminiService.ts     # Integração Gemini AI
├── types.ts             # Definições TypeScript
├── App.tsx              # Componente principal
├── index.tsx            # Entry point
└── supabase-schema.sql  # Schema do banco de dados
```

## 🎯 Como Usar

### Primeira Vez

1. **Configure o Supabase** (recomendado):
   - Execute o script SQL em `supabase-schema.sql` no SQL Editor do Supabase
   - Adicione as credenciais no `.env.local`

2. **Cadastre seus itens de estoque:**
   - Vá em "Controle de Estoque"
   - Adicione os materiais que você usa (cera, essências, etc.)

3. **Cadastre seus produtos:**
   - Vá em "Meus Produtos"
   - Crie produtos e defina suas receitas (quanto de cada material é usado)

4. **Comece a vender:**
   - Vá em "Minhas Vendas"
   - Adicione produtos ao carrinho
   - O estoque será baixado automaticamente!

### Funcionalidades Principais

- **Vendas**: Registre vendas e acompanhe faturamento em tempo real
- **Estoque**: Monitore seus materiais e receba alertas de estoque baixo
- **Encomendas**: Organize pedidos em um sistema Kanban visual
- **Calculadora**: Calcule o custo real dos seus produtos
- **IA**: Peça ajuda criativa para nomes, descrições e ideias

## 🔐 Segurança

- Autenticação via Supabase Auth (email + senha) com Row Level Security por usuário
- Dados armazenados localmente no navegador (localStorage) para feedback instantâneo
- Sincronização com Supabase garante backup na nuvem
- Nenhuma informação sensível é compartilhada publicamente
- API keys devem ser mantidas em `.env.local` (não commitadas)

## 📱 Responsividade

O aplicativo é totalmente responsivo e funciona perfeitamente em:
- 💻 Desktop
- 📱 Tablets
- 📱 Smartphones

## 🛠️ Scripts Disponíveis

```bash
npm run dev      # Inicia servidor de desenvolvimento
npm run build    # Cria build de produção
npm run preview  # Preview do build de produção
```

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para:

1. Fazer fork do projeto
2. Criar uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abrir um Pull Request

## 📝 Licença

Este projeto é de uso pessoal/privado.

## 🔗 Links Úteis

- [AI Studio](https://ai.studio/apps/drive/1fjIVfMJm2qTM_zOseimvhgELWcld5DDU) - Versão no Google AI Studio
- [Supabase](https://supabase.com) - Documentação do Supabase
- [Google Gemini](https://ai.google.dev) - Documentação do Gemini AI

## 📞 Suporte

Para dúvidas ou problemas, abra uma [issue](https://github.com/jatoloko/YasminAromas-GoogleAiStudio/issues) no GitHub.

---

<div align="center">
Feito com ❤️ para YasminAromas
</div>
