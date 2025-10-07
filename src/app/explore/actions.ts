
'use server';

import { getPaginatedListings } from "@/lib/data";
import { ListingFilters } from "@/lib/types";

// Server Action para buscar mais anúncios de forma segura
export async function fetchMoreListings(
    cursor: number | null, // ATUALIZADO: Agora espera um número ou nulo
    pageSize: number,
    filters: ListingFilters
) {
    // Validação de entrada pode ser adicionada aqui
    if (pageSize > 20) {
        throw new Error("Tamanho da página muito grande.");
    }

    const results = await getPaginatedListings(cursor, pageSize, filters);
    
    // Agora podemos retornar os resultados diretamente, pois 'nextCursor' já é serializável
    return {
        data: results.data,
        nextCursor: results.nextCursor,
        hasMore: results.hasMore,
    };
}
