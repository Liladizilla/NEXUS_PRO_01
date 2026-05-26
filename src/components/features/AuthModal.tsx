import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Mail, 
  Lock, 
  GitBranch, 
  Globe, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { 
  auth, 
  googleProvider, 
  githubProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  updateProfile
} from '../../core/firebase';
import { cn } from '../../lib/utils';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type AuthMode = 'signin' | 'signup' | 'reset';

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [mode, setMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSocialLogin = async (provider: any) => {
    setLoading(true);
    setError(null);
    try {
      await signInWithPopup(auth, provider);
      onClose();
    } catch (err: any) {
      console.error("Social login error:", err);
      if (err.code === 'auth/popup-closed-by-user') {
        setError('The sign-in popup was closed before completion. Please try again and ensure popups and third-party cookies are allowed in your browser.');
      } else if (err.code === 'auth/cancelled-popup-request') {
        setError('Only one sign-in popup can be open at a time.');
      } else if (err.code === 'auth/popup-blocked') {
        setError('The sign-in popup was blocked by your browser. Please allow popups for this site.');
      } else {
        setError(err.message || 'An unexpected error occurred during social login.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Input Validation
    if (!email.trim()) {
      setError('Email address is required');
      return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (mode !== 'reset' && !password) {
      setError('Password is required');
      return;
    }

    if (mode === 'signup' && !displayName.trim()) {
      setError('Display name is required');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'signup') {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName });
        await sendEmailVerification(userCredential.user);
        setSuccess('Account created! Please check your email for verification.');
        setTimeout(() => setMode('signin'), 3000);
      } else if (mode === 'signin') {
        await signInWithEmailAndPassword(auth, email, password);
        onClose();
      } else if (mode === 'reset') {
        await sendPasswordResetEmail(auth, email);
        setSuccess('Password reset email sent!');
        setTimeout(() => setMode('signin'), 3000);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative w-full max-w-md bg-nexus-bg border border-white/10 rounded-[32px] overflow-hidden shadow-2xl p-8"
      >
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/5 text-white/40 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>

        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-black tracking-tighter bg-gradient-to-br from-white to-white/40 bg-clip-text text-transparent">
              {mode === 'signin' ? 'Welcome Back' : mode === 'signup' ? 'Create Account' : 'Reset Password'}
            </h2>
            <p className="text-xs text-white/40 uppercase font-bold tracking-widest">
              {mode === 'signin' ? 'Access your Odyseus ecosystem' : mode === 'signup' ? 'Join the Odyseus mesh' : 'Recover your access'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleSocialLogin(googleProvider)}
              disabled={loading}
              className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-white/5 border border-white/10 text-xs font-bold uppercase tracking-widest hover:bg-white/10 transition-all disabled:opacity-50"
            >
              <Globe size={14} className="text-nexus-accent" />
              Google
            </button>
            <button
              onClick={() => handleSocialLogin(githubProvider)}
              disabled={loading}
              className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-white/5 border border-white/10 text-xs font-bold uppercase tracking-widest hover:bg-white/10 transition-all disabled:opacity-50"
            >
              <GitBranch size={14} className="text-white" />
              GitHub
            </button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/5"></div>
            </div>
            <div className="relative flex justify-center text-[8px] uppercase font-black tracking-[0.2em] text-white/20">
              <span className="bg-nexus-bg px-4">Or continue with email</span>
            </div>
          </div>

          <form onSubmit={handleEmailAuth} className="space-y-4">
            {mode === 'signup' && (
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-white/30 ml-1">Display Name</label>
                <div className="relative">
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-nexus-accent/50 transition-all"
                    placeholder="Odyseus Architect"
                  />
                  <Mail size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
                </div>
              </div>
            )}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-white/30 ml-1">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-nexus-accent/50 transition-all"
                  placeholder="architect@odyseus.ai"
                />
                <Mail size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
              </div>
            </div>
            {mode !== 'reset' && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between ml-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-white/30">Password</label>
                  {mode === 'signin' && (
                    <button
                      type="button"
                      onClick={() => setMode('reset')}
                      className="text-[8px] font-bold uppercase tracking-widest text-nexus-accent hover:underline"
                    >
                      Forgot?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-nexus-accent/50 transition-all"
                    placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
                  />
                  <Lock size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
                </div>
              </div>
            )}

            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-2 text-[10px] text-rose-500 font-bold uppercase tracking-widest"
                >
                  <AlertCircle size={14} />
                  {error}
                </motion.div>
              )}
              {success && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2 text-[10px] text-emerald-400 font-bold uppercase tracking-widest"
                >
                  <CheckCircle2 size={14} />
                  {success}
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-2xl bg-nexus-accent text-nexus-accent-contrast font-black uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-2 hover:opacity-90 transition-all disabled:opacity-50 shadow-lg shadow-nexus-accent/20"
            >
              {loading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <>
                  {mode === 'signin' ? 'Initialize Session' : mode === 'signup' ? 'Create Identity' : 'Reset Access'}
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <div className="text-center">
            <button
              onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
              className="text-[10px] font-bold uppercase tracking-widest text-white/40 hover:text-white transition-colors"
            >
              {mode === 'signin' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
