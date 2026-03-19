import React, { useState, useEffect } from 'react';
import { User, Camera, Save, Loader2, CheckCircle2, Mail, AlertTriangle } from 'lucide-react';
import { useNexusStore } from '../store';
import { auth, updateUserProfile, sendEmailVerification } from '../firebase';
import { motion, AnimatePresence } from 'motion/react';

export const UserProfile = () => {
  const { userProfile, addLog } = useNexusStore();
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(userProfile?.displayName || '');
  const [photoURL, setPhotoURL] = useState(userProfile?.photoURL || '');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifySent, setVerifySent] = useState(false);

  useEffect(() => {
    if (userProfile) {
      setDisplayName(userProfile.displayName);
      setPhotoURL(userProfile.photoURL || '');
    }
  }, [userProfile]);

  const handleSave = async () => {
    if (!auth.currentUser) return;
    setIsSaving(true);
    try {
      await updateUserProfile(auth.currentUser.uid, {
        displayName,
        photoURL: photoURL || null,
        email: auth.currentUser.email || ''
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

      <div className="flex items-center gap-6 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
        <div className="relative group">
          <div className="w-20 h-20 rounded-2xl bg-nexus-accent/10 border border-nexus-accent/20 flex items-center justify-center overflow-hidden">
            {photoURL ? (
              <img src={photoURL} alt={displayName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              <User size={32} className="text-nexus-accent" />
            )}
          </div>
          {isEditing && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-2xl">
              <Camera size={20} className="text-white" />
            </div>
          )}
        </div>

        <div className="flex-1 space-y-1">
          {isEditing ? (
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
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-lg font-bold text-white">{displayName || 'Anonymous User'}</h4>
                  <p className="text-xs text-white/40">{userProfile?.email}</p>
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
              <div className="flex items-center gap-2 mt-2">
                <span className="px-2 py-0.5 rounded-full bg-nexus-accent/10 border border-nexus-accent/20 text-[8px] font-bold uppercase tracking-widest text-nexus-accent">
                  {userProfile?.uid?.slice(0, 8)}
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
    </div>
  );
};
