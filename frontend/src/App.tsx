import { lazy, Suspense } from "react";
import { useTranslation } from "react-i18next";
import { Route, Routes } from "react-router-dom";

import { CookieConsentProvider } from "@/contexts/cookie-consent-context";
import { ProtectedRoute } from "@/features/auth/components/ProtectedRoute";
import { PublicOnlyRoute } from "@/features/auth/components/PublicOnlyRoute";
import { AppLayout } from "@/components/layout/AppLayout";
import { AppErrorBoundary } from "@/components/error/AppErrorBoundary";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

const LandingPage = lazy(() => import("@/pages/landing"));
const LoginPage = lazy(() => import("@/features/auth/pages/Login"));
const RegisterPage = lazy(() => import("@/features/auth/pages/Register"));
const ForgotPasswordPage = lazy(
  () => import("@/features/auth/pages/ForgotPassword"),
);
const ResetPasswordPage = lazy(
  () => import("@/features/auth/pages/ResetPassword"),
);
const ProfilePage = lazy(() => import("@/features/user/pages/Profile"));
const Dashboard = lazy(() => import("@/features/dashboard/pages/Dashboard"));
const NewInvoicePage = lazy(() =>
  import("@/pages/NewInvoicePage").then((module) => ({
    default: module.NewInvoicePage,
  })),
);
const PageNotFound = lazy(() =>
  import("@/pages/404").then((module) => ({ default: module.PageNotFound })),
);
const SettingsPage = lazy(() =>
  import("@/features/settings/pages/SettingsPage").then((module) => ({
    default: module.SettingsPage,
  })),
);
const ReportsPage = lazy(() =>
  import("@/features/reports/pages/ReportsPage").then((module) => ({
    default: module.default,
  })),
);
const CookieConsent = lazy(() =>
  import("@/components/ui/cookie-consent").then((module) => ({
    default: module.CookieConsent,
  })),
);
const TermsOfService = lazy(() =>
  import("@/features/legal/pages/TermsOfService").then((module) => ({
    default: module.TermsOfService,
  })),
);
const PrivacyPolicy = lazy(() =>
  import("@/features/legal/pages/PrivacyPolicy").then((module) => ({
    default: module.PrivacyPolicy,
  })),
);

const shouldRenderCookieConsent = () => {
  if (typeof window === "undefined") return false;

  const consent = window.localStorage.getItem("cookie-consent-status");

  return consent !== "accepted" && consent !== "rejected";
};

function App() {
  const { t } = useTranslation("common");

  return (
    <CookieConsentProvider>
      {shouldRenderCookieConsent() ? (
        <Suspense fallback={null}>
          <CookieConsent />
        </Suspense>
      ) : null}
      <Routes>
        <Route
          element={
            <AppErrorBoundary>
              <Suspense
                fallback={
                  <LoadingSpinner message={t("common:loading.pages.landing")} />
                }
              >
                <LandingPage />
              </Suspense>
            </AppErrorBoundary>
          }
          path="/"
        />
        <Route
          element={
            <AppErrorBoundary>
              <Suspense
                fallback={
                  <LoadingSpinner message={t("common:loading.pages.page")} />
                }
              >
                <ForgotPasswordPage />
              </Suspense>
            </AppErrorBoundary>
          }
          path="/forgot-password"
        />
        <Route
          element={
            <AppErrorBoundary>
              <Suspense
                fallback={
                  <LoadingSpinner message={t("common:loading.pages.page")} />
                }
              >
                <ResetPasswordPage />
              </Suspense>
            </AppErrorBoundary>
          }
          path="/reset-password"
        />
        <Route
          element={
            <AppErrorBoundary>
              <PublicOnlyRoute>
                <Suspense
                  fallback={
                    <LoadingSpinner message={t("common:loading.pages.login")} />
                  }
                >
                  <LoginPage />
                </Suspense>
              </PublicOnlyRoute>
            </AppErrorBoundary>
          }
          path="/login"
        />
        <Route
          element={
            <AppErrorBoundary>
              <PublicOnlyRoute>
                <Suspense
                  fallback={
                    <LoadingSpinner
                      message={t("common:loading.pages.register")}
                    />
                  }
                >
                  <RegisterPage />
                </Suspense>
              </PublicOnlyRoute>
            </AppErrorBoundary>
          }
          path="/register"
        />
        <Route
          element={
            <AppErrorBoundary>
              <Suspense
                fallback={
                  <LoadingSpinner message={t("common:loading.pages.page")} />
                }
              >
                <TermsOfService />
              </Suspense>
            </AppErrorBoundary>
          }
          path="/terms-of-service"
        />
        <Route
          element={
            <AppErrorBoundary>
              <Suspense
                fallback={
                  <LoadingSpinner message={t("common:loading.pages.page")} />
                }
              >
                <PrivacyPolicy />
              </Suspense>
            </AppErrorBoundary>
          }
          path="/privacy-policy"
        />
        <Route
          element={
            <AppErrorBoundary
              fallbackTitle={t("common:error_boundary.layout_title")}
            >
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            </AppErrorBoundary>
          }
        >
          <Route
            index
            element={
              <AppErrorBoundary>
                <Suspense
                  fallback={
                    <LoadingSpinner
                      message={t("common:loading.pages.dashboard")}
                    />
                  }
                >
                  <Dashboard />
                </Suspense>
              </AppErrorBoundary>
            }
            path="/dashboard"
          />
          <Route
            element={
              <AppErrorBoundary>
                <Suspense
                  fallback={
                    <LoadingSpinner
                      message={t("common:loading.pages.profile")}
                    />
                  }
                >
                  <ProfilePage />
                </Suspense>
              </AppErrorBoundary>
            }
            path="/profile"
          />
          <Route
            element={
              <AppErrorBoundary>
                <Suspense
                  fallback={
                    <LoadingSpinner
                      message={t("common:loading.pages.invoices")}
                    />
                  }
                >
                  <NewInvoicePage />
                </Suspense>
              </AppErrorBoundary>
            }
            path="/invoices"
          />
          <Route
            element={
              <AppErrorBoundary>
                <Suspense
                  fallback={
                    <LoadingSpinner
                      message={t("common:loading.pages.settings")}
                    />
                  }
                >
                  <SettingsPage />
                </Suspense>
              </AppErrorBoundary>
            }
            path="/settings"
          />
          <Route
            element={
              <AppErrorBoundary>
                <Suspense
                  fallback={
                    <LoadingSpinner
                      message={t("common:loading.pages.reports")}
                    />
                  }
                >
                  <ReportsPage />
                </Suspense>
              </AppErrorBoundary>
            }
            path="/reports"
          />
        </Route>
        <Route
          element={
            <AppErrorBoundary>
              <Suspense
                fallback={
                  <LoadingSpinner message={t("common:loading.pages.page")} />
                }
              >
                <PageNotFound />
              </Suspense>
            </AppErrorBoundary>
          }
          path="*"
        />
      </Routes>
    </CookieConsentProvider>
  );
}

export default App;
