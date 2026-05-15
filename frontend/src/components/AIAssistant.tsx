"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, X, BrainCircuit, Send, Sparkles, User } from "lucide-react";
import { usePathname } from "next/navigation";
import { useChronoTheme } from "@/lib/useChronoTheme";
import { getApiUrl } from "@/lib/api";

type Message = {
  id: string;
  sender: "user" | "ai";
  text: string;
  isTyping?: boolean;
};

// Memoized Message Bubble to prevent unnecessary re-renders during chat streaming
const MessageBubble = React.memo(({ msg, isDark }: { msg: Message; isDark: boolean }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
    >
      <div className={`flex gap-2 max-w-[85%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
        <div className="shrink-0 mt-auto">
          {msg.sender === 'ai' ? (
            <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)' }}>
              <Sparkles className="w-3 h-3 text-cyan-400" />
            </div>
          ) : (
            <div className="w-6 h-6 rounded-full bg-cyan-500 flex items-center justify-center">
              <User className="w-3 h-3 text-white" />
            </div>
          )}
        </div>

        <div 
          className={`p-3 rounded-2xl text-sm ${
            msg.sender === 'user' 
              ? 'bg-cyan-600 text-white rounded-br-sm shadow-md' 
              : `rounded-bl-sm backdrop-blur-md`
          }`}
          style={msg.sender !== 'user' ? {
            background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.08)'}`,
            color: isDark ? '#e5e7eb' : '#374151',
          } : undefined}
        >
          {msg.isTyping ? (
            <div className="flex gap-1 items-center h-5 px-2">
              {[0, 0.2, 0.4].map((delay) => (
                <motion.div 
                  key={delay}
                  animate={{ y: [0, -5, 0] }} 
                  transition={{ repeat: Infinity, duration: 0.6, delay }} 
                  className="w-1.5 h-1.5 rounded-full" 
                  style={{ background: 'var(--muted)' }}
                />
              ))}
            </div>
          ) : (
            <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
          )}
        </div>
      </div>
    </motion.div>
  );
});

MessageBubble.displayName = "MessageBubble";

export default function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [input, setInput] = useState("");
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      sender: "ai",
      text: "Hello! I'm your ChronoHealth AI Clinical Assistant. I can explain the CII formula, analyze your datasets, or suggest interventions. How can I help?"
    }
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const { isDark, mounted } = useChronoTheme();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!isOpen) return;
    let contextMsg = "";
    if (pathname.includes("/dashboard/upload")) {
      contextMsg = "I see you're on the Data Ingestion page. Let me know if you need help understanding the dataset completeness or AI quality scores!";
    } else if (pathname.includes("/dashboard/cii")) {
      contextMsg = "We are currently viewing the CII Engine. Need me to break down how the Phase Shift Rate or Stress Correlation is calculated?";
    } else if (pathname.includes("/dashboard/rl")) {
      contextMsg = "Looking at the Q-Learning Agent? I can explain how the expected rewards for CBT-I interventions are optimized.";
    }

    if (contextMsg) {
      setMessages(prev => {
        if (prev.some(m => m.text === contextMsg)) return prev;
        return [...prev, { id: Date.now().toString(), sender: "ai", text: contextMsg }];
      });
    }
  }, [pathname, isOpen]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userText = input.trim();
    const newUserMsg: Message = { id: Date.now().toString(), sender: "user", text: userText };
    
    setMessages(prev => [...prev, newUserMsg]);
    setInput("");

    const typingId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, { id: typingId, sender: "ai", text: "", isTyping: true }]);

    try {
      const response = await fetch(getApiUrl("/api/context-chat"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          message: userText,
          context: `User is currently on ${pathname}`,
          session_id: sessionId
        })
      });
      
      const data = await response.json();
      const aiResponse = data.response || "I apologize, but I'm having trouble processing that specific request. Please try rephrasing or ask about your latest stress analytics.";
      
      setMessages(prev => prev.map(msg => 
        msg.id === typingId ? { ...msg, text: aiResponse, isTyping: false } : msg
      ));

      // Optional: Log context for debugging or future UI indicators
      if (data.context) {
        console.log("AI Analysis Context:", data.context);
      }
    } catch (error) {
      console.error("AI Assistant Error:", error);
      setMessages(prev => prev.map(msg => 
        msg.id === typingId ? { 
          ...msg, 
          text: "The clinical intelligence server is currently experiencing high latency. Please check your connection or try again in a few moments.", 
          isTyping: false 
        } : msg
      ));
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSend();
  };

  if (!mounted) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="absolute bottom-16 right-0 w-[350px] sm:w-[400px] h-[500px] backdrop-blur-2xl rounded-3xl shadow-2xl flex flex-col overflow-hidden"
            style={{
              background: isDark ? 'rgba(0,0,0,0.92)' : 'rgba(255,255,255,0.95)',
              border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
            }}
          >
            <div className="h-16 flex items-center justify-between px-4" style={{
              borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
              background: isDark ? 'linear-gradient(to right, rgba(6,182,212,0.1), rgba(168,85,247,0.1))' : 'linear-gradient(to right, rgba(6,182,212,0.06), rgba(168,85,247,0.06))',
            }}>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500 to-purple-500 flex items-center justify-center">
                    <BrainCircuit className="w-4 h-4 text-white" />
                  </div>
                  <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full" style={{ borderWidth: '2px', borderColor: isDark ? '#000' : '#fff' }}></span>
                </div>
                <div>
                  <h3 className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>Clinical AI</h3>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    <p className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider">Live Context Synced</p>
                  </div>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="w-8 h-8 rounded-full flex items-center justify-center transition-colors" style={{ background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}>
                <X className="w-4 h-4" style={{ color: 'var(--muted)' }} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
              {messages.map((msg) => (
                <MessageBubble key={msg.id} msg={msg} isDark={isDark} />
              ))}
              <div ref={messagesEndRef} />
            </div>

            {messages.length < 5 && (
              <div className="px-4 pb-2 flex flex-wrap gap-2">
                {[
                  "Explain CII Formula", 
                  "What drives my stress?", 
                  "Explain Architecture",
                  "Analyze Dataset"
                ].map((q) => (
                  <button
                    key={q}
                    onClick={() => { setInput(q); }}
                    className="text-[10px] px-2 py-1 rounded-full border border-theme hover:bg-cyan-500/10 transition-colors text-theme-muted hover:text-cyan-400"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            <div className="p-4" style={{ background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)', borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}` }}>
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask about your analytics..."
                  className="w-full rounded-full pl-4 pr-12 py-3 text-sm focus:outline-none focus:border-cyan-500 transition-colors"
                  style={{
                    background: isDark ? '#0a0a0a' : '#f8fafc',
                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)'}`,
                    color: 'var(--foreground)',
                  }}
                />
                <button 
                  onClick={handleSend}
                  disabled={!input.trim()}
                  className="absolute right-2 w-8 h-8 rounded-full bg-cyan-500 hover:bg-cyan-400 disabled:bg-gray-500 disabled:opacity-50 flex items-center justify-center transition-colors"
                >
                  <Send className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="w-14 h-14 rounded-full bg-gradient-to-tr from-cyan-500 to-purple-500 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.5)] relative z-50 border border-white/20"
      >
        {isOpen ? <X className="w-6 h-6 text-white" /> : <MessageSquare className="w-6 h-6 text-white" />}
        <AnimatePresence>
          {isHovered && !isOpen && (
            <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
              className="absolute right-full mr-4 whitespace-nowrap text-xs px-3 py-1.5 rounded-lg backdrop-blur-md"
              style={{
                background: isDark ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.9)',
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                color: 'var(--foreground)',
              }}
            >
              Ask AI Assistant
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}
