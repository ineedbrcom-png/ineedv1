import {
  Car,
  Dog,
  Gamepad,
  Home as HomeIcon,
  Laptop,
  Paintbrush,
  Search,
  Shirt,
  Utensils,
  Wrench,
  Laptop2 as LaptopCode,
  GraduationCap as UserGraduate,
  Baby,
  Box,
  Scissors,
  Dumbbell,
  Sparkles,
  ShieldAlert,
  Smartphone,
  Book,
  Sofa,
  KeyRound,
  Cog,
} from "lucide-react";
import type { Category } from "./data";

export const productCategories: Category[] = [
    { id: 'tecnologia', name: "Tecnologia", slug: 'tecnologia', icon: Laptop, type: 'product', subcategories: [] },
    { id: 'celulares', name: "Celulares", slug: 'celulares', icon: Smartphone, type: 'product', subcategories: [] },
    { id: 'moveis-e-eletro', name: "Móveis & Eletro", slug: 'moveis-e-eletro', icon: Sofa, type: 'product', subcategories: [] },
    { id: 'auto-pecas', name: "Auto Peças", slug: 'auto-pecas', icon: Cog, type: 'product', subcategories: [] },
    { id: 'alugueis', name: "Aluguéis", slug: 'alugueis', icon: KeyRound, type: 'product', subcategories: [] },
    { id: 'livros', name: "Livros", slug: 'livros', icon: Book, type: 'product', subcategories: [] },
    { id: 'moda', name: "Moda", slug: 'moda', icon: Shirt, type: 'product', subcategories: [] },
    { id: 'games', name: "Games", slug: 'games', icon: Gamepad, type: 'product', subcategories: [] },
    { id: 'alimentos', name: "Alimentos", slug: 'alimentos', icon: Utensils, type: 'product', subcategories: [] },
    { id: 'infantil', name: "Infantil", slug: 'infantil', icon: Baby, type: 'product', subcategories: [] },
  ];

export const serviceCategories: Category[] = [
    { id: 'reparos', name: "Reparos", slug: 'reparos', icon: Wrench, type: 'service', subcategories: [] },
    { id: 'jardinagem', name: "Jardinagem", slug: 'jardinagem', icon: Scissors, type: 'service', subcategories: [] },
    { id: 'pet-care', name: "Pet Care", slug: 'pet-care', icon: Dog, type: 'service', subcategories: [] },
    { id: 'reformas', name: "Reformas", slug: 'reformas', icon: Paintbrush, type: 'service', subcategories: [] },
    { id: 'mecanica', name: "Mecânica", slug: 'mecanica', icon: Car, type: 'service', subcategories: [] },
    { id: 'ti', name: "TI", slug: 'ti', icon: LaptopCode, type: 'service', subcategories: [] },
    { id: 'aulas', name: "Aulas", slug: 'aulas', icon: UserGraduate, type: 'service', subcategories: [] },
    { id: 'estetica', name: "Estética", slug: 'estetica', icon: Sparkles, type: 'service', subcategories: [] },
    { id: 'fitness', name: "Fitness", slug: 'fitness', icon: Dumbbell, type: 'service', subcategories: [] },
    { id: 'procura-se', name: "Procura-se", slug: 'procura-se', icon: Search, type: 'service', subcategories: [] },
    { id: 'denuncias', name: "Denúncias", slug: 'denuncias', icon: ShieldAlert, type: 'service', subcategories: [] },
  ];

export const allCategories: Category[] = [...productCategories, ...serviceCategories];
