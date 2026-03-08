export const MAX_INVOICE_UPLOAD_SIZE = 5 * 1024 * 1024;

export const ALLOWED_INVOICE_UPLOAD_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export const INVOICE_UPLOAD_ACCEPT = "image/*,.pdf";
