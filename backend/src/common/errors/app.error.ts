export type AppErrorDetail = {
  field?: string;
  code: string;
  meta?: Record<string, unknown>;
};

export class AppError extends Error {
  constructor(
    public readonly code: string,
    message = code,
    public readonly details: AppErrorDetail[] = [],
  ) {
    super(message);
    this.name = new.target.name;
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace?.(this, new.target);
  }
}
