// src/lib/data.ts
import { getAdminFirestore } from "@/lib/firebase-admin";
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
  DocumentData,
  QueryDocumentSnapshot,
} from "firebase-admin/firestore";
import { allCategoriesById } from "./categories";
import type { Listing, ListingAuthor, ListingCursor, ListingFilters, User } from "./types";

/**
 * Busca anúncios publicados de forma paginada com filtros no lado do servidor.
 * Esta função é projetada para ser usada em Server Components ou API Routes.
 */
export async function getPaginatedListings(
  lastVisible: ListingCursor = null,
  pageSize: number = 12,
  filters: ListingFilters = {}
): Promise<{ data: Listing[]; nextCursor: QueryDocumentSnapshot<DocumentData> | null; hasMore: boolean }> {
  const db = getAdminFirestore();
  if (!db) {
    console.error("Firestore Admin não inicializado.");
    return { data: [], nextCursor: null, hasMore: false };
  }

  const listingsRef = collection(db, "listings");

  let q: Query = query(listingsRef, where("status", "==", "publicado"));

  // Aplicar filtros
  if (filters.categoryId && filters.categoryId !== 'all') {
    q = query(q, where("categoryId", "==", filters.categoryId));
  }
  
  if (filters.maxBudget !== undefined && filters.maxBudget > 0 && filters.maxBudget < 5000) {
    q = query(q, where("budget", "<=", filters.maxBudget));
    q = query(q, orderBy("budget", "desc"));
  } else {
    q = query(q, orderBy("createdAt", "desc"));
  }

  if (lastVisible) {
    q = query(q, startAfter(lastVisible));
  }

  q = query(q, limit(pageSize));

  const documentSnapshots = await getDocs(q);

  const data = await Promise.all(
    documentSnapshots.docs.map(async (docSnapshot) => {
      const data = docSnapshot.data();
      const listingCategory = allCategoriesById[data.categoryId];

      let author: ListingAuthor = { name: "Usuário iNeed", id: data.authorId, rating: 0, reviewCount: 0 };
      try {
        if(data.authorId) {
          const userDocRef = doc(db, "users", data.authorId);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            const userData = userDocSnap.data() as User;
            if (userData) {
              author = {
                id: data.authorId,
                name: userData.displayName || "Usuário iNeed",
                photoURL: userData.photoURL,
                rating: userData.rating || 0,
                reviewCount: userData.reviewCount || 0,
              };
            }
          }
        }
      } catch (e) {
        console.error("Erro ao buscar dados do autor:", e);
      }

      return {
        id: docSnapshot.id,
        ...data,
        createdAt: data.createdAt.toDate().toISOString(),
        category: listingCategory,
        author: author,
      } as Listing;
    })
  );

  const newCursor = documentSnapshots.docs[documentSnapshots.docs.length - 1] || null;

  return {
    data: data,
    nextCursor: newCursor,
    hasMore: data.length === pageSize,
  };
}


export type { User, Listing, Category, ListingAuthor, ListingCursor, ListingFilters, Proposal, Contract, Message, Conversation } from './types';
