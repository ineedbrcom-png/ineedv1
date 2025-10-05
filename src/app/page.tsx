
import { allCategories, productCategories, serviceCategories } from "@/lib/categories";
import { Listing, ListingAuthor } from "@/lib/data";
import { getAdminFirestore } from "@/lib/firebase-admin"; // MODIFICADO: Importa a função
import { HomeClient } from "./home-client";

async function getListings() {
    const firestoreAdmin = getAdminFirestore(); // MODIFICADO: Chama a função para obter a instância
    if (!firestoreAdmin) {
        console.error("Firestore Admin não inicializado, retornando lista vazia de pedidos.");
        return [];
    }
    try {
        const listingsCol = firestoreAdmin.collection("listings");
        const q = listingsCol
            .where("status", "==", "approved")
            .orderBy("createdAt", "desc")
            .limit(6);
        const listingSnapshot = await q.get();

        if (listingSnapshot.empty) {
            return [];
        }

        // (O restante do código permanece o mesmo)
        const listings: Listing[] = await Promise.all(
            listingSnapshot.docs.map(async (doc) => {
                const listingData = doc.data();
                const authorDoc = await firestoreAdmin.collection('users').doc(listingData.authorId).get();
                const authorData = authorDoc.data() as ListingAuthor | undefined;

                return {
                    id: doc.id,
                    title: listingData.title,
                    description: listingData.description,
                    category: listingData.category,
                    author: authorData || { id: listingData.authorId, name: 'Usuário Desconhecido', avatar: '' },
                    images: listingData.images || [],
                    tags: listingData.tags || [],
                    createdAt: listingData.createdAt.toDate(),
                };
            })
        );
        return listings;

    } catch (error) {
        console.error("Erro ao buscar anúncios do Firestore:", error);
        return [];
    }
}

export default async function Home() {
    const listings = await getListings();
    return (
        <HomeClient
            listings={listings}
            productCategories={productCategories}
            serviceCategories={serviceCategories}
            allCategories={allCategories}
        />
    );
}
