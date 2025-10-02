
import { notFound } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { firestoreAdmin } from "@/lib/firebase-admin"; // Use Admin SDK on the server
import { Listing, ListingAuthor } from "@/lib/data";
import { allCategories } from "@/lib/categories";
import ListingDetailPage from "./listing-client-page";

// This is a server component, so we can use the Firebase Admin SDK
// to fetch data securely on the server.
export default async function ListingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  if (!id) {
    notFound();
  }

  const docRef = firestoreAdmin.collection("listings").doc(id);
  const docSnap = await docRef.get();

  if (!docSnap.exists) {
    notFound();
  }

  const data = docSnap.data()!;
  const category = allCategories.find(c => c.id === data.categoryId)!;
  
  let author: ListingAuthor = { name: "Usuário", id: data.authorId, rating: 0, reviewCount: 0 };
  
  if (data.authorId) {
      const userDocRef = firestoreAdmin.collection("users").doc(data.authorId);
      const userDocSnap = await userDocRef.get();
      
      if (userDocSnap.exists()) {
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


  // We need to serialize the `createdAt` timestamp
  const listingData = {
    ...data,
    createdAt: data.createdAt.toDate().toISOString(),
  };


  const listing = {
    id: docSnap.id,
    ...listingData,
    category: category,
    author: author,
  } as Listing;


  return <ListingDetailPage listing={listing} />;
}
