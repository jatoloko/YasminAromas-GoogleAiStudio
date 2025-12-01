import React, { useState } from 'react';
import { Sparkles, Send, Bot, User } from 'lucide-react';
import { generateCreativeContent } from '../services/geminiService';
import { useToast } from '../contexts/ToastContext';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const AIAssistantTab: React.FC = () => {
  const toast = useToast();
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Olá! Sou seu assistente criativo da YasminAromas. Posso ajudar com ideias de nomes para velas, descrições para Instagram, ou dúvidas sobre produção. Como posso ajudar hoje?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await generateCreativeContent(userMessage);
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Não foi possível obter uma resposta da IA.';
      toast.showError(message);
      setMessages(prev => [...prev, { role: 'assistant', content: `⚠️ ${message}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="h-[calc(100vh-200px)] flex flex-col bg-white rounded-xl shadow-sm border border-brand-100 overflow-hidden">
      <div className="bg-brand-50 p-4 border-b border-brand-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="text-brand-500" />
          <h2 className="font-bold text-brand-900">Yasmin IA - Assistente Criativo</h2>
        </div>
        <span className="text-xs bg-brand-200 text-brand-800 px-2 py-1 rounded-full font-medium">Gemini 2.5 Powered</span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex max-w-[80%] gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-gray-200' : 'bg-brand-100'}`}>
                {msg.role === 'user' ? <User size={16} className="text-gray-600" /> : <Bot size={16} className="text-brand-600" />}
              </div>
              <div className={`p-4 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                msg.role === 'user' 
                  ? 'bg-gray-800 text-white rounded-tr-none' 
                  : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none shadow-sm'
              }`}>
                {msg.content}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex w-full justify-start">
            <div className="flex max-w-[80%] gap-3">
              <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0">
                <Sparkles size={16} className="text-brand-600 animate-pulse" />
              </div>
              <div className="p-4 bg-white border border-gray-200 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2">
                <span className="w-2 h-2 bg-brand-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-2 h-2 bg-brand-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-2 h-2 bg-brand-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-white border-t border-gray-100">
        <div className="flex gap-2 relative">
          <input
            type="text"
            className="w-full bg-white text-gray-900 border border-gray-300 rounded-xl pl-4 pr-12 py-3 focus:ring-2 focus:ring-brand-400 outline-none transition-shadow"
            placeholder="Peça uma ideia de aroma, legenda para post, ou dica..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="absolute right-2 top-2 bg-brand-500 text-white p-1.5 rounded-lg hover:bg-brand-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIAssistantTab;