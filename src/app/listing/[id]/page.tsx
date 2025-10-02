
import { notFound } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { getFirebaseClient } from "@/lib/firebase";
import { Listing, ListingAuthor } from "@/lib/data";
import { allCategories } from "@/lib/categories";
import ListingDetailPage from "./listing-client-page";

// Note: We can't call getFirebaseClient() at the top level of a Server Component.
// This page now fetches minimal data and passes it to the client component.
// The client component will fetch the author details.

export default async function ListingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  // This is a temporary solution for the build process.
  // In a real app, we would get the firestore instance differently on the server.
  // For now, we delegate all firestore access to the client.
  
  // The 'db' instance can't be initialized here on the server in this context,
  // so we'll fetch the full listing on the client side.
  // Passing just the ID to the client component.
  
  // A better approach for Server Components would be to use the Firebase Admin SDK,
  // but to keep consistency with the client-side SDK usage, we do it this way.

  const docRef = doc(getFirebaseClient().db, "listings", id);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    notFound();
  }

  const data = docSnap.data();
  const category = allCategories.find(c => c.id === data.categoryId)!;
  
  const userDocRef = doc(getFirebaseClient().db, "users", data.authorId);
  const userDocSnap = await getDoc(userDocRef);
  
  let author: ListingAuthor = { name: "Usuário", id: data.authorId, rating: 0, reviewCount: 0 };
  if (userDocSnap.exists()) {
      const userData = userDocSnap.data();
      author = {
          id: data.authorId,
          name: userData.displayName,
          photoURL: userData.photoURL,
          rating: userData.rating || 0,
          reviewCount: userData.reviewCount || 0,
      }
  }

  const listing = {
    id: docSnap.id,
    ...data,
    category: category,
    author: author,
  } as Listing;


  return <ListingDetailPage listing={listing} />;
}
