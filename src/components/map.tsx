
"use client";

import { useState } from "react";
import {
  GoogleMap,
  useJsApiLoader,
  MarkerF,
  InfoWindowF,
} from "@react-google-maps/api";
import { type Listing } from "@/lib/data";
import { Card } from "@/components/ui/card";
import { AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Link from "next/link";
import { Button } from "./ui/button";

const containerStyle = {
  width: "100%",
  height: "400px",
  borderRadius: "0.5rem",
};

const defaultCenter = {
  lat: -29.6849,
  lng: -53.8068,
};

// A simple hashing function to create different locations for demo purposes
const getLocation = (id: string, baseLat: number, baseLng: number) => {
  const hash = id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const latOffset = ((hash * 9301 + 49297) % 233280) / 233280 * 0.1 - 0.05;
  const lngOffset = ((hash * 52429 + 1376312589) % 233280) / 233280 * 0.1 - 0.05;
  return { lat: baseLat + latOffset, lng: baseLng + lngOffset };
};

const libraries: ("places")[] = ["places"];

export function Map({ listings }: { listings: Listing[] }) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);

  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: apiKey,
    libraries: libraries,
  });

  if (loadError) {
    return (
       <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Erro ao Carregar o Mapa</AlertTitle>
        <AlertDescription>
          Não foi possível carregar o Google Maps. Verifique a chave da API e a conexão com a internet.
        </AlertDescription>
      </Alert>
    )
  }

  if (!apiKey) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Google Maps API Key Faltando</AlertTitle>
        <AlertDescription>
          A chave da API do Google Maps não foi configurada. O mapa não pode ser exibido.
        </AlertDescription>
      </Alert>
    );
  }
  
  if (!isLoaded) {
    return (
      <Card className="h-[400px] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="ml-2">Carregando mapa...</p>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={defaultCenter}
        zoom={12}
        options={{
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        }}
        onClick={() => setSelectedListing(null)}
      >
        {listings.map((listing) => (
          <MarkerF
            key={listing.id}
            position={getLocation(listing.id, defaultCenter.lat, defaultCenter.lng)}
            title={listing.title}
            onClick={() => setSelectedListing(listing)}
          />
        ))}

        {selectedListing && (
          <InfoWindowF
            position={getLocation(selectedListing.id, defaultCenter.lat, defaultCenter.lng)}
            onCloseClick={() => setSelectedListing(null)}
            options={{
              pixelOffset: new window.google.maps.Size(0, -30)
            }}
          >
            <div className="p-1 max-w-xs">
              <h4 className="font-bold text-base mb-1">{selectedListing.title}</h4>
              <p className="text-sm text-gray-600 mb-2 line-clamp-2">{selectedListing.description}</p>
              <Button asChild size="sm">
                <Link href={`/listing/${selectedListing.id}`}>Ver Pedido</Link>
              </Button>
            </div>
          </InfoWindowF>
        )}
      </GoogleMap>
    </Card>
  );
}
