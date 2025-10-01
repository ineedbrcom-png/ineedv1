import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { findImage } from '@/lib/placeholder-images';

export function MapPlaceholder() {
  const mapImage = findImage('map-placeholder');

  return (
    <Card className="overflow-hidden relative text-white">
      {mapImage && (
        <Image
          src={mapImage.imageUrl}
          alt={mapImage.description}
          fill
          className="object-cover"
          data-ai-hint={mapImage.imageHint}
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-black/20" />
      <CardContent className="relative p-8 h-[250px] flex flex-col justify-end">
        <h3 className="text-3xl font-bold">Coming Soon: Interactive Map</h3>
        <p className="text-lg text-white/80 max-w-lg">
          Visualize active requests on an interactive map to discover and engage with local opportunities near you.
        </p>
      </CardContent>
    </Card>
  );
}
