import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ToastProvider } from './contexts/ToastContext';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

// Error boundary para capturar erros
try {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <ToastProvider>
        <App />
      </ToastProvider>
    </React.StrictMode>
  );
} catch (error) {
  console.error('Erro ao renderizar aplicação:', error);
  rootElement.innerHTML = `
    <div style="padding: 20px; text-align: center;">
      <h1>Erro ao carregar aplicação</h1>
      <p>Por favor, verifique o console para mais detalhes.</p>
      <pre>${error instanceof Error ? error.message : String(error)}</pre>
    </div>
  `;
}