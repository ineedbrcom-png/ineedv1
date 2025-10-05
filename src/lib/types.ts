
// src/lib/types.ts

/**
 * Representa o autor de um anúncio (listing).
 * Contém um subconjunto de informações do perfil completo do usuário.
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
  id: string;          // O slug da categoria, usado como ID único
  name: string;        // O nome de exibição da categoria
  slug: string;        // O slug para uso em URLs
  iconName: string;    // O nome do ícone (de lucide-react) a ser usado
  type: 'product' | 'service'; // O tipo da categoria
  subcategories: any[]; // Reservado para futuras implementações
}

/**
 * Representa um único anúncio ou "pedido" na plataforma.
 * Esta é a estrutura de dados principal usada no lado do cliente.
 */
export interface Listing {
  id: string;
  title: string;
  description: string;
  budget: number;
  categoryId: string;
  category: Category; // Objeto da categoria aninhado para fácil acesso no cliente
  location: string;
  authorId: string;
  author: ListingAuthor; // Objeto do autor aninhado
  createdAt: any; // Idealmente, seria `FirebaseFirestore.Timestamp`
  imageUrls?: string[];
  status: 'publicado' | 'pendente' | 'revisao' | 'rejeitado';
}

/**
 * Representa o cursor para paginação de anúncios, que é o último documento da página anterior.
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
