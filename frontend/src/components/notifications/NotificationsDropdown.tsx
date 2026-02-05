'use client';

import { useMemo } from 'react';
import { Bell } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useNotifications, useUnreadNotificationCount } from '@/src/hooks/queries';
import { useNotificationsSocket } from '@/src/hooks/useNotificationsSocket';
import { cn } from '@/lib/utils';

const MAX_ITEMS = 6;

const normalizeNotifications = (response: any) => {
  const payload = response?.data ?? response;
  if (Array.isArray(payload?.data)) {
    return payload.data;
  }
  if (Array.isArray(payload)) {
    return payload;
  }
  return [];
};

export const NotificationsDropdown = () => {
  useNotificationsSocket();
  const { data: unreadCount } = useUnreadNotificationCount();
  const { data: notificationsData } = useNotifications({
    limit: MAX_ITEMS,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  } as any);

  const notifications = useMemo(
    () => normalizeNotifications(notificationsData).slice(0, MAX_ITEMS),
    [notificationsData]
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative px-5">
          <Bell className="h-5 w-5" />
          {unreadCount && unreadCount > 0 && (
            <span className="absolute -top-1 rounded-full bg-destructive py-0.5 text-[10px] font-semibold text-white">
              {unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-96 p-0">
        <div className="px-3 py-2">
          <DropdownMenuLabel className="px-0">Notifications</DropdownMenuLabel>
        </div>
        <DropdownMenuSeparator />
        <div className="max-h-80 overflow-auto">
          {notifications.length === 0 && (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
              No notifications yet.
            </div>
          )}
          {notifications.map((notification: any) => {
            const title = notification.title || 'Notification';
            const message = notification.message || notification.content || '';
            const createdAt = notification.createdAt ? new Date(notification.createdAt) : null;
            const timeLabel = createdAt ? formatDistanceToNow(createdAt, { addSuffix: true }) : '';
            const isRead = notification.isRead ?? notification.read ?? false;

            return (
              <div
                key={notification._id || notification.id}
                className={cn(
                  'border-b border-border px-4 py-3 text-sm last:border-b-0',
                  !isRead && 'bg-primary/5'
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="font-medium text-foreground">{title}</div>
                  {!isRead && <span className="mt-1 h-2 w-2 rounded-full bg-primary" />}
                </div>
                {message && (
                  <div className="mt-1 line-clamp-2 text-xs text-muted-foreground">{message}</div>
                )}
                {timeLabel && (
                  <div className="mt-2 text-[11px] text-muted-foreground">{timeLabel}</div>
                )}
              </div>
            );
          })}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
