declare module '*.svg' {
  const src: string;
  export default src;
}

declare module 'react-dom/client' {
  export function createRoot(...args: any[]): any;
}
