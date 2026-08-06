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
    intake: "Ingreso",
  },
  home: {
    /* Portada. La frase evita el "somos una institución dedicada a" y nombra la
       situación real de quien llega: decisiones legales que no se improvisan. */
    title: "Cuatro clínicas jurídicas para las decisiones que no admiten improvisación.",
    titleEmphasis: "no admiten",
    subtitle:
      "Insolvencia, emprendimiento, trabajo e impuestos. Asesoría gratuita de la Facultad de Derecho de la Universidad Diego Portales.",
    /* El diferenciador incopiable: no decimos "gratis", explicamos por qué no se
       cobra. Un estudio de cuota litis no puede replicar esta frase. */
    note: "Te atiende un estudiante de último año de Derecho UDP, con la supervisión directa de un profesor de la Facultad.",
    noteStrong: "No cobramos porque esto es parte de su formación",
    noteEnd: ", no una promoción ni un porcentaje del resultado.",
    cta: "Presentar mi caso",
    summaryTitle: "Las clínicas",
    /* Materia de cada clínica para el sumario de portada: no está en la base,
       es rótulo editorial. Si se agrega una quinta clínica, agregar su línea. */
    summaryMatters: {
      insolvencia: "Ley 20.720 · SUPERIR · renegociación y liquidación",
      "innovacion-emprendimiento": "Sociedades · propiedad intelectual · contratos",
      laboral: "Despidos · finiquitos · tutela laboral",
      tributario: "Observaciones y liquidaciones del SII · TTA",
    } as Record<string, string>,
    stats: [
      { value: "4", emphasis: false, label: "Clínicas jurídicas especializadas" },
      { value: "Sin costo", emphasis: true, label: "Para quien consulta, en todas las etapas" },
      { value: "Supervisada", emphasis: true, label: "Cada causa, por un profesor de la Facultad" },
      { value: "UDP", emphasis: false, label: "Facultad de Derecho, Universidad Diego Portales" },
    ],
    clinicsEyebrow: "Materias",
    clinicsTitle: "Las clínicas",
    clinicsSubtitle:
      "Cada clínica atiende su materia con equipo propio y publica contenido propio. Un mismo formulario de ingreso conduce a las cuatro.",
    teamEyebrow: "Equipo",
    teamTitle: "Quién te atiende",
    teamSubtitle:
      "Tu caso lo trabaja un estudiante de los últimos años de Derecho UDP, con un ayudante que acompaña el día a día y un profesor de la Facultad que responde por cada decisión.",
    roles: [
      {
        title: "Profesora o profesor a cargo",
        description:
          "Dirige la clínica y supervisa cada causa. Define si el caso se toma, aprueba la estrategia y responde académica y profesionalmente por el trabajo del equipo.",
      },
      {
        title: "Ayudante",
        description:
          "Egresado o egresada de la Facultad. Hace el puente entre el profesor y los estudiantes, revisa escritos antes de que salgan y sostiene la continuidad del caso entre semestres.",
      },
      {
        title: "Estudiante",
        description:
          "Alumna o alumno de los últimos años de la carrera. Es quien te entrevista, estudia tu caso y prepara los escritos. Para eso existe la clínica: es su formación, y por eso no se te cobra.",
      },
    ],
    teamLeadRole: "Profesora o profesor a cargo",
    teamViewAll: "Ver equipo completo",
    teamNote:
      "Aquí aparece quien encabeza cada clínica. El equipo completo — ayudantes y estudiantes — se ve al entrar a la página de cada una. Los nombres, retratos y biografías se cargan desde el panel de administración de la clínica respectiva.",
    articlesEyebrow: "Publicaciones",
    articlesTitle: "Columnas de opinión",
    articlesSubtitle:
      "Análisis firmado por los equipos de cada clínica sobre las materias que atendemos. Se publican desde el panel de administración de cada clínica.",
    articlesViewAll: "Ver todas las columnas",
    galleryEyebrow: "Galería",
    galleryTitle: "Clases y actividades",
    gallerySubtitle:
      "El registro fotográfico del trabajo de las clínicas: sesiones de clase, atenciones, audiencias y actividades de extensión.",
    galleryNote:
      "Cada clínica publica sus propios álbumes desde el panel de administración: título, descripción, portada y un pie de foto por imagen. Aquí se muestra el álbum más reciente de cada una; el resto se ve al entrar a la clínica.",
    galleryEmpty:
      "Todavía no hay álbumes publicados. Aparecerán aquí en cuanto cada clínica suba el primero desde su panel.",
    intakeEyebrow: "Ingreso",
    intakeTitle: "Formulario de ingreso",
    intakeSubtitle:
      "Solicita formalmente la asistencia de una de nuestras clínicas jurídicas. Un integrante del equipo revisará tu caso y te contactará para confirmar si puede ser atendido.",
    faqEyebrow: "Consultas",
    faqTitle: "Preguntas frecuentes",
    faqSubtitle:
      "Las dudas que más se repiten en cada clínica, respondidas por sus equipos. Filtra por materia para ver solo lo que te corresponde.",
    faqFilterAll: "Todas",
    viewClinic: "Ver clínica",
    viewAll: "Ver todos",
    /* La home ya no muestra los tres pasos ni el banner de cierre, pero siguen
       vivos: howItWorks lo usan /ingreso y /contacto, y ctaBanner /clinicas/[slug]. */
    howItWorks: {
      title: "¿Cómo funciona?",
      subtitle: "Tres pasos simples para recibir asesoría de una de nuestras clínicas.",
      steps: [
        {
          title: "Completa el formulario",
          description: "Cuéntanos tu caso a través del formulario de ingreso, indicando la clínica correspondiente.",
        },
        {
          title: "Un equipo revisa tu caso",
          description: "Un integrante de la clínica evalúa tu solicitud y confirma si puede ser atendida.",
        },
        {
          title: "Te contactamos",
          description: "Te contactaremos para coordinar los siguientes pasos de tu asesoría.",
        },
      ],
    },
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
  contact: {
    title: "Contacto",
    subtitle: "Cuéntanos tu consulta y la clínica correspondiente te responderá a la brevedad.",
    sidebarTitle: "¿Qué pasa después?",
    privacyNote: "Tu información solo será compartida con la clínica seleccionada y se usará únicamente para responder tu consulta.",
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
  intake: {
    title: "Formulario de ingreso",
    subtitle:
      "Solicita formalmente la asistencia de una de nuestras clínicas jurídicas. Un integrante del equipo revisará tu caso y te contactará para confirmar si puede ser atendido.",
    sidebarTitle: "¿Qué pasa después?",
    privacyNote: "Tu información solo será compartida con la clínica seleccionada y se usará únicamente para evaluar tu solicitud de ingreso.",
    clinic: "Clínica",
    selectClinic: "Selecciona una clínica",
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
    quickLinksTitle: "Enlaces rápidos",
    clinicsTitle: "Clínicas",
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
