
"use client";

import { ListingCard } from "./listing-card";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Loader2, Inbox, PlusCircle } from "lucide-react";
import { Listing } from "@/lib/data";

interface ListingGridProps {
  listings: Listing[];
  isLoading: boolean;
  emptyStateType: 'product' | 'service' | 'general';
  onPostRequestClick: () => void;
}

export function ListingGrid({
  listings,
  isLoading,
  emptyStateType,
  onPostRequestClick,
}: ListingGridProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-10">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (listings.length === 0) {
    const typeText = emptyStateType === 'product' ? "produto" : "serviço";
    const message = emptyStateType === 'general' 
        ? "Nenhum pedido encontrado com os filtros atuais."
        : `Nenhum pedido de ${typeText} ainda.`;

    return (
      <Card className="col-span-1 md:col-span-2 lg:col-span-3 mt-4 flex flex-col items-center justify-center text-center p-8 border-dashed">
        <Inbox className="h-12 w-12 text-gray-400 mb-4" />
        <h4 className="text-xl font-semibold text-gray-700">{message}</h4>
        <p className="text-gray-500 mt-2 mb-4">
          Seja o primeiro a criar um pedido e movimentar a comunidade!
        </p>
        <Button onClick={onPostRequestClick}>
          <PlusCircle className="mr-2" /> Criar um Pedido
        </Button>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {listings.map((listing) => (
        <ListingCard key={listing.id} listing={listing} />
      ))}
    </div>
  );
}
