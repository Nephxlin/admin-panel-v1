import { API_URL } from './axios';

/**
 * Converte um caminho de imagem em URL completa
 * Se já for uma URL completa (começa com http), retorna como está
 * Senão, adiciona o prefixo do API_URL/uploads/
 */
export function getImageUrl(path: string | null | undefined): string {
  if (!path) return '';
  
  // Se já for uma URL completa, retorna como está
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  
  // Remove /uploads/ do início se existir para evitar duplicação
  const cleanPath = path.startsWith('uploads/') ? path.substring(8) : path;
  const cleanPath2 = cleanPath.startsWith('/uploads/') ? cleanPath.substring(9) : cleanPath;
  
  // Constrói a URL completa
  return `${API_URL}/uploads/${cleanPath2}`;
}

/**
 * Adiciona cache buster à URL da imagem
 */
export function getImageUrlWithCache(path: string | null | undefined, cacheBuster?: number | string): string {
  const url = getImageUrl(path);
  if (!url) return '';
  
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}v=${cacheBuster || Date.now()}`;
}

