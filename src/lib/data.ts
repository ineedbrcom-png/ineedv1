
import type { LucideIcon } from "lucide-react";

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: LucideIcon;
  type: 'product' | 'service';
  subcategories: string[];
}

export interface User {
    id: string;
    name: string;
    avatarId: string;
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
  author: User;
  imageUrls: string[];
  authorId: string;
  createdAt: any;
  categoryId: string;
}

export interface ConversationParticipant {
    id: string;
    name: string;
    avatarId: string;
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
  images?: string[];
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

// This is now a mock for a logged out user or as a base for a real user.
export const currentUser = {
  name: "Emily Carter",
  email: "emily.carter@example.com",
  avatarId: "avatar-1",
  joinDate: "2023-05-15",
  skills: ["Product Management", "UX/UI Design", "Market Research"],
  about: "I'm a product manager passionate about creating user-centric digital experiences. In my free time, I'm often looking for creative professionals to collaborate on side projects.",
  isEmailVerified: true,
  isPhoneVerified: true,
  isDocumentVerified: false,
  rating: 4.8,
  reviewCount: 57,
};

export const conversations: Conversation[] = [];
export const messages: Message[] = [];
