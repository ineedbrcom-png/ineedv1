
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { allCategories } from "@/lib/categories";
import { ListingCard } from "@/components/listing-card";
import { notFound, useSearchParams } from "next/navigation";
import { Listing, ListingCursor } from "@/lib/types";
import { Loader2, Search, MapPin, Wallet, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useDebounce } from "@/hooks/use-debounce"; // Um hook customizado para debounce

type ExploreClientPageProps = {
  slug: string;
  initialData: {
    data: Listing[];
    nextCursor: ListingCursor;
    hasMore: boolean;
  };
};

export function ExploreClientPage({ slug, initialData }: ExploreClientPageProps) {
  const [listings, setListings] = useState<Listing[]>(initialData.data);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<ListingCursor | null>(initialData.nextCursor);
  const [hasMore, setHasMore] = useState(initialData.hasMore);

  const searchParams = useSearchParams();
  const initialSearchTerm = searchParams.get('q') || "";

  // Filtros
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [locationFilter, setLocationFilter] = useState("");
  const [budgetFilter, setBudgetFilter] = useState([5000]);

  // Debounce para os filtros para evitar buscas excessivas
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const debouncedLocationFilter = useDebounce(locationFilter, 500);
  const debouncedBudgetFilter = useDebounce(budgetFilter, 500);

  const maxBudget = 5000;

  const category = useMemo(() => 
    slug === "all"
      ? { name: "Todos os Pedidos", slug: "all", id: "all" }
      : allCategories.find((c) => c.slug === slug)
  , [slug]);

  if (!category) {
    notFound();
  }

  const fetchListings = useCallback(async (cursor: ListingCursor | null = null) => {
    if (cursor === null) setIsLoading(true);
    else setIsLoadingMore(true);

    try {
      const filters = {
        categoryId: slug === "all" ? undefined : category?.id,
        maxBudget: debouncedBudgetFilter[0] < maxBudget ? debouncedBudgetFilter[0] : undefined,
      };

      const response = await fetch("/api/listings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ cursor, pageSize: 12, filters }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch listings");
      }

      const { data, nextCursor: newNextCursor, hasMore: newHasMore } = await response.json();
      
      // A filtragem por texto e localização continua no cliente.
      const clientFilteredData = data.filter(l => 
        (debouncedSearchTerm ? (l.title.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) || l.description.toLowerCase().includes(debouncedSearchTerm.toLowerCase())) : true) &&
        (debouncedLocationFilter ? l.location.toLowerCase().includes(debouncedLocationFilter.toLowerCase()) : true)
      );

      setListings(prev => cursor ? [...prev, ...clientFilteredData] : clientFilteredData);
      setNextCursor(newNextCursor);
      setHasMore(newHasMore);

    } catch (error) {
      console.error("Error fetching listings:", error);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [slug, category?.id, debouncedBudgetFilter, debouncedSearchTerm, debouncedLocationFilter]);

  // Efeito para carregar/recarregar os anúncios quando os filtros DEBOUNCED mudam
  useEffect(() => {
    setListings([]);
    setNextCursor(null);
    setHasMore(true);
    fetchListings(null);
  }, [fetchListings]); 

  const handleLoadMore = () => {
    if (hasMore && !isLoadingMore && nextCursor) {
      fetchListings(nextCursor);
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setLocationFilter("");
    setBudgetFilter([maxBudget]);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* ... Cabeçalho e Formulário de Filtros ... */}
       <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800">{category?.name}</h1>
        <p className="text-lg text-gray-600 mt-2">
          Mostrando {listings.length} pedido(s)
        </p>
      </div>
      
      <Card className="mb-8 p-6 bg-muted/30">
        <form onSubmit={(e) => e.preventDefault()}> {/* Previne submit tradicional */}
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
            </div>
        </form>
      </Card>

      {isLoading ? (
        <div className="flex justify-center items-center py-16">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : listings.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
          {hasMore && (
            <div className="mt-12 text-center">
              <Button onClick={handleLoadMore} disabled={isLoadingMore}>
                {isLoadingMore ? (
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

// Você precisará criar este hook, por exemplo em /src/hooks/use-debounce.ts

    