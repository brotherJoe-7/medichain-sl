export {};

declare global {
  interface Window {
    ethereum?: {
      on(eventName: string, callback: (...args: unknown[]) => void): void;
      removeListener(eventName: string, callback: (...args: unknown[]) => void): void;
      request?: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
    };
  }
}
