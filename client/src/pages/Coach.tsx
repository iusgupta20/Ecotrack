import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { Send, Leaf, HelpCircle, Loader } from 'lucide-react';

interface Message {
  sender: 'user' | 'coach';
  text: string;
  timestamp: Date;
}

export const Coach: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'coach',
      text: "👋 Hi! I'm your EcoTrack AI Coach. I can analyze your lifestyle footprints, answer questions about sustainability, and help you draft a custom carbon reduction plan. Ask me anything, or pick a suggestion below!",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const suggestions = [
    "How can I cut transport emissions?",
    "Why does diet choice affect carbon?",
    "Tips for reducing home AC usage",
    "How recycling helps carbon reduction"
  ];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;

    const userMsg: Message = {
      sender: 'user',
      text: textToSend,
      timestamp: new Date()
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await api.post<{ reply: string }>('/coach/chat', { prompt: textToSend });
      
      const coachMsg: Message = {
        sender: 'coach',
        text: response.reply,
        timestamp: new Date()
      };
      
      setMessages((prev) => [...prev, coachMsg]);
    } catch (err: any) {
      const errorMsg: Message = {
        sender: 'coach',
        text: "⚠️ Apologies, I'm having trouble connecting to my knowledge base. Please try again or check your server configuration.",
        timestamp: new Date()
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 h-[82vh] flex flex-col">
      {/* Chat header */}
      <div className="p-4 rounded-t-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
          <Leaf size={20} className="animate-pulse-slow" />
        </div>
        <div>
          <h1 className="font-bold text-slate-800 dark:text-white text-base">EcoTrack AI Sustainability Coach</h1>
          <p className="text-xs text-slate-400">Contextual advice tailored to your carbon profile</p>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-6 border-x border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 space-y-4">
        {messages.map((msg, index) => (
          <div 
            key={index} 
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[75%] p-4 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
              msg.sender === 'user' 
                ? 'bg-emerald-600 text-white rounded-br-none shadow-md' 
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-none shadow-sm'
            }`}>
              {msg.text}
              <div className={`text-[10px] mt-2 text-right ${msg.sender === 'user' ? 'text-emerald-200' : 'text-slate-400'}`}>
                {msg.timestamp.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl rounded-bl-none shadow-sm text-sm text-slate-500 flex items-center gap-2">
              <Loader size={16} className="animate-spin text-emerald-500" />
              <span>Coach is compiling advice...</span>
            </div>
          </div>
        )}
        <div ref={chatEndRef}></div>
      </div>

      {/* Input panel & suggestions */}
      <div className="p-4 rounded-b-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
        {/* Suggestion tags */}
        <div className="flex gap-2 overflow-x-auto pb-1.5 scrollbar-thin">
          {suggestions.map((sug) => (
            <button
              key={sug}
              onClick={() => handleSendMessage(sug)}
              className="text-xs px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-700 bg-transparent text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 shrink-0 font-medium transition"
            >
              {sug}
            </button>
          ))}
        </div>

        {/* Input box */}
        <form 
          onSubmit={(e) => { e.preventDefault(); handleSendMessage(input); }} 
          className="flex gap-2"
        >
          <input
            type="text"
            placeholder="Type your sustainability questions..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            className="flex-1 px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent text-slate-800 dark:text-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition"
            aria-label="Sustainability query message input"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="p-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition disabled:opacity-40"
            aria-label="Send message"
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default Coach;
