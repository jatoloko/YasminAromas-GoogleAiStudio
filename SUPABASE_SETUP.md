# Configuração do Supabase

## Passo 1: Executar o Schema SQL

1. Acesse o painel do Supabase: https://kenpfnkivygilaknxyql.supabase.co
2. Vá para **SQL Editor**
3. Copie e cole o conteúdo do arquivo `supabase-schema.sql`
4. Execute o script

## Passo 2: Configurar Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto com:

```
VITE_SUPABASE_URL=https://kenpfnkivygilaknxyql.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtlbnBmbmtpdnlnaWxha254eXFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1NzQ3NzEsImV4cCI6MjA4MDE1MDc3MX0.LN8Kig1gxMvydoFv2x4p6nYVqMYKRGfOhaKMDubJDCI
```

## Passo 3: Reiniciar o Servidor

Após criar o `.env.local`, reinicie o servidor de desenvolvimento:

```bash
npm run dev
```

## Como Funciona

- O sistema usa **Supabase como fonte primária** de dados
- **localStorage** é usado como fallback e cache local
- Na primeira execução, os dados do localStorage são migrados automaticamente para o Supabase
- Todas as operações são sincronizadas automaticamente

## Troubleshooting

Se o Supabase não estiver disponível, o sistema continuará funcionando apenas com localStorage.

