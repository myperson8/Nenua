
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { startStudentChat } from '../services/geminiService';

interface StudentChatProps {
  isCompact?: boolean;
}

export default function StudentChat({ isCompact = false }: StudentChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('nenua_chat_history');
    return saved ? JSON.parse(saved) : [
      { role: 'model', text: 'Sup, scholar? Ready to turn that brain fog into high-fidelity neural links? What we grinding today?' }
    ];
  });
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatRef = useRef<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatRef.current = startStudentChat(messages);
  }, []);

  useEffect(() => {
    localStorage.setItem('nenua_chat_history', JSON.stringify(messages));
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, loading]);

  const handleSend = async (textOverride?: string) => {
    const messageText = textOverride || input;
    if (!messageText.trim() || loading) return;

    const userMessage: ChatMessage = { role: 'user', text: messageText };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      if (!chatRef.current) {
        chatRef.current = startStudentChat(messages);
      }
      const result = await chatRef.current.sendMessage({ message: messageText });
      const modelMessage: ChatMessage = { role: 'model', text: result.text || "Neural link failure." };
      setMessages(prev => [...prev, modelMessage]);
    } catch (err: any) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'model', text: "Connection error." }]);
    } finally {
      setLoading(false);
    }
  };

  const renderFormattedText = (text: string) => {
    return text.split('\n').map((paragraph, i) => {
      const parts = paragraph.split(/(\*\*.*?\*\*)/g);
      const content = parts.map((part, j) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={j} className="text-white font-black">{part.slice(2, -2)}</strong>;
        }
        return part;
      });

      if (paragraph.trim().startsWith('- ') || paragraph.trim().startsWith('* ')) {
        return (
          <div key={i} className="flex gap-2 ml-2 mb-1">
            <span className="text-emerald-500">•</span>
            <span className="flex-1">{content.slice(0).map(c => typeof c === 'string' ? c.replace(/^[-*]\s/, '') : c)}</span>
          </div>
        );
      }

      return paragraph.trim() ? <p key={i} className="mb-2 last:mb-0">{content}</p> : <div key={i} className="h-2" />;
    });
  };

  if (isCompact) {
    return (
      <div className="flex flex-col h-full gap-4">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Neural Tutor Link</span>
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
        </div>
        <div className="flex-1 bg-slate-900/40 border border-slate-800/50 rounded-2xl p-5 overflow-hidden">
          <div className="text-sm text-slate-300 line-clamp-4 leading-relaxed font-medium">
            {renderFormattedText(messages[messages.length - 1].text)}
          </div>
        </div>
        <button 
          onClick={(e) => { e.stopPropagation(); handleSend("Help me optimize my study session"); }}
          className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500/20 active:scale-95"
        >
          Smart Chat
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full max-w-5xl mx-auto py-4">
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto custom-scrollbar space-y-6 mb-6 pr-4 min-h-[400px]"
      >
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-6 rounded-[2rem] text-sm md:text-base leading-relaxed shadow-xl ${
              msg.role === 'user' 
                ? 'bg-emerald-500 text-slate-950 font-bold' 
                : 'bg-slate-800/40 border border-white/5 text-slate-200'
            }`}>
              {msg.role === 'user' ? msg.text : renderFormattedText(msg.text)}
            </div>
          </div>
        ))}
      </div>

      <div className="relative flex items-center pt-4 border-t border-white/5">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask Nenua anything..."
          className="w-full bg-white/5 border border-white/10 rounded-[2rem] px-8 py-5 text-slate-100 outline-none focus:border-emerald-500/50"
        />
        <button
          onClick={() => handleSend()}
          disabled={loading || !input.trim()}
          className="absolute right-4 p-3 bg-emerald-500 text-slate-950 rounded-full"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </button>
      </div>
    </div>
  );
}
