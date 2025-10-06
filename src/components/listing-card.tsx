
import Link from "next/link";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Listing } from "@/lib/data";
import { Handshake, MapPin } from "lucide-react";
import { StarRating } from "./star-rating";
import { formatDistanceToNow } from 'date-fns';
import { enUS, ptBR } from 'date-fns/locale';

type ListingCardProps = {
  listing: Listing;
};

export function ListingCard({ listing }: ListingCardProps) {
  const category = listing.category;
  const author = listing.author;
  
  const getPostTime = () => {
    if (!listing.createdAt) return 'há um tempo';
    
    let date: Date;
    // Check if createdAt is already a Date object, a string, or a Firestore-like object with toDate
    if (listing.createdAt instanceof Date) {
      date = listing.createdAt;
    } else if (typeof listing.createdAt === 'string') {
      date = new Date(listing.createdAt);
    } else if ((listing.createdAt as any)?.toDate) {
      date = (listing.createdAt as any).toDate();
    } else {
      return 'data inválida';
    }

    // Check if the date is valid
    if (isNaN(date.getTime())) {
      return 'data inválida';
    }

    return formatDistanceToNow(date, { addSuffix: true, locale: ptBR });
  }


  return (
    <Card className="flex flex-col overflow-hidden h-full transition-transform duration-300 card-hover shadow-md">
      <CardContent className="p-4 flex-grow flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <span className="bg-blue-100 text-blue-600 text-xs font-medium px-2.5 py-0.5 rounded">
            {category?.name || "Sem categoria"}
          </span>
          <span className="text-gray-500 text-sm">{getPostTime()}</span>
        </div>
        <h4 className="text-lg font-bold mb-2 text-gray-800 flex-grow">
          <Link href={`/listing/${listing.id}`} className="hover:text-primary transition-colors">
            {listing.title}
          </Link>
        </h4>
        <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm line-clamp-2">
          {listing.description}
        </p>
        <div className="mb-3">
            <StarRating rating={author?.rating || 0} reviewCount={author?.reviewCount || 0} />
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

    