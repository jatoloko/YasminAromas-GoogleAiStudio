/**
 * Funções de validação reutilizáveis
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

// Validações para vendas
export const validateSale = {
  customerName: (value: string): ValidationResult => {
    if (!value || value.trim().length === 0) {
      return { isValid: false, error: 'Nome do cliente é obrigatório' };
    }
    if (value.length < 2) {
      return { isValid: false, error: 'Nome deve ter pelo menos 2 caracteres' };
    }
    return { isValid: true };
  },

  totalValue: (value: number | string): ValidationResult => {
    if (value === '' || value === 0) {
      return { isValid: false, error: 'Valor total é obrigatório' };
    }
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(num) || num <= 0) {
      return { isValid: false, error: 'Valor deve ser maior que zero' };
    }
    return { isValid: true };
  },

  date: (value: string): ValidationResult => {
    if (!value) {
      return { isValid: false, error: 'Data é obrigatória' };
    }
    return { isValid: true };
  },
};

// Validações para inventário
export const validateInventory = {
  name: (value: string): ValidationResult => {
    if (!value || value.trim().length === 0) {
      return { isValid: false, error: 'Nome do item é obrigatório' };
    }
    if (value.length < 2) {
      return { isValid: false, error: 'Nome deve ter pelo menos 2 caracteres' };
    }
    return { isValid: true };
  },

  quantity: (value: number | string): ValidationResult => {
    if (value === '') {
      return { isValid: false, error: 'Quantidade é obrigatória' };
    }
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(num) || num < 0) {
      return { isValid: false, error: 'Quantidade não pode ser negativa' };
    }
    return { isValid: true };
  },

  minThreshold: (value: number | string): ValidationResult => {
    if (value === '') {
      return { isValid: true }; // Opcional
    }
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(num) || num < 0) {
      return { isValid: false, error: 'Limite mínimo não pode ser negativo' };
    }
    return { isValid: true };
  },
};

// Validações para produtos
export const validateProduct = {
  name: (value: string): ValidationResult => {
    if (!value || value.trim().length === 0) {
      return { isValid: false, error: 'Nome do produto é obrigatório' };
    }
    if (value.length < 2) {
      return { isValid: false, error: 'Nome deve ter pelo menos 2 caracteres' };
    }
    return { isValid: true };
  },

  price: (value: number | string): ValidationResult => {
    if (value === '') {
      return { isValid: false, error: 'Preço é obrigatório' };
    }
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(num) || num <= 0) {
      return { isValid: false, error: 'Preço deve ser maior que zero' };
    }
    return { isValid: true };
  },
};

// Validações para encomendas
export const validateOrder = {
  customerName: (value: string): ValidationResult => {
    if (!value || value.trim().length === 0) {
      return { isValid: false, error: 'Nome do cliente é obrigatório' };
    }
    return { isValid: true };
  },

  description: (value: string): ValidationResult => {
    if (!value || value.trim().length === 0) {
      return { isValid: false, error: 'Descrição é obrigatória' };
    }
    if (value.length < 5) {
      return { isValid: false, error: 'Descrição deve ter pelo menos 5 caracteres' };
    }
    return { isValid: true };
  },

  deadline: (value: string): ValidationResult => {
    if (!value) {
      return { isValid: false, error: 'Prazo é obrigatório' };
    }
    const date = new Date(value);
    if (date < new Date()) {
      return { isValid: false, error: 'Prazo não pode ser no passado' };
    }
    return { isValid: true };
  },

  estimatedValue: (value: number | string): ValidationResult => {
    if (value === '') {
      return { isValid: true }; // Opcional
    }
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(num) || num < 0) {
      return { isValid: false, error: 'Valor não pode ser negativo' };
    }
    return { isValid: true };
  },
};

// Validações para login
export const validateAuth = {
  username: (value: string): ValidationResult => {
    if (!value || value.trim().length === 0) {
      return { isValid: false, error: 'Nome de usuário é obrigatório' };
    }
    if (value.length < 3) {
      return { isValid: false, error: 'Nome de usuário deve ter pelo menos 3 caracteres' };
    }
    if (value.length > 20) {
      return { isValid: false, error: 'Nome de usuário não pode exceder 20 caracteres' };
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(value)) {
      return { isValid: false, error: 'Nome de usuário pode conter apenas letras, números, _ e -' };
    }
    return { isValid: true };
  },

  password: (value: string): ValidationResult => {
    if (!value || value.length === 0) {
      return { isValid: false, error: 'Senha é obrigatória' };
    }
    if (value.length < 6) {
      return { isValid: false, error: 'Senha deve ter pelo menos 6 caracteres' };
    }
    if (value.length > 50) {
      return { isValid: false, error: 'Senha não pode exceder 50 caracteres' };
    }
    return { isValid: true };
  },

  email: (value: string): ValidationResult => {
    if (!value || value.trim().length === 0) {
      return { isValid: false, error: 'E-mail é obrigatório' };
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value.toLowerCase())) {
      return { isValid: false, error: 'Informe um e-mail válido' };
    }
    return { isValid: true };
  },
};

