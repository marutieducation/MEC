'use client';

import React, { useState, useEffect, useRef } from 'react';
import { BellIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { io, Socket } from 'socket.io-client';

interface Notification {
  _id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  link?: string;
  createdAt: string;
}

export default function NotificationBell() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!user) return;

    
    const fetchNotifications = async () => {
      try {
        const res = await api.get('/notifications');
        
        setNotifications(Array.isArray(res) ? res : (res?.data || []));
      } catch (err) {
        console.error('Failed to fetch notifications:', err);
        setNotifications([]);
      }
    };
    fetchNotifications();

    
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http:
    socketRef.current = io(socketUrl);

    socketRef.current.on('connect', () => {
      socketRef.current?.emit('joinRoom', user._id);
    });

    socketRef.current.on('notification', (newNotif: Notification) => {
      setNotifications((prev) => [newNotif, ...prev]);
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [user]);

  
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = (notifications || []).filter(n => !n.isRead).length;

  const handleMarkAsRead = async (id: string) => {
    try {
      await api.put(`/notifications/${id}/read`, {});
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (err) {
       console.error(err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.put(`/notifications/read-all`, {});
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
       console.error(err);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-8 h-8 rounded-full bg-bg text-muted hover:text-heading hover:bg-border transition-colors relative focus:outline-none focus:ring-2 focus:ring-primary"
      >
        <span className="sr-only">View notifications</span>
        <BellIcon className="h-5 w-5" aria-hidden="true" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 flex h-3 w-3">
             <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
             <span className="relative inline-flex rounded-full h-3 w-3 bg-primary border-2 border-surface text-[8px] items-center justify-center text-white font-bold"></span>
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-surface border border-border shadow-xl rounded-xl overflow-hidden z-50 animate-in slide-in-from-top-2">
          <div className="flex items-center justify-between p-4 border-b border-border bg-bg/50">
             <h3 className="font-semibold text-heading text-[14px]">Notifications</h3>
             {unreadCount > 0 && (
                <button onClick={handleMarkAllAsRead} className="text-[12px] text-primary hover:underline font-medium">Mark all as read</button>
             )}
          </div>
          
          <div className="max-h-[400px] overflow-y-auto">
            {(!notifications || notifications.length === 0) ? (
               <div className="p-8 text-center text-muted text-sm">You're all caught up!</div>
            ) : (
               <div className="divide-y divide-border">
                  {(notifications || []).map(notif => (
                     <div 
                        key={notif._id} 
                        className={`p-4 transition-colors hover:bg-bg/50 cursor-pointer ${notif.isRead ? 'opacity-70' : 'bg-primary/5'}`}
                        onClick={() => {
                           if (!notif.isRead) handleMarkAsRead(notif._id);
                           if (notif.link) window.location.href = notif.link;
                        }}
                     >
                        <div className="flex justify-between items-start mb-1">
                           <h4 className={`text-[13px] ${notif.isRead ? 'font-medium text-heading' : 'font-bold text-primary'}`}>{notif.title}</h4>
                           <span className="text-[10px] text-muted whitespace-nowrap ml-2">
                              {new Date(notif.createdAt).toLocaleDateString()}
                           </span>
                        </div>
                        <p className="text-[12px] text-muted line-clamp-2">{notif.message}</p>
                     </div>
                  ))}
               </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
