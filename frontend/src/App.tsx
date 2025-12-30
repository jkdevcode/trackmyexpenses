import { Route, Routes } from "react-router-dom";

import { CookieConsentProvider } from "@/contexts/cookie-consent-context";
import { CookieConsent } from "@/components/ui/cookie-consent";
import { PageNotFound } from "@/pages/404";

import IndexPage from "@/pages/index";
import LandingPage from "@/pages/landing";
import LoginPage from "@/features/auth/pages/Login";
import RegisterPage from "@/features/auth/pages/Register";
import { ProtectedRoute } from "@/features/auth/components/ProtectedRoute";
import { PublicOnlyRoute } from "@/features/auth/components/PublicOnlyRoute";

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
              <IndexPage />
            </ProtectedRoute>
          }
          path="/dashboard"
        />
        <Route element={<PageNotFound />} path="*" />
      </Routes>
    </CookieConsentProvider>
  );
}

export default App;
