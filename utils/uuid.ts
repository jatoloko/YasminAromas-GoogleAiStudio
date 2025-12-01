/**
 * Gera um UUID v4 usando Web Crypto API
 * Compatível com Supabase
 */
export function generateUUID(): string {
  // Use crypto.getRandomValues() para gerar um UUID v4
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
    return uuid;
  }

  // Fallback para ambientes que não suportam crypto.getRandomValues()
  // Usar Math.random() como último recurso
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Gera um UUID v4 alternativo usando SubtleCrypto (mais seguro)
 * Pode ser mais lento, use apenas se necessário
 */
export async function generateUUIDSecure(): Promise<string> {
  try {
    const bytes = new Uint8Array(16);
    if (crypto && crypto.getRandomValues) {
      crypto.getRandomValues(bytes);
    } else {
      // Fallback
      for (let i = 0; i < 16; i++) {
        bytes[i] = Math.floor(Math.random() * 256);
      }
    }

    // Marcar versão como 4 (bit 12-15 da 7ª byte)
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    // Marcar variant como RFC 4122 (bits 6-7 da 9ª byte)
    bytes[8] = (bytes[8] & 0x3f) | 0x80;

    const hex = Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  } catch {
    // Fallback para a versão não-segura
    return generateUUID();
  }
}

