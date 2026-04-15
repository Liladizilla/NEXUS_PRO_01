import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, User, Loader2, X, Minimize2, Maximize2, Sparkles, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { callGeminiChat } from '../../core/ai';
import { useNexusStore } from '../../core/store';
import ReactMarkdown from 'react-markdown';

interface Message {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export const AIChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: "Hello! I'm your Odyseus AI assistant. How can I help you build today?", timestamp: Date.now() }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { addLog } = useNexusStore();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', text: input, timestamp: Date.now() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const chatHistory = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));
      chatHistory.push({ role: 'user', parts: [{ text: input }] });

      const response = await callGeminiChat(chatHistory, "You are Odyseus AI, a world-class software architect and developer. Help the user build their application. Be concise, technical, and helpful.");
      
      setMessages(prev => [...prev, { role: 'model', text: response || "I'm sorry, I couldn't process that.", timestamp: Date.now() }]);
    } catch (error) {
      console.error('AI Chat Error:', error);
      addLog(`Error: AI Chat failed. ${error instanceof Error ? error.message : ''}`);
      setMessages(prev => [...prev, { role: 'model', text: "System Error: I'm having trouble connecting to my neural mesh. Please try again later.", timestamp: Date.now() }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Toggle Button */}
      {!isOpen && (
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 rounded-2xl bg-nexus-accent text-nexus-accent-contrast shadow-[0_0_20px_rgba(0,240,255,0.3)] flex items-center justify-center z-50 group"
        >
          <MessageSquare size={24} className="group-hover:rotate-12 transition-transform" />
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-[#0a0a0a] animate-pulse" />
        </motion.button>
      )}

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              scale: 1,
              height: isMinimized ? '64px' : '500px',
              width: isMinimized ? '200px' : '380px'
            }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden z-50 glass"
          >
            {/* Header */}
            <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-nexus-accent/20 flex items-center justify-center">
                  <Bot size={18} className="text-nexus-accent" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Odyseus AI</h4>
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span className="text-[8px] font-bold uppercase tracking-widest text-white/40">Neural Mesh Online</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => setIsMinimized(!isMinimized)}
                  title={isMinimized ? 'Maximize' : 'Minimize'}
                  className="p-1.5 hover:bg-white/5 rounded-lg text-white/40 hover:text-white transition-colors"
                >
                  {isMinimized ? <Maximize2 size={14} /> : <Minimize2 size={14} />}
                </button>
                <button 
                  onClick={() => setIsOpen(false)}
                  title="Close chat"
                  className="p-1.5 hover:bg-white/5 rounded-lg text-white/40 hover:text-white transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* Messages */}
                <div 
                  ref={scrollRef}
                  className="flex-1 overflow-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-white/10"
                >
                  {messages.map((msg, i) => (
                    <motion.div
                      initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      key={i}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[85%] flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                        <div className={`w-6 h-6 rounded-lg shrink-0 flex items-center justify-center ${msg.role === 'user' ? 'bg-white/10' : 'bg-nexus-accent/20'}`}>
                          {msg.role === 'user' ? <User size={12} className="text-white/60" /> : <Bot size={12} className="text-nexus-accent" />}
                        </div>
                        <div className={`rounded-2xl px-3 py-2 text-xs leading-relaxed ${msg.role === 'user' ? 'bg-nexus-accent text-nexus-accent-contrast font-medium' : 'bg-white/5 text-white/80 border border-white/5'}`}>
                          <div className="markdown-body">
                            <ReactMarkdown>{msg.text}</ReactMarkdown>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="flex gap-2">
                        <div className="w-6 h-6 rounded-lg bg-nexus-accent/20 flex items-center justify-center">
                          <Bot size={12} className="text-nexus-accent" />
                        </div>
                        <div className="bg-white/5 border border-white/5 rounded-2xl px-3 py-2 flex items-center gap-2">
                          <Loader2 size={12} className="animate-spin text-nexus-accent" />
                          <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">Thinking...</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Input */}
                <div className="p-4 border-t border-white/5 bg-white/5">
                  <div className="relative">
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                      placeholder="Ask me anything..."
                      className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl pl-4 pr-10 py-2.5 text-xs focus:outline-none focus:border-nexus-accent/50 transition-colors"
                    />
                    <button
                      onClick={handleSend}
                      disabled={!input.trim() || isLoading}
                      title="Send message"
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-nexus-accent hover:text-white transition-colors disabled:opacity-50"
                    >
                      <Send size={16} />
                    </button>
                  </div>
                  <div className="flex items-center justify-center gap-4 mt-3">
                    <div className="flex items-center gap-1.5 text-[8px] font-bold uppercase tracking-widest text-white/20">
                      <Sparkles size={10} className="text-nexus-accent" />
                      Gemini 3.1 Pro
                    </div>
                    <div className="w-1 h-1 rounded-full bg-white/10" />
                    <div className="flex items-center gap-1.5 text-[8px] font-bold uppercase tracking-widest text-white/20">
                      <Bot size={10} className="text-nexus-accent" />
                      Search Grounding Active
                    </div>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
