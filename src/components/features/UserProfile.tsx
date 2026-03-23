import React, { useState, useEffect } from 'react';
import { User, Camera, Save, Loader2, CheckCircle2, Mail, AlertTriangle, Github, Globe, MapPin, Info, BarChart3, Rocket, Cpu } from 'lucide-react';
import { useNexusStore } from '../../core/store';
import { auth, updateUserProfile, sendEmailVerification } from '../../core/firebase';
import { motion, AnimatePresence } from 'motion/react';

const PREDEFINED_AVATARS = [
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Milo',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Luna',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Oliver',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Zoe',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Leo',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Maya',
];

export const UserProfile = () => {
  const { userProfile, addLog, githubConnected, githubUser, setGithubConnected, setGithubUser } = useNexusStore();
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(userProfile?.displayName || '');
  const [photoURL, setPhotoURL] = useState(userProfile?.photoURL || '');
  const [bio, setBio] = useState(userProfile?.bio || '');
  const [location, setLocation] = useState(userProfile?.location || '');
  const [website, setWebsite] = useState(userProfile?.website || '');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifySent, setVerifySent] = useState(false);
  const [isConnectingGithub, setIsConnectingGithub] = useState(false);

  useEffect(() => {
    if (userProfile) {
      setDisplayName(userProfile.displayName || '');
      setPhotoURL(userProfile.photoURL || '');
      setBio(userProfile.bio || '');
      setLocation(userProfile.location || '');
      setWebsite(userProfile.website || '');
    }
  }, [userProfile]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'OAUTH_AUTH_SUCCESS' && event.data?.provider === 'github') {
        setGithubConnected(true);
        setGithubUser(event.data.user);
        addLog(`System: GitHub account @${event.data.user} connected successfully.`);
        
        // Update profile in Firestore
        if (auth.currentUser) {
          updateUserProfile(auth.currentUser.uid, {
            githubConnected: true,
            githubUser: event.data.user
          });
        }
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [setGithubConnected, setGithubUser, addLog]);

  const handleSave = async () => {
    if (!auth.currentUser) return;
    setIsSaving(true);
    try {
      await updateUserProfile(auth.currentUser.uid, {
        displayName,
        photoURL: photoURL || null,
        email: auth.currentUser.email || '',
        bio,
        location,
        website
      });
      addLog("System: User profile updated successfully.");
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      setIsEditing(false);
    } catch (error) {
      addLog(`Error: Failed to update profile. ${error instanceof Error ? error.message : ''}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleConnectGithub = async () => {
    setIsConnectingGithub(true);
    try {
      const res = await fetch('/api/auth/github/url');
      const { url } = await res.json();
      window.open(url, 'github_oauth', 'width=600,height=700');
    } catch (error) {
      addLog(`Error: Failed to initiate GitHub connection. ${error instanceof Error ? error.message : ''}`);
    } finally {
      setIsConnectingGithub(false);
    }
  };

  const handleResendVerification = async () => {
    if (!auth.currentUser) return;
    setIsVerifying(true);
    try {
      await sendEmailVerification(auth.currentUser);
      setVerifySent(true);
      addLog("System: Verification email sent.");
      setTimeout(() => setVerifySent(false), 5000);
    } catch (error) {
      addLog(`Error: Failed to send verification email. ${error instanceof Error ? error.message : ''}`);
    } finally {
      setIsVerifying(false);
    }
  };

  if (!auth.currentUser) {
    return (
      <div className="p-6 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto">
          <User size={32} className="text-white/20" />
        </div>
        <p className="text-white/40 text-sm">Please sign in to view your profile.</p>
      </div>
    );
  }

  const isEmailVerified = auth.currentUser.emailVerified;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h5 className="text-xs font-bold uppercase tracking-widest text-white/40">User Profile</h5>
        {!isEditing ? (
          <button 
            onClick={() => setIsEditing(true)}
            className="text-[10px] font-bold uppercase tracking-widest text-nexus-accent hover:text-nexus-accent/80 transition-colors"
          >
            Edit Profile
          </button>
        ) : (
          <div className="flex gap-3">
            <button 
              onClick={() => setIsEditing(false)}
              className="text-[10px] font-bold uppercase tracking-widest text-white/40 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-nexus-accent hover:text-nexus-accent/80 transition-colors disabled:opacity-50"
            >
              {isSaving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
              Save Changes
            </button>
          </div>
        )}
      </div>

      <div className="flex items-start gap-6 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
        <div className="relative group">
          <div className="w-24 h-24 rounded-2xl bg-nexus-accent/10 border border-nexus-accent/20 flex items-center justify-center overflow-hidden">
            {photoURL ? (
              <img src={photoURL} alt={displayName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              <User size={40} className="text-nexus-accent" />
            )}
          </div>
          {isEditing && (
            <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-2xl">
              <Camera size={20} className="text-white mb-1" />
              <span className="text-[8px] font-bold uppercase tracking-widest text-white">Change</span>
            </div>
          )}
        </div>

        <div className="flex-1 space-y-4">
          {isEditing ? (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest text-white/20 font-bold">Display Name</label>
                  <input 
                    type="text" 
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-nexus-accent/50"
                    placeholder="Enter display name"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest text-white/20 font-bold">Avatar URL</label>
                  <input 
                    type="text" 
                    value={photoURL}
                    onChange={(e) => setPhotoURL(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-nexus-accent/50"
                    placeholder="https://example.com/avatar.png"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest text-white/20 font-bold">Location</label>
                  <div className="relative">
                    <MapPin size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
                    <input 
                      type="text" 
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-3 py-1.5 text-xs focus:outline-none focus:border-nexus-accent/50"
                      placeholder="San Francisco, CA"
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest text-white/20 font-bold">Website</label>
                  <div className="relative">
                    <Globe size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
                    <input 
                      type="text" 
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-3 py-1.5 text-xs focus:outline-none focus:border-nexus-accent/50"
                      placeholder="https://yourportfolio.com"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest text-white/20 font-bold">Bio</label>
                  <textarea 
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-nexus-accent/50 min-h-[70px] resize-none"
                    placeholder="Tell us about yourself..."
                  />
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xl font-black tracking-tight text-white">{displayName || 'Anonymous User'}</h4>
                  <div className="flex items-center gap-3 mt-1">
                    <p className="text-xs text-white/40 flex items-center gap-1.5">
                      <Mail size={12} />
                      {userProfile?.email}
                    </p>
                    {location && (
                      <p className="text-xs text-white/40 flex items-center gap-1.5">
                        <MapPin size={12} />
                        {location}
                      </p>
                    )}
                    {website && (
                      <a href={website} target="_blank" rel="noopener noreferrer" className="text-xs text-nexus-accent hover:underline flex items-center gap-1.5">
                        <Globe size={12} />
                        Website
                      </a>
                    )}
                  </div>
                </div>
                {!isEmailVerified && (
                  <div className="flex flex-col items-end gap-1">
                    <div className="flex items-center gap-1 text-[8px] font-bold uppercase tracking-widest text-rose-500">
                      <AlertTriangle size={10} />
                      Unverified
                    </div>
                    <button
                      onClick={handleResendVerification}
                      disabled={isVerifying || verifySent}
                      className="text-[8px] font-bold uppercase tracking-widest text-nexus-accent hover:underline disabled:opacity-50"
                    >
                      {isVerifying ? 'Sending...' : verifySent ? 'Sent!' : 'Verify Email'}
                    </button>
                  </div>
                )}
              </div>
              
              {bio && (
                <p className="text-xs text-white/60 leading-relaxed max-w-xl">
                  {bio}
                </p>
              )}

              <div className="flex items-center gap-2 mt-2">
                <span className="px-2 py-0.5 rounded-full bg-nexus-accent/10 border border-nexus-accent/20 text-[8px] font-bold uppercase tracking-widest text-nexus-accent">
                  ID: {userProfile?.uid?.slice(0, 8)}
                </span>
                {saveSuccess && (
                  <motion.span 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-1 text-[8px] font-bold uppercase tracking-widest text-emerald-400"
                  >
                    <CheckCircle2 size={10} />
                    Profile Saved
                  </motion.span>
                )}
                {isEmailVerified && (
                  <span className="flex items-center gap-1 text-[8px] font-bold uppercase tracking-widest text-emerald-400">
                    <CheckCircle2 size={10} />
                    Verified
                  </span>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {isEditing && (
        <div className="space-y-3 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
          <label className="text-[10px] uppercase tracking-widest text-white/20 font-bold">Quick Avatars</label>
          <div className="grid grid-cols-8 gap-2">
            {PREDEFINED_AVATARS.map((url, i) => (
              <button
                key={i}
                onClick={() => setPhotoURL(url)}
                className={`aspect-square rounded-xl border-2 transition-all overflow-hidden ${photoURL === url ? 'border-nexus-accent scale-95' : 'border-transparent hover:border-white/20'}`}
              >
                <img src={url} alt={`Avatar ${i}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
          <div className="flex items-center gap-2 text-white/40">
            <BarChart3 size={16} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Build Stats</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-2xl font-black tracking-tight text-white">42</p>
              <p className="text-[8px] font-bold uppercase tracking-widest text-white/20">Total Builds</p>
            </div>
            <div>
              <p className="text-2xl font-black tracking-tight text-nexus-accent">89%</p>
              <p className="text-[8px] font-bold uppercase tracking-widest text-white/20">Success Rate</p>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
          <div className="flex items-center gap-2 text-white/40">
            <Rocket size={16} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Deployments</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-2xl font-black tracking-tight text-white">12</p>
              <p className="text-[8px] font-bold uppercase tracking-widest text-white/20">Active Apps</p>
            </div>
            <div>
              <p className="text-2xl font-black tracking-tight text-emerald-400">0</p>
              <p className="text-[8px] font-bold uppercase tracking-widest text-white/20">Downtime</p>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
          <div className="flex items-center gap-2 text-white/40">
            <Github size={16} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Integrations</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${githubConnected ? 'bg-white/10 text-white' : 'bg-white/5 text-white/20'}`}>
                <Github size={16} />
              </div>
              <div>
                <p className="text-xs font-bold text-white">{githubConnected ? `@${githubUser}` : 'GitHub'}</p>
                <p className="text-[8px] font-bold uppercase tracking-widest text-white/20">{githubConnected ? 'Connected' : 'Not Connected'}</p>
              </div>
            </div>
            {!githubConnected ? (
              <button 
                onClick={handleConnectGithub}
                disabled={isConnectingGithub}
                className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-[8px] font-bold uppercase tracking-widest text-white hover:bg-white/10 transition-colors disabled:opacity-50"
              >
                {isConnectingGithub ? '...' : 'Connect'}
              </button>
            ) : (
              <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
