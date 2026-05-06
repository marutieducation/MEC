'use client';

import React, { useState, useEffect, useRef } from 'react';
import { XMarkIcon, PaperAirplaneIcon } from '@heroicons/react/24/solid';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { io, Socket } from 'socket.io-client';

interface Message {
  _id: string;
  content: string;
  sender: {
    _id: string;
    firstName: string;
  } | string;
  createdAt: string;
}

interface ChatBoxProps {
  isOpen: boolean;
  onClose: () => void;
  recipientId: string;
  recipientName: string;
}

export default function ChatBox({ isOpen, onClose, recipientId, recipientName }: ChatBoxProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!isOpen || !user) return;


    const fetchMessages = async () => {
      setIsLoading(true);
      try {
        const res = await api.get(`/chat/${recipientId}`);
        setMessages(res.data);
      } catch (err) {
        console.error('Failed to fetch messages', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMessages();


    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/?$/, '') || 'https://mec-backend-9uu9.onrender.com';
    socketRef.current = io(socketUrl);

    socketRef.current.on('connect', () => {
      socketRef.current?.emit('joinRoom', user._id);
    });

    socketRef.current.on('receiveMessage', (message: Message) => {

      const senderId = typeof message.sender === 'object' ? message.sender._id : message.sender;
      if (senderId === recipientId || senderId === user._id) {
         setMessages((prev) => [...prev, message]);
      }
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [isOpen, user, recipientId]);

  useEffect(() => {

    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    try {
      const res = await api.post(`/chat/${recipientId}`, { content: newMessage });

      setMessages((prev) => [...prev, res.data]);
      setNewMessage('');
    } catch (err) {
      console.error('Failed to send message', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 w-96 max-w-[calc(100vw-2rem)] h-[500px] max-h-[80vh] bg-surface rounded-xl border border-border shadow-2xl flex flex-col z-50 overflow-hidden animate-in slide-in-from-bottom-8">
      {}
      <div className="flex items-center justify-between px-4 py-3 bg-primary text-white">
        <div className="flex items-center gap-3">
           <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold">
             {recipientName.charAt(0)}
           </div>
           <div>
             <h3 className="font-semibold text-sm">{recipientName}</h3>
             <p className="text-[10px] text-white/80 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span> Online
             </p>
           </div>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full transition-colors">
          <XMarkIcon className="w-5 h-5" />
        </button>
      </div>

      {}
      <div className="flex-1 overflow-y-auto p-4 bg-bg flex flex-col gap-3">
        {isLoading ? (
           <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
           </div>
        ) : messages.length === 0 ? (
           <div className="text-center text-muted text-sm mt-10">
              Start a conversation with {recipientName.split(' ')[0]}
           </div>
        ) : (
           messages.map((msg, i) => {
              const senderId = typeof msg.sender === 'object' ? msg.sender._id : msg.sender;
              const isMe = senderId === user?._id;

              return (
                 <div key={msg._id || i} className={`w-max max-w-[80%] rounded-2xl px-4 py-2 text-[13px] ${
                    isMe ? 'bg-primary text-white self-end rounded-br-sm' : 'bg-surface border border-border text-heading self-start rounded-bl-sm shadow-sm'
                 }`}>
                    {msg.content}
                 </div>
              );
           })
        )}
        <div ref={bottomRef} />
      </div>

      {}
      <form onSubmit={handleSendMessage} className="p-3 border-t border-border bg-surface flex items-center gap-2">
        <input
          type="text"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="flex-1 h-10 px-3 rounded-full bg-bg border border-border text-sm focus:outline-none focus:border-primary"
        />
        <button
          type="submit"
          disabled={!newMessage.trim()}
          className="w-10 h-10 rounded-full bg-primary hover:bg-primary-dark text-white flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
           <PaperAirplaneIcon className="w-4 h-4 mr-0.5" />
        </button>
      </form>
    </div>
  );
}
