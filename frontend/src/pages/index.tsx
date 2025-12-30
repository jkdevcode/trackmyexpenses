import { useTranslation } from "react-i18next";
import { Button } from "@heroui/button";
import { useNavigate } from "react-router-dom";
import { useSession } from "@/contexts/session-context";

import { title } from "@/components/ui/primitives";
import DefaultLayout from "@/layouts/default";

export default function IndexPage() {
  const { t } = useTranslation();
  const { user, logout } = useSession();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <DefaultLayout>
      <section className="flex flex-col items-center justify-center gap-6 py-16 md:py-24">
        <div className="text-center">
          <h1 className={title()}>
            {t("dashboard")} - {t("welcome-to")}&nbsp;
            <span className={title({ color: "violet" })}>{user?.name || user?.email || "User"}</span>
          </h1>
        </div>

        <div className="mt-8">
          <Button color="danger" variant="flat" onPress={handleLogout}>
            {t("logout")}
          </Button>
        </div>
      </section>
    </DefaultLayout>
  );
}
