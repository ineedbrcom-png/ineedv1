
import type { LucideIcon } from "lucide-react";
import type { Timestamp } from "firebase/firestore";

export interface Category {
  id: string;
  name: string;
  slug: string;
  iconName: string; // Changed from icon: LucideIcon
  type: 'product' | 'service';
  subcategories: string[];
}

export interface User {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  about?: string;
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
  skills?: string[];
  createdAt: Timestamp;
  rating: number;
  reviewCount: number;
  isPhoneVerified?: boolean;
  isDocumentVerified?: boolean;
}

export interface ListingAuthor {
    id: string;
    name: string;
    photoURL?: string;
    rating: number;
    reviewCount: number;
}

export interface Listing {
  id: string;
  title: string;
  description:string;
  budget: number;
  location: string;
  category: Category;
  author: ListingAuthor;
  imageUrls: string[];
  authorId: string;
  createdAt: any;
  categoryId: string;
  status: 'pending_review' | 'approved' | 'rejected';
}

export interface ConversationParticipant {
    id: string;
    name: string;
    photoURL?: string;
}

export interface Conversation {
  id: string;
  participants: string[];
  participantsDetails: ConversationParticipant[];
  listingId: string;
  listingAuthorId: string;
  listingTitle: string;
  lastMessage: string;
  lastMessageTimestamp: any;
  unreadBy: string[];
  contractAccepted: boolean;
  status: 'open' | 'completed';
  reviewedBy: string[];
}

export interface Message {
  id: string;
  conversationId: string;
  type: 'user' | 'system' | 'proposal' | 'contract' | 'contact_details' | 'review_prompt';
  content: string;
  sender: string; // user.uid
  timestamp: any;
  read?: boolean;
  proposalDetails?: Proposal;
  contractDetails?: Contract;
  contactDetails?: ContactDetails;
  imageUrls?: string[];
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

export interface Review {
    rating: number;
    comment: string;
    fromUserId: string;
    toUserId: string;
    conversationId: string;
    createdAt: any;
}


// Mock data below is for reference and prototyping.
// Active data is now fetched from Firestore.

export const listings: Listing[] = [];

export const popularTags = [
  "urgente",
  "remoto",
  "iniciante",
  "design-grafico",
  "react",
  "tempo-integral",
  "meio-periodo",
];

export const conversations: Conversation[] = [];
export const messages: Message[] = [];

    
