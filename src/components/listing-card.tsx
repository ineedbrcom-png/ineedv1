import Image from "next/image";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Listing } from "@/lib/data";
import { findImage } from "@/lib/placeholder-images";
import { ArrowRight, MapPin, Tag } from "lucide-react";

type ListingCardProps = {
  listing: Listing;
};

export function ListingCard({ listing }: ListingCardProps) {
  const image = findImage(listing.imageId);
  const category = listing.category;

  return (
    <Card className="flex flex-col overflow-hidden h-full transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      <CardHeader className="p-0 relative">
        {image && (
          <Image
            src={image.imageUrl}
            alt={image.description}
            width={600}
            height={400}
            className="w-full h-48 object-cover"
            data-ai-hint={image.imageHint}
          />
        )}
        <Badge
          variant="secondary"
          className="absolute top-3 right-3 flex items-center gap-1"
        >
          {category.icon && <category.icon className="h-3 w-3" />}
          {category.name}
        </Badge>
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <CardTitle className="text-lg font-bold mb-2 leading-tight">
          <Link href="#" className="hover:text-primary transition-colors">
            {listing.title}
          </Link>
        </CardTitle>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {listing.description}
        </p>
        <div className="flex flex-wrap gap-2 text-sm">
          <div className="flex items-center gap-1 text-muted-foreground">
            <Tag className="h-4 w-4 text-primary" />
            <span>Budget: ${listing.budget}</span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <MapPin className="h-4 w-4 text-primary" />
            <span>{listing.location}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button asChild variant="outline" className="w-full">
          <Link href="#">
            View Details
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
