
"use client";

import { useEffect, useState } from "react";
import { allCategories } from "@/lib/categories";
import { ListingCard } from "@/components/listing-card";
import { notFound } from "next/navigation";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Listing } from "@/lib/data";
import { Loader2 } from "lucide-react";

export default function ExploreCategoryPage({
  params,
}: {
  params: { slug: string };
}) {
  const { slug } = params;
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const category =
    slug === "all"
      ? { name: "Todos os Pedidos", slug: "all", id: "all" }
      : allCategories.find((c) => c.slug === slug);

  useEffect(() => {
    if (!category) return;

    const fetchListings = async () => {
      setIsLoading(true);
      try {
        const listingsCol = collection(db, "listings");
        let q;
        if (slug === "all") {
          q = query(listingsCol, orderBy("createdAt", "desc"));
        } else {
          q = query(
            listingsCol,
            where("categoryId", "==", category.id),
            orderBy("createdAt", "desc")
          );
        }

        const listingSnapshot = await getDocs(q);
        const listingList = listingSnapshot.docs.map((doc) => {
          const data = doc.data();
           const listingCategory = allCategories.find(c => c.id === data.categoryId)!;
          return {
            id: doc.id,
            ...data,
            category: listingCategory,
            author: { name: "Usuário", id: data.authorId, avatarId: 'avatar-1', rating: 0, reviewCount: 0 },
          } as Listing;
        });
        setListings(listingList);
      } catch (error) {
        console.error("Error fetching listings:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchListings();
  }, [slug, category]);

  if (!category) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800">{category.name}</h1>
        <p className="text-lg text-gray-600 mt-2">
          {listings.length} pedido(s) encontrado(s)
        </p>
      </div>
      {isLoading ? (
         <div className="flex justify-center items-center py-16">
            <Loader2 className="h-8 w-8 animate-spin" />
         </div>
      ) : listings.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-xl text-gray-500">
            Nenhum pedido encontrado nesta categoria.
          </p>
        </div>
      )}
    </div>
  );
}

    