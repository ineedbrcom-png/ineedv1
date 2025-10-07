
"use client";

import { useState, useEffect, useMemo, useTransition } from "react";
import { allCategories } from "@/lib/categories";
import { ListingCard } from "@/components/listing-card";
import { notFound, useSearchParams } from "next/navigation";
import { Listing, ListingCursor } from "@/lib/types";
import { Loader2, Search, MapPin, Wallet, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useDebounce } from "@/hooks/use-debounce";
import { fetchMoreListings } from "../actions"; // CORRIGIDO: O caminho agora é '../actions'

type ExploreClientPageProps = {
  slug: string;
  initialData: {
    data: Listing[];
    nextCursor: number | undefined;
    hasMore: boolean;
  };
};

export function ExploreClientPage({ slug, initialData }: ExploreClientPageProps) {
  const [listings, setListings] = useState<Listing[]>(initialData.data);
  const [nextCursor, setNextCursor] = useState<number | null>(initialData.nextCursor || null);
  const [hasMore, setHasMore] = useState(initialData.hasMore);
  const [isPending, startTransition] = useTransition();

  const searchParams = useSearchParams();
  const initialSearchTerm = searchParams.get('q') || "";
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [locationFilter, setLocationFilter] = useState("");
  const [budgetFilter, setBudgetFilter] = useState([5000]);
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const debouncedLocationFilter = useDebounce(locationFilter, 500);
  const debouncedBudgetFilter = useDebounce(budgetFilter, 500);
  const maxBudget = 5000;
  const category = useMemo(() =>
    slug === "all"
      ? { name: "Todos os Pedidos", slug: "all", id: "all" }
      : allCategories.find((c) => c.slug === slug),
    [slug]
  );
  if (!category) notFound();

  const handleLoadMore = () => {
    if (!hasMore || isPending || !nextCursor) return;

    startTransition(async () => {
      const filters = {
        categoryId: slug === "all" ? undefined : category?.id,
        maxBudget: debouncedBudgetFilter[0] < maxBudget ? debouncedBudgetFilter[0] : undefined,
      };

      try {
        const result = await fetchMoreListings(nextCursor, 12, filters);
        setListings(prev => [...prev, ...result.data]);
        setNextCursor(result.nextCursor || null);
        setHasMore(result.hasMore);
      } catch (error) {
        console.error("Falha ao carregar mais anúncios:", error);
      }
    });
  };
  
  const clearFilters = () => {
    setSearchTerm("");
    setLocationFilter("");
    setBudgetFilter([maxBudget]);
  };
  
  const filteredListings = useMemo(() => {
    return listings.filter(l =>
        (debouncedSearchTerm ? (l.title.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) || l.description.toLowerCase().includes(debouncedSearchTerm.toLowerCase())) : true) &&
        (debouncedLocationFilter ? l.location.toLowerCase().includes(debouncedLocationFilter.toLowerCase()) : true)
    );
  }, [listings, debouncedSearchTerm, debouncedLocationFilter]);


  return (
    <div className="container mx-auto px-4 py-8">
      {/* ... (JSX do cabeçalho e filtros, que precisam ser adicionados de volta) ... */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800">{category?.name}</h1>
        <p className="text-lg text-gray-600 mt-2">
          Mostrando {filteredListings.length} pedido(s)
        </p>
      </div>

      {filteredListings.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredListings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
          {hasMore && (
            <div className="mt-12 text-center">
              <Button onClick={handleLoadMore} disabled={isPending || !nextCursor}>
                {isPending ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Carregando...</>
                ) : (
                  "Carregar Mais Pedidos"
                )}
              </Button>
            </div>
          )}
        </>
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
