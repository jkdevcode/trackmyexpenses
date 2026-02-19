import { Route, Routes } from "react-router-dom";

import { CookieConsentProvider } from "@/contexts/cookie-consent-context";
import { CookieConsent } from "@/components/ui/cookie-consent";
import { PageNotFound } from "@/pages/404";

import LandingPage from "@/pages/landing";
import LoginPage from "@/features/auth/pages/Login";
import RegisterPage from "@/features/auth/pages/Register";
import ProfilePage from "@/features/user/pages/Profile";
import Dashboard from "@/features/dashboard/pages/Dashboard";
import { NewInvoicePage } from "@/pages/NewInvoicePage";
import { ProtectedRoute } from "@/features/auth/components/ProtectedRoute";
import { PublicOnlyRoute } from "@/features/auth/components/PublicOnlyRoute";
import { AppLayout } from "@/components/layout/AppLayout";
import { AppErrorBoundary } from "@/components/error/AppErrorBoundary";

function App() {
  return (
    <CookieConsentProvider>
      <CookieConsent />
      <Routes>
        <Route
          element={
            <AppErrorBoundary>
              <LandingPage />
            </AppErrorBoundary>
          }
          path="/"
        />
        <Route
          element={
            <AppErrorBoundary>
              <PublicOnlyRoute>
                <LoginPage />
              </PublicOnlyRoute>
            </AppErrorBoundary>
          }
          path="/login"
        />
        <Route
          element={
            <AppErrorBoundary>
              <PublicOnlyRoute>
                <RegisterPage />
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
                <Dashboard />
              </AppErrorBoundary>
            }
          />
          <Route
            path="/profile"
            element={
              <AppErrorBoundary>
                <ProfilePage />
              </AppErrorBoundary>
            }
          />
          <Route
            path="/invoices"
            element={
              <AppErrorBoundary>
                <NewInvoicePage />
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
              <PageNotFound />
            </AppErrorBoundary>
          }
          path="*"
        />
      </Routes>
    </CookieConsentProvider>
  );
}

export default App;
