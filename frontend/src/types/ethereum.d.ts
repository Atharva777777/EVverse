export interface RequestArguments {
  method: string;
  params?: unknown[] | Record<string, unknown>;
}

export interface EIP1193Provider {
  request<T = unknown>(args: RequestArguments): Promise<T>;
  on?(eventName: string, listener: (...args: unknown[]) => void): void;
  removeListener?(eventName: string, listener: (...args: unknown[]) => void): void;
  isMetaMask?: boolean;
}

declare global {
  interface Window {
    ethereum?: EIP1193Provider;
  }
}
