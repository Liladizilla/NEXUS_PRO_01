import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Zap, AlertCircle, Globe, GitBranch } from 'lucide-react';
import { 
  auth, 
  googleProvider, 
  githubProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile
} from '../../core/firebase';

export const AuthPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    if (!auth) {
      setError('Authentication is unavailable. Firebase is not configured for this deployment.');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setLoadingText(isLogin ? 'Authenticating...' : 'Creating Account...');
    
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const { user } = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(user, { displayName: email.split('@')[0] });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider: string) => {
    setIsLoading(true);
    setError(null);
    setLoadingText(`Connecting to ${provider} Gateway...`);
    if (!auth || !googleProvider || !githubProvider) {
      setError('Authentication is unavailable. Firebase is not configured for this deployment.');
      setIsLoading(false);
      return;
    }
    
    try {
      if (provider === 'Google') {
        await signInWithPopup(auth, googleProvider);
      } else if (provider === 'GitHub') {
        await signInWithPopup(auth, githubProvider);
      }
    } catch (err: any) {
      setError(getAuthErrorMessage(err, provider));
      setIsLoading(false);
    }
  };

  const getAuthErrorMessage = (err: any, provider: string): string => {
    const code = err?.code;
    if (code === 'auth/unauthorized-domain') {
      return `Sign-in blocked: this app is being served from "${window.location.host}" which isn't authorized in Firebase. The project owner must add it under Authentication → Settings → Authorized domains.`;
    }
    if (code === 'auth/popup-closed-by-user') {
      return 'The sign-in popup was closed before completing. Please try again and allow popups / third-party cookies.';
    }
    if (code === 'auth/cancelled-popup-request') {
      return 'Only one sign-in popup can be open at a time. Please try again.';
    }
    if (code === 'auth/popup-blocked') {
      return 'The sign-in popup was blocked by your browser. Please allow popups for this site.';
    }
    if (code === 'auth/operation-not-allowed') {
      return `${provider} sign-in isn't enabled for this Firebase project. Enable it under Authentication → Sign-in method.`;
    }
    return err instanceof Error ? err.message : `${provider} login failed`;
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed inset-0 z-150 bg-nexus-bg flex items-center justify-center p-6 overflow-y-auto"
    >
      <div className="max-w-md w-full glass p-8 rounded-3xl space-y-8 border-nexus-accent/20 relative overflow-hidden my-auto">
        {isLoading && (
          <div className="absolute inset-0 z-50 bg-nexus-bg/80 backdrop-blur-md flex flex-col items-center justify-center space-y-4">
            <div className="w-12 h-12 border-4 border-nexus-accent/20 border-t-nexus-accent rounded-full animate-spin"></div>
            <p className="text-nexus-accent font-bold text-xs tracking-widest uppercase animate-pulse">{loadingText}</p>
          </div>
        )}

        <div className="text-center space-y-2">
          <Zap size={40} className="text-nexus-accent mx-auto mb-4" />
          <h2 className="text-3xl font-black tracking-tight">{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
          <p className="text-white/40 text-sm">Access the world's most stable software builder OS</p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle size={14} />
            {error}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-bold text-white/40 ml-1">Email Address</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white/5 border border-nexus-border rounded-xl px-4 py-3 text-sm focus:border-nexus-accent/50 transition-colors"
              placeholder="name@company.com"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-bold text-white/40 ml-1">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/5 border border-nexus-border rounded-xl px-4 py-3 text-sm focus:border-nexus-accent/50 transition-colors"
              placeholder="••••••••"
              required
            />
          </div>
          <button 
            type="submit"
            className="w-full bg-nexus-accent text-nexus-accent-contrast font-bold py-3 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all glow-accent"
          >
            {isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-nexus-border"></div></div>
          <div className="relative flex justify-center text-[10px] uppercase font-bold"><span className="bg-nexus-bg px-2 text-white/20">Or continue with</span></div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={() => handleSocialLogin('Google')}
            className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/5 border border-nexus-border hover:bg-white/10 transition-colors text-xs font-bold"
          >
            <Globe size={14} /> Google
          </button>
          <button 
            onClick={() => handleSocialLogin('GitHub')}
            className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/5 border border-nexus-border hover:bg-white/10 transition-colors text-xs font-bold"
          >
            <GitBranch size={14} /> GitHub
          </button>
        </div>

        <p className="text-center text-xs text-white/40">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
          <button onClick={() => setIsLogin(!isLogin)} className="text-nexus-accent font-bold hover:underline">
            {isLogin ? 'Sign Up' : 'Log In'}
          </button>
        </p>
      </div>
    </motion.div>
  );
};
