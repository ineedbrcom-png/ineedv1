
"use client";

import { useState, useEffect } from "react";
import { allCategories } from "@/lib/categories";
import { ListingCard } from "@/components/listing-card";
import { notFound, useSearchParams } from "next/navigation";
import { collection, query, where, getDocs, orderBy, doc, getDoc } from "firebase/firestore";
import { getFirebaseClient } from "@/lib/firebase";
import { Listing, ListingAuthor } from "@/lib/data";
import { Loader2, Search, MapPin, Wallet, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type ExploreClientPageProps = {
  slug: string;
};

export function ExploreClientPage({ slug }: ExploreClientPageProps) {
  const [allListings, setAllListings] = useState<Listing[]>([]);
  const [filteredListings, setFilteredListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const searchParams = useSearchParams();
  const initialSearchTerm = searchParams.get('q') || "";

  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [locationFilter, setLocationFilter] = useState("");
  const [budgetFilter, setBudgetFilter] = useState([5000]);

  const maxBudget = 5000;

  const category =
    slug === "all"
      ? { name: "Todos os Pedidos", slug: "all", id: "all" }
      : allCategories.find((c) => c.slug === slug);

  if (!category) {
    notFound();
  }

  useEffect(() => {
    if (!category) return;

    const fetchListings = async () => {
      setIsLoading(true);
      try {
        const { db } = getFirebaseClient();
        const listingsCol = collection(db, "listings");
        
        let queries = [where("status", "==", "approved")];

        if (slug !== "all" && category?.id) {
          queries.push(where("categoryId", "==", category.id));
        }

        // Firestore limitation: You can't have inequality filters on multiple fields.
        // We will do the budget filtering on the client side.
        // The orderBy('createdAt') was also removed to avoid needing a composite index for every category.
        const q = query(
            listingsCol,
            ...queries,
             orderBy("createdAt", "desc")
        );


        const listingSnapshot = await getDocs(q);
        const listingList = await Promise.all(listingSnapshot.docs.map(async (docSnapshot) => {
          const data = docSnapshot.data();
           const listingCategory = allCategories.find(c => c.id === data.categoryId)!;

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

          return {
            id: docSnapshot.id,
            ...data,
            category: listingCategory,
            author: author,
          } as Listing;
        }));
        setAllListings(listingList);
      } catch (error) {
        console.error("Error fetching listings:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchListings();
  }, [slug, category]);

  
  useEffect(() => {
    // This effect runs whenever the base list of listings or any filter changes.
    let listings = [...allListings];

    // Search term filter (title and description)
    if (searchTerm) {
      listings = listings.filter(l => 
          l.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          l.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Location filter
    if (locationFilter) {
        listings = listings.filter(l => 
            l.location.toLowerCase().includes(locationFilter.toLowerCase())
        );
    }

    // Budget filter
    listings = listings.filter(l => l.budget <= budgetFilter[0]);
    
    setFilteredListings(listings);
  }, [allListings, searchTerm, locationFilter, budgetFilter]);


  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Filters are now applied automatically via useEffect, so this can be empty
    // or used for other purposes if needed.
  }
  
  const clearFilters = () => {
    setSearchTerm("");
    setLocationFilter("");
    setBudgetFilter([maxBudget]);
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800">{category?.name}</h1>
        <p className="text-lg text-gray-600 mt-2">
          {filteredListings.length} pedido(s) encontrado(s)
        </p>
      </div>
      
      <Card className="mb-8 p-6 bg-muted/30">
        <form onSubmit={handleFilterSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
                <div className="lg:col-span-2">
                    <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">Palavra-chave</label>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            id="search"
                            placeholder="Buscar por título ou descrição..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </div>
                 <div>
                    <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">Localização</label>
                    <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            id="location"
                            placeholder="Ex: Santa Maria, RS"
                            value={locationFilter}
                            onChange={(e) => setLocationFilter(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </div>
                <div>
                     <label htmlFor="budget" className="block text-sm font-medium text-gray-700 mb-2">Orçamento até</label>
                    <div className="flex items-center gap-4">
                        <Slider
                            id="budget"
                            min={0}
                            max={maxBudget}
                            step={50}
                            value={budgetFilter}
                            onValueChange={setBudgetFilter}
                        />
                         <div className="flex items-center gap-2">
                            <Wallet className="h-5 w-5 text-gray-500" />
                            <span className="font-semibold text-gray-700 w-20 text-right">R$ {budgetFilter[0]}</span>
                        </div>
                    </div>
                </div>
            </div>
             <div className="flex justify-end gap-4 mt-6">
                <Button variant="ghost" onClick={clearFilters} type="button">
                    <X className="mr-2 h-4 w-4"/>
                    Limpar Filtros
                </Button>
                {/* The Apply button is no longer strictly necessary as filters apply on change */}
            </div>
        </form>
      </Card>


      {isLoading ? (
         <div className="flex justify-center items-center py-16">
            <Loader2 className="h-8 w-8 animate-spin" />
         </div>
      ) : filteredListings.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredListings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-xl text-gray-500">
            Nenhum pedido encontrado com os filtros aplicados.
          </p>
          <Button variant="link" onClick={clearFilters} className="mt-2">Limpar filtros e tentar novamente</Button>
        </div>
      )}
    </div>
  );
}
