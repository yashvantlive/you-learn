"use client";

import { useState, useEffect, useRef } from "react";
import { ref, push, onChildAdded, query, limitToLast } from "firebase/database";
import { rtdb } from "@/lib/firebase";
import { MessageCircle, Send, X, Smile } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ChatReactionsProps {
  roomId: string;
  playerId: string;
  playerName: string;
}

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: number;
  type: "text" | "reaction";
}

const REACTIONS = ["👍", "❤️", "😂", "😮", "🔥", "🎉"];

export default function ChatReactions({ roomId, playerId, playerName }: ChatReactionsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [showReactions, setShowReactions] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  // 1. Listen for Messages
  useEffect(() => {
    if (!roomId) return;

    // Listen to last 50 messages
    const chatRef = query(ref(rtdb, `rooms/${roomId}/chat`), limitToLast(50));
    
    const unsubscribe = onChildAdded(chatRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setMessages((prev) => [...prev, { id: snapshot.key as string, ...data }]);
        
        if (!isOpen) {
          setHasUnread(true);
        }
        
        // Auto-scroll to bottom
        setTimeout(() => {
          scrollRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    });

    return () => unsubscribe();
  }, [roomId, isOpen]);

  // 2. Clear unread when opened
  useEffect(() => {
    if (isOpen) setHasUnread(false);
  }, [isOpen]);

  // 3. Send Message Handler
  const sendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!message.trim()) return;

    const chatRef = ref(rtdb, `rooms/${roomId}/chat`);
    await push(chatRef, {
      senderId: playerId,
      senderName: playerName,
      text: message.trim(),
      type: "text",
      timestamp: Date.now(),
    });

    setMessage("");
    setShowReactions(false);
  };

  // 4. Send Reaction Handler
  const sendReaction = async (emoji: string) => {
    const chatRef = ref(rtdb, `rooms/${roomId}/chat`);
    await push(chatRef, {
      senderId: playerId,
      senderName: playerName,
      text: emoji,
      type: "reaction",
      timestamp: Date.now(),
    });
    setShowReactions(false);
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-24 right-4 z-40 p-3 bg-violet-600 text-white rounded-full shadow-lg hover:bg-violet-700 transition-all active:scale-95 border-2 border-white/20"
      >
        <MessageCircle size={24} />
        {hasUnread && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-slate-900 animate-pulse" />
        )}
      </button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-36 right-4 z-40 w-80 h-96 bg-white/95 backdrop-blur-md border border-slate-200 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-3 bg-slate-100 border-b border-slate-200 flex justify-between items-center">
              <h3 className="font-bold text-slate-700 text-sm flex items-center gap-2">
                <MessageCircle size={16} className="text-violet-600"/> Live Chat
              </h3>
              <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-slate-200 rounded-full transition-colors">
                <X size={16} className="text-slate-500" />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
              {messages.length === 0 && (
                <div className="text-center text-xs text-slate-400 mt-10">
                  No messages yet. Say hi! 👋
                </div>
              )}
              
              {messages.map((msg) => {
                const isMe = msg.senderId === playerId;
                const isReaction = msg.type === "reaction";

                return (
                  <div key={msg.id} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                    {!isMe && <span className="text-[10px] text-slate-400 ml-1 mb-0.5">{msg.senderName}</span>}
                    <div
                      className={`px-3 py-2 rounded-xl text-sm max-w-[85%] shadow-sm ${
                        isReaction 
                          ? "bg-transparent text-4xl p-0 shadow-none animate-in zoom-in spin-in-3" 
                          : isMe 
                            ? "bg-violet-600 text-white rounded-tr-none" 
                            : "bg-slate-100 text-slate-800 rounded-tl-none"
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                );
              })}
              <div ref={scrollRef} />
            </div>

            {/* Input Area */}
            <div className="p-3 border-t border-slate-200 bg-white relative">
              
              {/* Reaction Picker Popover */}
              <AnimatePresence>
                {showReactions && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }} 
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute bottom-full left-0 w-full p-2 bg-white border-t border-slate-100 flex justify-around shadow-sm pb-4"
                  >
                    {REACTIONS.map(emoji => (
                      <button 
                        key={emoji} 
                        onClick={() => sendReaction(emoji)}
                        className="text-2xl hover:scale-125 transition-transform p-1"
                      >
                        {emoji}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={sendMessage} className="flex gap-2 items-center">
                <button 
                  type="button" 
                  onClick={() => setShowReactions(!showReactions)}
                  className={`p-2 rounded-lg transition-colors ${showReactions ? "text-violet-600 bg-violet-50" : "text-slate-400 hover:bg-slate-50"}`}
                >
                  <Smile size={20} />
                </button>
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 bg-slate-50 border-none outline-none text-sm px-3 py-2 rounded-lg focus:ring-2 focus:ring-violet-100 transition-all"
                />
                <button 
                  type="submit" 
                  disabled={!message.trim()}
                  className="p-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send size={16} />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}