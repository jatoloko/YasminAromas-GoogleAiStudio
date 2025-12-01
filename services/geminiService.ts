import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || '';

// Initialize Gemini
// We only initialize if key is present to avoid immediate errors, 
// though actual calls will fail gracefully if key is missing.
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({ apiKey });
}

export const generateCreativeContent = async (prompt: string): Promise<string> => {
  if (!ai) {
    return "Erro: Chave de API não configurada. Por favor, configure a variável de ambiente API_KEY.";
  }

  try {
    const response = await ai.models.generateContent({
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
