import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, X, Send, User } from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';

interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: number;
}

export default function ChatOverlay() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [socket, setSocket] = useState<Socket | null>(null);
  
  const { user } = useAuth();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar' || i18n.language === 'ur';
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Connect to WebSocket server on the same port
    const newSocket = io();
    setSocket(newSocket);

    newSocket.on('chat-message', (msg: ChatMessage) => {
      setMessages(prev => [...prev, msg]);
    });

    return () => {
      newSocket.close();
    };
  }, []);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !socket || !user) return;

    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      senderId: user.uid,
      senderName: user.displayName || 'مستخدم',
      text: input.trim(),
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, newMsg]);
    socket.emit('chat-message', newMsg);
    setInput('');
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 ${isRTL ? 'left-6' : 'right-6'} z-40 bg-emerald-600 text-white p-4 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:bg-emerald-700 transition-transform hover:scale-105`}
        aria-label="Open Chat"
      >
        <MessageCircle size={24} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={`fixed bottom-24 ${isRTL ? 'left-6' : 'right-6'} w-80 h-96 z-50 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 flex flex-col overflow-hidden`}
            dir={isRTL ? 'rtl' : 'ltr'}
          >
            {/* Header */}
            <div className="bg-emerald-600 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageCircle size={20} />
                <h3 className="font-bold">المجتمع مباشر (WebSocket)</h3>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-white/20 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
              {messages.length === 0 ? (
                <div className="m-auto text-slate-400 text-sm text-center">
                  لا توجد رسائل بعد. كن أول من يرحب بالآخرين!
                </div>
              ) : (
                messages.map((msg) => {
                  const isMe = msg.senderId === user?.uid;
                  return (
                    <div 
                      key={msg.id} 
                      className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} gap-1 max-w-[85%] ${isMe ? 'self-end' : 'self-start'}`}
                    >
                      {!isMe && (
                        <span className="text-[10px] text-slate-400 flex items-center gap-1 px-1">
                          <User size={10} />
                          {msg.senderName}
                        </span>
                      )}
                      <div 
                        className={`px-3 py-2 rounded-2xl text-sm ${
                          isMe 
                            ? 'bg-emerald-600 text-white rounded-tr-sm' 
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-sm'
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <form onSubmit={sendMessage} className="p-3 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="اكتب رسالة..."
                className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-emerald-500 text-slate-800 dark:text-white"
                disabled={!user}
              />
              <button
                type="submit"
                disabled={!input.trim() || !user}
                className="bg-emerald-600 text-white p-2 rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:bg-emerald-700 transition-colors"
              >
                <Send size={18} className={isRTL ? 'rotate-180' : ''} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
