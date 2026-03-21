import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import { resources } from "./resource";

const getInitialLanguage = () => {
  if (typeof window === "undefined") return "en";

  const savedLanguage = window.localStorage.getItem("language");
  if (savedLanguage) return savedLanguage.split("-")[0];

  return window.navigator.language?.split("-")[0] || "en";
};

if (!i18next.isInitialized) {
  i18next.use(initReactI18next).init({
    resources,
    lng: getInitialLanguage(),
    fallbackLng: "en",
    interpolation: { escapeValue: false }
  });
}

export default i18next;
