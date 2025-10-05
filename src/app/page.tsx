import { productCategories, serviceCategories } from "@/lib/categories";
import { Listing, ListingAuthor } from "@/lib/data";
import { getAdminFirestore } from "@/lib/firebase-admin";
import { HomeClient } from "./home-client";
import { allCategories } from "@/lib/categories";
import { User } from "@/lib/types";

async function getListings(): Promise<Listing[]> {
    const firestoreAdmin = getAdminFirestore();
    if (!firestoreAdmin) {
        console.error("Firestore Admin não inicializado, retornando lista vazia de pedidos.");
        return [];
    }
    try {
        const listingsCol = firestoreAdmin.collection("listings");
        const q = listingsCol
            .where("status", "==", "publicado")
            .orderBy("createdAt", "desc")
            .limit(6);
        const listingSnapshot = await q.get();

        if (listingSnapshot.empty) {
            return [];
        }

        const listings: Listing[] = await Promise.all(
            listingSnapshot.docs.map(async (doc) => {
                const listingData = doc.data();
                
                const category = allCategories.find(c => c.id === listingData.categoryId) || null;

                let author: ListingAuthor = { id: listingData.authorId, name: 'Usuário iNeed', rating: 0, reviewCount: 0 };

                try {
                    if (listingData.authorId) {
                        const authorDoc = await firestoreAdmin.collection('users').doc(listingData.authorId).get();
                        if (authorDoc.exists) {
                            const authorData = authorDoc.data() as User;
                            author = {
                               id: listingData.authorId,
                               name: authorData?.displayName || 'Usuário iNeed',
                               photoURL: authorData?.photoURL,
                               rating: authorData?.rating || 0,
                               reviewCount: authorData?.reviewCount || 0
                            };
                        }
                    }
                } catch (e) {
                    console.error(`Erro ao buscar autor ${listingData.authorId}:`, e);
                }


                return {
                    id: doc.id,
                    title: listingData.title,
                    description: listingData.description,
                    budget: listingData.budget,
                    categoryId: listingData.categoryId,
                    location: listingData.location,
                    authorId: listingData.authorId,
                    imageUrls: listingData.imageUrls || [],
                    status: listingData.status,
                    category: category,
                    author: author,
                    createdAt: listingData.createdAt.toDate().toISOString(),
                } as Listing;
            })
        );
        // Filtrar listings que não conseguiram encontrar uma categoria (embora improvável)
        return listings.filter(l => l.category);

    } catch (error) {
        console.error("Erro ao buscar anúncios do Firestore:", error);
        return [];
    }
}

export default async function Home() {
    const initialListings = await getListings();
    
    // Serializar os dados para o cliente
    const serializedListings = initialListings.map(listing => ({
      ...listing,
      createdAt: listing.createdAt,
    }));

    return (
        <HomeClient
            initialListings={serializedListings}
            productCategories={productCategories}
            serviceCategories={serviceCategories}
        />
    );
}
