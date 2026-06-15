import React, { useState, useRef, useEffect } from 'react';
import { GlassCard } from '../../components/ui/GlassCard';
import { Button } from '../../components/ui/Button';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import api from '../../api';

export function AIDataAssistant() {
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
      const response = await api.post('/ai/ask-data', { question: userMessage });
      setMessages((prev) => [...prev, { role: 'ai', content: response.data.answer }]);
    } catch (error) {
      console.error('Failed to get answer', error);
      setMessages((prev) => [
        ...prev,
        { role: 'ai', content: 'Sorry, I encountered an error while analyzing the attendance data.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 h-[80vh] flex flex-col">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="text-3xl font-bold text-white mb-2">AI Data Assistant</h1>
        <p className="text-slate-400 text-lg">Ask natural language questions about your team's attendance data.</p>
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
              <div className="w-20 h-20 mb-6 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/30 shadow-[0_0_30px_rgba(59,130,246,0.3)]">
                <svg className="w-10 h-10 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <p className="text-xl font-medium mb-2 text-white">Hi! I'm your AI Data Analyst.</p>
              <p>Ask me questions like "Who worked overtime last week?" or "Which team has the highest attendance rate?"</p>
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
                        ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-br-sm'
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
              placeholder="E.g., How many days was John absent this month?"
              className="flex-1 glass-input rounded-xl px-5 py-3.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 shadow-inner"
              disabled={loading}
            />
            <Button type="submit" isLoading={loading} disabled={!question.trim() || loading} className="px-8 font-semibold bg-blue-600 hover:bg-blue-700">
              Analyze Data
            </Button>
          </form>
        </div>
      </GlassCard>
    </div>
  );
}
