
import type { LucideIcon } from "lucide-react";
import { allCategories } from "./categories";


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
  description: string;
  budget: number;
  location: string;
  category: Category;
  author: User;
  imageId: string;
}

export interface Conversation {
  id: string;
  userName: string;
  userAvatarId: string;
  listingTitle: string;
  lastMessage: string;
  timestamp: string;
  unread: boolean;
}

export interface Message {
  id: string;
  type: 'user' | 'system' | 'proposal';
  content: string;
  sender: 'me' | 'them';
  timestamp: string;
  read?: boolean;
  proposalDetails?: Proposal;
  images?: string[];
}

export interface Proposal {
    value: number;
    deadline: string;
    conditions: string;
    status: 'pending' | 'accepted' | 'rejected';
}

const users: User[] = [
    { id: 'user-1', name: "Alice", avatarId: "avatar-2", rating: 4.8, reviewCount: 15 },
    { id: 'user-2', name: "Bob", avatarId: "avatar-3", rating: 4.5, reviewCount: 8 },
    { id: 'user-3', name: "Charlie", avatarId: "avatar-4", rating: 5.0, reviewCount: 22 },
    { id: 'user-4', name: "Diana", avatarId: "avatar-5", rating: 4.2, reviewCount: 5 },
    { id: 'user-5', name: "Frank", avatarId: "avatar-2", rating: 4.8, reviewCount: 15 },
    { id: 'user-6', name: "Grace", avatarId: "avatar-3", rating: 4.5, reviewCount: 8 },
]


export const listings: Listing[] = [
  {
    id: "1",
    title: "Preciso de um notebook com 8GB de RAM",
    description:
      "Busco um notebook com pelo menos 8GB de RAM e SSD para trabalho com edição de vídeo. Preferência por marcas conhecidas e em bom estado.",
    budget: 2500,
    location: "São Paulo, SP",
    category: allCategories.find(c => c.slug === 'tecnologia')!,
    author: users.find(u => u.name === 'Alice')!,
    imageId: "listing-1",
  },
  {
    id: "2",
    title: "Ajuda com manutenção semanal de jardim",
    description:
      "Meu jardim está precisando de cuidados. Preciso de alguém uma vez por semana para aparar a grama, podar e manter tudo em ordem. Jardim de aprox. 50m².",
    budget: 150,
    location: "Curitiba, PR",
    category: allCategories.find(c => c.slug === 'jardinagem')!,
    author: users.find(u => u.name === 'Bob')!,
    imageId: "listing-2",
  },
  {
    id: "3",
    title: "Desenvolvedor para criar landing page responsiva",
    description:
      "Procuro desenvolvedor experiente para criar uma landing page para meu novo software. Design no Figma já está pronto. Deve ser em Next.js e Tailwind.",
    budget: 1800,
    location: "Remoto",
    category: allCategories.find(c => c.slug === 'ti')!,
    author: users.find(u => u.name === 'Charlie')!,
    imageId: "listing-3",
  },
  {
    id: "4",
    title: "Aulas particulares de Espanhol para iniciante",
    description:
      "Quero aprender espanhol para uma viagem. Procuro tutor para 2-3 aulas por semana. Sou iniciante, então preciso de alguém com paciência!",
    budget: 50,
    location: "Miami, FL",
    category: allCategories.find(c => c.slug === 'aulas')!,
    author: users.find(u => u.name === 'Diana')!,
    imageId: "listing-4",
  },
  {
    id: "5",
    title: "Sofá de 3 lugares em bom estado",
    description:
      "Estou procurando um sofá de 3 lugares para minha sala. Pode ser usado, mas precisa estar em boas condições, sem rasgos ou manchas grandes.",
    budget: 700,
    location: "Rio de Janeiro, RJ",
    category: allCategories.find(c => c.slug === 'moveis-e-eletro')!,
    author: users.find(u => u.name === 'Frank')!,
    imageId: "listing-2",
  },
  {
    id: "6",
    title: "Tênis de corrida masculino, tamanho 42",
    description:
      "Busco tênis para corrida, de preferência das marcas Nike, Adidas ou Asics. Pode ser pouco usado, mas em bom estado de conservação.",
    budget: 200,
    location: "Belo Horizonte, MG",
    category: allCategories.find(c => c.slug === 'moda')!,
    author: users.find(u => u.name === 'Grace')!,
    imageId: "listing-1",
  },
];

export const popularTags = [
  "urgente",
  "remoto",
  "iniciante",
  "design-grafico",
  "react",
  "tempo-integral",
  "meio-periodo",
];

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

export const conversations: Conversation[] = [
  {
    id: '1',
    userName: 'Tech Solutions',
    userAvatarId: 'avatar-2',
    listingTitle: 'Re: Notebook para trabalho',
    lastMessage: 'Ok, o modelo XYZ que eu tenho tem i5, 8GB RAM e...',
    timestamp: '13:45',
    unread: true,
  },
  {
    id: '2',
    userName: 'Notebooks Usados SP',
    userAvatarId: 'avatar-3',
    listingTitle: 'Re: Notebook para trabalho',
    lastMessage: 'Obrigado pelo orçamento! Vou analisar e...',
    timestamp: 'Ontem',
    unread: false,
  },
  {
    id: '3',
    userName: 'Juliana C.',
    userAvatarId: 'avatar-4',
    listingTitle: 'Re: Instalação de Prateleiras',
    lastMessage: 'Perfeito, vou aguardar sua visita amanhã',
    timestamp: '15/10',
    unread: false,
  },
];

export const messages: Message[] = [
  {
    id: '1',
    type: 'system',
    content: 'Roger Ruviaro enviou uma proposta de R$ 2.500,00 em 14 de Setembro, 2025.',
    sender: 'me',
    timestamp: '',
  },
  {
    id: '2',
    type: 'user',
    content: 'Olá Roger! Tenho um Dell Inspiron 15 5000 com as especificações que você precisa. i5, 8GB RAM, SSD 256GB e placa MX150.',
    sender: 'them',
    timestamp: '10:30 AM',
    read: true,
  },
  {
    id: '3',
    type: 'user',
    content: 'Ótimo! Pode me enviar fotos do notebook? E qual o preço?',
    sender: 'me',
    timestamp: '10:32 AM',
  },
  {
    id: '4',
    type: 'user',
    content: 'Aqui estão algumas fotos. O preço seria R$ 2.800,00 mas podemos negociar.',
    sender: 'them',
    timestamp: '10:33 AM',
    read: true,
    images: ['listing-3', 'listing-1']
  },
  {
    id: '5',
    type: 'proposal',
    content: '',
    sender: 'me',
    timestamp: '',
    proposalDetails: {
      value: 2500,
      deadline: '3 dias úteis',
      conditions: 'Garantia de 3 meses',
      status: 'pending',
    },
  },
  {
    id: '6',
    type: 'user',
    content: 'O prazo de 3 dias está ótimo, mas podemos fechar em R$ 2.300,00 considerando que o modelo é de 2022?',
    sender: 'me',
    timestamp: '10:37 AM',
  },
  {
    id: '7',
    type: 'user',
    content: 'Podemos ajustar para R$ 2.400,00 final. O que acha?',
    sender: 'them',
    timestamp: '10:40 AM',
    read: true,
  }
];
