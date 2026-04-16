// src/pages/Home/utils/homeKeyboardDeepCopyUtils.ts
import { addDoc, collection, getDocs, query, where } from 'firebase/firestore';

const TOPIC_RESOURCE_COLLECTIONS = ['documents', 'resumen', 'quizzes', 'exams', 'examns'];

const sanitizeSharedFields = (payload: any) => ({
  ...payload,
  isShared: false,
  sharedWith: [],
  sharedWithUids: [],
  editorUids: [],
  viewerUids: [],
});

const buildTopicClonePayload = ({
  sourceTopic,
  targetSubjectId,
  user,
  institutionId,
}: {
  sourceTopic: any;
  targetSubjectId: any;
  user: any;
  institutionId: any;
}) => {
  const rawPayload = {
    ...(sourceTopic || {}),
    subjectId: targetSubjectId,
    ownerId: user?.uid || sourceTopic?.ownerId || null,
    institutionId: sourceTopic?.institutionId || institutionId || user?.institutionId || null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const payload = sanitizeSharedFields(rawPayload);
  delete payload.id;
  return payload;
};

const buildTopicResourceClonePayload = ({
  sourceResource,
  targetTopicId,
  targetSubjectId,
  user,
  institutionId,
}: {
  sourceResource: any;
  targetTopicId: any;
  targetSubjectId: any;
  user: any;
  institutionId: any;
}) => {
  const rawPayload = {
    ...(sourceResource || {}),
    topicId: targetTopicId,
    subjectId: targetSubjectId,
    ownerId: user?.uid || sourceResource?.ownerId || null,
    institutionId: sourceResource?.institutionId || institutionId || user?.institutionId || null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const payload = sanitizeSharedFields(rawPayload);
  delete payload.id;
  return payload;
};

const cloneTopicResources = async ({
  db,
  sourceTopicId,
  targetTopicId,
  targetSubjectId,
  user,
  institutionId,
}: {
  db: any;
  sourceTopicId: any;
  targetTopicId: any;
  targetSubjectId: any;
  user: any;
  institutionId: any;
}) => {
  let copiedCount = 0;

  for (const collectionName of TOPIC_RESOURCE_COLLECTIONS) {
    let snapshot: any;

    try {
      snapshot = await getDocs(
        query(collection(db, collectionName), where('topicId', '==', sourceTopicId))
      );
    } catch {
      continue;
    }

    for (const resourceDoc of snapshot.docs) {
      const clonePayload = buildTopicResourceClonePayload({
        sourceResource: resourceDoc.data(),
        targetTopicId,
        targetSubjectId,
        user,
        institutionId,
      });

      await addDoc(collection(db, collectionName), clonePayload);
      copiedCount += 1;
    }
  }

  return copiedCount;
};

export const cloneSubjectTopicsAndResources = async ({
  db,
  sourceSubjectId,
  targetSubjectId,
  user,
  institutionId,
}: {
  db: any;
  sourceSubjectId: any;
  targetSubjectId: any;
  user: any;
  institutionId: any;
}) => {
  if (!db || !sourceSubjectId || !targetSubjectId) {
    return { topicsCopied: 0, resourcesCopied: 0 };
  }

  const topicsSnapshot = await getDocs(
    query(collection(db, 'topics'), where('subjectId', '==', sourceSubjectId))
  );

  const sourceTopics = topicsSnapshot.docs
    .map((topicDoc: any) => ({ id: topicDoc.id, ...topicDoc.data() }))
    .sort((a: any, b: any) => Number(a?.order || 0) - Number(b?.order || 0));

  let topicsCopied = 0;
  let resourcesCopied = 0;

  for (const sourceTopic of sourceTopics) {
    const topicClonePayload = buildTopicClonePayload({
      sourceTopic,
      targetSubjectId,
      user,
      institutionId,
    });

    const createdTopicRef = await addDoc(collection(db, 'topics'), topicClonePayload);
    topicsCopied += 1;

    resourcesCopied += await cloneTopicResources({
      db,
      sourceTopicId: sourceTopic.id,
      targetTopicId: createdTopicRef.id,
      targetSubjectId,
      user,
      institutionId,
    });
  }

  return {
    topicsCopied,
    resourcesCopied,
  };
};
