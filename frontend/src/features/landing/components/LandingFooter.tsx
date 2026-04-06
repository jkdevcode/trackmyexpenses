import { Link } from "@heroui/link";
import { useTranslation } from "react-i18next";

export const LandingFooter = () => {
  const { t } = useTranslation("landing");
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full py-12 border-t border-default-100 bg-background px-4">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="flex flex-col gap-2">
          <p className="font-bold text-xl">TrackMyExpenses</p>
          <p className="text-default-400 text-sm">
            {t("footer.rights", { year: currentYear })}
          </p>
        </div>
        <div className="flex gap-8">
          <Link className="text-sm" color="foreground" href="/terms">
            {t("footer.terms")}
          </Link>
          <Link className="text-sm" color="foreground" href="/privacy">
            {t("footer.privacy")}
          </Link>
          <Link
            className="text-sm"
            color="foreground"
            href="mailto:info@trackmyexpenses.com"
          >
            Contacto
          </Link>
        </div>
      </div>
    </footer>
  );
};
