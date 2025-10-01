
"use client";

import {
  GoogleMap,
  useJsApiLoader,
  MarkerF,
} from "@react-google-maps/api";
import { type Listing } from "@/lib/data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

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
  const latOffset = (hash % 100) * 0.001 - 0.05;
  const lngOffset = (hash % 100) * 0.001 - 0.05;
  return { lat: baseLat + latOffset, lng: baseLng + lngOffset };
};

export function Map({ listings }: { listings: Listing[] }) {
  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
  });

  if (loadError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Erro no Mapa</AlertTitle>
        <AlertDescription>
          Não foi possível carregar o Google Maps. Por favor, verifique a chave
          da API.
        </AlertDescription>
      </Alert>
    );
  }

  return isLoaded ? (
    <Card className="overflow-hidden">
      <GoogleMap mapContainerStyle={containerStyle} center={defaultCenter} zoom={12}>
        {listings.map((listing) => (
          <MarkerF
            key={listing.id}
            position={getLocation(listing.id, defaultCenter.lat, defaultCenter.lng)}
            title={listing.title}
          />
        ))}
      </GoogleMap>
    </Card>
  ) : (
    <Card className="h-[400px] flex items-center justify-center">
      <p>Carregando mapa...</p>
    </Card>
  );
}
