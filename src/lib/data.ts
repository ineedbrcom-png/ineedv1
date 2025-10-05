
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  orderBy,
  limit,
  startAfter,
  getDocs,
  QueryDocumentSnapshot,
  DocumentData,
  where,
  Query,
} from "firebase/firestore";
import { allCategories } from "./categories";
import { ListingAuthor } from "./data"; // Assuming ListingAuthor is in data.ts

export type Listing = {
  id: string;
  title: string;
  description: string;
  budget: number;
  categoryId: string;
  category: {
    id: string;
    name: string;
    slug: string;
  };
  location: string;
  authorId: string;
  author: ListingAuthor;
  createdAt: any; // Firestore Timestamp
  imageUrls?: string[];
  status: 'publicado' | 'pendente' | 'revisao' | 'rejeitado';
};


// Tipo auxiliar para o cursor (o último documento da busca anterior)
export type ListingCursor = QueryDocumentSnapshot<DocumentData> | null;

export interface ListingFilters {
  categoryId?: string;
  maxBudget?: number;
  // A busca por texto (searchTerm) e localização (locationFilter) será tratada separadamente
  // pois o Firestore tem limitações com consultas de texto completo.
}

/**
 * Busca anúncios publicados de forma paginada com filtros no lado do servidor.
 * @param lastVisible - O último documento visível da página anterior (cursor).
 * @param pageSize - O número de anúncios a serem buscados por página.
 * @param filters - Os filtros a serem aplicados na consulta.
 * @returns Um objeto com os dados dos anúncios, o próximo cursor e um booleano indicando se há mais itens.
 */
export async function getPaginatedListings(
  lastVisible: ListingCursor = null,
  pageSize: number = 12,
  filters: ListingFilters = {}
) {
  const listingsRef = collection(db, "listings");

  let q: Query = query(listingsRef, where("status", "==", "publicado"));

  // Aplicar filtros
  if (filters.categoryId) {
    q = query(q, where("categoryId", "==", filters.categoryId));
  }

  if (filters.maxBudget !== undefined && filters.maxBudget > 0 && filters.maxBudget < 5000) {
    // IMPORTANTE: Filtros de intervalo (<=) exigem que a primeira ordenação seja no mesmo campo.
    q = query(q, where("budget", "<=", filters.maxBudget));
    // A ordenação principal por orçamento pode fazer sentido aqui.
    // Se a ordenação por data for mais importante, essa filtragem de orçamento deve ser feita no cliente.
    q = query(q, orderBy("budget", "desc"));
  } else {
    // Caso contrário, a ordenação padrão é pela data de criação.
    q = query(q, orderBy("createdAt", "desc"));
  }

  // Adiciona o limite de documentos por página
  q = query(q, limit(pageSize));

  // Se tivermos um cursor (não é a primeira página), usamos 'startAfter'
  if (lastVisible) {
    q = query(q, startAfter(lastVisible));
  }

  const documentSnapshots = await getDocs(q);

  // Prepara os dados para o retorno, incluindo a busca de dados do autor
  const data = await Promise.all(documentSnapshots.docs.map(async (docSnapshot) => {
    const data = docSnapshot.data();
    const listingCategory = allCategories.find(c => c.id === data.categoryId)!;

    let author: ListingAuthor = { name: "Usuário iNeed", id: data.authorId, rating: 0, reviewCount: 0 };
    try {
        const userDocRef = doc(db, "users", data.authorId);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            author = {
                id: data.authorId,
                name: userData.displayName || "Usuário iNeed",
                photoURL: userData.photoURL,
                rating: userData.rating || 0,
                reviewCount: userData.reviewCount || 0,
            }
        }
    } catch (e) {
        console.error("Erro ao buscar dados do autor:", e);
    }

    return {
      id: docSnapshot.id,
      ...data,
      category: listingCategory,
      author: author,
    } as Listing;
  }));

  // Determina o novo cursor para a próxima busca
  const newCursor = documentSnapshots.docs[documentSnapshots.docs.length - 1] || null;

  return {
    data: data,
    nextCursor: newCursor,
    hasMore: data.length === pageSize,
  };
}
