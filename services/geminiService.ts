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
      console.log('✅ Gemini AI inicializado com sucesso');
    } catch (error) {
      console.error('❌ Erro ao inicializar Gemini AI:', error);
    }
  }
  return ai;
};

export const generateCreativeContent = async (prompt: string): Promise<string> => {
  const aiInstance = getAI();
  
  if (!aiInstance) {
    return "Erro: Chave de API não configurada. Por favor, configure a variável de ambiente GEMINI_API_KEY.";
  }

  try {
    const response = await aiInstance.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: "Você é um assistente criativo e especialista para a 'YasminAromas', uma empresa de velas aromáticas artesanais. Suas respostas devem ser úteis, inspiradoras e focadas em negócios de artesanato. Use emojis ocasionalmente. Responda em Português do Brasil.",
      }
    });
    return response.text || "Não foi possível gerar uma resposta.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Desculpe, ocorreu um erro ao consultar a IA. Tente novamente mais tarde.";
  }
};