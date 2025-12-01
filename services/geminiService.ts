import { GoogleGenAI } from "@google/genai";

// Usar import.meta.env que é o padrão do Vite (não process.env)
// Vite expõe automaticamente variáveis que começam com VITE_
// Mas para GEMINI_API_KEY, precisamos usar o define do vite.config.ts
const apiKey = import.meta.env.GEMINI_API_KEY || 
               (typeof process !== 'undefined' && process.env && process.env.GEMINI_API_KEY) || '';

// Initialize Gemini com lazy initialization para evitar problemas de ordem
let ai: GoogleGenAI | null = null;

const getAI = (): GoogleGenAI | null => {
  if (!ai && apiKey) {
    try {
      ai = new GoogleGenAI({ apiKey });
    } catch (error) {
      console.error('❌ Erro ao inicializar Gemini AI:', error);
    }
  }
  return ai;
};

const SYSTEM_PROMPT = "Você é um assistente criativo e especialista para a 'YasminAromas', uma empresa de velas aromáticas artesanais. Suas respostas devem ser úteis, inspiradoras, orientadas a pequenos negócios e sempre em Português do Brasil. Use emojis apenas quando fizer sentido.";

export const generateCreativeContent = async (prompt: string): Promise<string> => {
  if (!prompt || !prompt.trim()) {
    throw new Error('Envie uma mensagem para o assistente.');
  }

  const aiInstance = getAI();
  
  if (!aiInstance) {
    throw new Error('Chave de API do Gemini não configurada. Defina GEMINI_API_KEY para usar o assistente.');
  }

  try {
    const response = await aiInstance.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }],
        },
      ],
      systemInstruction: {
        role: 'system',
        parts: [{ text: SYSTEM_PROMPT }],
      },
    });

    const text = response.text?.trim();
    if (text) {
      return text;
    }

    throw new Error('A IA não retornou nenhuma resposta.');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro desconhecido ao consultar o Gemini.';
    throw new Error(message);
  }
};