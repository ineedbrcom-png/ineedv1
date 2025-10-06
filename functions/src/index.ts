'use server';
import { onDocumentCreated, onDocumentUpdated } from "firebase-functions/v2/firestore";
import * as admin from 'firebase-admin';
import { moderateListingContent } from "./content-moderation";

// Garante que o app seja inicializado apenas uma vez
if (!admin.apps.length) {
  admin.initializeApp();
}

// Lógica de moderação reutilizável
async function handleModeration(docId: string) {
    // Busca o documento mais recente diretamente para garantir que temos os dados atuais.
    const docRef = admin.firestore().collection('listings').doc(docId);
    const snapshot = await docRef.get();
    
    if (!snapshot.exists) {
        console.log(`Documento ${docId} não existe mais. Abortando moderação.`);
        return;
    }

    const data = snapshot.data();
    if (!data) return;

    // Roda a moderação apenas se o status for 'pendente'
    if (data.status !== 'pendente') {
        console.log(`Anúncio ${docId} não está pendente (${data.status}). Pulando moderação.`);
        return;
    }

    console.log(`Executando moderação para o anúncio ${snapshot.id}`);
    try {
        const moderationResult = await moderateListingContent({
            title: data.title,
            description: data.description,
        });

        const newStatus = moderationResult.classification === 'published' ? 'publicado' : moderationResult.classification;
        
        await snapshot.ref.update({ status: newStatus });
        console.log(`Anúncio ${snapshot.id} atualizado para: ${newStatus}`);

    } catch (error) {
        console.error(`Erro na moderação do anúncio ${snapshot.id}:`, error);
        // Em caso de erro na IA, move para revisão manual para não perder o anúncio.
        await snapshot.ref.update({ status: 'revisao' });
    }
}


// Gatilho para NOVOS anúncios
// Usando onDocumentCreated, o status será 'pendente' por padrão do formulário.
export const moderateNewListing = onDocumentCreated("listings/{listingId}", (event) => {
    return handleModeration(event.params.listingId);
});

// Gatilho para ATUALIZAÇÕES de anúncios
// Acionado se um anúncio for editado e re-submetido para moderação.
export const moderateUpdatedListing = onDocumentUpdated("listings/{listingId}", (event) => {
    const afterData = event.data?.after.data();
    
    // Verifica se o status mudou para 'pendente' (indicando uma re-submissão)
    if (afterData && afterData.status === 'pendente') {
        return handleModeration(event.params.listingId);
    }
    
    // Ignora outras atualizações (ex: de 'pendente' para 'publicado')
    return null; 
});
