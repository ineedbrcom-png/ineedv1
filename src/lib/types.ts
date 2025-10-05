// src/lib/types.ts

import type { Timestamp } from "firebase/firestore";

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
  createdAt: string; // Serializado como string ISO
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


export interface User {
    uid: string;
    displayName: string;
    email: string;
    photoURL?: string;
    phone?: string;
    cpf?: string;
    address?: {
        cep: string;
        street: string;
        number: string;
        neighborhood: string;
        city: string;
        state: string;
    };
    createdAt: Timestamp;
    rating: number;
    reviewCount: number;
    isPhoneVerified: boolean;
    isDocumentVerified: boolean;
    skills?: string[];
    about?: string;
}

export interface Conversation {
    id: string;
    participants: string[];
    participantsDetails: { id: string; name: string; photoURL: string }[];
    listingId: string;
    listingAuthorId: string;
    listingTitle: string;
    lastMessage: string;
    lastMessageTimestamp: Timestamp;
    unreadBy: string[];
    contractAccepted: boolean;
    status: 'open' | 'completed';
    reviewedBy: string[];
}

export interface Message {
    id: string;
    conversationId: string;
    content: string;
    sender: string;
    timestamp: Timestamp;
    type: 'user' | 'system' | 'proposal' | 'contract' | 'contact_details' | 'review_prompt';
    read: boolean;
    imageUrls?: string[];
    proposalDetails?: Proposal;
    contractDetails?: Contract;
    contactDetails?: ContactDetails;
}

export interface Proposal {
    value: number;
    deadline: string;
    conditions: string;
    status: 'pending' | 'accepted' | 'rejected';
}

export interface Contract {
    value: number;
    terms: string;
    status: 'pending' | 'accepted' | 'rejected';
}

export interface ContactDetails {
    name: string;
    phone: string;
    address: string;
    location: string;
}
