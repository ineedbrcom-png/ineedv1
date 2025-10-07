
// src/lib/types.ts

/**
 * Representa uma subcategoria dentro de uma categoria principal.
 */
export interface Subcategory {
  id: string;
  name: string;
  slug: string;
}

/**
 * Representa o autor de um anúncio (listing).
 */
export interface ListingAuthor {
  id: string;
  name: string;
  photoURL?: string;
  rating: number;
  reviewCount: number;
}

/**
 * Representa uma categoria de produto ou serviço.
 */
export interface Category {
  id: string;
  name: string;
  slug: string;
  iconName: string;
  type: 'product' | 'service';
  subcategories: Subcategory[]; // ATUALIZADO para usar o novo tipo
}

/**
 * Representa um único anúncio ou "pedido" na plataforma.
 */
export interface Listing {
  id: string;
  title: string;
  description: string;
  budget: number;
  categoryId: string;
  subcategoryId?: string; // NOVO: Adicionado campo para a subcategoria
  category?: Category;
  location: string;
  authorId: string;
  author: ListingAuthor;
  createdAt: string; 
  imageUrls?: string[];
  status: 'publicado' | 'pendente' | 'revisao' | 'rejeitado';
}

/**
 * Representa o cursor para paginação de anúncios.
 */
export type ListingCursor = import("firebase/firestore").QueryDocumentSnapshot<
  import("firebase/firestore").DocumentData
> | null;

/**
 * Define os filtros que podem ser aplicados ao buscar por anúncios.
 */
export interface ListingFilters {
  categoryId?: string;
  maxBudget?: number;
}
