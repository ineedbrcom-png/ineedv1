
import { Star, StarHalf } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  reviewCount: number;
  className?: string;
}

export function StarRating({ rating, reviewCount, className }: StarRatingProps) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating - fullStars >= 0.5;

  if (reviewCount === 0) {
    return <span className={cn("text-gray-500 text-sm", className)}>Nenhuma avaliação</span>;
  }

  return (
    <div className={cn("flex items-center text-sm", className)}>
      <div className="flex text-yellow-400">
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
      <span className="ml-2 text-gray-600 dark:text-gray-400">
        ({reviewCount} avaliações)
      </span>
    </div>
  );
}
