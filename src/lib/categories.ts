
import type { Category } from "./types"; // Alterado para importar de types.ts
import { sluggify } from "./utils";

function createCategory(name: string, iconName: string, type: 'product' | 'service'): Category {
    const slug = sluggify(name);
    return {
        id: slug,
        name,
        slug,
        iconName,
        type,
        subcategories: [],
    };
}

export const productCategories: Category[] = [
    createCategory("Tecnologia", "Laptop", 'product'),
    createCategory("Celulares", "Smartphone", 'product'),
    createCategory("Móveis & Eletro", "Sofa", 'product'),
    createCategory("Auto Peças", "Cog", 'product'),
    createCategory("Aluguéis", "KeyRound", 'product'),
    createCategory("Livros", "Book", 'product'),
    createCategory("Moda", "Shirt", 'product'),
    createCategory("Games", "Gamepad", 'product'),
    createCategory("Alimentos", "Utensils", 'product'),
    createCategory("Infantil", "Baby", 'product'),
];

export const serviceCategories: Category[] = [
    createCategory("Reparos", "Wrench", 'service'),
    createCategory("Jardinagem", "Scissors", 'service'),
    createCategory("Pet Care", "Dog", 'service'),
    createCategory("Reformas", "Paintbrush", 'service'),
    createCategory("Mecânica", "Car", 'service'),
    createCategory("TI", "Laptop2", 'service'),
    createCategory("Aulas", "GraduationCap", 'service'),
    createCategory("Estética", "Sparkles", 'service'),
    createCategory("Fitness", "Dumbbell", 'service'),
    createCategory("Procura-se", "Search", 'service'),
    createCategory("Denúncias", "ShieldAlert", 'service'),
];

export const allCategories: Category[] = [...productCategories, ...serviceCategories];

export const allCategoriesById: { [key: string]: Category } = 
    allCategories.reduce((acc, category) => {
        acc[category.id] = category;
        return acc;
    }, {} as { [key: string]: Category });

export function getCategoryById(id: string): Category | undefined {
    return allCategoriesById[id];
}
