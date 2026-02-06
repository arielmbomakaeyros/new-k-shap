'use client';

import { useMemo, useState, useEffect } from 'react';
import { ProtectedRoute } from '@/src/components/ProtectedRoute';
import { ProtectedLayout } from '@/src/components/layout/ProtectedLayout';
import { useChatParticipants } from '@/src/hooks/queries';
import { useChatMessages } from '@/src/hooks/queries/useChat';
import { useChatSocket } from '@/src/hooks/useChatSocket';
import { useAuthStore } from '@/src/store/authStore';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/node_modules/react-i18next';

export default function ChatPage() {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const { data: usersData } = useChatParticipants();
  const { data: messages = [] } = useChatMessages();
  const [liveMessages, setLiveMessages] = useState<any[]>([]);
  const [activeUserId, setActiveUserId] = useState<string | null>(null);
  const [activeRoomId, setActiveRoomId] = useState<string | null>('company');
  const [draft, setDraft] = useState('');

  const currentUserId = user?._id || user?.id;
  const users = usersData || [];

  const filteredUsers = users.filter((u: any) => (u._id || u.id) !== currentUserId);

  useEffect(() => {
    setLiveMessages(messages || []);
  }, [messages]);

  const activeMessages = useMemo(() => {
    if (activeUserId) {
      return liveMessages.filter((m: any) => {
        const senderId = typeof m.sender === 'object' ? m.sender?._id || m.sender?.id : m.sender;
        const recipientId = typeof m.recipient === 'object' ? m.recipient?._id || m.recipient?.id : m.recipient;
        return (
          (senderId === currentUserId && recipientId === activeUserId) ||
          (senderId === activeUserId && recipientId === currentUserId)
        );
      });
    }
    if (activeRoomId === 'company') {
      return liveMessages.filter((m: any) => {
        const recipientId = typeof m.recipient === 'object' ? m.recipient?._id || m.recipient?.id : m.recipient;
        return !recipientId && (m.chatType === 'general' || !m.chatType);
      });
    }
    return [];
  }, [liveMessages, activeUserId, currentUserId, activeRoomId]);

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
                {filteredUsers.map((u: any) => {
                  const id = u._id || u.id;
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
                      <div className="font-medium text-foreground">
                        {u.firstName} {u.lastName}
                      </div>
                      <div className="text-xs text-muted-foreground">{u.email}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="rounded-lg border border-border bg-card flex flex-col">
              <div className="border-b border-border px-4 py-3 text-sm font-semibold text-foreground">
                {activeUserId
                  ? t('chat.conversation', { defaultValue: 'Conversation' })
                  : t('chat.companyRoom', { defaultValue: 'Company Room' })}
              </div>
              <div className="flex-1 overflow-auto px-4 py-4 space-y-3">
                {activeMessages.length === 0 && (
                  <p className="text-sm text-muted-foreground">{t('chat.noMessages', { defaultValue: 'No messages yet.' })}</p>
                )}
                {activeMessages.map((m: any, index: number) => {
                  const senderId = typeof m.sender === 'object' ? m.sender?._id || m.sender?.id : m.sender;
                  const mine = senderId === currentUserId;
                  return (
                    <div key={m._id || m.id || `msg-${index}`} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] rounded-lg px-3 py-2 text-sm ${mine ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'}`}>
                        {m.message}
                      </div>
                    </div>
                  );
                })}
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
      </ProtectedLayout>
    </ProtectedRoute>
  );
}
