// Every user-visible string in the public site lives here. Hub Negocios UDP
// is Spanish-only — no bilingual CopyShape<T> split like other consoles in
// this family.

export const webPageCopy = {
  dateLocale: "es-CL",
  siteName: "Hub Negocios UDP",
  home: {
    /* La home reproduce la pieza de diseño con su texto en el marcado, para que
       diseño e implementación se lean como una sola cosa. Lo que queda aquí es
       lo que consumen OTRAS páginas: /clinicas/[slug] usa ctaBanner. */
    viewClinic: "Ver clínica",
    ctaBanner: {
      title: "¿Tienes una consulta legal?",
      subtitle: "Solicita ayuda gratuita de una de nuestras clínicas jurídicas.",
      primaryCta: "Solicitar ingreso",
      secondaryCta: "Contáctanos",
    },
  },
  clinics: {
    title: "Clínicas",
    subtitle: "Elige una clínica para conocer su equipo, preguntas frecuentes y actividades.",
    intro:
      "Las clínicas jurídicas de Hub Negocios UDP son atendidas por estudiantes y egresados de la Facultad de Derecho, bajo la supervisión directa de profesores. La asesoría es gratuita y busca acercar herramientas legales a personas y emprendedores.",
    badgeFreeService: "Atención gratuita",
    ctaCardTitle: "Solicita ayuda de esta clínica",
    ctaCardBody: "Completa el formulario de ingreso y un integrante del equipo revisará tu caso.",
    ctaCardButton: "Solicitar ingreso",
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
    prev: "Anterior",
    next: "Siguiente",
    ctaTitle: "¿Tienes un caso similar?",
    ctaBody: "Solicita asesoría gratuita de la clínica correspondiente.",
    ctaButton: "Solicitar ingreso",
  },
  intake: {
    title: "Formulario de ingreso",
    subtitle:
      "Solicita formalmente la asistencia de una de nuestras clínicas jurídicas. Un integrante del equipo revisará tu caso y te contactará para confirmar si puede ser atendido.",
    sidebarTitle: "¿Qué pasa después?",
    privacyNote: "Tu información solo será compartida con la clínica seleccionada y se usará únicamente para evaluar tu solicitud de ingreso.",
    clinic: "Clínica",
    fullName: "Nombre completo",
    rut: "RUT",
    email: "Email",
    phone: "Teléfono (opcional)",
    caseType: "Tipo de caso",
    caseTypePlaceholder: "Ej: despido injustificado, renegociación de deudas, observación del SII…",
    caseDescription: "Describe tu caso",
    hasDocumentation: "¿Cuentas con documentación de respaldo? (opcional)",
    hasDocumentationPlaceholder: "Ej: contrato de trabajo, liquidaciones de sueldo, notificaciones del SII…",
    submit: "Enviar solicitud",
    sending: "Enviando…",
    success: "¡Gracias! Recibimos tu solicitud de ingreso y la clínica te contactará a la brevedad.",
    error: "No se pudo enviar tu solicitud. Intenta nuevamente.",
  },
  footer: {
    description:
      "Clínicas jurídicas de la Facultad de Derecho UDP que ofrecen asesoría gratuita a personas y emprendedores.",
    rights: "Hub Negocios UDP — Universidad Diego Portales",
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
