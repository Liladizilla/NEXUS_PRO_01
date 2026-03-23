import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, Send, X, CheckCircle2 } from 'lucide-react';
import { useNexusStore } from '../../core/store';

export const FeedbackWidget: React.FC = () => {
  const { feedback, setFeedback } = useNexusStore();
  const [isOpen, setIsOpen] = useState(false);
  const [tempFeedback, setTempFeedback] = useState(feedback);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(tempFeedback);
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setIsOpen(false);
    }, 2000);
  };

  return (
    <div className="fixed bottom-8 left-8 z-[100]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="mb-4 w-80 glass p-6 rounded-3xl border-nexus-accent/20 shadow-2xl"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-black uppercase tracking-widest text-nexus-accent">Refinement Loop</h3>
              <button onClick={() => setIsOpen(false)} className="text-white/40 hover:text-white transition-colors">
                <X size={16} />
              </button>
            </div>

            {isSubmitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-8 text-center space-y-3"
              >
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="text-emerald-500" size={24} />
                </div>
                <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Feedback Integrated</p>
                <p className="text-[10px] text-white/40">The next build iteration will incorporate your refinements.</p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest">
                  Provide feedback to refine the next AI iteration
                </p>
                <textarea
                  value={tempFeedback}
                  onChange={(e) => setTempFeedback(e.target.value)}
                  placeholder="e.g., Make the UI more minimal, add a dark mode toggle, or fix the layout..."
                  className="w-full h-32 bg-white/5 border border-white/10 rounded-xl p-3 text-xs focus:outline-none focus:border-nexus-accent/50 transition-all resize-none"
                />
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-nexus-accent text-nexus-accent-contrast font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-lg shadow-nexus-accent/20"
                >
                  <Send size={14} />
                  Update Prompt
                </button>
              </form>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl transition-all duration-500 ${
          isOpen ? 'bg-white/10 text-white' : 'bg-nexus-accent text-nexus-accent-contrast'
        }`}
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
        {!isOpen && feedback && (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 rounded-full border-2 border-nexus-bg animate-pulse" />
        )}
      </motion.button>
    </div>
  );
};
