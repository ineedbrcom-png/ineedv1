
import type { Category } from "./data";

export const productCategories: Category[] = [
    { id: 'tecnologia', name: "Tecnologia", slug: 'tecnologia', iconName: 'Laptop', type: 'product', subcategories: [] },
    { id: 'celulares', name: "Celulares", slug: 'celulares', iconName: 'Smartphone', type: 'product', subcategories: [] },
    { id: 'moveis-e-eletro', name: "Móveis & Eletro", slug: 'moveis-e-eletro', iconName: 'Sofa', type: 'product', subcategories: [] },
    { id: 'auto-pecas', name: "Auto Peças", slug: 'auto-pecas', iconName: 'Cog', type: 'product', subcategories: [] },
    { id: 'alugueis', name: "Aluguéis", slug: 'alugueis', iconName: 'KeyRound', type: 'product', subcategories: [] },
    { id: 'livros', name: "Livros", slug: 'livros', iconName: 'Book', type: 'product', subcategories: [] },
    { id: 'moda', name: "Moda", slug: 'moda', iconName: 'Shirt', type: 'product', subcategories: [] },
    { id: 'games', name: "Games", slug: 'games', iconName: 'Gamepad', type: 'product', subcategories: [] },
    { id: 'alimentos', name: "Alimentos", slug: 'alimentos', iconName: 'Utensils', type: 'product', subcategories: [] },
    { id: 'infantil', name: "Infantil", slug: 'infantil', iconName: 'Baby', type: 'product', subcategories: [] },
  ];

export const serviceCategories: Category[] = [
    { id: 'reparos', name: "Reparos", slug: 'reparos', iconName: 'Wrench', type: 'service', subcategories: [] },
    { id: 'jardinagem', name: "Jardinagem", slug: 'jardinagem', iconName: 'Scissors', type: 'service', subcategories: [] },
    { id: 'pet-care', name: "Pet Care", slug: 'pet-care', iconName: 'Dog', type: 'service', subcategories: [] },
    { id: 'reformas', name: "Reformas", slug: 'reformas', iconName: 'Paintbrush', type: 'service', subcategories: [] },
    { id: 'mecanica', name: "Mecânica", slug: 'mecanica', iconName: 'Car', type: 'service', subcategories: [] },
    { id: 'ti', name: "TI", slug: 'ti', iconName: 'Laptop2', type: 'service', subcategories: [] },
    { id: 'aulas', name: "Aulas", slug: 'aulas', iconName: 'GraduationCap', type: 'service', subcategories: [] },
    { id: 'estetica', name: "Estética", slug: 'estetica', iconName: 'Sparkles', type: 'service', subcategories: [] },
    { id: 'fitness', name: "Fitness", slug: 'fitness', iconName: 'Dumbbell', type: 'service', subcategories: [] },
    { id: 'procura-se', name: "Procura-se", slug: 'procura-se', iconName: 'Search', type: 'service', subcategories: [] },
    { id: 'denuncias', name: "Denúncias", slug: 'denuncias', iconName: 'ShieldAlert', type: 'service', subcategories: [] },
  ];

export const allCategories: Category[] = [...productCategories, ...serviceCategories];
