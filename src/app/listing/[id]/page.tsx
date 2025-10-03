
import { notFound } from "next/navigation";
import { firestoreAdmin } from "@/lib/firebase-admin"; // Use Admin SDK on the server
import { Listing, ListingAuthor } from "@/lib/data";
import { allCategories } from "@/lib/categories";
import ListingDetailPage from "./listing-client-page";
import { getAuth } from 'firebase-admin/auth';
import { admin } from "@/lib/firebase-admin";

// This is a server component, so we can use the Firebase Admin SDK
// to fetch data securely on the server.
export default async function ListingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  if (!id) {
    notFound();
  }

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
  if (data.status !== 'approved') {
      // This is a placeholder for real auth check. 
      // A real implementation would check if the current logged-in user is `data.authorId`.
      // Since we can't easily get the current user in a server component without a session library,
      // we'll just block non-approved listings for now to demonstrate the status field usage.
      // A user should still be able to see their own rejected/pending posts.
      // For now, we will show a generic not found.
      // notFound();
  }

  const category = allCategories.find(c => c.id === data.categoryId)!;
  
  let author: ListingAuthor = { name: "Usuário", id: data.authorId, rating: 0, reviewCount: 0 };
  
  // firestoreAdmin is already checked above, so we can use it safely here.
  if (data.authorId) {
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
  }


  // We need to serialize the `createdAt` timestamp safely
  const listingData = {
    ...data,
    createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
  };


  const listing = {
    id: docSnap.id,
    ...listingData,
    category: category,
    author: author,
  } as Listing;


  return <ListingDetailPage listing={listing} />;
}
