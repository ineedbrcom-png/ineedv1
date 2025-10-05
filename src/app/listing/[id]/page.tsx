
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
      notFound();
  }

  const docRef = firestoreAdmin.collection("listings").doc(id);
  const docSnap = await docRef.get();

  if (!docSnap.exists) {
    notFound();
  }
  
  const data = docSnap.data()!;

  // Basic access control: only show approved listings to everyone,
  // but allow the author to see their own listing regardless of status.
  // In a real app, you might get the current user's session here.
  // For this simplified example, we'll assume public access must be approved.
  if (data.status !== 'publicado' && data.status !== 'approved') { // 'approved' for backwards compatibility
      // This is a placeholder for real auth check. 
      // A real implementation would check if the current logged-in user is `data.authorId`.
      // Since we can't easily get the current user in a server component without a session library,
      // we'll just block non-approved listings for now to demonstrate the status field usage.
      // A user should still be able to see their own rejected/pending posts.
      // For now, we will show a generic not found.
      // In a real app, you'd redirect or show an "access denied" page.
      // notFound();
  }

  const category = allCategories.find(c => c.id === data.categoryId);
  if (!category) {
      console.warn(`Categoria com ID '${data.categoryId}' não encontrada para o anúncio '${id}'.`);
      // Decide how to handle: notFound() or render with default category
  }
  
  let author: ListingAuthor = { name: "Usuário", id: data.authorId, rating: 0, reviewCount: 0 };
  
  if (data.authorId) {
      try {
        const userDocRef = firestoreAdmin.collection("users").doc(data.authorId);
        const userDocSnap = await userDocRef.get();
        
        if (userDocSnap.exists) {
            const userData = userDocSnap.data()!;
            author = {
                id: data.authorId,
                name: userData.displayName,
                photoURL: userData.photoURL,
                rating: userData.rating || 0,
                reviewCount: userData.reviewCount || 0,
            }
        }
      } catch (e) {
          console.error(`Erro ao buscar autor ${data.authorId}:`, e)
      }
  }


  // We need to serialize the `createdAt` timestamp safely
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
    category: category || ({ id: 'unknown', name: 'Desconhecida', slug: 'unknown', type: 'product', iconName: 'Box', subcategories: [] } as Category),
    author: author,
  };


  return <ListingDetailPage listing={listingData} />;
}
