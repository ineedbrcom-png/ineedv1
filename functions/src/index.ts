import { onDocumentWritten } from "firebase-functions/v2/firestore";
import * as admin from 'firebase-admin';
import { moderateListingContent } from "./content-moderation";

// Initialize the Firebase Admin SDK only once.
if (admin.apps.length === 0) {
  admin.initializeApp();
}

/**
 * Handles the content moderation for a given listing document.
 * @param docId The ID of the document in the 'listings' collection.
 * @param data The data of the document to be moderated.
 * @returns A promise that resolves when the moderation and update are complete.
 */
async function handleModeration(docId: string, data: admin.firestore.DocumentData) {
    console.log(`Executing moderation for listing ${docId}`);
    try {
        const moderationResult = await moderateListingContent({
            title: data.title,
            description: data.description,
        });

        // The AI returns 'published', 'review', or 'rejected'.
        // We map them to our desired Firestore status values.
        let newStatus = moderationResult.classification;
        if (newStatus === 'published') {
            newStatus = 'publicado'; // Map to our status
        } else if (newStatus === 'review') {
            newStatus = 'revisao'; // Map to our status
        } else if (newStatus === 'rejected') {
            newStatus = 'rejeitado'; // Map to our status
        }

        await admin.firestore().collection('listings').doc(docId).update({ status: newStatus });
        console.log(`Listing ${docId} updated to status: ${newStatus}`);

    } catch (error) {
        console.error(`Error during moderation for listing ${docId}:`, error);
        // In case of an AI error, move to manual review to avoid losing the listing.
        await admin.firestore().collection('listings').doc(docId).update({ status: 'revisao' });
    }
}

/**
 * Firestore trigger that runs whenever a document in the 'listings' collection
 * is created or updated.
 */
export const moderateListing = onDocumentWritten("listings/{listingId}", async (event) => {
    const afterData = event.data?.after.data();
    const beforeData = event.data?.before.data();

    // Case 1: New document created (beforeData is undefined, afterData exists).
    // The status is 'pending' by default from the client form.
    if (!beforeData && afterData && afterData.status === 'pending') {
        console.log(`New listing ${event.params.listingId} detected for moderation.`);
        return handleModeration(event.params.listingId, afterData);
    }

    // Case 2: Document was updated.
    // We only re-moderate if the status was changed back to 'pending'.
    if (beforeData && afterData) {
        const statusChanged = beforeData.status !== afterData.status;
        const isResubmitted = afterData.status === 'pending';
        const contentChanged = beforeData.title !== afterData.title || beforeData.description !== afterData.description;

        if (isResubmitted && (statusChanged || contentChanged)) {
             console.log(`Listing ${event.params.listingId} was re-submitted for moderation.`);
             return handleModeration(event.params.listingId, afterData);
        }
    }
    
    // For all other cases, do nothing.
    console.log(`No moderation action needed for listing ${event.params.listingId}.`);
    return null;
});
