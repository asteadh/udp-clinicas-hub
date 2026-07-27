// Every user-visible string in the public site lives here. Hub Negocios UDP
// is Spanish-only — no bilingual CopyShape<T> split like other consoles in
// this family.

export const webPageCopy = {
  dateLocale: "es-CL",
  siteName: "Hub Negocios UDP",
  nav: {
    home: "Inicio",
    clinics: "Clínicas",
    articles: "Artículos",
    contact: "Contacto",
  },
  home: {
    eyebrow: "Universidad Diego Portales",
    title: "Hub Negocios UDP",
    subtitle:
      "Cuatro clínicas jurídicas que acompañan a personas y emprendedores con asesoría gratuita en insolvencia, innovación, derecho laboral y tributario.",
    cta: "Contáctanos",
    clinicsTitle: "Nuestras clínicas",
    clinicsSubtitle: "Cada clínica atiende consultas y publica contenido propio.",
    articlesTitle: "Artículos recientes",
    viewAll: "Ver todos",
    viewClinic: "Ver clínica",
  },
  clinics: {
    title: "Clínicas",
    subtitle: "Elige una clínica para conocer su equipo, preguntas frecuentes y actividades.",
    notFoundTitle: "Clínica no encontrada",
    notFoundBody: "Esta clínica no existe o no está disponible.",
    faqsTitle: "Preguntas frecuentes",
    teamTitle: "Equipo",
    galleryTitle: "Galería",
    articlesTitle: "Artículos",
    noFaqs: "Esta clínica aún no publica preguntas frecuentes.",
    noTeam: "Esta clínica aún no publica su equipo.",
    noGallery: "Esta clínica aún no publica fotos.",
    noArticles: "Esta clínica aún no publica artículos.",
  },
  articles: {
    title: "Artículos",
    subtitle: "Contenido publicado por las clínicas de Hub Negocios UDP.",
    notFoundTitle: "Artículo no encontrado",
    notFoundBody: "Este artículo no existe o no está disponible.",
    by: "Por",
    noArticles: "Aún no hay artículos publicados.",
    back: "Volver a artículos",
    readMore: "Leer más",
  },
  contact: {
    title: "Contacto",
    subtitle: "Cuéntanos tu consulta y la clínica correspondiente te responderá a la brevedad.",
    clinic: "Clínica",
    selectClinic: "Selecciona una clínica",
    name: "Nombre",
    email: "Email",
    phone: "Teléfono (opcional)",
    message: "Mensaje",
    submit: "Enviar consulta",
    sending: "Enviando…",
    success: "¡Gracias! Recibimos tu consulta y te contactaremos pronto.",
    error: "No se pudo enviar tu consulta. Intenta nuevamente.",
  },
  footer: {
    rights: "Hub Negocios UDP — Universidad Diego Portales",
  },
  common: {
    noData: "No hay datos para mostrar.",
  },
  errorPages: {
    errorTitle: "Algo salió mal",
    errorBody: "No pudimos cargar esta página. Hemos registrado el error e investigaremos.",
    retry: "Intentar nuevamente",
    backHome: "Volver al inicio",
    persistHelp: "Si el problema persiste, recarga la página o contáctanos.",
    notFoundTitle: "Página no encontrada",
    notFoundBody: "La página que buscas no existe. Verifica la URL o vuelve al inicio.",
    goHome: "Ir al inicio",
    notFoundHelp: "Si sigues viendo este error, contáctanos.",
    globalTitle: "Fallo del sitio",
    globalBody: "Se produjo un error crítico. Por favor recarga la página para continuar.",
    reload: "Recargar",
  },
} as const;

export type WebPageCopy = typeof webPageCopy;
