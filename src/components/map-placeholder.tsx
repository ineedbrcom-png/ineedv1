import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { findImage } from '@/lib/placeholder-images';

export function MapPlaceholder() {
  const mapImage = findImage('map-placeholder');

  return (
    <Card className="overflow-hidden relative text-white bg-white rounded-lg shadow-lg">
      {mapImage && (
        <Image
          src={mapImage.imageUrl}
          alt={mapImage.description}
          fill
          className="object-cover"
          data-ai-hint={mapImage.imageHint}
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/10" />
      <CardContent className="relative p-8 h-[400px] flex flex-col justify-center items-center text-center">
        <h3 className="text-3xl font-bold">Em Breve: Mapa Interativo</h3>
        <p className="text-lg text-white/90 max-w-lg mt-2">
          Visualize pedidos ativos em um mapa interativo para descobrir e se engajar com oportunidades locais perto de você.
        </p>
      </CardContent>
    </Card>
  );
}
