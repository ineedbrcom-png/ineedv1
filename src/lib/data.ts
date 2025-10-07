
// src/lib/data.ts
import { getAdminFirestore } from "@/lib/firebase-admin"; // CORRIGIDO: Importa a função
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
  Timestamp,
} from "firebase-admin/firestore";
import { allCategoriesById } from "./categories";
import type { Listing, ListingAuthor, ListingCursor, ListingFilters } from "./types";

function getCursorValue(doc: ListingCursor, orderByField: string) {
    if (!doc) return undefined;
    const value = doc.get(orderByField);
    if (value instanceof Timestamp) {
        return value.toMillis();
    }
    return value;
}

export async function getPaginatedListings(
  lastVisible: any = null,
  pageSize: number = 12,
  filters: ListingFilters = {}
) {
  const db = getAdminFirestore(); // CORRIGIDO: Chama a função para obter a instância do Firestore
  if (!db) {
    console.error("Firestore Admin não inicializado, não é possível buscar anúncios.");
    return { data: [], nextCursor: undefined, hasMore: false };
  }

  const listingsRef = collection(db, "listings");
  let q: Query = query(listingsRef, where("status", "==", "publicado"));
  let orderByField = "createdAt";

  if (filters.categoryId) {
    q = query(q, where("categoryId", "==", filters.categoryId));
  }

  if (filters.maxBudget !== undefined && filters.maxBudget < 5000) {
    orderByField = "budget";
    q = query(q, where("budget", "<=", filters.maxBudget), orderBy(orderByField, "desc"));
  } else {
    q = query(q, orderBy(orderByField, "desc"));
  }

  if (lastVisible) {
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
        const data = docSnapshot.data();
        const listingCategory = allCategoriesById[data.categoryId];
        let author: ListingAuthor = { name: "Usuário iNeed", id: data.authorId, rating: 0, reviewCount: 0 };
        // ... (código para buscar dados do autor)
        return {
            id: docSnapshot.id,
            ...data,
            category: listingCategory,
            author: author,
            createdAt: data.createdAt.toDate().toISOString(),
        } as Listing;
    })
  );

  return {
    data: data,
    nextCursor: nextCursorValue,
    hasMore: data.length === pageSize,
  };
}
