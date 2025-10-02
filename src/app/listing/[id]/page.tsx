
import { notFound } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Listing, ListingAuthor } from "@/lib/data";
import { allCategories } from "@/lib/categories";
import ListingDetailPage from "./listing-client-page";

export default async function ListingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const docRef = doc(db, "listings", id);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    notFound();
  }

  const data = docSnap.data();
  const category = allCategories.find(c => c.id === data.categoryId)!;
  
  let author: ListingAuthor = { name: "Usuário", id: data.authorId, rating: 0, reviewCount: 0 };
  const userDocRef = doc(db, "users", data.authorId);
  const userDocSnap = await getDoc(userDocRef);
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
