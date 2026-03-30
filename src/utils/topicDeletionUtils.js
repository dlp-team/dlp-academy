// src/utils/topicDeletionUtils.js
import { collection, deleteDoc, doc, getDocs, query, where } from 'firebase/firestore';

export const DEFAULT_TOPIC_CASCADE_COLLECTIONS = [
    'documents',
    'resumen',
    'quizzes',
    'exams',
    'examns',
];

const normalizeCollections = (collections) => {
    if (!Array.isArray(collections)) {
        return [...DEFAULT_TOPIC_CASCADE_COLLECTIONS];
    }

    const cleaned = collections
        .map((entry) => String(entry || '').trim())
        .filter(Boolean);

    if (cleaned.length === 0) {
        return [...DEFAULT_TOPIC_CASCADE_COLLECTIONS];
    }

    return [...new Set(cleaned)];
};

const isNotFoundDelete = (error) => {
    const code = String(error?.code || '').toLowerCase();
    if (code === 'not-found') return true;

    const message = String(error?.message || '').toLowerCase();
    return message.includes('no document to update') || message.includes('missing target');
};

export const cascadeDeleteTopicResources = async ({
    db,
    topicId,
    collections = DEFAULT_TOPIC_CASCADE_COLLECTIONS,
    logger = console,
}) => {
    if (!db || !topicId) {
        return {
            collections: normalizeCollections(collections),
            attemptedDeletes: 0,
            queryFailures: [],
            deleteFailures: [],
        };
    }

    const normalizedCollections = normalizeCollections(collections);
    const queryFailures = [];
    const deleteFailures = [];
    const deleteTasks = [];

    for (const collectionName of normalizedCollections) {
        try {
            const itemsQuery = query(
                collection(db, collectionName),
                where('topicId', '==', topicId)
            );
            const itemsSnapshot = await getDocs(itemsQuery);

            itemsSnapshot.docs.forEach((itemDoc) => {
                deleteTasks.push(
                    deleteDoc(doc(db, collectionName, itemDoc.id)).catch((error) => {
                        if (isNotFoundDelete(error)) return;

                        deleteFailures.push({
                            collectionName,
                            itemId: itemDoc.id,
                            code: error?.code || null,
                            message: error?.message || String(error),
                        });
                        logger?.warn?.(`Error deleting ${collectionName} item ${itemDoc.id}:`, error);
                    })
                );
            });
        } catch (error) {
            queryFailures.push({
                collectionName,
                code: error?.code || null,
                message: error?.message || String(error),
            });
            logger?.warn?.(`Error querying ${collectionName} for topic cleanup:`, error);
        }
    }

    await Promise.allSettled(deleteTasks);

    return {
        collections: normalizedCollections,
        attemptedDeletes: deleteTasks.length,
        queryFailures,
        deleteFailures,
    };
};
