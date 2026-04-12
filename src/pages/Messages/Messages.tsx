// src/pages/Messages/Messages.tsx
import React, { useEffect, useMemo, useState } from 'react';
import {
  BellOff,
  GraduationCap,
  Loader2,
  MessageCircle,
  MessageSquareText,
  Send,
  Shield,
  UserRound,
} from 'lucide-react';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import Header from '../../components/layout/Header';
import CommunicationItemCard from '../../components/ui/CommunicationItemCard';
import NotificationItemCard from '../../components/ui/NotificationItemCard';
import { formatNotificationRelativeTime } from '../../components/ui/notificationPresentation';
import { db } from '../../firebase/config';
import { useNotifications } from '../../hooks/useNotifications';
import { sendDirectMessage } from '../../services/directMessageService';
import {
  buildConversationKey,
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

const Messages = ({ user }: any) => {
  const currentUid = normalizeValue(user?.uid);
  const institutionId = normalizeValue(user?.institutionId);

  const [allMessages, setAllMessages] = useState<any[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [messagesError, setMessagesError] = useState('');
  const [participantProfilesByUid, setParticipantProfilesByUid] = useState<any>({});
  const [commonSubjectsByUid, setCommonSubjectsByUid] = useState<any>({});
  const [selectedConversationKey, setSelectedConversationKey] = useState('');
  const [messageDraft, setMessageDraft] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
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

  useEffect(() => {
    if (!currentUid) {
      setAllMessages([]);
      setLoadingMessages(false);
      return undefined;
    }

    setLoadingMessages(true);
    setMessagesError('');

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

    const senderQuery = query(
      collection(db, 'directMessages'),
      where('senderUid', '==', currentUid)
    );

    const recipientQuery = query(
      collection(db, 'directMessages'),
      where('recipientUid', '==', currentUid)
    );

    const unsubscribeSender = onSnapshot(senderQuery, (snapshot) => {
      senderMessagesById = new Map(
        snapshot.docs.map((messageDoc: any) => [
          messageDoc.id,
          { id: messageDoc.id, ...messageDoc.data() },
        ])
      );
      syncMergedMessages();
    }, (error: any) => {
      console.error('Error listening sender messages:', error);
      setMessagesError('No se pudieron cargar los mensajes enviados.');
      setLoadingMessages(false);
    });

    const unsubscribeRecipient = onSnapshot(recipientQuery, (snapshot) => {
      recipientMessagesById = new Map(
        snapshot.docs.map((messageDoc: any) => [
          messageDoc.id,
          { id: messageDoc.id, ...messageDoc.data() },
        ])
      );
      syncMergedMessages();
    }, (error: any) => {
      console.error('Error listening recipient messages:', error);
      setMessagesError('No se pudieron cargar los mensajes recibidos.');
      setLoadingMessages(false);
    });

    return () => {
      unsubscribeSender();
      unsubscribeRecipient();
    };
  }, [currentUid]);

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
        };
      })
      .sort((left: any, right: any) => timestampToMillis(right?.lastMessage?.createdAt) - timestampToMillis(left?.lastMessage?.createdAt));
  }, [allMessages, commonSubjectsByUid, currentUid, participantProfilesByUid]);

  const participantUids = useMemo(
    () => Array.from(new Set(conversations.map((conversation: any) => conversation.participantUid).filter(Boolean))),
    [conversations]
  );

  const participantKey = participantUids.join('|');

  useEffect(() => {
    if (!participantUids.length) return;

    const missingParticipantUids = participantUids.filter((participantUid) => !participantProfilesByUid?.[participantUid]);
    if (!missingParticipantUids.length) return;

    let cancelled = false;

    const fetchParticipantProfiles = async () => {
      const profileEntries = await Promise.all(missingParticipantUids.map(async (participantUid) => {
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
  }, [participantKey, participantProfilesByUid, participantUids]);

  useEffect(() => {
    if (!currentUid || !institutionId || !participantUids.length) {
      setCommonSubjectsByUid({});
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
        participantUids.forEach((participantUid) => {
          nextCommonSubjects[participantUid] = [];
        });

        subjectsSnapshot.docs.forEach((subjectDoc: any) => {
          const subjectData = subjectDoc.data() || {};
          if (!isUserLinkedToSubject(subjectData, currentUid)) return;

          participantUids.forEach((participantUid) => {
            if (!isUserLinkedToSubject(subjectData, participantUid)) return;

            const subjectName = normalizeValue(subjectData?.name || subjectData?.title || '');
            if (!subjectName) return;

            nextCommonSubjects[participantUid].push(subjectName);
          });
        });

        Object.keys(nextCommonSubjects).forEach((participantUid) => {
          nextCommonSubjects[participantUid] = Array.from(new Set(nextCommonSubjects[participantUid])).slice(0, 6);
        });

        setCommonSubjectsByUid(nextCommonSubjects);
      } catch (error) {
        console.error('Error fetching common subjects:', error);
      }
    };

    fetchCommonSubjects();

    return () => {
      cancelled = true;
    };
  }, [currentUid, institutionId, participantKey, participantUids]);

  useEffect(() => {
    if (!conversations.length) {
      setSelectedConversationKey('');
      return;
    }

    setSelectedConversationKey((previousKey) => {
      if (previousKey && conversations.some((conversation: any) => conversation.conversationKey === previousKey)) {
        return previousKey;
      }
      return conversations[0].conversationKey;
    });
  }, [conversations]);

  const selectedConversation = useMemo(
    () => conversations.find((conversation: any) => conversation.conversationKey === selectedConversationKey) || null,
    [conversations, selectedConversationKey]
  );

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

  const handleNotificationActivate = async (notification: any) => {
    if (!notification?.read) {
      await markAsRead(notification.id);
    }

    const senderUid = normalizeValue(notification?.senderUid);
    if (!senderUid) return;

    const matchingConversation = conversations.find((conversation: any) => conversation.participantUid === senderUid);
    if (matchingConversation) {
      setSelectedConversationKey(matchingConversation.conversationKey);
    }
  };

  const handleSelectConversation = async (conversation: any) => {
    setSelectedConversationKey(conversation.conversationKey);

    const relatedNotifications = messageNotifications.filter((notification: any) => (
      !notification?.read && normalizeValue(notification?.senderUid) === conversation.participantUid
    ));

    await Promise.all(relatedNotifications.map((notification: any) => markAsRead(notification.id)));
  };

  const handleSendMessage = async () => {
    if (!selectedConversation || sendingMessage) return;

    const content = normalizeValue(messageDraft);
    if (!content) {
      setComposerFeedback({ tone: 'error', text: 'Escribe un mensaje antes de enviar.' });
      return;
    }

    setSendingMessage(true);
    setComposerFeedback({ tone: '', text: '' });

    try {
      await sendDirectMessage({
        sender: user,
        recipientUid: selectedConversation.participantUid,
        content,
        subjectId: selectedConversation?.lastMessage?.subjectId || null,
        subjectName: selectedConversation?.lastMessage?.subjectName || null,
      });

      setMessageDraft('');
      setComposerFeedback({ tone: 'success', text: 'Mensaje enviado correctamente.' });
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

  const unreadNotificationCount = messageNotifications.filter((notification: any) => !notification?.read).length;
  const roleMeta = ROLE_META?.[normalizeType(selectedConversation?.participantRole)] || ROLE_META.student;
  const RoleIcon = roleMeta.icon;

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
            Avisos de mensajes sin leer: {unreadNotificationCount}
          </div>
        </section>

        <div className="grid gap-5 lg:grid-cols-[360px_minmax(0,1fr)]">
          <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">Conversaciones</p>
              <span className="text-xs text-slate-500 dark:text-slate-400">{conversations.length}</span>
            </div>

            <div className="max-h-[600px] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
              {loadingMessages ? (
                <div className="py-12 flex items-center justify-center text-slate-500 dark:text-slate-400">
                  <Loader2 className="w-5 h-5 animate-spin" />
                </div>
              ) : conversations.length === 0 ? (
                <div className="py-12 px-4 text-center">
                  <BellOff className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Aún no tienes conversaciones</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Puedes iniciar mensajes desde la sección de clase en una asignatura.
                  </p>
                </div>
              ) : (
                conversations.map((conversation: any) => (
                  <CommunicationItemCard
                    key={conversation.conversationKey}
                    title={conversation.participantName}
                    message={conversation.lastMessage?.content || 'Sin mensajes aún'}
                    timestampLabel={formatNotificationRelativeTime(conversation.lastMessage?.createdAt)}
                    unread={conversation.unreadCount > 0}
                    icon={MessageCircle}
                    iconContainerClass="bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300"
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
                    actions={conversation.unreadCount > 0 ? (
                      <div className="inline-flex items-center rounded-full bg-sky-100 px-2 py-0.5 text-[11px] font-semibold text-sky-700 dark:bg-sky-900/40 dark:text-sky-200">
                        {conversation.unreadCount} nuevo{conversation.unreadCount === 1 ? '' : 's'}
                      </div>
                    ) : null}
                  />
                ))
              )}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden min-h-[600px] flex flex-col">
            {selectedConversation ? (
              <>
                <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                        {selectedConversation.participantName}
                      </h2>
                      <div className="mt-1 inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold border border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-300">
                        <RoleIcon className="w-3.5 h-3.5" />
                        {roleMeta.label}
                      </div>
                    </div>
                    <span className="text-xs text-slate-500 dark:text-slate-400">{selectedConversation.messages.length} mensajes</span>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Asignaturas en común</p>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedConversation.commonSubjects.length > 0 ? (
                        selectedConversation.commonSubjects.map((subjectName: string) => (
                          <span
                            key={subjectName}
                            className="inline-flex rounded-full bg-indigo-100 px-2 py-0.5 text-[11px] font-medium text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300"
                          >
                            {subjectName}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-slate-500 dark:text-slate-400">Sin coincidencias detectadas.</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-slate-50/50 dark:bg-slate-950/30">
                  {selectedConversation.messages.map((message: any) => {
                    const isOwnMessage = normalizeValue(message?.senderUid) === currentUid;
                    return (
                      <div
                        key={message.id}
                        className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-2xl px-3 py-2 shadow-sm ${
                            isOwnMessage
                              ? 'bg-indigo-600 text-white'
                              : 'bg-white text-slate-700 dark:bg-slate-900 dark:text-slate-200 border border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                          <p className={`mt-1 text-[11px] ${isOwnMessage ? 'text-indigo-100' : 'text-slate-400 dark:text-slate-500'}`}>
                            {formatNotificationRelativeTime(message.createdAt)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
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

                  <div className="flex items-end gap-2">
                    <textarea
                      value={messageDraft}
                      onChange={(event: any) => setMessageDraft(event.target.value)}
                      placeholder="Escribe un mensaje..."
                      rows={2}
                      maxLength={700}
                      className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition-colors focus:border-indigo-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                    />
                    <button
                      type="button"
                      onClick={handleSendMessage}
                      disabled={sendingMessage || !normalizeValue(messageDraft)}
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
                <MessageCircle className="w-10 h-10 text-slate-300 dark:text-slate-600 mb-3" />
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Selecciona una conversación</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Aquí podrás ver historial, rol del usuario y asignaturas en común.
                </p>
              </div>
            )}
          </section>
        </div>

        <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">Notificaciones de mensajes</p>
            <span className="text-xs text-slate-500 dark:text-slate-400">{messageNotifications.length}</span>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {messageNotifications.length === 0 ? (
              <div className="py-8 text-center px-4 text-slate-500 dark:text-slate-400 text-sm">
                No hay notificaciones de mensajes pendientes.
              </div>
            ) : (
              messageNotifications.slice(0, 8).map((notification: any) => (
                <NotificationItemCard
                  key={notification.id}
                  notification={notification}
                  onActivate={(currentNotification: any) => {
                    handleNotificationActivate(currentNotification).catch((error) => {
                      console.error('Error activating message notification:', error);
                    });
                  }}
                />
              ))
            )}
          </div>
        </section>

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
