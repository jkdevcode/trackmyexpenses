import { Link } from "@heroui/link";
import { Link as RouterLink } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { APP_CONFIG } from "@/config/app";

export const LandingFooter = () => {
  const { t } = useTranslation("landing");
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full py-12 border-t border-default-100 bg-background px-4">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="flex flex-col gap-2">
          <RouterLink to="/">
            <p className="font-bold text-xl hover:opacity-80 transition-opacity">
              TrackMyExpenses
            </p>
          </RouterLink>
          <p className="text-default-400 text-sm">
            {t("footer.rights", { year: currentYear })}
          </p>
        </div>
        <div className="flex gap-8">
          <Link className="text-sm" color="foreground" href="/terms-of-service">
            {t("footer.terms")}
          </Link>
          <Link className="text-sm" color="foreground" href="/privacy-policy">
            {t("footer.privacy")}
          </Link>
          <a
            className="text-sm text-foreground hover:opacity-80 transition-opacity"
            href={`mailto:${APP_CONFIG.contactEmail}`}
          >
            {t("footer.contact")}
          </a>
        </div>
      </div>
    </footer>
  );
};
