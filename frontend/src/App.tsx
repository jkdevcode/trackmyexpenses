import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";

import { CookieConsentProvider } from "@/contexts/cookie-consent-context";
import { CookieConsent } from "@/components/ui/cookie-consent";
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

function App() {
  return (
    <CookieConsentProvider>
      <CookieConsent />
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
            path="/dashboard"
            element={
              <AppErrorBoundary>
                <Suspense
                  fallback={<LoadingSpinner message="Cargando dashboard..." />}
                >
                  <Dashboard />
                </Suspense>
              </AppErrorBoundary>
            }
          />
          <Route
            path="/profile"
            element={
              <AppErrorBoundary>
                <Suspense
                  fallback={<LoadingSpinner message="Cargando perfil..." />}
                >
                  <ProfilePage />
                </Suspense>
              </AppErrorBoundary>
            }
          />
          <Route
            path="/invoices"
            element={
              <AppErrorBoundary>
                <Suspense
                  fallback={<LoadingSpinner message="Cargando facturas..." />}
                >
                  <NewInvoicePage />
                </Suspense>
              </AppErrorBoundary>
            }
          />
          <Route
            path="/settings"
            element={<div className="p-4">Ajustes (WIP)</div>}
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
