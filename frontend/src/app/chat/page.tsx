'use client';

import { useMemo, useRef, useState, useEffect } from 'react';
import { ProtectedRoute } from '@/src/components/ProtectedRoute';
import { ProtectedLayout } from '@/src/components/layout/ProtectedLayout';
import { useChatParticipants } from '@/src/hooks/queries';
import { useChatMessages } from '@/src/hooks/queries/useChat';
import { useChatSocket } from '@/src/hooks/useChatSocket';
import { useAuthStore } from '@/src/store/authStore';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/node_modules/react-i18next';
import { Sheet, SheetBody, SheetHeader, SheetTitle } from '@/src/components/ui';

export default function ChatPage() {
  const { t, i18n } = useTranslation();
  const { user } = useAuthStore();
  const { data: usersData } = useChatParticipants();
  const { data: messages = [] } = useChatMessages();
  const [liveMessages, setLiveMessages] = useState<any[]>([]);
  const [activeUserId, setActiveUserId] = useState<string | null>(null);
  const [activeRoomId, setActiveRoomId] = useState<string | null>('company');
  const [draft, setDraft] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [showUserDetails, setShowUserDetails] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [lastReadAt, setLastReadAt] = useState<Date | null>(null);

  const currentUserId = user?._id || user?.id;
  const users = usersData || [];

  const filteredUsers = users
    .filter((u: any) => (u._id || u.id) !== currentUserId)
    .filter((u: any) => {
      if (!userSearch.trim()) return true;
      const full = `${u.firstName || ''} ${u.lastName || ''}`.toLowerCase();
      return full.includes(userSearch.toLowerCase()) || (u.email || '').toLowerCase().includes(userSearch.toLowerCase());
    });

  useEffect(() => {
    setLiveMessages(messages || []);
  }, [messages]);

  const activeMessages = useMemo(() => {
    if (activeUserId) {
      return liveMessages
        .filter((m: any) => {
          const senderId = typeof m.sender === 'object' ? m.sender?._id || m.sender?.id : m.sender;
          const recipientId = typeof m.recipient === 'object' ? m.recipient?._id || m.recipient?.id : m.recipient;
          return (
            (senderId === currentUserId && recipientId === activeUserId) ||
            (senderId === activeUserId && recipientId === currentUserId)
          );
        })
        .sort((a: any, b: any) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime());
    }
    if (activeRoomId === 'company') {
      return liveMessages
        .filter((m: any) => {
          const recipientId = typeof m.recipient === 'object' ? m.recipient?._id || m.recipient?.id : m.recipient;
          return !recipientId && (m.chatType === 'general' || !m.chatType);
        })
        .sort((a: any, b: any) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime());
    }
    return [];
  }, [liveMessages, activeUserId, currentUserId, activeRoomId]);

  useEffect(() => {
    if (!messagesEndRef.current) return;
    if (isAtBottom || activeUserId || activeRoomId === 'company') {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeMessages, activeUserId, activeRoomId, isAtBottom]);

  const activeUser = useMemo(() => {
    if (!activeUserId) return null;
    return users.find((u: any) => (u._id || u.id) === activeUserId) || null;
  }, [activeUserId, users]);

  const conversationMeta = useMemo(() => {
    const meta: Record<string, { last?: any; unread: number }> = {};
    for (const msg of liveMessages) {
      const senderId = typeof msg.sender === 'object' ? msg.sender?._id || msg.sender?.id : msg.sender;
      const recipientId = typeof msg.recipient === 'object' ? msg.recipient?._id || msg.recipient?.id : msg.recipient;
      if (!senderId || !recipientId) continue;
      const otherId = senderId === currentUserId ? recipientId : senderId;
      const last = meta[otherId]?.last;
      if (!last || new Date(msg.createdAt || msg.updatedAt || 0) > new Date(last.createdAt || last.updatedAt || 0)) {
        meta[otherId] = { ...(meta[otherId] || {}), last: msg };
      }
      const readBy = msg.readBy || [];
      const isUnread = recipientId === currentUserId && !readBy.some((id: any) => id?.toString?.() === currentUserId?.toString?.() || id === currentUserId);
      if (isUnread) {
        meta[otherId] = { ...(meta[otherId] || {}), unread: (meta[otherId]?.unread || 0) + 1 };
      }
    }
    return meta;
  }, [liveMessages, currentUserId]);

  const sortedConversations = useMemo(() => {
    return filteredUsers
      .map((u: any) => ({
        user: u,
        meta: conversationMeta[u._id || u.id] || { last: null, unread: 0 },
      }))
      .sort((a: any, b: any) => {
        const aDate = a.meta.last?.createdAt ? new Date(a.meta.last.createdAt).getTime() : 0;
        const bDate = b.meta.last?.createdAt ? new Date(b.meta.last.createdAt).getTime() : 0;
        return bDate - aDate;
      });
  }, [filteredUsers, conversationMeta]);

  const socketRef = useChatSocket({
    onMessage: (msg) => {
      setLiveMessages((prev) => {
        const msgId = msg?._id || msg?.id;
        if (!msgId) return [msg, ...prev];
        if (prev.some((m: any) => (m?._id || m?.id) === msgId)) {
          return prev;
        }
        return [msg, ...prev];
      });
    },
  });

  useEffect(() => {
    if (activeRoomId && socketRef.current) {
      socketRef.current.emit('chat:join_room', { roomId: activeRoomId });
    }
  }, [activeRoomId, socketRef]);

  useEffect(() => {
    if (!activeUserId || !socketRef.current || !currentUserId) return;
    const unreadIds = activeMessages
      .filter((m: any) => {
        const recipientId = typeof m.recipient === 'object' ? m.recipient?._id || m.recipient?.id : m.recipient;
        const readBy = m.readBy || [];
        return recipientId === currentUserId && !readBy.some((id: any) => id?.toString?.() === currentUserId?.toString?.() || id === currentUserId);
      })
      .map((m: any) => m._id || m.id)
      .filter(Boolean);
    if (unreadIds.length) {
      socketRef.current.emit('chat:read', { messageIds: unreadIds });
      setLiveMessages((prev) =>
        prev.map((m: any) =>
          unreadIds.includes(m._id || m.id)
            ? { ...m, readBy: Array.from(new Set([...(m.readBy || []), currentUserId])) }
            : m
        )
      );
      setLastReadAt(new Date());
    }
  }, [activeUserId, activeMessages, currentUserId, socketRef]);

  useEffect(() => {
    if (activeUserId || activeRoomId === 'company') {
      setLastReadAt(new Date());
    }
  }, [activeUserId, activeRoomId]);

  const handleSend = () => {
    if (!draft.trim() || !socketRef.current) return;
    if (activeUserId) {
      socketRef.current.emit('chat:send_message', {
        message: draft.trim(),
        recipientId: activeUserId,
        chatType: 'general',
      });
      setDraft('');
      return;
    }
    if (activeRoomId) {
      socketRef.current.emit('chat:send_message', {
        message: draft.trim(),
        roomId: activeRoomId,
        chatType: 'general',
      });
      setDraft('');
    }
  };

  return (
    <ProtectedRoute>
      <ProtectedLayout title={t('navigation.chat', { defaultValue: 'Chat' })}>
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="grid gap-6 md:grid-cols-[280px_1fr]">
            <div className="rounded-lg border border-border bg-card">
              <div className="border-b border-border px-4 py-3 text-sm font-semibold text-foreground">
                {t('chat.rooms', { defaultValue: 'Rooms' })}
                {user?.company?.name && (
                  <div className="mt-1 text-xs text-muted-foreground">{user.company.name}</div>
                )}
              </div>
              <div className="max-h-[70vh] overflow-auto">
                <button
                  onClick={() => {
                    setActiveUserId(null);
                    setActiveRoomId('company');
                    socketRef.current?.emit('chat:join_room', { roomId: 'company' });
                  }}
                  className={`w-full px-4 py-3 text-left text-sm hover:bg-muted/60 ${
                    activeRoomId === 'company' ? 'bg-muted/70' : ''
                  }`}
                >
                  <div className="font-medium text-foreground">{t('chat.companyRoom', { defaultValue: 'Company Room' })}</div>
                  <div className="text-xs text-muted-foreground">{t('chat.companyRoomDesc', { defaultValue: 'All company members' })}</div>
                </button>

                <div className="border-t border-border/60 my-2" />
                <div className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase">
                  {t('chat.users', { defaultValue: 'Users' })}
                </div>
                <div className="px-4 pb-2">
                  <input
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    placeholder={t('chat.searchUsers', { defaultValue: 'Search users...' })}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs text-foreground"
                  />
                </div>
                {sortedConversations.map(({ user: u, meta }) => {
                  const id = u._id || u.id;
                  const last = meta?.last;
                  const unread = meta?.unread || 0;
                  const lastText = last?.message || '';
                  const lastTime = last?.createdAt
                    ? new Intl.DateTimeFormat(i18n.language || undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(last.createdAt))
                    : '';
                  return (
                    <button
                      key={id}
                      onClick={() => {
                        setActiveRoomId(null);
                        setActiveUserId(id);
                        socketRef.current?.emit('chat:join_room', { targetUserId: id });
                      }}
                      className={`w-full px-4 py-3 text-left text-sm hover:bg-muted/60 ${
                        activeUserId === id ? 'bg-muted/70' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="font-medium text-foreground">
                            {u.firstName} {u.lastName}
                          </div>
                          <div className="text-xs text-muted-foreground truncate max-w-[180px]">
                            {lastText || u.email}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-[10px] text-muted-foreground">{lastTime}</div>
                          {unread > 0 && (
                            <div className="mt-1 inline-flex min-w-[18px] items-center justify-center rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-semibold text-primary-foreground">
                              {unread}
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="rounded-lg border border-border bg-card flex flex-col">
              <div className="border-b border-border px-4 py-3 text-sm font-semibold text-foreground flex items-center justify-between">
                <div>
                  {activeUserId
                    ? `${activeUser?.firstName || ''} ${activeUser?.lastName || ''}`.trim() || t('chat.conversation', { defaultValue: 'Conversation' })
                    : t('chat.companyRoom', { defaultValue: 'Company Room' })}
                </div>
                {activeUserId && activeUser && (
                  <button
                    onClick={() => setShowUserDetails(true)}
                    className="text-xs text-primary hover:underline"
                  >
                    {t('chat.viewDetails', { defaultValue: 'View details' })}
                  </button>
                )}
              </div>
              <div
                ref={messagesContainerRef}
                onScroll={() => {
                  const el = messagesContainerRef.current;
                  if (!el) return;
                  const threshold = 80;
                  const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < threshold;
                  setIsAtBottom(atBottom);
                }}
                className="flex-1 overflow-auto px-4 py-4 space-y-3"
              >
                {activeMessages.length === 0 && (
                  <p className="text-sm text-muted-foreground">{t('chat.noMessages', { defaultValue: 'No messages yet.' })}</p>
                )}
                {activeMessages.map((m: any, index: number) => {
                  const senderId = typeof m.sender === 'object' ? m.sender?._id || m.sender?.id : m.sender;
                  const mine = senderId === currentUserId;
                  const timeLabel = m.createdAt
                    ? new Intl.DateTimeFormat(i18n.language || undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(m.createdAt))
                    : '';
                  const showNewDivider =
                    !mine &&
                    lastReadAt &&
                    m.createdAt &&
                    new Date(m.createdAt).getTime() > lastReadAt.getTime() &&
                    (index === 0 ||
                      !(activeMessages[index - 1]?.createdAt &&
                        new Date(activeMessages[index - 1].createdAt).getTime() > lastReadAt.getTime()));
                  return (
                    <div key={m._id || m.id || `msg-${index}`}>
                      {showNewDivider && (
                        <div className="my-2 flex items-center gap-2 text-xs text-muted-foreground">
                          <div className="h-px flex-1 bg-border" />
                          <span>{t('chat.newMessages', { defaultValue: 'New messages' })}</span>
                          <div className="h-px flex-1 bg-border" />
                        </div>
                      )}
                      <div className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[70%] rounded-lg px-3 py-2 text-sm ${mine ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'}`}>
                          <div>{m.message}</div>
                          <div className={`mt-1 text-[10px] ${mine ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                            {timeLabel}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
              <div className="border-t border-border p-4">
                <div className="flex gap-2">
                  <input
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder={t('chat.typeMessage', { defaultValue: 'Type a message...' })}
                    className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
                    disabled={!activeUserId && !activeRoomId}
                  />
                  <Button
                  className='gradient-bg-primary text-white'
                    onClick={handleSend}
                    disabled={!draft.trim() || (!activeUserId && !activeRoomId)}
                  >
                    {t('chat.send', { defaultValue: 'Send' })}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {activeUser && (
          <Sheet isOpen={showUserDetails} onClose={() => setShowUserDetails(false)} position="right" size="lg">
            <SheetHeader>
              <SheetTitle>{t('chat.userDetails', { defaultValue: 'User details' })}</SheetTitle>
            </SheetHeader>
            <SheetBody>
              <div className="space-y-2 text-sm">
                <div className="font-semibold text-foreground">
                  {activeUser.firstName} {activeUser.lastName}
                </div>
                <div className="text-muted-foreground">{activeUser.email}</div>
                {activeUser.phone && <div className="text-muted-foreground">{activeUser.phone}</div>}
                {user?.company?.name && (
                  <div className="text-muted-foreground">{user.company.name}</div>
                )}
              </div>
            </SheetBody>
          </Sheet>
        )}
      </ProtectedLayout>
    </ProtectedRoute>
  );
}
