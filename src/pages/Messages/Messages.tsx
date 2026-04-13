// src/pages/Messages/Messages.tsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Archive,
  ArchiveRestore,
  ArrowLeft,
  BellOff,
  Check,
  CheckCheck,
  Copy,
  CornerUpLeft,
  CornerDownRight,
  Filter,
  GraduationCap,
  Link2,
  Loader2,
  MessageCircle,
  MessageSquareText,
  Paperclip,
  Pin,
  Search,
  Send,
  Shield,
  UserRound,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  where,
  writeBatch,
} from 'firebase/firestore';
import Header from '../../components/layout/Header';
import Avatar from '../../components/ui/Avatar';
import CommunicationItemCard from '../../components/ui/CommunicationItemCard';
import { formatNotificationRelativeTime } from '../../components/ui/notificationPresentation';
import { db } from '../../firebase/config';
import { useNotifications } from '../../hooks/useNotifications';
import { DIRECT_MESSAGE_ATTACHMENT_LIMITS, sendDirectMessage } from '../../services/directMessageService';
import {
  applyConversationInboxFilters,
  buildConversationKey,
  buildThreadRows,
  filterInstitutionRecipientSuggestions,
  isUserLinkedToSubject,
  resolveConversationParticipantUid,
  timestampToMillis,
} from '../../utils/directMessageUtils';

const ROLE_META: any = {
  admin: {
    label: 'Administrador',
    icon: Shield,
    badgeClass: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
  },
  institutionadmin: {
    label: 'Admin institución',
    icon: Shield,
    badgeClass: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  },
  teacher: {
    label: 'Profesor',
    icon: GraduationCap,
    badgeClass: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300',
  },
  student: {
    label: 'Alumno',
    icon: UserRound,
    badgeClass: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  },
};

const normalizeType = (value: any) => String(value || '').trim().toLowerCase();

const normalizeValue = (value: any) => String(value || '').trim();

const getRoleLabel = (roleValue: any) => ROLE_META?.[normalizeType(roleValue)]?.label || 'Usuario';

const hasSameStringArray = (left: string[] = [], right: string[] = []) => {
  if (left.length !== right.length) return false;
  return left.every((value, index) => value === right[index]);
};

const hasSameCommonSubjectsMap = (left: any, right: any) => {
  const leftKeys = Object.keys(left || {}).sort();
  const rightKeys = Object.keys(right || {}).sort();

  if (!hasSameStringArray(leftKeys, rightKeys)) return false;

  return leftKeys.every((key) => {
    const leftValues = Array.isArray(left?.[key]) ? left[key] : [];
    const rightValues = Array.isArray(right?.[key]) ? right[key] : [];
    return hasSameStringArray(leftValues, rightValues);
  });
};

const MESSAGE_QUERY_LIMIT = 240;
const CONVERSATION_RENDER_STEP = 25;
const THREAD_RENDER_STEP = 60;
const MOBILE_BREAKPOINT_PX = 1024;
const SUBJECT_REFERENCE_SCOPE_LIMIT = 18;

const DIRECT_MESSAGE_ATTACHMENT_ACCEPT = [
  'image/*',
  '.pdf',
  '.doc',
  '.docx',
  '.ppt',
  '.pptx',
  '.xls',
  '.xlsx',
  '.txt',
  '.csv',
].join(',');

const INBOX_FILTERS = [
  { key: 'all', label: 'Todos' },
  { key: 'unread', label: 'No leidos' },
  { key: 'pinned', label: 'Fijados' },
  { key: 'archived', label: 'Archivados' },
];

const buildMessagesPreferenceStorageKey = (
  category: 'pinned' | 'muted' | 'archived',
  uid: string,
  institutionIdValue: string
) => `dlp_messages_${category}_${institutionIdValue}_${uid}`;

const buildMessagesDraftStorageKey = (uid: string, institutionIdValue: string) => (
  `dlp_messages_drafts_${institutionIdValue}_${uid}`
);

const buildMessagePreviewText = (value: any, maxLength = 90) => {
  const normalized = normalizeValue(value);
  if (normalized.length <= maxLength) return normalized;
  return `${normalized.slice(0, Math.max(0, maxLength - 3))}...`;
};

const formatAttachmentSize = (bytes: any) => {
  const normalizedBytes = Number(bytes || 0);
  if (!Number.isFinite(normalizedBytes) || normalizedBytes <= 0) return '0 KB';
  if (normalizedBytes >= 1024 * 1024) return `${(normalizedBytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(normalizedBytes / 1024))} KB`;
};

const buildSubjectRoute = (subjectId: string) => {
  const normalizedSubjectId = normalizeValue(subjectId);
  if (!normalizedSubjectId) return '';
  return `/home/subject/${normalizedSubjectId}`;
};

const buildSubjectReferenceRoute = (reference: any) => {
  if (!reference || typeof reference !== 'object') return '';

  const explicitRoute = normalizeValue(reference?.route);
  if (explicitRoute) return explicitRoute;

  const subjectId = normalizeValue(reference?.subjectId);
  if (!subjectId) return '';

  const topicId = normalizeValue(reference?.topicId);
  const resourceId = normalizeValue(reference?.resourceId);
  const resourceType = normalizeType(reference?.resourceType);

  if (topicId && resourceId) {
    if (resourceType === 'resumen' || resourceType === 'summary') {
      return `/home/subject/${subjectId}/topic/${topicId}/resumen/${resourceId}`;
    }

    if (resourceType === 'resource' || resourceType === 'document' || resourceType === 'pdf') {
      return `/home/subject/${subjectId}/topic/${topicId}/resource/${resourceId}`;
    }
  }

  return buildSubjectRoute(subjectId);
};

const isImageAttachment = (attachment: any) => {
  const contentType = normalizeType(attachment?.contentType);
  return normalizeType(attachment?.kind) === 'image' || contentType.startsWith('image/');
};

const hasSameSubjectEntriesMap = (left: any, right: any) => {
  const leftKeys = Object.keys(left || {}).sort();
  const rightKeys = Object.keys(right || {}).sort();

  if (!hasSameStringArray(leftKeys, rightKeys)) return false;

  return leftKeys.every((key) => {
    const leftEntries = Array.isArray(left?.[key]) ? left[key] : [];
    const rightEntries = Array.isArray(right?.[key]) ? right[key] : [];

    if (leftEntries.length !== rightEntries.length) return false;

    return leftEntries.every((entry: any, index: number) => (
      normalizeValue(entry?.subjectId) === normalizeValue(rightEntries[index]?.subjectId)
      && normalizeValue(entry?.subjectName) === normalizeValue(rightEntries[index]?.subjectName)
    ));
  });
};

const readStoredStringArray = (storageKey: string) => {
  try {
    if (typeof window === 'undefined' || !storageKey) return [];
    const rawValue = window.localStorage.getItem(storageKey);
    if (!rawValue) return [];

    const parsedValue = JSON.parse(rawValue);
    return Array.isArray(parsedValue)
      ? parsedValue.map((entry) => normalizeValue(entry)).filter(Boolean)
      : [];
  } catch (error) {
    console.error('Error reading messages preference from localStorage:', error);
    return [];
  }
};

const writeStoredStringArray = (storageKey: string, values: string[]) => {
  try {
    if (typeof window === 'undefined' || !storageKey) return;
    const nextValues = Array.from(new Set(values.map((entry) => normalizeValue(entry)).filter(Boolean)));
    window.localStorage.setItem(storageKey, JSON.stringify(nextValues));
  } catch (error) {
    console.error('Error writing messages preference to localStorage:', error);
  }
};

const Messages = ({ user }: any) => {
  const navigate = useNavigate();
  const currentUid = normalizeValue(user?.uid);
  const institutionId = normalizeValue(user?.institutionId);

  const [allMessages, setAllMessages] = useState<any[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [messagesError, setMessagesError] = useState('');
  const [useIndexedMessageQuery, setUseIndexedMessageQuery] = useState(true);
  const [isCompatibilityMessageQueryMode, setIsCompatibilityMessageQueryMode] = useState(false);
  const [inboxSearchTerm, setInboxSearchTerm] = useState('');
  const [activeInboxFilter, setActiveInboxFilter] = useState<'all' | 'unread' | 'pinned' | 'archived'>('all');
  const [pinnedConversationKeys, setPinnedConversationKeys] = useState<string[]>([]);
  const [mutedConversationKeys, setMutedConversationKeys] = useState<string[]>([]);
  const [archivedConversationKeys, setArchivedConversationKeys] = useState<string[]>([]);
  const [isMobileViewport, setIsMobileViewport] = useState(false);
  const [mobileViewMode, setMobileViewMode] = useState<'inbox' | 'thread'>('inbox');
  const [participantProfilesByUid, setParticipantProfilesByUid] = useState<any>({});
  const [commonSubjectsByUid, setCommonSubjectsByUid] = useState<any>({});
  const [commonSubjectEntriesByUid, setCommonSubjectEntriesByUid] = useState<any>({});
  const [selectedConversationKey, setSelectedConversationKey] = useState('');
  const [messageDraft, setMessageDraft] = useState('');
  const [composerAttachments, setComposerAttachments] = useState<any[]>([]);
  const [selectedSubjectReference, setSelectedSubjectReference] = useState<any>(null);
  const [showSubjectReferencePicker, setShowSubjectReferencePicker] = useState(false);
  const [referenceSubjectId, setReferenceSubjectId] = useState('');
  const [referenceResourceId, setReferenceResourceId] = useState('__subject__');
  const [subjectResourcesBySubjectId, setSubjectResourcesBySubjectId] = useState<any>({});
  const [loadingSubjectResources, setLoadingSubjectResources] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [replyContext, setReplyContext] = useState<any>(null);
  const [draftByConversationKey, setDraftByConversationKey] = useState<any>({});
  const [showJumpToLatest, setShowJumpToLatest] = useState(false);
  const [visibleConversationCount, setVisibleConversationCount] = useState(CONVERSATION_RENDER_STEP);
  const [visibleMessageCount, setVisibleMessageCount] = useState(THREAD_RENDER_STEP);
  const [recipientQuery, setRecipientQuery] = useState('');
  const [selectedRecipient, setSelectedRecipient] = useState<any>(null);
  const [institutionUsers, setInstitutionUsers] = useState<any[]>([]);
  const [loadingInstitutionUsers, setLoadingInstitutionUsers] = useState(false);
  const threadViewportRef = useRef<HTMLDivElement | null>(null);
  const composerTextareaRef = useRef<HTMLTextAreaElement | null>(null);
  const composerAttachmentInputRef = useRef<HTMLInputElement | null>(null);
  const wasThreadNearBottomRef = useRef(true);
  const previousConversationKeyRef = useRef('');
  const previousSelectedConversationMessageCountRef = useRef(0);
  const attemptedParticipantProfileUidsRef = useRef<any>(new Set());
  const queryFallbackTriggeredRef = useRef(false);
  const [composerFeedback, setComposerFeedback] = useState<{ tone: 'success' | 'error' | ''; text: string }>({
    tone: '',
    text: '',
  });

  const {
    notifications,
    markAsRead,
  } = useNotifications(user);

  const messageNotifications = useMemo(
    () => notifications.filter((notification) => normalizeType(notification?.type) === 'direct_message'),
    [notifications]
  );

  const recipientSuggestions = useMemo(
    () => filterInstitutionRecipientSuggestions(institutionUsers, recipientQuery, { limit: 6 }),
    [institutionUsers, recipientQuery]
  );

  const pinnedStorageKey = useMemo(
    () => (currentUid && institutionId
      ? buildMessagesPreferenceStorageKey('pinned', currentUid, institutionId)
      : ''),
    [currentUid, institutionId]
  );

  const mutedStorageKey = useMemo(
    () => (currentUid && institutionId
      ? buildMessagesPreferenceStorageKey('muted', currentUid, institutionId)
      : ''),
    [currentUid, institutionId]
  );

  const archivedStorageKey = useMemo(
    () => (currentUid && institutionId
      ? buildMessagesPreferenceStorageKey('archived', currentUid, institutionId)
      : ''),
    [currentUid, institutionId]
  );

  const draftsStorageKey = useMemo(
    () => (currentUid && institutionId
      ? buildMessagesDraftStorageKey(currentUid, institutionId)
      : ''),
    [currentUid, institutionId]
  );

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const updateViewportMode = () => {
      const isMobile = window.innerWidth < MOBILE_BREAKPOINT_PX;
      setIsMobileViewport(isMobile);
      if (!isMobile) {
        setMobileViewMode('inbox');
      }
    };

    updateViewportMode();
    window.addEventListener('resize', updateViewportMode);

    return () => {
      window.removeEventListener('resize', updateViewportMode);
    };
  }, []);

  useEffect(() => {
    if (!pinnedStorageKey) {
      setPinnedConversationKeys([]);
      return;
    }

    setPinnedConversationKeys(readStoredStringArray(pinnedStorageKey));
  }, [pinnedStorageKey]);

  useEffect(() => {
    if (!mutedStorageKey) {
      setMutedConversationKeys([]);
      return;
    }

    setMutedConversationKeys(readStoredStringArray(mutedStorageKey));
  }, [mutedStorageKey]);

  useEffect(() => {
    if (!archivedStorageKey) {
      setArchivedConversationKeys([]);
      return;
    }

    setArchivedConversationKeys(readStoredStringArray(archivedStorageKey));
  }, [archivedStorageKey]);

  useEffect(() => {
    if (!draftsStorageKey) {
      setDraftByConversationKey({});
      return;
    }

    try {
      if (typeof window === 'undefined') {
        setDraftByConversationKey({});
        return;
      }

      const rawDrafts = window.localStorage.getItem(draftsStorageKey);
      const parsedDrafts = rawDrafts ? JSON.parse(rawDrafts) : {};
      setDraftByConversationKey(parsedDrafts && typeof parsedDrafts === 'object' ? parsedDrafts : {});
    } catch (error) {
      console.error('Error reading draft messages from localStorage:', error);
      setDraftByConversationKey({});
    }
  }, [draftsStorageKey]);

  useEffect(() => {
    if (!pinnedStorageKey) return;
    writeStoredStringArray(pinnedStorageKey, pinnedConversationKeys);
  }, [pinnedConversationKeys, pinnedStorageKey]);

  useEffect(() => {
    if (!mutedStorageKey) return;
    writeStoredStringArray(mutedStorageKey, mutedConversationKeys);
  }, [mutedConversationKeys, mutedStorageKey]);

  useEffect(() => {
    if (!archivedStorageKey) return;
    writeStoredStringArray(archivedStorageKey, archivedConversationKeys);
  }, [archivedConversationKeys, archivedStorageKey]);

  useEffect(() => {
    if (!draftsStorageKey || typeof window === 'undefined') return;

    try {
      window.localStorage.setItem(draftsStorageKey, JSON.stringify(draftByConversationKey || {}));
    } catch (error) {
      console.error('Error writing draft messages to localStorage:', error);
    }
  }, [draftByConversationKey, draftsStorageKey]);

  useEffect(() => {
    if (!currentUid || !institutionId) {
      setInstitutionUsers([]);
      return;
    }

    let cancelled = false;

    const fetchInstitutionUsers = async () => {
      setLoadingInstitutionUsers(true);

      try {
        const usersSnapshot = await getDocs(
          query(
            collection(db, 'users'),
            where('institutionId', '==', institutionId)
          )
        );

        if (cancelled) return;

        const nextUsers = usersSnapshot.docs
          .map((userDoc: any) => ({
            uid: userDoc.id,
            ...userDoc.data(),
          }))
          .filter((candidate: any) => normalizeValue(candidate?.uid) !== currentUid)
          .sort((left: any, right: any) => {
            const leftLabel = normalizeValue(left?.displayName || left?.name || left?.email || '');
            const rightLabel = normalizeValue(right?.displayName || right?.name || right?.email || '');
            return leftLabel.localeCompare(rightLabel, 'es');
          });

        setInstitutionUsers(nextUsers);
      } catch (error) {
        console.error('Error fetching institution users for messages:', error);
      } finally {
        if (!cancelled) {
          setLoadingInstitutionUsers(false);
        }
      }
    };

    fetchInstitutionUsers();

    return () => {
      cancelled = true;
    };
  }, [currentUid, institutionId]);

  useEffect(() => {
    if (!currentUid) {
      setAllMessages([]);
      setLoadingMessages(false);
      setMessagesError('');
      setIsCompatibilityMessageQueryMode(false);
      return undefined;
    }

    if (!institutionId) {
      setAllMessages([]);
      setLoadingMessages(false);
      setMessagesError('No se pudo identificar tu institución para cargar mensajes.');
      setIsCompatibilityMessageQueryMode(false);
      return undefined;
    }

    setLoadingMessages(true);
    setMessagesError('');
    queryFallbackTriggeredRef.current = false;

    let senderMessagesById = new Map<string, any>();
    let recipientMessagesById = new Map<string, any>();

    const syncMergedMessages = () => {
      const merged = new Map<string, any>([
        ...Array.from(senderMessagesById.entries()),
        ...Array.from(recipientMessagesById.entries()),
      ]);

      const nextMessages = Array.from(merged.values()).sort(
        (left: any, right: any) => timestampToMillis(right?.createdAt) - timestampToMillis(left?.createdAt)
      );

      setAllMessages(nextMessages);
      setLoadingMessages(false);
    };

    const senderQuery = useIndexedMessageQuery
      ? query(
        collection(db, 'directMessages'),
        where('institutionId', '==', institutionId),
        where('senderUid', '==', currentUid),
        orderBy('createdAt', 'desc'),
        limit(MESSAGE_QUERY_LIMIT)
      )
      : query(
        collection(db, 'directMessages'),
        where('institutionId', '==', institutionId),
        where('senderUid', '==', currentUid)
      );

    const recipientQuery = useIndexedMessageQuery
      ? query(
        collection(db, 'directMessages'),
        where('institutionId', '==', institutionId),
        where('recipientUid', '==', currentUid),
        orderBy('createdAt', 'desc'),
        limit(MESSAGE_QUERY_LIMIT)
      )
      : query(
        collection(db, 'directMessages'),
        where('institutionId', '==', institutionId),
        where('recipientUid', '==', currentUid)
      );

    if (!useIndexedMessageQuery) {
      setIsCompatibilityMessageQueryMode(true);
    }

    const unsubscribeSender = onSnapshot(senderQuery, (snapshot) => {
      senderMessagesById = new Map(
        snapshot.docs.map((messageDoc: any) => [
          messageDoc.id,
          { id: messageDoc.id, ...messageDoc.data() },
        ])
      );
      if (useIndexedMessageQuery) {
        setIsCompatibilityMessageQueryMode(false);
      }
      syncMergedMessages();
    }, (error: any) => {
      if (
        useIndexedMessageQuery
        && error?.code === 'failed-precondition'
        && !queryFallbackTriggeredRef.current
      ) {
        queryFallbackTriggeredRef.current = true;
        setUseIndexedMessageQuery(false);
        setMessagesError('');
        return;
      }

      console.error('Error listening sender messages:', error);

      setMessagesError(
        error?.code === 'permission-denied'
          ? 'No tienes permisos suficientes para leer mensajes de esta institución.'
          : 'No se pudieron cargar los mensajes enviados.'
      );
      setLoadingMessages(false);
    });

    const unsubscribeRecipient = onSnapshot(recipientQuery, (snapshot) => {
      recipientMessagesById = new Map(
        snapshot.docs.map((messageDoc: any) => [
          messageDoc.id,
          { id: messageDoc.id, ...messageDoc.data() },
        ])
      );
      if (useIndexedMessageQuery) {
        setIsCompatibilityMessageQueryMode(false);
      }
      syncMergedMessages();
    }, (error: any) => {
      if (
        useIndexedMessageQuery
        && error?.code === 'failed-precondition'
        && !queryFallbackTriggeredRef.current
      ) {
        queryFallbackTriggeredRef.current = true;
        setUseIndexedMessageQuery(false);
        setMessagesError('');
        return;
      }

      console.error('Error listening recipient messages:', error);

      setMessagesError(
        error?.code === 'permission-denied'
          ? 'No tienes permisos suficientes para leer mensajes de esta institución.'
          : 'No se pudieron cargar los mensajes recibidos.'
      );
      setLoadingMessages(false);
    });

    return () => {
      unsubscribeSender();
      unsubscribeRecipient();
    };
  }, [currentUid, institutionId, useIndexedMessageQuery]);

  const conversations = useMemo(() => {
    const grouped = new Map<string, any>();

    allMessages.forEach((message: any) => {
      const conversationKey = buildConversationKey(message?.senderUid, message?.recipientUid);
      const participantUid = resolveConversationParticipantUid(message, currentUid);

      if (!conversationKey || !participantUid) return;

      if (!grouped.has(conversationKey)) {
        grouped.set(conversationKey, {
          conversationKey,
          participantUid,
          messages: [],
        });
      }

      grouped.get(conversationKey).messages.push(message);
    });

    return Array.from(grouped.values())
      .map((conversation) => {
        const orderedMessages = [...conversation.messages].sort(
          (left: any, right: any) => timestampToMillis(left?.createdAt) - timestampToMillis(right?.createdAt)
        );

        const lastMessage = orderedMessages[orderedMessages.length - 1] || null;
        const unreadCount = orderedMessages.filter((message: any) => (
          normalizeValue(message?.recipientUid) === currentUid && !message?.readByRecipient
        )).length;

        const profile = participantProfilesByUid?.[conversation.participantUid] || {};
        const fallbackName = normalizeValue(
          normalizeValue(lastMessage?.senderUid) === currentUid
            ? (lastMessage?.recipientDisplayName || lastMessage?.recipientEmail)
            : (lastMessage?.senderDisplayName || lastMessage?.senderEmail)
        );

        const participantName = normalizeValue(profile?.displayName || profile?.name || fallbackName || 'Usuario');
        const participantPhotoURL = normalizeValue(profile?.photoURL) || null;
        const participantRole = normalizeType(profile?.role) || 'student';

        return {
          ...conversation,
          lastMessage,
          messages: orderedMessages,
          unreadCount,
          participantName,
          participantPhotoURL,
          participantRole,
          commonSubjects: commonSubjectsByUid?.[conversation.participantUid] || [],
          commonSubjectEntries: commonSubjectEntriesByUid?.[conversation.participantUid] || [],
        };
      })
      .sort((left: any, right: any) => timestampToMillis(right?.lastMessage?.createdAt) - timestampToMillis(left?.lastMessage?.createdAt));
  }, [allMessages, commonSubjectEntriesByUid, commonSubjectsByUid, currentUid, participantProfilesByUid]);

  const inboxConversations = useMemo(
    () => applyConversationInboxFilters(conversations, {
      searchTerm: inboxSearchTerm,
      activeFilter: activeInboxFilter,
      pinnedConversationKeys,
      mutedConversationKeys,
      archivedConversationKeys,
    }),
    [activeInboxFilter, archivedConversationKeys, conversations, inboxSearchTerm, mutedConversationKeys, pinnedConversationKeys]
  );

  const visibleMessageNotifications = useMemo(
    () => messageNotifications.filter((notification: any) => {
      const senderUid = normalizeValue(notification?.senderUid);
      if (!senderUid || !currentUid) return true;

      const relatedConversationKey = buildConversationKey(senderUid, currentUid);
      return !mutedConversationKeys.includes(relatedConversationKey)
        && !archivedConversationKeys.includes(relatedConversationKey);
    }),
    [archivedConversationKeys, currentUid, messageNotifications, mutedConversationKeys]
  );

  useEffect(() => {
    if (!conversations.length) return;

    const availableConversationKeys = new Set(
      conversations.map((conversation: any) => normalizeValue(conversation?.conversationKey)).filter(Boolean)
    );

    setPinnedConversationKeys((previous) => {
      const next = previous.filter((conversationKey) => availableConversationKeys.has(conversationKey));
      return hasSameStringArray(previous, next) ? previous : next;
    });

    setMutedConversationKeys((previous) => {
      const next = previous.filter((conversationKey) => availableConversationKeys.has(conversationKey));
      return hasSameStringArray(previous, next) ? previous : next;
    });

    setArchivedConversationKeys((previous) => {
      const next = previous.filter((conversationKey) => availableConversationKeys.has(conversationKey));
      return hasSameStringArray(previous, next) ? previous : next;
    });
  }, [conversations]);

  const participantUids = useMemo(() => {
    const conversationParticipantUids = inboxConversations
      .map((conversation: any) => conversation.participantUid)
      .filter(Boolean);

    const selectedRecipientUid = normalizeValue(selectedRecipient?.uid);
    if (selectedRecipientUid) {
      conversationParticipantUids.push(selectedRecipientUid);
    }

    return Array.from(new Set(conversationParticipantUids));
  }, [inboxConversations, selectedRecipient?.uid]);

  const participantKey = participantUids.join('|');

  useEffect(() => {
    if (!participantUids.length) return;

    const pendingParticipantUids = participantUids.filter(
      (participantUid) => !attemptedParticipantProfileUidsRef.current.has(participantUid)
    );
    if (!pendingParticipantUids.length) return;

    pendingParticipantUids.forEach((participantUid) => {
      attemptedParticipantProfileUidsRef.current.add(participantUid);
    });

    let cancelled = false;

    const fetchParticipantProfiles = async () => {
      const profileEntries = await Promise.all(pendingParticipantUids.map(async (participantUid) => {
        try {
          const profileSnapshot = await getDoc(doc(db, 'users', participantUid));
          if (!profileSnapshot.exists()) return [participantUid, null];
          return [participantUid, profileSnapshot.data()];
        } catch (error) {
          console.error('Error fetching participant profile:', error);
          return [participantUid, null];
        }
      }));

      if (cancelled) return;

      const nextProfiles: any = {};
      profileEntries.forEach(([participantUid, profileData]) => {
        if (profileData) {
          nextProfiles[participantUid] = profileData;
        }
      });

      if (Object.keys(nextProfiles).length > 0) {
        setParticipantProfilesByUid((previous: any) => ({ ...previous, ...nextProfiles }));
      }
    };

    fetchParticipantProfiles();

    return () => {
      cancelled = true;
    };
  }, [participantKey]);

  useEffect(() => {
    if (!currentUid || !institutionId || !participantUids.length) {
      setCommonSubjectsByUid((previous: any) => (
        Object.keys(previous || {}).length === 0 ? previous : {}
      ));
      setCommonSubjectEntriesByUid((previous: any) => (
        Object.keys(previous || {}).length === 0 ? previous : {}
      ));
      return;
    }

    let cancelled = false;

    const fetchCommonSubjects = async () => {
      try {
        const subjectsQuery = query(
          collection(db, 'subjects'),
          where('institutionId', '==', institutionId)
        );

        const subjectsSnapshot = await getDocs(subjectsQuery);
        if (cancelled) return;

        const nextCommonSubjects: any = {};
        const nextCommonSubjectEntries: any = {};
        participantUids.forEach((participantUid) => {
          nextCommonSubjects[participantUid] = [];
          nextCommonSubjectEntries[participantUid] = [];
        });

        subjectsSnapshot.docs.forEach((subjectDoc: any) => {
          const subjectData = subjectDoc.data() || {};
          if (!isUserLinkedToSubject(subjectData, currentUid)) return;

          const subjectId = normalizeValue(subjectDoc.id);
          const subjectName = normalizeValue(subjectData?.name || subjectData?.title || '');
          if (!subjectName || !subjectId) return;

          participantUids.forEach((participantUid) => {
            if (!isUserLinkedToSubject(subjectData, participantUid)) return;

            nextCommonSubjects[participantUid].push(subjectName);
            nextCommonSubjectEntries[participantUid].push({
              subjectId,
              subjectName,
            });
          });
        });

        Object.keys(nextCommonSubjects).forEach((participantUid) => {
          nextCommonSubjects[participantUid] = Array.from(new Set(nextCommonSubjects[participantUid])).slice(0, 6);
          nextCommonSubjectEntries[participantUid] = nextCommonSubjectEntries[participantUid]
            .filter((entry: any, index: number, source: any[]) => (
              source.findIndex((candidate: any) => normalizeValue(candidate?.subjectId) === normalizeValue(entry?.subjectId)) === index
            ))
            .slice(0, 6);
        });

        setCommonSubjectsByUid((previous: any) => (
          hasSameCommonSubjectsMap(previous, nextCommonSubjects)
            ? previous
            : nextCommonSubjects
        ));

        setCommonSubjectEntriesByUid((previous: any) => (
          hasSameSubjectEntriesMap(previous, nextCommonSubjectEntries)
            ? previous
            : nextCommonSubjectEntries
        ));
      } catch (error) {
        console.error('Error fetching common subjects:', error);
      }
    };

    fetchCommonSubjects();

    return () => {
      cancelled = true;
    };
  }, [currentUid, institutionId, participantKey]);

  useEffect(() => {
    if (!inboxConversations.length) {
      setSelectedConversationKey('');
      return;
    }

    setSelectedConversationKey((previousKey) => {
      if (previousKey && inboxConversations.some((conversation: any) => conversation.conversationKey === previousKey)) {
        return previousKey;
      }
      return '';
    });
  }, [inboxConversations]);

  const selectedConversation = useMemo(
    () => conversations.find((conversation: any) => conversation.conversationKey === selectedConversationKey) || null,
    [conversations, selectedConversationKey]
  );

  const selectedConversationIsPinned = selectedConversation
    ? pinnedConversationKeys.includes(selectedConversation.conversationKey)
    : false;

  const selectedConversationIsMuted = selectedConversation
    ? mutedConversationKeys.includes(selectedConversation.conversationKey)
    : false;

  const selectedConversationIsArchived = selectedConversation
    ? archivedConversationKeys.includes(selectedConversation.conversationKey)
    : false;

  const visibleConversations = useMemo(
    () => inboxConversations.slice(0, visibleConversationCount),
    [inboxConversations, visibleConversationCount]
  );

  const hasMoreConversations = inboxConversations.length > visibleConversationCount;

  const visibleSelectedConversationMessages = useMemo(() => {
    if (!selectedConversation) return [];

    const startIndex = Math.max(0, selectedConversation.messages.length - visibleMessageCount);
    return selectedConversation.messages.slice(startIndex);
  }, [selectedConversation, visibleMessageCount]);

  const hiddenSelectedConversationMessageCount = selectedConversation
    ? Math.max(0, selectedConversation.messages.length - visibleSelectedConversationMessages.length)
    : 0;

  const selectedThreadRows = useMemo(
    () => buildThreadRows(visibleSelectedConversationMessages),
    [visibleSelectedConversationMessages]
  );

  const activeComposerConversationKey = useMemo(() => {
    if (selectedConversation?.conversationKey) {
      return normalizeValue(selectedConversation.conversationKey);
    }

    const selectedRecipientUid = normalizeValue(selectedRecipient?.uid);
    if (!selectedRecipientUid) {
      return '';
    }

    return buildConversationKey(currentUid, selectedRecipientUid);
  }, [currentUid, selectedConversation?.conversationKey, selectedRecipient?.uid]);

  const showInboxPane = !isMobileViewport || mobileViewMode === 'inbox';
  const showThreadPane = !isMobileViewport || mobileViewMode === 'thread';

  useEffect(() => {
    setVisibleConversationCount(CONVERSATION_RENDER_STEP);
  }, [activeInboxFilter, currentUid, inboxSearchTerm, institutionId]);

  useEffect(() => {
    setVisibleMessageCount(THREAD_RENDER_STEP);
  }, [selectedConversationKey]);

  useEffect(() => {
    if (!activeComposerConversationKey) {
      setMessageDraft('');
      return;
    }

    setMessageDraft(String(draftByConversationKey?.[activeComposerConversationKey] || ''));
  }, [activeComposerConversationKey, draftByConversationKey]);

  useEffect(() => {
    setReplyContext(null);
  }, [selectedConversationKey, selectedRecipient?.uid]);

  useEffect(() => {
    const viewport = threadViewportRef.current;
    if (!viewport) return undefined;

    const handleThreadScroll = () => {
      const distanceFromBottom = viewport.scrollHeight - (viewport.scrollTop + viewport.clientHeight);
      const isNearBottom = distanceFromBottom < 80;
      wasThreadNearBottomRef.current = isNearBottom;
      setShowJumpToLatest(!isNearBottom && distanceFromBottom > 180);
    };

    handleThreadScroll();
    viewport.addEventListener('scroll', handleThreadScroll);

    return () => {
      viewport.removeEventListener('scroll', handleThreadScroll);
    };
  }, [selectedConversationKey]);

  useEffect(() => {
    const viewport = threadViewportRef.current;
    if (!viewport || !selectedConversation) return;

    const currentConversationKey = normalizeValue(selectedConversation?.conversationKey);
    const currentMessageCount = selectedConversation?.messages?.length || 0;
    const switchedConversation = currentConversationKey !== previousConversationKeyRef.current;
    const hasNewMessages = currentMessageCount > previousSelectedConversationMessageCountRef.current;

    if (switchedConversation || (hasNewMessages && wasThreadNearBottomRef.current)) {
      viewport.scrollTop = viewport.scrollHeight;
      setShowJumpToLatest(false);
    }

    previousConversationKeyRef.current = currentConversationKey;
    previousSelectedConversationMessageCountRef.current = currentMessageCount;
  }, [selectedConversation?.conversationKey, selectedConversation?.messages?.length]);

  useEffect(() => {
    if (selectedConversation) return;
    previousConversationKeyRef.current = '';
    previousSelectedConversationMessageCountRef.current = 0;
    setShowJumpToLatest(false);
  }, [selectedConversation]);

  useEffect(() => {
    const selectedRecipientUid = normalizeValue(selectedRecipient?.uid);
    if (!selectedRecipientUid) return;

    const matchingConversation = conversations.find(
      (conversation: any) => normalizeValue(conversation?.participantUid) === selectedRecipientUid
    );

    if (!matchingConversation) return;

    setSelectedConversationKey(matchingConversation.conversationKey);
    setSelectedRecipient(null);
  }, [conversations, selectedRecipient?.uid]);

  const selectedRecipientCommonSubjectEntries = useMemo(() => {
    const selectedRecipientUid = normalizeValue(selectedRecipient?.uid);
    if (!selectedRecipientUid) return [];
    return commonSubjectEntriesByUid?.[selectedRecipientUid] || [];
  }, [commonSubjectEntriesByUid, selectedRecipient?.uid]);

  const availableSubjectEntries = useMemo(() => {
    if (selectedConversation?.commonSubjectEntries?.length) {
      return selectedConversation.commonSubjectEntries;
    }
    return selectedRecipientCommonSubjectEntries;
  }, [selectedConversation?.commonSubjectEntries, selectedRecipientCommonSubjectEntries]);

  useEffect(() => {
    if (!availableSubjectEntries.length) {
      setReferenceSubjectId('');
      setReferenceResourceId('__subject__');
      setShowSubjectReferencePicker(false);
      setSelectedSubjectReference(null);
      return;
    }

    setReferenceSubjectId((previous) => {
      if (previous && availableSubjectEntries.some((entry: any) => normalizeValue(entry?.subjectId) === previous)) {
        return previous;
      }
      return normalizeValue(availableSubjectEntries[0]?.subjectId);
    });
  }, [availableSubjectEntries]);

  useEffect(() => {
    setReferenceResourceId('__subject__');
  }, [referenceSubjectId]);

  const referenceResources = useMemo(
    () => subjectResourcesBySubjectId?.[referenceSubjectId] || [],
    [referenceSubjectId, subjectResourcesBySubjectId]
  );

  useEffect(() => {
    if (!referenceSubjectId || subjectResourcesBySubjectId?.[referenceSubjectId]) return;

    let cancelled = false;

    const loadSubjectResources = async () => {
      setLoadingSubjectResources(true);

      try {
        const topicsSnapshot = await getDocs(
          query(
            collection(db, 'topics'),
            where('subjectId', '==', referenceSubjectId),
            limit(SUBJECT_REFERENCE_SCOPE_LIMIT)
          )
        );

        const topicDocs = topicsSnapshot.docs
          .map((topicDoc: any) => ({
            id: topicDoc.id,
            ...(topicDoc.data() || {}),
          }))
          .filter((topic: any) => {
            const topicInstitutionId = normalizeValue(topic?.institutionId);
            return !institutionId || !topicInstitutionId || topicInstitutionId === institutionId;
          });

        let encounteredPermissionDenial = false;

        const resourceGroups = await Promise.all(topicDocs.map(async (topic: any) => {
          const topicName = normalizeValue(topic?.name || topic?.title || 'Tema');

          const resourceQueries = await Promise.allSettled([
            getDocs(query(collection(db, 'documents'), where('topicId', '==', topic.id), limit(10))),
            getDocs(query(collection(db, 'resumen'), where('topicId', '==', topic.id), limit(10))),
            getDocs(query(collection(db, 'subjects', referenceSubjectId, 'topics', topic.id, 'documents'), limit(10))),
            getDocs(query(collection(db, 'subjects', referenceSubjectId, 'topics', topic.id, 'resumen'), limit(10))),
          ]);

          const [
            rootDocumentsResult,
            rootSummariesResult,
            nestedDocumentsResult,
            nestedSummariesResult,
          ] = resourceQueries;

          const mapDocsToResources = (result: any, resourceType: 'resource' | 'resumen') => {
            if (result.status !== 'fulfilled') {
              const errorCode = normalizeValue(result?.reason?.code);
              if (errorCode === 'permission-denied') {
                encounteredPermissionDenial = true;
              } else if (result?.reason) {
                console.error('Error loading topic resources for direct message references:', result.reason);
              }
              return [];
            }

            return result.value.docs.map((resourceDoc: any) => {
              const resourceData = resourceDoc.data() || {};
              return {
                id: `${resourceType}_${resourceDoc.id}`,
                resourceType,
                resourceId: resourceDoc.id,
                resourceName: normalizeValue(resourceData?.name || resourceData?.title || (resourceType === 'resumen' ? 'Resumen' : 'Recurso')),
                topicId: topic.id,
                topicName,
                route: resourceType === 'resumen'
                  ? `/home/subject/${referenceSubjectId}/topic/${topic.id}/resumen/${resourceDoc.id}`
                  : `/home/subject/${referenceSubjectId}/topic/${topic.id}/resource/${resourceDoc.id}`,
              };
            });
          };

          const resourcesMap = new Map<string, any>();
          [
            ...mapDocsToResources(rootDocumentsResult, 'resource'),
            ...mapDocsToResources(rootSummariesResult, 'resumen'),
            ...mapDocsToResources(nestedDocumentsResult, 'resource'),
            ...mapDocsToResources(nestedSummariesResult, 'resumen'),
          ].forEach((entry: any) => {
            if (!resourcesMap.has(entry.id)) {
              resourcesMap.set(entry.id, entry);
            }
          });

          return Array.from(resourcesMap.values());
        }));

        if (cancelled) return;

        const flattenedResources = resourceGroups.flat().slice(0, 50);

        setSubjectResourcesBySubjectId((previous: any) => ({
          ...(previous || {}),
          [referenceSubjectId]: flattenedResources,
        }));

        if (encounteredPermissionDenial && flattenedResources.length === 0) {
          setComposerFeedback({
            tone: 'error',
            text: 'No tienes permisos para consultar recursos de referencia en esta asignatura.',
          });
        }
      } catch (error) {
        console.error('Error loading subject references for direct messages:', error);
        if (!cancelled) {
          setComposerFeedback({
            tone: 'error',
            text: 'No se pudieron cargar los recursos de esta asignatura para referencia.',
          });
          setSubjectResourcesBySubjectId((previous: any) => ({
            ...(previous || {}),
            [referenceSubjectId]: [],
          }));
        }
      } finally {
        if (!cancelled) {
          setLoadingSubjectResources(false);
        }
      }
    };

    loadSubjectResources();

    return () => {
      cancelled = true;
    };
  }, [institutionId, referenceSubjectId, subjectResourcesBySubjectId]);

  const handleMessageDraftChange = (nextValue: string) => {
    setMessageDraft(nextValue);

    if (!activeComposerConversationKey) {
      return;
    }

    setDraftByConversationKey((previous: any) => {
      const currentValue = String(previous?.[activeComposerConversationKey] || '');
      if (currentValue === nextValue) {
        return previous;
      }

      const nextMap = { ...(previous || {}) };
      if (!nextValue.trim()) {
        delete nextMap[activeComposerConversationKey];
      } else {
        nextMap[activeComposerConversationKey] = nextValue;
      }

      return nextMap;
    });
  };

  const handleComposerAttachmentsSelected = (event: any) => {
    const selectedFiles = Array.from(event?.target?.files || []);
    if (!selectedFiles.length) {
      event.target.value = '';
      return;
    }

    const maxCount = DIRECT_MESSAGE_ATTACHMENT_LIMITS.maxCount;
    const maxFileSizeBytes = DIRECT_MESSAGE_ATTACHMENT_LIMITS.maxFileSizeBytes;
    const supportedMimeTypes = DIRECT_MESSAGE_ATTACHMENT_LIMITS.allowedMimeTypes;

    let rejectedBySize = 0;
    let rejectedByType = 0;
    let rejectedByCount = 0;

    const nextAttachments = [...composerAttachments];

    selectedFiles.forEach((file: any) => {
      if (nextAttachments.length >= maxCount) {
        rejectedByCount += 1;
        return;
      }

      const normalizedFileType = normalizeType(file?.type);
      const isSupportedType = normalizedFileType.startsWith('image/')
        || supportedMimeTypes.includes(normalizedFileType);
      if (!isSupportedType) {
        rejectedByType += 1;
        return;
      }

      if (Number(file?.size || 0) > maxFileSizeBytes) {
        rejectedBySize += 1;
        return;
      }

      const fileFingerprint = `${normalizeValue(file?.name)}_${Number(file?.size || 0)}_${Number(file?.lastModified || 0)}`;
      const isDuplicate = nextAttachments.some((existing: any) => (
        `${normalizeValue(existing?.name)}_${Number(existing?.size || 0)}_${Number(existing?.lastModified || 0)}` === fileFingerprint
      ));

      if (!isDuplicate) {
        nextAttachments.push(file);
      }
    });

    setComposerAttachments(nextAttachments);

    if (rejectedBySize > 0 || rejectedByType > 0 || rejectedByCount > 0) {
      const feedbackParts: string[] = [];
      if (rejectedBySize > 0) {
        feedbackParts.push(`${rejectedBySize} archivo(s) superan 8 MB`);
      }
      if (rejectedByType > 0) {
        feedbackParts.push(`${rejectedByType} archivo(s) tienen un formato no compatible`);
      }
      if (rejectedByCount > 0) {
        feedbackParts.push(`límite máximo de ${maxCount} adjuntos por mensaje`);
      }

      setComposerFeedback({
        tone: 'error',
        text: `No se pudieron adjuntar todos los archivos: ${feedbackParts.join(', ')}.`,
      });
    }

    event.target.value = '';
  };

  const handleRemoveComposerAttachment = (indexToRemove: number) => {
    setComposerAttachments((previous) => previous.filter((_: any, index: number) => index !== indexToRemove));
  };

  const handleInsertSubjectReference = () => {
    if (!referenceSubjectId) {
      setComposerFeedback({ tone: 'error', text: 'Selecciona una asignatura para crear la referencia.' });
      return;
    }

    const selectedSubject = availableSubjectEntries.find(
      (entry: any) => normalizeValue(entry?.subjectId) === referenceSubjectId
    );

    if (!selectedSubject) {
      setComposerFeedback({ tone: 'error', text: 'No se pudo resolver la asignatura seleccionada.' });
      return;
    }

    if (referenceResourceId === '__subject__') {
      setSelectedSubjectReference({
        subjectId: referenceSubjectId,
        subjectName: normalizeValue(selectedSubject?.subjectName || 'Asignatura'),
        resourceType: 'subject',
        resourceId: null,
        resourceName: null,
        topicId: null,
        label: `Asignatura: ${normalizeValue(selectedSubject?.subjectName || 'Asignatura')}`,
        route: buildSubjectRoute(referenceSubjectId),
      });
      setShowSubjectReferencePicker(false);
      return;
    }

    const selectedResource = referenceResources.find(
      (resource: any) => normalizeValue(resource?.id) === referenceResourceId
    );

    if (!selectedResource) {
      setComposerFeedback({ tone: 'error', text: 'Selecciona un recurso válido para añadir la referencia.' });
      return;
    }

    setSelectedSubjectReference({
      subjectId: referenceSubjectId,
      subjectName: normalizeValue(selectedSubject?.subjectName || 'Asignatura'),
      topicId: normalizeValue(selectedResource?.topicId),
      resourceType: normalizeValue(selectedResource?.resourceType),
      resourceId: normalizeValue(selectedResource?.resourceId),
      resourceName: normalizeValue(selectedResource?.resourceName),
      label: `${normalizeValue(selectedResource?.topicName || 'Tema')} · ${normalizeValue(selectedResource?.resourceName || 'Recurso')}`,
      route: normalizeValue(selectedResource?.route),
    });
    setShowSubjectReferencePicker(false);
  };

  const handleOpenSubjectReference = (reference: any) => {
    const route = buildSubjectReferenceRoute(reference);
    if (!route) return;
    navigate(route);
  };

  const handleCopyMessageContent = async (message: any) => {
    const messageContent = normalizeValue(message?.content);
    if (!messageContent) return;

    try {
      if (typeof navigator === 'undefined' || !navigator.clipboard?.writeText) {
        throw new Error('Clipboard API unavailable');
      }

      await navigator.clipboard.writeText(messageContent);
      setComposerFeedback({
        tone: 'success',
        text: 'Mensaje copiado al portapapeles.',
      });
    } catch (error) {
      console.error('Error copying direct message content:', error);
      setComposerFeedback({
        tone: 'error',
        text: 'No se pudo copiar el mensaje en este dispositivo.',
      });
    }
  };

  const handleReplyToMessage = (message: any) => {
    if (!message) return;

    const isOwnMessage = normalizeValue(message?.senderUid) === currentUid;
    const senderName = isOwnMessage
      ? 'Tú'
      : normalizeValue(
        selectedConversation?.participantName
        || message?.senderDisplayName
        || message?.senderEmail
        || 'Usuario'
      );

    setReplyContext({
      messageId: normalizeValue(message?.id),
      senderName,
      preview: buildMessagePreviewText(message?.content),
    });

    composerTextareaRef.current?.focus();
  };

  const handleScrollToLatestMessage = () => {
    const viewport = threadViewportRef.current;
    if (!viewport) return;

    viewport.scrollTop = viewport.scrollHeight;
    setShowJumpToLatest(false);
    wasThreadNearBottomRef.current = true;
  };

  useEffect(() => {
    if (!selectedConversation || !currentUid) return;

    const unreadMessages = selectedConversation.messages.filter((message: any) => (
      normalizeValue(message?.recipientUid) === currentUid && !message?.readByRecipient
    ));

    if (!unreadMessages.length) return;

    const markConversationMessagesAsRead = async () => {
      try {
        const batch = writeBatch(db);
        unreadMessages.forEach((message: any) => {
          batch.update(doc(db, 'directMessages', message.id), {
            readByRecipient: true,
            readAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        });

        await batch.commit();
      } catch (error) {
        console.error('Error marking conversation messages as read:', error);
      }
    };

    markConversationMessagesAsRead();
  }, [currentUid, selectedConversation]);

  const handleSelectConversation = async (conversation: any) => {
    setSelectedConversationKey(conversation.conversationKey);
    setSelectedRecipient(null);
    setRecipientQuery('');
    setMobileViewMode('thread');
    setShowSubjectReferencePicker(false);
    setSelectedSubjectReference(null);
    setComposerAttachments([]);
    if (composerAttachmentInputRef.current) {
      composerAttachmentInputRef.current.value = '';
    }

    const relatedNotifications = messageNotifications.filter((notification: any) => (
      !notification?.read && normalizeValue(notification?.senderUid) === conversation.participantUid
    ));

    await Promise.all(relatedNotifications.map((notification: any) => markAsRead(notification.id)));
  };

  const handleSelectRecipient = (recipient: any) => {
    const recipientUid = normalizeValue(recipient?.uid);
    if (!recipientUid) return;

    const matchingConversation = conversations.find(
      (conversation: any) => normalizeValue(conversation?.participantUid) === recipientUid
    );

    setComposerFeedback({ tone: '', text: '' });
    setRecipientQuery('');
    setShowSubjectReferencePicker(false);
    setSelectedSubjectReference(null);
    setComposerAttachments([]);
    if (composerAttachmentInputRef.current) {
      composerAttachmentInputRef.current.value = '';
    }

    if (matchingConversation) {
      setSelectedConversationKey(matchingConversation.conversationKey);
      setSelectedRecipient(null);
      setMobileViewMode('thread');
      return;
    }

    setSelectedConversationKey('');
    setSelectedRecipient(recipient);
    setMobileViewMode('thread');
  };

  const handleTogglePinnedConversation = (conversationKey: string) => {
    const normalizedConversationKey = normalizeValue(conversationKey);
    if (!normalizedConversationKey) return;

    setPinnedConversationKeys((previous) => {
      const keySet = new Set(previous);
      if (keySet.has(normalizedConversationKey)) {
        keySet.delete(normalizedConversationKey);
      } else {
        keySet.add(normalizedConversationKey);
      }
      return Array.from(keySet);
    });
  };

  const handleToggleMutedConversation = (conversationKey: string) => {
    const normalizedConversationKey = normalizeValue(conversationKey);
    if (!normalizedConversationKey) return;

    setMutedConversationKeys((previous) => {
      const keySet = new Set(previous);
      if (keySet.has(normalizedConversationKey)) {
        keySet.delete(normalizedConversationKey);
      } else {
        keySet.add(normalizedConversationKey);
      }
      return Array.from(keySet);
    });
  };

  const handleToggleArchivedConversation = (conversationKey: string) => {
    const normalizedConversationKey = normalizeValue(conversationKey);
    if (!normalizedConversationKey) return;

    setArchivedConversationKeys((previous) => {
      const keySet = new Set(previous);
      if (keySet.has(normalizedConversationKey)) {
        keySet.delete(normalizedConversationKey);
      } else {
        keySet.add(normalizedConversationKey);
      }
      return Array.from(keySet);
    });
  };

  const handleThreadBackToInbox = () => {
    setMobileViewMode('inbox');
  };

  const handleMessageDraftKeyDown = (event: any) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      void handleSendMessage();
    }
  };

  const handleSendMessage = async () => {
    if (sendingMessage) return;

    const targetRecipientUid = normalizeValue(
      selectedConversation?.participantUid || selectedRecipient?.uid
    );

    if (!targetRecipientUid) {
      setComposerFeedback({ tone: 'error', text: 'Selecciona una persona para enviar el mensaje.' });
      return;
    }

    const content = normalizeValue(messageDraft);
    if (!content && composerAttachments.length === 0 && !selectedSubjectReference) {
      setComposerFeedback({
        tone: 'error',
        text: 'Escribe un mensaje, adjunta un archivo o agrega una referencia antes de enviar.',
      });
      return;
    }

    const replyPrefix = replyContext?.messageId
      ? `↪ ${normalizeValue(replyContext?.senderName || 'Usuario')}: ${normalizeValue(replyContext?.preview || '')}\n`
      : '';

    const composedContent = content ? `${replyPrefix}${content}`.trim() : '';
    if (composedContent.length > 700) {
      setComposerFeedback({
        tone: 'error',
        text: 'Tu respuesta citada supera el límite de 700 caracteres. Reduce el contenido.',
      });
      return;
    }

    setSendingMessage(true);
    setComposerFeedback({ tone: '', text: '' });

    try {
      await sendDirectMessage({
        sender: {
          ...(user || {}),
          institutionId: normalizeValue(user?.institutionId || institutionId) || null,
        },
        recipientUid: targetRecipientUid,
        content: composedContent,
        subjectId: normalizeValue(
          selectedSubjectReference?.subjectId
          || selectedConversation?.lastMessage?.subjectId
          || null
        ) || null,
        subjectName: normalizeValue(
          selectedSubjectReference?.subjectName
          || selectedConversation?.lastMessage?.subjectName
          || null
        ) || null,
        attachments: composerAttachments,
        subjectReference: selectedSubjectReference,
      });

      setMessageDraft('');
      setReplyContext(null);
      setComposerAttachments([]);
      setSelectedSubjectReference(null);
      setShowSubjectReferencePicker(false);

      if (composerAttachmentInputRef.current) {
        composerAttachmentInputRef.current.value = '';
      }

      if (activeComposerConversationKey) {
        setDraftByConversationKey((previous: any) => {
          const nextMap = { ...(previous || {}) };
          delete nextMap[activeComposerConversationKey];
          return nextMap;
        });
      }

      setComposerFeedback({
        tone: 'success',
        text: selectedConversation
          ? 'Mensaje enviado correctamente.'
          : 'Mensaje enviado. La conversación se mostrará en la lista.',
      });
    } catch (error: any) {
      const fallbackMessage = 'No se pudo enviar el mensaje.';
      setComposerFeedback({
        tone: 'error',
        text: normalizeValue(error?.message) || fallbackMessage,
      });
    } finally {
      setSendingMessage(false);
    }
  };

  const unreadNotificationCount = visibleMessageNotifications.filter((notification: any) => !notification?.read).length;
  const unreadConversationCount = conversations.reduce((total: number, conversation: any) => {
    const conversationKey = normalizeValue(conversation?.conversationKey);
    const unreadCount = Number(conversation?.unreadCount || 0);

    if (!conversationKey || mutedConversationKeys.includes(conversationKey) || archivedConversationKeys.includes(conversationKey)) {
      return total;
    }

    return total + unreadCount;
  }, 0);
  const roleMeta = ROLE_META?.[
    normalizeType(selectedConversation?.participantRole || selectedRecipient?.role)
  ] || ROLE_META.student;
  const RoleIcon = roleMeta.icon;
  const selectedRecipientName = normalizeValue(
    selectedRecipient?.displayName || selectedRecipient?.name || selectedRecipient?.email || 'Usuario'
  );
  const selectedSubjectEntry = useMemo(
    () => availableSubjectEntries.find((entry: any) => normalizeValue(entry?.subjectId) === referenceSubjectId) || null,
    [availableSubjectEntries, referenceSubjectId]
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 transition-colors">
      <Header user={user} />

      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-5">
        <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm px-5 py-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <MessageSquareText className="w-5 h-5 text-sky-600 dark:text-sky-300" />
              Mensajes directos
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Conversaciones privadas dentro de tu institución con contexto académico compartido.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700 dark:border-sky-800 dark:bg-sky-900/30 dark:text-sky-200">
            Mensajes sin leer: {unreadConversationCount} · Avisos: {unreadNotificationCount}
          </div>
        </section>

        <div className="grid gap-5 lg:grid-cols-[360px_minmax(0,1fr)]">
          <section className={`rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden ${showInboxPane ? 'block' : 'hidden lg:block'}`}>
            <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">Conversaciones</p>
                <span className="text-xs text-slate-500 dark:text-slate-400">{inboxConversations.length} / {conversations.length}</span>
              </div>

              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  id="messages-inbox-search"
                  type="text"
                  value={inboxSearchTerm}
                  onChange={(event: any) => setInboxSearchTerm(event.target.value)}
                  placeholder="Buscar conversación por nombre, rol o mensaje"
                  className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-700 outline-none transition-colors focus:border-sky-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {INBOX_FILTERS.map((filterOption: any) => {
                  const isActive = activeInboxFilter === filterOption.key;
                  return (
                    <button
                      key={filterOption.key}
                      type="button"
                      onClick={() => setActiveInboxFilter(filterOption.key)}
                      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold transition-colors ${
                        isActive
                          ? 'border-sky-300 bg-sky-100 text-sky-700 dark:border-sky-700 dark:bg-sky-900/30 dark:text-sky-200'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800'
                      }`}
                    >
                      <Filter className="h-3.5 w-3.5" />
                      {filterOption.label}
                    </button>
                  );
                })}

                {mutedConversationKeys.length > 0 && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-500 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-300">
                    <VolumeX className="h-3.5 w-3.5" />
                    Silenciadas: {mutedConversationKeys.length}
                  </span>
                )}

                {archivedConversationKeys.length > 0 && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-500 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-300">
                    <Archive className="h-3.5 w-3.5" />
                    Archivadas: {archivedConversationKeys.length}
                  </span>
                )}
              </div>

              <div className="space-y-2 pt-1 border-t border-slate-100 dark:border-slate-800">
                <label htmlFor="messages-recipient-search" className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Nuevo mensaje
                </label>

                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    id="messages-recipient-search"
                    type="text"
                    value={recipientQuery}
                    onChange={(event: any) => setRecipientQuery(event.target.value)}
                    placeholder="Escribe un nombre o correo"
                    className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-700 outline-none transition-colors focus:border-sky-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                  />
                </div>

                {recipientQuery && (
                  recipientSuggestions.length > 0 ? (
                    <div className="rounded-xl border border-slate-200 bg-white shadow-sm divide-y divide-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:divide-slate-800">
                      {recipientSuggestions.map((candidate: any) => (
                        <button
                          key={candidate.uid}
                          type="button"
                          onClick={() => handleSelectRecipient(candidate)}
                          className="w-full px-3 py-2 text-left hover:bg-sky-50 dark:hover:bg-sky-900/20 transition-colors"
                        >
                          <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                            {normalizeValue(candidate?.displayName || candidate?.name || candidate?.email || 'Usuario')}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {normalizeValue(candidate?.email || 'Sin correo')} · {getRoleLabel(candidate?.role)}
                          </p>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 dark:text-slate-400 px-1">
                      {loadingInstitutionUsers
                        ? 'Buscando usuarios en tu institución...'
                        : 'No se encontraron coincidencias en tu institución.'}
                    </p>
                  )
                )}

                {!recipientQuery && selectedRecipient && !selectedConversation && (
                  <div className="flex items-center justify-between gap-2 rounded-xl border border-sky-200 bg-sky-50 px-3 py-2 text-xs text-sky-700 dark:border-sky-800 dark:bg-sky-900/30 dark:text-sky-200">
                    <span>Nuevo chat con {selectedRecipientName}</span>
                    <button
                      type="button"
                      onClick={() => setSelectedRecipient(null)}
                      className="inline-flex h-5 w-5 items-center justify-center rounded-full hover:bg-sky-100 dark:hover:bg-sky-900/40"
                      aria-label="Quitar destinatario"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="max-h-[600px] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
              {isCompatibilityMessageQueryMode && (
                <div className="px-4 py-2 text-xs font-medium text-amber-700 bg-amber-50 border-b border-amber-100 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-900/40">
                  Modo compatibilidad activo para consultas de mensajes (sin indice compuesto).
                </div>
              )}

              {loadingMessages ? (
                <div className="py-12 flex items-center justify-center text-slate-500 dark:text-slate-400">
                  <Loader2 className="w-5 h-5 animate-spin" />
                </div>
              ) : inboxConversations.length === 0 ? (
                <div className="py-12 px-4 text-center">
                  <BellOff className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                    {conversations.length > 0 ? 'No hay conversaciones para este filtro' : 'Aún no tienes conversaciones'}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {conversations.length > 0
                      ? 'Prueba cambiando el filtro o limpiando la búsqueda.'
                      : 'Puedes iniciar mensajes desde la sección de clase en una asignatura.'}
                  </p>
                </div>
              ) : (
                <>
                  {visibleConversations.map((conversation: any) => (
                    <CommunicationItemCard
                      key={conversation.conversationKey}
                      title={conversation.participantName}
                      message={conversation.lastMessage?.content || 'Sin mensajes aún'}
                      timestampLabel={formatNotificationRelativeTime(conversation.lastMessage?.createdAt)}
                      unread={conversation.visibleUnreadCount > 0}
                      icon={MessageCircle}
                      iconContainerClass="bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300"
                      showActorAsLeading
                      showActorMeta={false}
                      actor={{
                        name: conversation.participantName,
                        photoURL: conversation.participantPhotoURL,
                        label: 'Conversación con',
                      }}
                      containerClassName={conversation.conversationKey === selectedConversationKey
                        ? 'ring-1 ring-sky-300 dark:ring-sky-700'
                        : ''}
                      onActivate={() => {
                        handleSelectConversation(conversation).catch((error) => {
                          console.error('Error selecting conversation:', error);
                        });
                      }}
                      actions={(
                        <div className="flex flex-wrap items-center gap-1.5">
                          <button
                            type="button"
                            onClick={(event: any) => {
                              event.stopPropagation();
                              handleTogglePinnedConversation(conversation.conversationKey);
                            }}
                            className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold transition-colors ${
                              conversation.isPinned
                                ? 'border-indigo-200 bg-indigo-100 text-indigo-700 dark:border-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-200'
                                : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800'
                            }`}
                            title={conversation.isPinned ? 'Desfijar conversación' : 'Fijar conversación'}
                          >
                            <Pin className="h-3.5 w-3.5" />
                            {conversation.isPinned ? 'Fijada' : 'Fijar'}
                          </button>

                          <button
                            type="button"
                            onClick={(event: any) => {
                              event.stopPropagation();
                              handleToggleMutedConversation(conversation.conversationKey);
                            }}
                            className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold transition-colors ${
                              conversation.isMuted
                                ? 'border-amber-200 bg-amber-100 text-amber-700 dark:border-amber-700 dark:bg-amber-900/30 dark:text-amber-200'
                                : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800'
                            }`}
                            title={conversation.isMuted ? 'Activar notificaciones' : 'Silenciar conversación'}
                          >
                            {conversation.isMuted ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
                            {conversation.isMuted ? 'Silenciada' : 'Silenciar'}
                          </button>

                          <button
                            type="button"
                            onClick={(event: any) => {
                              event.stopPropagation();
                              handleToggleArchivedConversation(conversation.conversationKey);
                            }}
                            className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold transition-colors ${
                              conversation.isArchived
                                ? 'border-slate-400 bg-slate-200 text-slate-700 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100'
                                : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800'
                            }`}
                            title={conversation.isArchived ? 'Desarchivar conversación' : 'Archivar conversación'}
                          >
                            {conversation.isArchived ? <ArchiveRestore className="h-3.5 w-3.5" /> : <Archive className="h-3.5 w-3.5" />}
                            {conversation.isArchived ? 'Archivada' : 'Archivar'}
                          </button>

                          {conversation.visibleUnreadCount > 0 && (
                            <div className="inline-flex items-center rounded-full bg-sky-100 px-2 py-0.5 text-[11px] font-semibold text-sky-700 dark:bg-sky-900/40 dark:text-sky-200">
                              {conversation.visibleUnreadCount} nuevo{conversation.visibleUnreadCount === 1 ? '' : 's'}
                            </div>
                          )}
                        </div>
                      )}
                    />
                  ))}

                  {hasMoreConversations && (
                    <div className="px-4 py-3 border-t border-slate-100 dark:border-slate-800">
                      <button
                        type="button"
                        onClick={() => setVisibleConversationCount((previous) => previous + CONVERSATION_RENDER_STEP)}
                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                      >
                        Mostrar más conversaciones
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </section>

          <section className={`rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden min-h-[600px] flex-col ${showThreadPane ? 'flex' : 'hidden lg:flex'}`}>
            {selectedConversation ? (
              <>
                <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      {isMobileViewport && (
                        <button
                          type="button"
                          onClick={handleThreadBackToInbox}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                          aria-label="Volver a conversaciones"
                        >
                          <ArrowLeft className="h-4 w-4" />
                        </button>
                      )}

                      <Avatar
                        photoURL={selectedConversation?.participantPhotoURL}
                        name={selectedConversation?.participantName}
                        size="w-10 h-10"
                        textSize="text-sm"
                        className="border-0"
                      />

                      <div>
                        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                          {selectedConversation.participantName}
                        </h2>
                        <div className="mt-1 inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold border border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-300">
                          <RoleIcon className="w-3.5 h-3.5" />
                          {roleMeta.label}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleTogglePinnedConversation(selectedConversation.conversationKey)}
                        className={`inline-flex h-8 w-8 items-center justify-center rounded-full border transition-colors ${
                          selectedConversationIsPinned
                            ? 'border-indigo-300 bg-indigo-100 text-indigo-700 dark:border-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-200'
                            : 'border-slate-200 text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800'
                        }`}
                        title={selectedConversationIsPinned ? 'Desfijar conversación' : 'Fijar conversación'}
                        aria-label={selectedConversationIsPinned ? 'Desfijar conversación' : 'Fijar conversación'}
                      >
                        <Pin className="h-4 w-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleToggleMutedConversation(selectedConversation.conversationKey)}
                        className={`inline-flex h-8 w-8 items-center justify-center rounded-full border transition-colors ${
                          selectedConversationIsMuted
                            ? 'border-amber-300 bg-amber-100 text-amber-700 dark:border-amber-700 dark:bg-amber-900/30 dark:text-amber-200'
                            : 'border-slate-200 text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800'
                        }`}
                        title={selectedConversationIsMuted ? 'Activar notificaciones' : 'Silenciar conversación'}
                        aria-label={selectedConversationIsMuted ? 'Activar notificaciones' : 'Silenciar conversación'}
                      >
                        {selectedConversationIsMuted ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleToggleArchivedConversation(selectedConversation.conversationKey)}
                        className={`inline-flex h-8 w-8 items-center justify-center rounded-full border transition-colors ${
                          selectedConversationIsArchived
                            ? 'border-slate-500 bg-slate-200 text-slate-700 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100'
                            : 'border-slate-200 text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800'
                        }`}
                        title={selectedConversationIsArchived ? 'Desarchivar conversación' : 'Archivar conversación'}
                        aria-label={selectedConversationIsArchived ? 'Desarchivar conversación' : 'Archivar conversación'}
                      >
                        {selectedConversationIsArchived ? <ArchiveRestore className="h-4 w-4" /> : <Archive className="h-4 w-4" />}
                      </button>

                      <span className="text-xs text-slate-500 dark:text-slate-400">{selectedConversation.messages.length} mensajes</span>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Asignaturas en común</p>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedConversation.commonSubjectEntries.length > 0 ? (
                        selectedConversation.commonSubjectEntries.map((subjectEntry: any) => (
                          <button
                            key={subjectEntry.subjectId}
                            type="button"
                            onClick={() => navigate(buildSubjectRoute(subjectEntry.subjectId))}
                            className="inline-flex rounded-full bg-indigo-100 px-2 py-0.5 text-[11px] font-medium text-indigo-700 transition-colors hover:bg-indigo-200 dark:bg-indigo-900/40 dark:text-indigo-300 dark:hover:bg-indigo-900/60"
                            title="Abrir asignatura"
                          >
                            {subjectEntry.subjectName}
                          </button>
                        ))
                      ) : (
                        <span className="text-xs text-slate-500 dark:text-slate-400">Sin coincidencias detectadas.</span>
                      )}
                    </div>
                  </div>
                </div>

                <div
                  ref={threadViewportRef}
                  className="flex-1 overflow-y-auto px-4 py-4 space-y-2 bg-slate-50/50 dark:bg-slate-950/30"
                >
                  {hiddenSelectedConversationMessageCount > 0 && (
                    <div className="flex justify-center pb-1">
                      <button
                        type="button"
                        onClick={() => setVisibleMessageCount((previous) => previous + THREAD_RENDER_STEP)}
                        className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                      >
                        Mostrar {Math.min(THREAD_RENDER_STEP, hiddenSelectedConversationMessageCount)} mensajes anteriores
                      </button>
                    </div>
                  )}

                  {selectedThreadRows.map((row: any, rowIndex: number) => {
                    if (row.type === 'separator') {
                      return (
                        <div key={row.id} className="flex items-center justify-center py-1">
                          <span className="inline-flex rounded-full border border-slate-200 bg-white px-2.5 py-0.5 text-[11px] font-semibold text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
                            {row.label}
                          </span>
                        </div>
                      );
                    }

                    const message = row.message;
                    const isOwnMessage = normalizeValue(message?.senderUid) === currentUid;
                    const messageAttachments = Array.isArray(message?.attachments) ? message.attachments : [];
                    const messageSubjectReference = message?.subjectReference || null;
                    const messageSubjectReferenceRoute = buildSubjectReferenceRoute(messageSubjectReference);
                    const previousRow = rowIndex > 0 ? selectedThreadRows[rowIndex - 1] : null;
                    const isGroupedWithPreviousMessage = previousRow?.type === 'message'
                      && normalizeValue(previousRow?.message?.senderUid) === normalizeValue(message?.senderUid);

                    return (
                      <div
                        key={row.id}
                        className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} ${isGroupedWithPreviousMessage ? 'pt-0.5' : 'pt-2'}`}
                      >
                        <div
                          className={`max-w-[84%] rounded-2xl px-3 py-2 shadow-sm ${
                            isOwnMessage
                              ? 'bg-indigo-600 text-white rounded-br-md'
                              : 'bg-white text-slate-700 dark:bg-slate-900 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-bl-md'
                          }`}
                        >
                          {messageSubjectReference && (
                            <button
                              type="button"
                              onClick={() => handleOpenSubjectReference(messageSubjectReference)}
                              disabled={!messageSubjectReferenceRoute}
                              className={`mb-2 inline-flex items-center gap-1.5 rounded-lg border px-2 py-1 text-[11px] font-semibold transition-colors ${
                                isOwnMessage
                                  ? 'border-indigo-200/40 bg-indigo-500/20 text-indigo-50 hover:bg-indigo-500/30'
                                  : 'border-sky-200 bg-sky-50 text-sky-700 hover:bg-sky-100 dark:border-sky-700 dark:bg-sky-900/20 dark:text-sky-200 dark:hover:bg-sky-900/30'
                              }`}
                              title={messageSubjectReferenceRoute ? 'Abrir referencia' : 'Referencia sin ruta disponible'}
                            >
                              <Link2 className="h-3.5 w-3.5" />
                              {normalizeValue(messageSubjectReference?.label || messageSubjectReference?.resourceName || messageSubjectReference?.subjectName || 'Referencia compartida')}
                            </button>
                          )}

                          {messageAttachments.length > 0 && (
                            <div className="mb-2 space-y-1.5">
                              {messageAttachments.map((attachment: any, attachmentIndex: number) => {
                                const attachmentName = normalizeValue(attachment?.name || `Adjunto ${attachmentIndex + 1}`);
                                const attachmentUrl = normalizeValue(attachment?.url);

                                if (isImageAttachment(attachment) && attachmentUrl) {
                                  return (
                                    <a
                                      key={`${attachmentName}_${attachmentIndex}`}
                                      href={attachmentUrl}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="block"
                                    >
                                      <img
                                        src={attachmentUrl}
                                        alt={attachmentName}
                                        className="max-h-48 w-auto rounded-xl border border-white/20 object-cover"
                                      />
                                    </a>
                                  );
                                }

                                return (
                                  <a
                                    key={`${attachmentName}_${attachmentIndex}`}
                                    href={attachmentUrl || '#'}
                                    target={attachmentUrl ? '_blank' : undefined}
                                    rel={attachmentUrl ? 'noreferrer' : undefined}
                                    className={`inline-flex items-center gap-1.5 rounded-lg border px-2 py-1 text-[11px] font-semibold ${
                                      isOwnMessage
                                        ? 'border-indigo-200/40 bg-indigo-500/20 text-indigo-50 hover:bg-indigo-500/30'
                                        : 'border-slate-300 bg-slate-100 text-slate-700 hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700'
                                    }`}
                                  >
                                    <Paperclip className="h-3.5 w-3.5" />
                                    <span className="truncate max-w-[220px]">{attachmentName}</span>
                                    <span className="opacity-80">{formatAttachmentSize(attachment?.size)}</span>
                                  </a>
                                );
                              })}
                            </div>
                          )}

                          <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                          <div className="mt-1 flex items-center justify-between gap-2">
                            <div className={`flex items-center gap-1 ${isOwnMessage ? 'text-indigo-100/90' : 'text-slate-400 dark:text-slate-500'}`}>
                              <button
                                type="button"
                                onClick={() => handleReplyToMessage(message)}
                                className="inline-flex h-5 w-5 items-center justify-center rounded-full hover:bg-white/20 dark:hover:bg-slate-700/40"
                                title="Responder con cita"
                                aria-label="Responder con cita"
                              >
                                <CornerUpLeft className="h-3.5 w-3.5" />
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  void handleCopyMessageContent(message);
                                }}
                                className="inline-flex h-5 w-5 items-center justify-center rounded-full hover:bg-white/20 dark:hover:bg-slate-700/40"
                                title="Copiar mensaje"
                                aria-label="Copiar mensaje"
                              >
                                <Copy className="h-3.5 w-3.5" />
                              </button>
                            </div>

                            <div className={`flex items-center justify-end gap-1 text-[11px] ${isOwnMessage ? 'text-indigo-100' : 'text-slate-400 dark:text-slate-500'}`}>
                              <span>{formatNotificationRelativeTime(message.createdAt)}</span>
                              {isOwnMessage && (
                                message?.readByRecipient
                                  ? <CheckCheck className="h-3.5 w-3.5" />
                                  : <Check className="h-3.5 w-3.5" />
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {showJumpToLatest && (
                  <div className="px-3 pb-2">
                    <button
                      type="button"
                      onClick={handleScrollToLatestMessage}
                      className="ml-auto inline-flex items-center gap-1 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-[11px] font-semibold text-sky-700 hover:bg-sky-100 dark:border-sky-700 dark:bg-sky-900/20 dark:text-sky-200 dark:hover:bg-sky-900/40"
                    >
                      <CornerDownRight className="h-3.5 w-3.5" />
                      Ir al último mensaje
                    </button>
                  </div>
                )}

                <div className="border-t border-slate-100 dark:border-slate-800 p-3 space-y-2">
                  {composerFeedback.text && (
                    <div className={`rounded-xl border px-3 py-2 text-xs font-medium ${
                      composerFeedback.tone === 'error'
                        ? 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-800 dark:bg-rose-900/20 dark:text-rose-300'
                        : 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300'
                    }`}>
                      {composerFeedback.text}
                    </div>
                  )}

                  {replyContext?.messageId && (
                    <div className="flex items-start justify-between gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs dark:border-indigo-800 dark:bg-indigo-900/20">
                      <div className="min-w-0">
                        <p className="font-semibold text-indigo-700 dark:text-indigo-300">Respondiendo a {replyContext.senderName}</p>
                        <p className="mt-0.5 text-indigo-600 dark:text-indigo-200 truncate">{replyContext.preview}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setReplyContext(null)}
                        className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-indigo-600 hover:bg-indigo-100 dark:text-indigo-200 dark:hover:bg-indigo-900/40"
                        aria-label="Quitar respuesta"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}

                  {selectedSubjectReference?.subjectId && (
                    <div className="flex items-start justify-between gap-2 rounded-xl border border-sky-200 bg-sky-50 px-3 py-2 text-xs dark:border-sky-800 dark:bg-sky-900/20">
                      <button
                        type="button"
                        onClick={() => handleOpenSubjectReference(selectedSubjectReference)}
                        className="min-w-0 text-left"
                      >
                        <p className="font-semibold text-sky-700 dark:text-sky-300">Referencia incluida</p>
                        <p className="mt-0.5 truncate text-sky-600 dark:text-sky-200">
                          {normalizeValue(selectedSubjectReference?.label || selectedSubjectReference?.subjectName || 'Contenido de asignatura')}
                        </p>
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedSubjectReference(null)}
                        className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-sky-600 hover:bg-sky-100 dark:text-sky-200 dark:hover:bg-sky-900/40"
                        aria-label="Quitar referencia"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}

                  {composerAttachments.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {composerAttachments.map((attachment: any, attachmentIndex: number) => (
                        <span
                          key={`${normalizeValue(attachment?.name)}_${attachmentIndex}`}
                          className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                        >
                          <Paperclip className="h-3.5 w-3.5" />
                          <span className="max-w-[180px] truncate">{normalizeValue(attachment?.name || 'Adjunto')}</span>
                          <span className="opacity-80">{formatAttachmentSize(attachment?.size)}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveComposerAttachment(attachmentIndex)}
                            className="inline-flex h-4 w-4 items-center justify-center rounded-full hover:bg-slate-200 dark:hover:bg-slate-700"
                            aria-label="Quitar adjunto"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                    <span>Enter para enviar · Shift+Enter para salto de línea</span>
                    <span>{messageDraft.length}/700</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      ref={composerAttachmentInputRef}
                      type="file"
                      className="hidden"
                      multiple
                      accept={DIRECT_MESSAGE_ATTACHMENT_ACCEPT}
                      onChange={handleComposerAttachmentsSelected}
                    />

                    <button
                      type="button"
                      onClick={() => composerAttachmentInputRef.current?.click()}
                      className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                    >
                      <Paperclip className="h-3.5 w-3.5" />
                      Adjuntar archivo
                    </button>

                    {availableSubjectEntries.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setShowSubjectReferencePicker((previous) => !previous)}
                        className="inline-flex items-center gap-1 rounded-full border border-sky-200 bg-sky-50 px-2.5 py-1 text-[11px] font-semibold text-sky-700 hover:bg-sky-100 dark:border-sky-700 dark:bg-sky-900/20 dark:text-sky-200 dark:hover:bg-sky-900/30"
                      >
                        <Link2 className="h-3.5 w-3.5" />
                        Referenciar contenido
                      </button>
                    )}
                  </div>

                  {showSubjectReferencePicker && availableSubjectEntries.length > 0 && (
                    <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/60">
                      <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">Compartir referencia académica</p>

                      <div className="grid gap-2 md:grid-cols-2">
                        <label className="text-[11px] text-slate-500 dark:text-slate-400">
                          Asignatura
                          <select
                            value={referenceSubjectId}
                            onChange={(event: any) => setReferenceSubjectId(event.target.value)}
                            className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                          >
                            {availableSubjectEntries.map((subjectEntry: any) => (
                              <option key={subjectEntry.subjectId} value={subjectEntry.subjectId}>
                                {subjectEntry.subjectName}
                              </option>
                            ))}
                          </select>
                        </label>

                        <label className="text-[11px] text-slate-500 dark:text-slate-400">
                          Recurso
                          <select
                            value={referenceResourceId}
                            onChange={(event: any) => setReferenceResourceId(event.target.value)}
                            className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                          >
                            <option value="__subject__">Asignatura completa</option>
                            {referenceResources.map((resource: any) => (
                              <option key={resource.id} value={resource.id}>
                                {resource.topicName} · {resource.resourceName}
                              </option>
                            ))}
                          </select>
                        </label>
                      </div>

                      {loadingSubjectResources && (
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">Cargando recursos para {normalizeValue(selectedSubjectEntry?.subjectName || 'asignatura')}...</p>
                      )}

                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={handleInsertSubjectReference}
                          className="inline-flex items-center gap-1 rounded-full border border-sky-300 bg-sky-100 px-3 py-1 text-[11px] font-semibold text-sky-700 hover:bg-sky-200 dark:border-sky-700 dark:bg-sky-900/30 dark:text-sky-200 dark:hover:bg-sky-900/40"
                        >
                          <Link2 className="h-3.5 w-3.5" />
                          Añadir referencia
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="flex items-end gap-2">
                    <textarea
                      ref={composerTextareaRef}
                      value={messageDraft}
                      onChange={(event: any) => handleMessageDraftChange(event.target.value)}
                      onKeyDown={handleMessageDraftKeyDown}
                      placeholder="Escribe un mensaje..."
                      rows={2}
                      maxLength={700}
                      className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition-colors focus:border-indigo-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                    />
                    <button
                      type="button"
                      onClick={handleSendMessage}
                      disabled={sendingMessage || (!normalizeValue(messageDraft) && composerAttachments.length === 0 && !selectedSubjectReference)}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-70"
                      title="Enviar mensaje"
                      aria-label="Enviar mensaje"
                    >
                      {sendingMessage ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </>
            ) : selectedRecipient ? (
              <>
                <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      {isMobileViewport && (
                        <button
                          type="button"
                          onClick={handleThreadBackToInbox}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                          aria-label="Volver a conversaciones"
                        >
                          <ArrowLeft className="h-4 w-4" />
                        </button>
                      )}

                      <Avatar
                        photoURL={selectedRecipient?.photoURL}
                        name={selectedRecipientName}
                        size="w-10 h-10"
                        textSize="text-sm"
                        className="border-0"
                      />

                      <div>
                        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                          {selectedRecipientName}
                        </h2>
                        <div className="mt-1 inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold border border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-300">
                          <RoleIcon className="w-3.5 h-3.5" />
                          {roleMeta.label}
                        </div>
                      </div>
                    </div>
                    <span className="text-xs text-slate-500 dark:text-slate-400">Conversación nueva</span>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Asignaturas en común</p>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedRecipientCommonSubjectEntries.length > 0 ? (
                        selectedRecipientCommonSubjectEntries.map((subjectEntry: any) => (
                          <button
                            key={subjectEntry.subjectId}
                            type="button"
                            onClick={() => navigate(buildSubjectRoute(subjectEntry.subjectId))}
                            className="inline-flex rounded-full bg-indigo-100 px-2 py-0.5 text-[11px] font-medium text-indigo-700 transition-colors hover:bg-indigo-200 dark:bg-indigo-900/40 dark:text-indigo-300 dark:hover:bg-indigo-900/60"
                            title="Abrir asignatura"
                          >
                            {subjectEntry.subjectName}
                          </button>
                        ))
                      ) : (
                        <span className="text-xs text-slate-500 dark:text-slate-400">Sin coincidencias detectadas.</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex-1 flex items-center justify-center px-6 text-center bg-slate-50/50 dark:bg-slate-950/30">
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Escribe el primer mensaje para iniciar esta conversación.
                  </p>
                </div>

                <div className="border-t border-slate-100 dark:border-slate-800 p-3 space-y-2">
                  {composerFeedback.text && (
                    <div className={`rounded-xl border px-3 py-2 text-xs font-medium ${
                      composerFeedback.tone === 'error'
                        ? 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-800 dark:bg-rose-900/20 dark:text-rose-300'
                        : 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300'
                    }`}>
                      {composerFeedback.text}
                    </div>
                  )}

                  {replyContext?.messageId && (
                    <div className="flex items-start justify-between gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs dark:border-indigo-800 dark:bg-indigo-900/20">
                      <div className="min-w-0">
                        <p className="font-semibold text-indigo-700 dark:text-indigo-300">Respondiendo a {replyContext.senderName}</p>
                        <p className="mt-0.5 text-indigo-600 dark:text-indigo-200 truncate">{replyContext.preview}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setReplyContext(null)}
                        className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-indigo-600 hover:bg-indigo-100 dark:text-indigo-200 dark:hover:bg-indigo-900/40"
                        aria-label="Quitar respuesta"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}

                  {selectedSubjectReference?.subjectId && (
                    <div className="flex items-start justify-between gap-2 rounded-xl border border-sky-200 bg-sky-50 px-3 py-2 text-xs dark:border-sky-800 dark:bg-sky-900/20">
                      <button
                        type="button"
                        onClick={() => handleOpenSubjectReference(selectedSubjectReference)}
                        className="min-w-0 text-left"
                      >
                        <p className="font-semibold text-sky-700 dark:text-sky-300">Referencia incluida</p>
                        <p className="mt-0.5 truncate text-sky-600 dark:text-sky-200">
                          {normalizeValue(selectedSubjectReference?.label || selectedSubjectReference?.subjectName || 'Contenido de asignatura')}
                        </p>
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedSubjectReference(null)}
                        className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-sky-600 hover:bg-sky-100 dark:text-sky-200 dark:hover:bg-sky-900/40"
                        aria-label="Quitar referencia"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}

                  {composerAttachments.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {composerAttachments.map((attachment: any, attachmentIndex: number) => (
                        <span
                          key={`${normalizeValue(attachment?.name)}_${attachmentIndex}`}
                          className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                        >
                          <Paperclip className="h-3.5 w-3.5" />
                          <span className="max-w-[180px] truncate">{normalizeValue(attachment?.name || 'Adjunto')}</span>
                          <span className="opacity-80">{formatAttachmentSize(attachment?.size)}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveComposerAttachment(attachmentIndex)}
                            className="inline-flex h-4 w-4 items-center justify-center rounded-full hover:bg-slate-200 dark:hover:bg-slate-700"
                            aria-label="Quitar adjunto"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                    <span>Enter para enviar · Shift+Enter para salto de línea</span>
                    <span>{messageDraft.length}/700</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      ref={composerAttachmentInputRef}
                      type="file"
                      className="hidden"
                      multiple
                      accept={DIRECT_MESSAGE_ATTACHMENT_ACCEPT}
                      onChange={handleComposerAttachmentsSelected}
                    />

                    <button
                      type="button"
                      onClick={() => composerAttachmentInputRef.current?.click()}
                      className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                    >
                      <Paperclip className="h-3.5 w-3.5" />
                      Adjuntar archivo
                    </button>

                    {availableSubjectEntries.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setShowSubjectReferencePicker((previous) => !previous)}
                        className="inline-flex items-center gap-1 rounded-full border border-sky-200 bg-sky-50 px-2.5 py-1 text-[11px] font-semibold text-sky-700 hover:bg-sky-100 dark:border-sky-700 dark:bg-sky-900/20 dark:text-sky-200 dark:hover:bg-sky-900/30"
                      >
                        <Link2 className="h-3.5 w-3.5" />
                        Referenciar contenido
                      </button>
                    )}
                  </div>

                  {showSubjectReferencePicker && availableSubjectEntries.length > 0 && (
                    <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/60">
                      <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">Compartir referencia académica</p>

                      <div className="grid gap-2 md:grid-cols-2">
                        <label className="text-[11px] text-slate-500 dark:text-slate-400">
                          Asignatura
                          <select
                            value={referenceSubjectId}
                            onChange={(event: any) => setReferenceSubjectId(event.target.value)}
                            className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                          >
                            {availableSubjectEntries.map((subjectEntry: any) => (
                              <option key={subjectEntry.subjectId} value={subjectEntry.subjectId}>
                                {subjectEntry.subjectName}
                              </option>
                            ))}
                          </select>
                        </label>

                        <label className="text-[11px] text-slate-500 dark:text-slate-400">
                          Recurso
                          <select
                            value={referenceResourceId}
                            onChange={(event: any) => setReferenceResourceId(event.target.value)}
                            className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                          >
                            <option value="__subject__">Asignatura completa</option>
                            {referenceResources.map((resource: any) => (
                              <option key={resource.id} value={resource.id}>
                                {resource.topicName} · {resource.resourceName}
                              </option>
                            ))}
                          </select>
                        </label>
                      </div>

                      {loadingSubjectResources && (
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">Cargando recursos para {normalizeValue(selectedSubjectEntry?.subjectName || 'asignatura')}...</p>
                      )}

                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={handleInsertSubjectReference}
                          className="inline-flex items-center gap-1 rounded-full border border-sky-300 bg-sky-100 px-3 py-1 text-[11px] font-semibold text-sky-700 hover:bg-sky-200 dark:border-sky-700 dark:bg-sky-900/30 dark:text-sky-200 dark:hover:bg-sky-900/40"
                        >
                          <Link2 className="h-3.5 w-3.5" />
                          Añadir referencia
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="flex items-end gap-2">
                    <textarea
                      ref={composerTextareaRef}
                      value={messageDraft}
                      onChange={(event: any) => handleMessageDraftChange(event.target.value)}
                      onKeyDown={handleMessageDraftKeyDown}
                      placeholder="Escribe un mensaje..."
                      rows={2}
                      maxLength={700}
                      className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition-colors focus:border-indigo-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                    />
                    <button
                      type="button"
                      onClick={handleSendMessage}
                      disabled={sendingMessage || (!normalizeValue(messageDraft) && composerAttachments.length === 0 && !selectedSubjectReference)}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-70"
                      title="Enviar mensaje"
                      aria-label="Enviar mensaje"
                    >
                      {sendingMessage ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
                {isMobileViewport && (
                  <button
                    type="button"
                    onClick={handleThreadBackToInbox}
                    className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    Volver a conversaciones
                  </button>
                )}
                <MessageCircle className="w-10 h-10 text-slate-300 dark:text-slate-600 mb-3" />
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Selecciona una conversación</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Aquí podrás ver historial, rol del usuario y asignaturas en común.
                </p>
              </div>
            )}
          </section>
        </div>

        {messagesError && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 dark:border-rose-800 dark:bg-rose-900/20 dark:text-rose-300">
            {messagesError}
          </div>
        )}
      </main>
    </div>
  );
};

export default Messages;
