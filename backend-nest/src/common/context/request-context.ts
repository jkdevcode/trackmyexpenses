import { AsyncLocalStorage } from 'async_hooks';

type RequestContextStore = {
  requestId: string | null;
};

export class RequestContext {
  private static readonly storage =
    new AsyncLocalStorage<RequestContextStore>();

  static run<T>(requestId: string | null, callback: () => T): T {
    return this.storage.run({ requestId }, callback);
  }

  static getRequestId(): string | null {
    return this.storage.getStore()?.requestId ?? null;
  }
}
