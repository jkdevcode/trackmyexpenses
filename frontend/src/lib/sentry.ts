export const initSentry = () => {
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  const isProd = import.meta.env.PROD;

  if (!dsn || !isProd) {
    return;
  }

  const schedule = (callback: () => void) => {
    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
      window.requestIdleCallback(callback, { timeout: 2500 });

      return;
    }

    globalThis.setTimeout(callback, 1200);
  };

  schedule(() => {
    void import("@sentry/react").then(({ init }) => {
      init({
        dsn,
        environment: import.meta.env.VITE_SENTRY_ENVIRONMENT,
        enabled: true,
        tracesSampleRate: 0.1,
      });
    });
  });
};
