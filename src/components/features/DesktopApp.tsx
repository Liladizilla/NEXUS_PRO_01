import React, { useEffect, useState } from 'react';
import { useNexusStore } from '../../core/store';

// Type definitions for Electron API
interface ElectronAPI {
  getAppSettings: () => Promise<any>;
  setAppSettings: (settings: any) => Promise<void>;
  getSystemInfo: () => Promise<any>;
  minimizeWindow: () => Promise<void>;
  maximizeWindow: () => Promise<void>;
  closeWindow: () => Promise<void>;
  on: (channel: string, func: (...args: any[]) => void) => void;
  once: (channel: string, func: (...args: any[]) => void) => void;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}

export const DesktopApp: React.FC = () => {
  const [isMaximized, setIsMaximized] = useState(false);
  const [systemInfo, setSystemInfo] = useState<any>(null);
  const { addLog } = useNexusStore();

  useEffect(() => {
    const initDesktopApp = async () => {
      if (window.electronAPI) {
        try {
          // Get system info
          const info = await window.electronAPI.getSystemInfo();
          setSystemInfo(info);
          
          // Get app settings
          const settings = await window.electronAPI.getAppSettings();
          
          addLog(`Desktop App Initialized on ${info.platform} ${info.arch}`);
          addLog(`Node.js Version: ${info.version}`);
          
          // Listen for window state changes
          window.electronAPI.on('window-state-change', (state: string) => {
            setIsMaximized(state === 'maximized');
          });
          
        } catch (error) {
          console.error('Failed to initialize desktop app:', error);
        }
      }
    };

    initDesktopApp();
  }, [addLog]);

  const handleMinimize = async () => {
    if (window.electronAPI) {
      await window.electronAPI.minimizeWindow();
    }
  };

  const handleMaximize = async () => {
    if (window.electronAPI) {
      await window.electronAPI.maximizeWindow();
    }
  };

  const handleClose = async () => {
    if (window.electronAPI) {
      await window.electronAPI.closeWindow();
    }
  };

  // Only render desktop controls if Electron is available
  if (!window.electronAPI) {
    return null;
  }

  return (
    <div className="desktop-app-controls fixed top-0 left-0 right-0 z-50 pointer-events-none">
      {/* Desktop Window Controls */}
      <div className="flex items-center justify-end p-2 gap-1 pointer-events-auto">
        <button
          onClick={handleMinimize}
          className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors"
          title="Minimize"
        >
          <svg width="12" height="2" viewBox="0 0 12 2" fill="white">
            <rect width="12" height="2" rx="1"/>
          </svg>
        </button>
        <button
          onClick={handleMaximize}
          className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors"
          title={isMaximized ? "Restore" : "Maximize"}
        >
          {isMaximized ? (
            <svg width="10" height="10" viewBox="0 0 10 10" fill="white">
              <path d="M2 2h6v6H2z" stroke="white" strokeWidth="1"/>
              <path d="M4 0h6v6M0 6h6v6M2 2v6H8V2" stroke="white" strokeWidth="0.5"/>
            </svg>
          ) : (
            <svg width="10" height="10" viewBox="0 0 10 10" fill="white">
              <path d="M0 0h10v10H0z" stroke="white" strokeWidth="1"/>
            </svg>
          )}
        </button>
        <button
          onClick={handleClose}
          className="w-8 h-8 rounded-full hover:bg-red-500/50 flex items-center justify-center transition-colors"
          title="Close"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="white">
            <path d="M11 1L1 11M1 1l10 10" stroke="white" strokeWidth="1.5"/>
          </svg>
        </button>
      </div>

      {/* System Info Bar */}
      {systemInfo && (
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 mt-12 px-4 py-2 bg-black/50 backdrop-blur rounded-full text-[10px] text-white/50">
          {systemInfo.platform} • Node {systemInfo.version}
        </div>
      )}
    </div>
  );
};
