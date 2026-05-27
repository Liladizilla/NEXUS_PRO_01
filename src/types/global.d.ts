export {};

declare module '*.svg' {
  const src: string;
  export default src;
}

declare module 'react-dom/client' {
  export function createRoot(...args: any[]): any;
}

declare global {
  interface Window {
    aistudio?: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}
