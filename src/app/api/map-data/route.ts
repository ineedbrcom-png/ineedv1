
import { getAdminFirestore } from "@/lib/firebase-admin";
import { allCategoriesById } from "@/lib/categories";
import { NextRequest, NextResponse } from "next/server";

// Uma função de hash simples para criar locais diferentes para fins de demonstração
// Isso garante que os pinos não fiquem todos uns sobre os outros.
const getLocation = (id: string, baseLat: number, baseLng: number) => {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    const char = id.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Converte para um inteiro de 32 bits
  }
  
  const latOffset = (hash / 2**32) * 0.1 - 0.05;
  const lngOffset = ((hash * 9301 + 49297) % 233280 / 233280) * 0.1 - 0.05;
  
  return { lat: baseLat + latOffset, lng: baseLng + lngOffset };
};


export async function GET(req: NextRequest) {
  const db = getAdminFirestore();
  if (!db) {
    return NextResponse.json({ error: "O banco de dados não está inicializado." }, { status: 500 });
  }

  try {
    // 1. Busca no banco de dados por todos os "listings" que estão publicados.
    const listingsRef = db.collection("listings");
    const q = listingsRef.where("status", "==", "publicado");
    const activeListingsSnapshot = await q.get();

    if (activeListingsSnapshot.empty) {
      return NextResponse.json({
        type: "FeatureCollection",
        features: [],
      });
    }

    // Coordenadas base para Santa Maria, RS, como no componente do mapa
    const baseLocation = {
      lat: -29.6849,
      lng: -53.8068,
    };

    // 2. Transforma cada anúncio do banco em um formato GeoJSON "Feature".
    const features = activeListingsSnapshot.docs.map(doc => {
      const listing = doc.data();
      const category = allCategoriesById[listing.categoryId];

      // Gera coordenadas simuladas com base no ID do documento para espalhar os pinos
      const coords = getLocation(doc.id, baseLocation.lat, baseLocation.lng);

      return {
        type: 'Feature',
        geometry: {
          type: 'Point',
          // O formato GeoJSON é sempre [longitude, latitude].
          coordinates: [coords.lng, coords.lat]
        },
        properties: {
          id: doc.id,
          title: listing.title,
          // A categoria é a chave para colorirmos o pino no mapa!
          category: category?.slug || 'default',
          categoryType: category?.type || 'product',
        }
      };
    });

    // 3. Monta o objeto GeoJSON final que o Google Maps espera.
    const geoJsonData = {
      type: 'FeatureCollection',
      features: features,
    };

    // 4. Envia os dados como resposta em formato JSON.
    return NextResponse.json(geoJsonData);

  } catch (error) {
    console.error('Erro ao buscar dados para o mapa:', error);
    return NextResponse.json({ error: "Erro interno no servidor" }, { status: 500 });
  }
}
