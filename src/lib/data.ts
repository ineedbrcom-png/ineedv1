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

export interface Listing {
  id: string;
  title: string;
  description: string;
  budget: number;
  location: string;
  category: Category;
  author: {
    name: string;
    avatarId: string;
  };
  imageId: string;
}

export const listings: Listing[] = [
  {
    id: "1",
    title: "Preciso de um notebook com 8GB de RAM",
    description:
      "Busco um notebook com pelo menos 8GB de RAM e SSD para trabalho com edição de vídeo. Preferência por marcas conhecidas e em bom estado.",
    budget: 2500,
    location: "São Paulo, SP",
    category: allCategories.find(c => c.slug === 'tecnologia')!,
    author: { name: "Alice", avatarId: "avatar-2" },
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
    author: { name: "Bob", avatarId: "avatar-3" },
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
    author: { name: "Charlie", avatarId: "avatar-4" },
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
    author: { name: "Diana", avatarId: "avatar-5" },
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
    author: { name: "Frank", avatarId: "avatar-2" },
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
    author: { name: "Grace", avatarId: "avatar-3" },
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
};
