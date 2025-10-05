
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Função para converter uma string em um formato de slug amigável para URL
export function sluggify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD') // Normaliza para decompor caracteres acentuados
    .replace(/[\u0300-\u036f]/g, '') // Remove os acentos
    .replace(/\s+/g, '-') // Substitui espaços por hífens
    .replace(/&/g, '-e-') // Substitui & por '-e-'
    .replace(/[^\w\-]+/g, '') // Remove todos os caracteres não-alfanuméricos, exceto hífens
    .replace(/\-\-+/g, '-') // Substitui múltiplos hífens por um único
    .replace(/^-+/, '') // Remove hífens do início
    .replace(/-+$/, ''); // Remove hífens do fim
}
