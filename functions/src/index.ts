
import { onDocumentCreated, onDocumentUpdated } from "firebase-functions/v2/firestore";
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { moderateListingContent } from "../../src/ai/flows/content-moderation";

if (!admin.apps.length) {
  admin.initializeApp();
}

// Lógica de moderação reutilizável
async function moderateListing(snapshot: admin.firestore.DocumentSnapshot) {
    const data = snapshot.data();
    if (!data) return;

    console.log(`Executando moderação para o anúncio ${snapshot.id}`);
    try {
        const moderationResult = await moderateListingContent({
            title: data.title,
            description: data.description,
        });
        await snapshot.ref.update({ status: moderationResult.classification });
        console.log(`Anúncio ${snapshot.id} atualizado para: ${moderationResult.classification}`);
    } catch (error) {
        console.error(`Erro na moderação do anúncio ${snapshot.id}:`, error);
        await snapshot.ref.update({ status: 'revisao' });
    }
}

// Gatilho para NOVOS anúncios
export const moderateNewListing = onDocumentCreated("listings/{listingId}", (event) => {
    if (event.data?.data().status === 'pendente') {
        return moderateListing(event.data.ref.parent.firestore.doc(event.params.listingId));
    }
    return null;
});

// Gatilho para ATUALIZAÇÕES de anúncios
export const moderateUpdatedListing = onDocumentUpdated("listings/{listingId}", (event) => {
    const before = event.data?.before.data();
    const after = event.data?.after.data();
    if (before && after && (before.title !== after.title || before.description !== after.description)) {
        if (after.status === 'pendente') {
             return moderateListing(event.data.after.ref.parent.firestore.doc(event.params.listingId));
        }
    }
    return null;
});

// (O restante do código de cleanupUserOnDelete permanece o mesmo)
