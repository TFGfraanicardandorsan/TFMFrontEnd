const LOCALE_BY_LANGUAGE = {
  es: "es-ES",
  en: "en-GB",
  fr: "fr-FR",
};

const getActiveLocale = () => {
  const storedLanguage = localStorage.getItem("i18nextLng") || "es";
  const language = storedLanguage.split("-")[0];
  return LOCALE_BY_LANGUAGE[language] || LOCALE_BY_LANGUAGE.es;
};

export const formatearFecha = (fechaISO) => {
    const fecha = new Date(fechaISO);
    return new Intl.DateTimeFormat(getActiveLocale(), {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(fecha)
      .replace(",", "");
  };
