import { Route, Routes } from "react-router-dom";

import { CookieConsentProvider } from "@/contexts/cookie-consent-context";
import { CookieConsent } from "@/components/ui/cookie-consent";
import { PageNotFound } from "@/pages/404";

import LandingPage from "@/pages/landing";
import LoginPage from "@/features/auth/pages/Login";
import RegisterPage from "@/features/auth/pages/Register";
import ProfilePage from "@/features/user/pages/Profile";
import Dashboard from "@/features/dashboard/pages/Dashboard";
import { ProtectedRoute } from "@/features/auth/components/ProtectedRoute";
import { PublicOnlyRoute } from "@/features/auth/components/PublicOnlyRoute";
import { AppLayout } from "@/components/layout/AppLayout";

function App() {
  return (
    <CookieConsentProvider>
      <CookieConsent />
      <Routes>
        <Route element={<LandingPage />} path="/" />
        <Route
          element={
            <PublicOnlyRoute>
              <LoginPage />
            </PublicOnlyRoute>
          }
          path="/login"
        />
        <Route
          element={
            <PublicOnlyRoute>
              <RegisterPage />
            </PublicOnlyRoute>
          }
          path="/register"
        />
        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route index path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/invoices" element={<div className="p-4">Facturas (WIP)</div>} />
          <Route path="/settings" element={<div className="p-4">Ajustes (WIP)</div>} />
        </Route>
        <Route element={<PageNotFound />} path="*" />
      </Routes>
    </CookieConsentProvider>
  );
}

export default App;
