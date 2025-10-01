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
    { name: "Tecnologia", slug: 'tecnologia', icon: Laptop, type: 'product', subcategories: [] },
    { name: "Celulares", slug: 'celulares', icon: Smartphone, type: 'product', subcategories: [] },
    { name: "Móveis & Eletro", slug: 'moveis-e-eletro', icon: Sofa, type: 'product', subcategories: [] },
    { name: "Auto Peças", slug: 'auto-pecas', icon: Cog, type: 'product', subcategories: [] },
    { name: "Aluguéis", slug: 'alugueis', icon: KeyRound, type: 'product', subcategories: [] },
    { name: "Livros", slug: 'livros', icon: Book, type: 'product', subcategories: [] },
    { name: "Moda", slug: 'moda', icon: Shirt, type: 'product', subcategories: [] },
    { name: "Games", slug: 'games', icon: Gamepad, type: 'product', subcategories: [] },
    { name: "Alimentos", slug: 'alimentos', icon: Utensils, type: 'product', subcategories: [] },
    { name: "Infantil", slug: 'infantil', icon: Baby, type: 'product', subcategories: [] },
  ];

export const serviceCategories: Category[] = [
    { name: "Reparos", slug: 'reparos', icon: Wrench, type: 'service', subcategories: [] },
    { name: "Jardinagem", slug: 'jardinagem', icon: Scissors, type: 'service', subcategories: [] },
    { name: "Pet Care", slug: 'pet-care', icon: Dog, type: 'service', subcategories: [] },
    { name: "Reformas", slug: 'reformas', icon: Paintbrush, type: 'service', subcategories: [] },
    { name: "Mecânica", slug: 'mecanica', icon: Car, type: 'service', subcategories: [] },
    { name: "TI", slug: 'ti', icon: LaptopCode, type: 'service', subcategories: [] },
    { name: "Aulas", slug: 'aulas', icon: UserGraduate, type: 'service', subcategories: [] },
    { name: "Estética", slug: 'estetica', icon: Sparkles, type: 'service', subcategories: [] },
    { name: "Fitness", slug: 'fitness', icon: Dumbbell, type: 'service', subcategories: [] },
    { name: "Procura-se", slug: 'procura-se', icon: Search, type: 'service', subcategories: [] },
    { name: "Denúncias", slug: 'denuncias', icon: ShieldAlert, type: 'service', subcategories: [] },
  ];

export const allCategories = [...productCategories, ...serviceCategories].map(c => ({...c, id: c.slug}));
