import { useEffect } from "react";
import { useTranslation } from "react-i18next";

interface UsePageMetaProps {
  title?: string;
  description?: string;
}

export function usePageMeta({ title, description }: UsePageMetaProps = {}) {
  const { t } = useTranslation("meta");

  useEffect(() => {
    // Si no pasan título, usamos el default del namespace "meta"
    const nextTitle = title || t("default.title", "TrackMyExpenses");
    
    // Si no pasan description, usamos el default
    const nextDescription = description || t(
      "default.description",
      "Overview of your expenses, invoices and financial activity"
    );

    document.title = nextTitle;

    let metaDescription = document.querySelector('meta[name="description"]');
    
    if (metaDescription) {
      metaDescription.setAttribute("content", nextDescription);
    } else {
      metaDescription = document.createElement("meta");
      metaDescription.setAttribute("name", "description");
      metaDescription.setAttribute("content", nextDescription);
      document.head.appendChild(metaDescription);
    }
  }, [title, description, t]);
}
