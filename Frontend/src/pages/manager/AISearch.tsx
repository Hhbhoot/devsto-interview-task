import React, { useState, useRef, useEffect } from 'react';
import { GlassCard } from '../../components/ui/GlassCard';
import { Button } from '../../components/ui/Button';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import api from '../../api';

export function ManagerAISearch() {
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'ai'; content: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    const userMessage = question;
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setQuestion('');
    setLoading(true);

    try {
      const response = await api.post('/ai/ask', { question: userMessage });
      setMessages((prev) => [...prev, { role: 'ai', content: response.data.answer }]);
    } catch (error) {
      console.error('Failed to get answer', error);
      setMessages((prev) => [
        ...prev,
        { role: 'ai', content: 'Sorry, I encountered an error while searching the policies.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 h-[80vh] flex flex-col">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="text-3xl font-bold text-white mb-2">HR Policy Assistant</h1>
        <p className="text-slate-400 text-lg">Ask any questions about company policies and procedures.</p>
      </motion.div>

      <GlassCard className="flex-1 flex flex-col p-0 overflow-hidden relative">
        {/* Chat window */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 relative z-10 custom-scrollbar">
          {messages.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }} 
              animate={{ opacity: 1, scale: 1 }} 
              transition={{ delay: 0.2 }}
              className="h-full flex flex-col items-center justify-center text-slate-400"
            >
              <div className="w-20 h-20 mb-6 rounded-full bg-primary-500/20 flex items-center justify-center border border-primary-500/30 shadow-[0_0_30px_rgba(138,43,226,0.3)]">
                <svg className="w-10 h-10 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <p className="text-xl font-medium mb-2 text-white">Hi! I'm your AI HR Assistant.</p>
              <p>Ask me about leave policies, work hours, or compliance.</p>
            </motion.div>
          ) : (
            <AnimatePresence initial={false}>
              {messages.map((msg, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.3, type: "spring", stiffness: 250 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-5 py-3.5 shadow-lg ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-br-sm'
                        : 'bg-white/10 text-slate-200 border border-white/10 rounded-bl-sm backdrop-blur-md'
                    }`}
                  >
                    <div className="whitespace-pre-wrap leading-relaxed text-[15px] prose prose-invert max-w-none">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
          
          <AnimatePresence>
            {loading && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex justify-start"
              >
                <div className="bg-white/10 text-slate-200 border border-white/10 rounded-2xl rounded-bl-sm px-5 py-5 w-64 shadow-lg backdrop-blur-md">
                  <div className="animate-pulse flex flex-col gap-3">
                    <div className="h-2 bg-white/20 rounded-full w-full"></div>
                    <div className="h-2 bg-white/20 rounded-full w-5/6"></div>
                    <div className="h-2 bg-white/20 rounded-full w-4/6"></div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={endOfMessagesRef} />
        </div>

        {/* Input box */}
        <div className="p-4 bg-slate-950/80 backdrop-blur-xl border-t border-white/10 relative z-20">
          <form onSubmit={handleAsk} className="flex gap-4 max-w-4xl mx-auto">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="E.g., How many sick days do I get?"
              className="flex-1 glass-input rounded-xl px-5 py-3.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 shadow-inner"
              disabled={loading}
            />
            <Button type="submit" isLoading={loading} disabled={!question.trim() || loading} className="px-8 font-semibold">
              Ask AI
            </Button>
          </form>
        </div>
      </GlassCard>
    </div>
  );
}
