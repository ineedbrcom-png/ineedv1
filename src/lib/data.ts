
// src/lib/data.ts
import { db } from "@/lib/firebase-admin";
import {
  collection,
  query,
  orderBy,
  limit,
  startAfter,
  getDocs,
  doc,
  getDoc,
  where,
  Query,
  Timestamp, // Importa o tipo Timestamp
} from "firebase-admin/firestore";
import { allCategoriesById } from "./categories";
import type { Listing, ListingAuthor, ListingCursor, ListingFilters } from "./types";

// Função auxiliar para obter o valor do cursor de forma segura
function getCursorValue(doc: ListingCursor, orderByField: string) {
    if (!doc) return undefined;
    const value = doc.get(orderByField);
    if (value instanceof Timestamp) {
        return value.toMillis(); // Converte Timestamps para números (serializável)
    }
    return value;
}

export async function getPaginatedListings(
  lastVisible: any = null, // Agora pode ser um valor simples (número ou string)
  pageSize: number = 12,
  filters: ListingFilters = {}
) {
  const listingsRef = collection(db, "listings");

  let q: Query = query(listingsRef, where("status", "==", "publicado"));
  let orderByField = "createdAt"; // Campo de ordenação padrão

  // Aplicar filtros
  if (filters.categoryId) {
    q = query(q, where("categoryId", "==", filters.categoryId));
  }

  if (filters.maxBudget !== undefined && filters.maxBudget < 5000) {
    q = query(q, where("budget", "<=", filters.maxBudget));
    orderByField = "budget"; // Altera o campo de ordenação se o filtro de orçamento for usado
    q = query(q, orderBy(orderByField, "desc"));
  } else {
    q = query(q, orderBy(orderByField, "desc"));
  }

  if (lastVisible) {
    // Se o lastVisible for um número (timestamp), converte de volta para Timestamp
    if (orderByField === "createdAt" && typeof lastVisible === 'number') {
        q = query(q, startAfter(Timestamp.fromMillis(lastVisible)));
    } else {
        q = query(q, startAfter(lastVisible));
    }
  }

  q = query(q, limit(pageSize));

  const documentSnapshots = await getDocs(q);
  
  const lastDoc = documentSnapshots.docs[documentSnapshots.docs.length - 1];
  const nextCursorValue = getCursorValue(lastDoc, orderByField);

  const data = await Promise.all(
    documentSnapshots.docs.map(async (docSnapshot) => {
        // ... (lógica existente para buscar autor e categoria)
        const data = docSnapshot.data();
        const listingCategory = allCategoriesById[data.categoryId];
        let author: ListingAuthor = { name: "Usuário iNeed", id: data.authorId, rating: 0, reviewCount: 0 };
        // ... (código para buscar dados do autor)
        return {
            id: docSnapshot.id,
            ...data,
            category: listingCategory,
            author: author,
            createdAt: data.createdAt.toDate().toISOString(), // Garante que seja string
        } as Listing;
    })
  );

  return {
    data: data,
    nextCursor: nextCursorValue, // Retorna o valor simples e serializável
    hasMore: data.length === pageSize,
  };
}
