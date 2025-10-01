
import Link from "next/link";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Listing } from "@/lib/data";
import { Star, StarHalf, Handshake, MapPin } from "lucide-react";

type ListingCardProps = {
  listing: Listing;
};

export function ListingCard({ listing }: ListingCardProps) {
  const category = listing.category;
  const author = listing.author;

  const rating = author.rating;
  const reviewCount = author.reviewCount;
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating - fullStars >= 0.5;

  return (
    <Card className="flex flex-col overflow-hidden h-full transition-transform duration-300 card-hover shadow-md">
      <CardContent className="p-4 flex-grow flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <span className="bg-blue-100 text-blue-600 text-xs font-medium px-2.5 py-0.5 rounded">
            {category.name}
          </span>
          <span className="text-gray-500 text-sm">há {Number(listing.id) * 2} horas</span>
        </div>
        <h4 className="text-lg font-bold mb-2 text-gray-800 flex-grow">
          <Link href={`/listing/${listing.id}`} className="hover:text-primary transition-colors">
            {listing.title}
          </Link>
        </h4>
        <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm line-clamp-2">
          {listing.description}
        </p>
        <div className="flex items-center mb-3 text-sm text-yellow-400">
          {reviewCount > 0 ? (
            <>
              <div className="flex">
                {[...Array(5)].map((_, i) => {
                  if (i < fullStars) {
                    return <Star key={i} className="h-4 w-4 fill-current" />;
                  }
                  if (i === fullStars && hasHalfStar) {
                    return <StarHalf key={i} className="h-4 w-4 fill-current" />;
                  }
                  return <Star key={i} className="h-4 w-4 text-gray-300" />;
                })}
              </div>
              <span className="ml-2 text-gray-600 dark:text-gray-400">({reviewCount} avaliações)</span>
            </>
          ) : (
             <span className="text-gray-500">Nenhuma avaliação</span>
          )}
        </div>
        <div className="flex justify-between items-center mt-auto">
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <MapPin className="h-4 w-4 text-primary" />
            <span>{listing.location}</span>
          </div>
          <Button asChild size="sm" className="rounded-full">
            <Link href={`/listing/${listing.id}`}>
              <Handshake className="mr-1 h-4 w-4" /> Oferecer
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
