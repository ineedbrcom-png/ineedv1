
import { allCategories, productCategories, serviceCategories } from "@/lib/categories";
import { Listing, ListingAuthor } from "@/lib/data";
import { firestoreAdmin } from "@/lib/firebase-admin";
import { HomeClient } from "./home-client";

async function getListings() {
    try {
        const listingsCol = firestoreAdmin.collection("listings");
        // Let's simplify the query for now to avoid complexity with indexes
        const q = listingsCol.orderBy("createdAt", "desc");
        const listingSnapshot = await q.get();

        const listingList = await Promise.all(listingSnapshot.docs.map(async (docSnapshot) => {
          const data = docSnapshot.data();
          const category = allCategories.find(c => c.id === data.categoryId);
          
          let author: ListingAuthor = { name: "Usuário", id: data.authorId, rating: 0, reviewCount: 0 };
          if(data.authorId) {
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

          return {
            id: docSnapshot.id,
            ...data,
            createdAt: data.createdAt.toDate().toISOString(), // Serialize date
            category: category,
            author: author,
          } as Listing;
        }));
        return listingList;
      } catch (error) {
        console.error("Error fetching listings on server: ", error);
        return []; // Return empty array on error
      }
}


export default async function Home() {
  const listings = await getListings();

  return (
    <HomeClient 
      productCategories={productCategories} 
      serviceCategories={serviceCategories}
      initialListings={listings}
    />
  );
}
