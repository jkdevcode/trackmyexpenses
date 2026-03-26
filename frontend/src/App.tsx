import { lazy, Suspense } from "react";
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

const shouldRenderCookieConsent = () => {
  if (typeof window === "undefined") return false;

  const consent = window.localStorage.getItem("cookie-consent-status");

  return consent !== "accepted" && consent !== "rejected";
};

function App() {
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
                fallback={<LoadingSpinner message="Cargando inicio..." />}
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
              <PublicOnlyRoute>
                <Suspense
                  fallback={<LoadingSpinner message="Cargando login..." />}
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
                  fallback={<LoadingSpinner message="Cargando registro..." />}
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
            <AppErrorBoundary fallbackTitle="Error en el layout de la aplicacion">
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
                  fallback={<LoadingSpinner message="Cargando dashboard..." />}
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
                  fallback={<LoadingSpinner message="Cargando perfil..." />}
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
                  fallback={<LoadingSpinner message="Cargando facturas..." />}
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
                  fallback={<LoadingSpinner message="Cargando ajustes..." />}
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
                  fallback={<LoadingSpinner message="Cargando reportes..." />}
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
                fallback={<LoadingSpinner message="Cargando pagina..." />}
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
