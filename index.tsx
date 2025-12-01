import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ToastProvider } from './contexts/ToastContext';
import { AuthProvider } from './contexts/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';

const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error('❌ Elemento root não encontrado!');
  document.body.innerHTML = `
    <div style="padding: 20px; text-align: center; font-family: sans-serif;">
      <h1 style="color: red;">Erro Crítico</h1>
      <p>Elemento #root não encontrado no DOM.</p>
    </div>
  `;
  throw new Error("Could not find root element to mount to");
}

try {
  const root = ReactDOM.createRoot(rootElement);
  
  root.render(
    <ErrorBoundary>
      <AuthProvider>
        <ToastProvider>
          <App />
        </ToastProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
} catch (error) {
  console.error('❌ Erro ao renderizar aplicação:', error);
  
  rootElement.innerHTML = `
    <div style="padding: 20px; text-align: center; font-family: sans-serif; max-width: 600px; margin: 50px auto;">
      <h1 style="color: #e11d48; margin-bottom: 20px;">Erro ao carregar aplicação</h1>
      <p style="color: #6b7280; margin-bottom: 20px;">
        Ocorreu um erro ao inicializar a aplicação. Por favor, verifique o console do navegador (F12) para mais detalhes.
      </p>
      <details style="text-align: left; background: #f3f4f6; padding: 15px; border-radius: 8px; margin-top: 20px;">
        <summary style="cursor: pointer; font-weight: bold; margin-bottom: 10px;">Detalhes do erro</summary>
        <pre style="white-space: pre-wrap; font-size: 12px; color: #374151;">
${error instanceof Error ? error.message + '\n\n' + error.stack : String(error)}
        </pre>
      </details>
      <button 
        onclick="window.location.reload()" 
        style="margin-top: 20px; padding: 10px 20px; background: #f43f5e; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: bold;"
      >
        Recarregar Página
      </button>
    </div>
  `;
}