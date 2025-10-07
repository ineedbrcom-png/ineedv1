
import type { Category, Subcategory } from "./types";
import { sluggify } from "./utils";

// Função auxiliar para subcategorias
function createSubcategory(name: string): Subcategory {
    const slug = sluggify(name);
    return { id: slug, name, slug };
}

// Função auxiliar para categorias
function createCategory(
    name: string, 
    iconName: string, 
    type: 'product' | 'service',
    subcategories: Subcategory[] = [] // Agora aceita subcategorias
): Category {
    const slug = sluggify(name);
    return {
        id: slug,
        name,
        slug,
        iconName,
        type,
        subcategories,
    };
}

export const productCategories: Category[] = [
    createCategory("Tecnologia", "Laptop", 'product', [
        createSubcategory("Notebooks"),
        createSubcategory("Peças e Acessórios"),
        createSubcategory("Outros Dispositivos"),
    ]),
    createCategory("Celulares", "Smartphone", 'product'),
    createCategory("Móveis & Eletro", "Sofa", 'product'),
    // ... (outras categorias de produto)
    createCategory("Infantil", "Baby", 'product'),
];

export const serviceCategories: Category[] = [
    createCategory("Reparos", "Wrench", 'service', [
        createSubcategory("Eletrodomésticos"),
        createSubcategory("Eletrônicos"),
        createSubcategory("Hidráulica"),
        createSubcategory("Elétrica"),
    ]),
    createCategory("Jardinagem", "Scissors", 'service'),
    createCategory("Pet Care", "Dog", 'service'),
    // ... (outras categorias de serviço)
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
