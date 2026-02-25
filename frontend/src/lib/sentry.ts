import * as Sentry from "@sentry/react";

export const initSentry = () => {
  const dsn = import.meta.env.VITE_SENTRY_DSN; // Sentry DSN (Data Source Name) from environment variables

  if (!dsn) {
    return;
  }

  Sentry.init({
    dsn,
    environment: import.meta.env.VITE_SENTRY_ENVIRONMENT, // staging, development & production.
    enabled: !import.meta.env.DEV, // Disable Sentry in development mode
    tracesSampleRate: 0.1,
  });
};
