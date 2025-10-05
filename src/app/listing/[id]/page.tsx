
import { notFound } from "next/navigation";
import { getAdminFirestore } from "@/lib/firebase-admin"; // Use Admin SDK on the server
import { Listing, ListingAuthor, Category } from "@/lib/types";
import { allCategories } from "@/lib/categories";
import ListingDetailPage from "./listing-client-page";

// This is a server component, so we can use the Firebase Admin SDK
// to fetch data securely on the server.
export default async function ListingPage({ params }: { params: { id: string } }) {
  const { id } = params;
  
  if (!id) {
    notFound();
  }
  
  const firestoreAdmin = getAdminFirestore();
  if (!firestoreAdmin) {
      console.error("Firestore Admin não inicializado. Não é possível buscar o pedido.");
      // Em um cenário real, você poderia renderizar uma página de erro aqui.
      notFound();
  }

  const docRef = firestoreAdmin.collection("listings").doc(id);
  const docSnap = await docRef.get();

  if (!docSnap.exists) {
    notFound();
  }
  
  const data = docSnap.data()!;

  // Basic access control: only show approved listings to everyone.
  // A real app would have more complex logic to allow the author to see their own listing.
  if (data.status !== 'publicado') {
      // For simplicity, we just show notFound. A real app might show an "under review" page.
      // notFound(); // Temporarily disabled to allow viewing non-public posts during development
  }

  // Find the full category object
  const category = allCategories.find(c => c.id === data.categoryId);
  if (!category) {
      console.warn(`Categoria com ID '${data.categoryId}' não encontrada para o anúncio '${id}'.`);
      // Decide how to handle: notFound() or render with a default category
  }
  
  // Fetch author details
  let author: ListingAuthor = { name: "Usuário iNeed", id: data.authorId, rating: 0, reviewCount: 0 };
  
  if (data.authorId) {
      try {
        const userDocRef = firestoreAdmin.collection("users").doc(data.authorId);
        const userDocSnap = await userDocRef.get();
        
        if (userDocSnap.exists) {
            const userData = userDocSnap.data()!;
            author = {
                id: data.authorId,
                name: userData.displayName || 'Usuário iNeed',
                photoURL: userData.photoURL,
                rating: userData.rating || 0,
                reviewCount: userData.reviewCount || 0,
            }
        }
      } catch (e) {
          console.error(`Erro ao buscar autor ${data.authorId}:`, e)
      }
  }

  // We need to serialize the `createdAt` timestamp safely.
  // Firestore Timestamps are not directly serializable for client components.
  const listingData: Listing = {
    id: docSnap.id,
    title: data.title,
    description: data.description,
    budget: data.budget,
    categoryId: data.categoryId,
    location: data.location,
    authorId: data.authorId,
    imageUrls: data.imageUrls || [],
    status: data.status,
    createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
    // Provide the full category and author objects
    category: category || ({ id: 'unknown', name: 'Desconhecida', slug: 'unknown', type: 'product', iconName: 'Box', subcategories: [] } as Category),
    author: author,
  };


  return <ListingDetailPage listing={listingData} />;
}
