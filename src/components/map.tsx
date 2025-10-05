
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  GoogleMap,
  useJsApiLoader,
  InfoWindowF,
} from "@react-google-maps/api";
import { Card } from "@/components/ui/card";
import { AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Link from "next/link";
import { Button } from "./ui/button";

const containerStyle = {
  width: "100%",
  height: "500px", // Aumentei a altura para melhor visualização
  borderRadius: "0.5rem",
};

const defaultCenter = {
  lat: -29.6849,
  lng: -53.8068,
};

const libraries: ("places")[] = ["places"];

// Definição das cores para os tipos de categoria
const categoryColors = {
  product: '#29ABE2', // Azul (cor primária)
  service: '#FFB347', // Laranja (cor de destaque)
  default: '#808080'  // Cinza para qualquer outro caso
};

// Interface para o pino selecionado
interface SelectedPin {
  position: google.maps.LatLng;
  title: string;
  id: string;
}

export function Map() {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";
  const mapRef = useRef<google.maps.Map | null>(null);
  
  const [selectedPin, setSelectedPin] = useState<SelectedPin | null>(null);
  const [geoJson, setGeoJson] = useState<any>(null);

  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: apiKey,
    libraries: libraries,
  });

  // Busca os dados da API quando o componente é montado
  useEffect(() => {
    async function fetchMapData() {
      try {
        const response = await fetch('/api/map-data');
        if (!response.ok) {
          throw new Error('Falha ao buscar dados do mapa');
        }
        const data = await response.json();
        setGeoJson(data);
      } catch (error) {
        console.error(error);
      }
    }
    fetchMapData();
  }, []);


  const onLoad = useCallback(function callback(map: google.maps.Map) {
    mapRef.current = map;
  }, []);

  const onUnmount = useCallback(function callback(map: google.maps.Map) {
    mapRef.current = null;
    setSelectedPin(null);
  }, []);
  
  // Efeito para carregar e estilizar os dados do GeoJSON no mapa
  useEffect(() => {
    if (mapRef.current && geoJson) {
        const map = mapRef.current;
        
        // Limpa dados anteriores para evitar duplicação
        map.data.forEach(feature => {
            map.data.remove(feature);
        });

        map.data.addGeoJson(geoJson);

        // Estiliza os pinos com base na categoria
        map.data.setStyle(feature => {
            const type = feature.getProperty('categoryType') as keyof typeof categoryColors;
            const color = categoryColors[type] || categoryColors.default;

            return {
                icon: {
                    path: google.maps.SymbolPath.CIRCLE,
                    scale: 7,
                    fillColor: color,
                    fillOpacity: 1,
                    strokeWeight: 1.5,
                    strokeColor: 'white'
                },
                // Adiciona um cursor de ponteiro para indicar que é clicável
                cursor: 'pointer'
            };
        });

        // Adiciona o listener de clique para exibir o InfoWindow
        const clickListener = map.data.addListener('click', (event: google.maps.Data.MouseEvent) => {
          const feature = event.feature;
          const geometry = feature.getGeometry();
          if (geometry) {
             const position = (geometry as google.maps.Data.Point).get();
             if(position) {
                setSelectedPin({
                  position,
                  title: feature.getProperty('title'),
                  id: feature.getProperty('id'),
                });
             }
          }
        });
        
        // Limpeza: remove o listener quando o componente for desmontado
        return () => {
            google.maps.event.removeListener(clickListener);
        }
    }
  }, [mapRef, geoJson]);


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
      <Card className="h-[500px] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="ml-2">Carregando mapa...</p>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden shadow-lg">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={defaultCenter}
        zoom={13}
        options={{
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          zoomControl: true,
          mapId: 'cb11675feb560c9a59e8bcaa' // Seu ID de estilo do mapa
        }}
        onLoad={onLoad}
        onUnmount={onUnmount}
        onClick={() => setSelectedPin(null)} // Fecha o InfoWindow ao clicar no mapa
      >
        {selectedPin && (
          <InfoWindowF
            position={selectedPin.position}
            onCloseClick={() => setSelectedPin(null)}
            options={{
              pixelOffset: new window.google.maps.Size(0, -25)
            }}
          >
            <div className="p-1 max-w-xs">
              <h4 className="font-bold text-base mb-2">{selectedPin.title}</h4>
              <Button asChild size="sm">
                <Link href={`/listing/${selectedPin.id}`}>Ver Pedido</Link>
              </Button>
            </div>
          </InfoWindowF>
        )}
      </GoogleMap>
    </Card>
  );
}

