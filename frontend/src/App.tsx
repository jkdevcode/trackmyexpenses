import { Route, Routes } from "react-router-dom";

import { CookieConsentProvider } from "@/contexts/cookie-consent-context";
import { CookieConsent } from "@/components/ui/cookie-consent";
import { PageNotFound } from "@/pages/404";

import IndexPage from "@/pages/index";
import LandingPage from "@/pages/landing";
import LoginPage from "@/features/auth/pages/Login";
import RegisterPage from "@/features/auth/pages/Register";

function App() {
  return (
    <CookieConsentProvider>
      <CookieConsent />
      <Routes>
        <Route element={<LandingPage />} path="/" />
        <Route element={<LoginPage />} path="/login" />
        <Route element={<RegisterPage />} path="/register" />
        <Route element={<IndexPage />} path="/dashboard" />
        <Route element={<PageNotFound />} path="*" />
      </Routes>
    </CookieConsentProvider>
  );
}

export default App;
