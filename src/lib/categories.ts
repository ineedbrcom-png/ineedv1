
import type { Category } from "./types";
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
    createCategory("Technology", "Laptop", 'product'),
    createCategory("Cell Phones", "Smartphone", 'product'),
    createCategory("Furniture & Appliances", "Sofa", 'product'),
    createCategory("Auto Parts", "Cog", 'product'),
    createCategory("Rentals", "KeyRound", 'product'),
    createCategory("Books", "Book", 'product'),
    createCategory("Fashion", "Shirt", 'product'),
    createCategory("Games", "Gamepad", 'product'),
    createCategory("Food", "Utensils", 'product'),
    createCategory("Children", "Baby", 'product'),
];

export const serviceCategories: Category[] = [
    createCategory("Repairs", "Wrench", 'service'),
    createCategory("Gardening", "Scissors", 'service'),
    createCategory("Pet Care", "Dog", 'service'),
    createCategory("Renovations", "Paintbrush", 'service'),
    createCategory("Mechanics", "Car", 'service'),
    createCategory("IT", "Laptop2", 'service'),
    createCategory("Classes", "GraduationCap", 'service'),
    createCategory("Beauty", "Sparkles", 'service'),
    createCategory("Fitness", "Dumbbell", 'service'),
    createCategory("Wanted", "Search", 'service'),
    createCategory("Reports", "ShieldAlert", 'service'),
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
