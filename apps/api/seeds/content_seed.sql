-- Real (non-demo) informational content for all four clinics: FAQs and
-- articles. Applied unconditionally by cmd/seed (unlike demo_seed.sql,
-- which only runs with --demo). Insolvencia content is adapted from
-- "Tratado de Derecho Concursal Chileno" (A. Stead Hogg, UDP) — summarized
-- and paraphrased for a public audience, not reproduced verbatim.

-- --- Insolvencia y Reemprendimiento -----------------------------------------

INSERT INTO faqs (clinic_slug, question, answer_html, sort_order, is_published)
VALUES
  ('insolvencia', '¿Necesito un abogado para acogerme a la renegociación administrativa?',
   '<p>No. La renegociación administrativa ante la Superintendencia de Insolvencia y Reemprendimiento (SUPERIR) es gratuita y fue diseñada para tramitarse sin patrocinio de abogado, aunque siempre puedes solicitar orientación en nuestra clínica antes de presentarla.</p>', 1, true),
  ('insolvencia', '¿Qué requisitos debo cumplir para solicitar la renegociación?',
   '<p>En términos generales, debes tener al menos dos obligaciones vencidas por más de 90 días, por un monto total superior a 80 UF, y no encontrarte en las causales de exclusión que la ley contempla (por ejemplo, deudas de alimentos o de origen delictual).</p>', 2, true),
  ('insolvencia', '¿Cuál es la diferencia entre liquidación voluntaria y liquidación forzosa?',
   '<p>En la liquidación voluntaria es el propio deudor quien solicita el procedimiento y hace entrega de sus bienes al liquidador. En la liquidación forzosa, en cambio, son los acreedores quienes solicitan el procedimiento y puede llegar a existir incautación de bienes cuando el deudor no colabora.</p>', 3, true),
  ('insolvencia', '¿La reorganización judicial es solo para grandes empresas?',
   '<p>No. La Ley 20.720 contempla un procedimiento de reorganización simplificada pensado especialmente para micro y pequeñas empresas (MIPEs), más ágil y con menores costos que la reorganización judicial ordinaria.</p>', 4, true)
ON CONFLICT DO NOTHING;

INSERT INTO articles (clinic_slug, slug, title, excerpt, body_html, author_name, is_published, published_at)
VALUES
  ('insolvencia', 'que-cambio-con-la-ley-20720',
   '¿Qué cambió con la Ley 20.720?',
   'De la lógica de castigo al deudor a un sistema orientado a la reorganización y el reemprendimiento.',
   '<p>Durante buena parte del siglo XX, el derecho concursal chileno estuvo marcado por una lógica de punición hacia el deudor: primero bajo el régimen de quiebra del Código de Comercio de 1865, y luego bajo la Ley 4.558 de 1931 y la Ley 18.175 de 1982, que perfeccionaron el procedimiento de quiebra sin abandonar del todo esa mirada sancionatoria.</p>
<p>La Ley 20.720, vigente desde 2014, marca un cambio de paradigma: reemplaza el término "quiebra" por "liquidación" y pone al centro del sistema la posibilidad de reorganizar un negocio viable o de ofrecer, a la persona natural sobreendeudada, una salida ordenada y una segunda oportunidad de reemprender. La institucionalidad también cambió: se crea la Superintendencia de Insolvencia y Reemprendimiento (SUPERIR) en reemplazo de la antigua Superintendencia de Quiebras, y se profesionalizan los roles de veedor y liquidador.</p>
<p>En nuestra clínica ayudamos a entender, en cada caso concreto, qué procedimiento de los que contempla la ley actual corresponde a la situación de la persona o empresa que nos consulta.</p>',
   'Clínica de Insolvencia y Reemprendimiento UDP', true, now()),
  ('insolvencia', 'los-6-procedimientos-concursales-guia-rapida',
   'Los procedimientos concursales en Chile: guía rápida',
   'Un mapa simple de las alternativas que ofrece la Ley 20.720 según el tipo de deudor y su situación.',
   '<p>La Ley 20.720 no contempla un único camino frente al sobreendeudamiento, sino un catálogo de procedimientos concursales pensados para distintos perfiles de deudor:</p>
<ul>
<li><strong>Renegociación administrativa:</strong> exclusiva para personas naturales, gratuita, tramitada ante SUPERIR y sin necesidad de abogado.</li>
<li><strong>Reorganización judicial ordinaria:</strong> para empresas viables que buscan un acuerdo con sus acreedores para seguir operando, bajo la supervisión de un veedor.</li>
<li><strong>Reorganización simplificada:</strong> una versión más ágil y económica del procedimiento anterior, pensada para micro y pequeñas empresas (MIPEs).</li>
<li><strong>Liquidación ordinaria:</strong> el procedimiento tradicional de realización de los bienes del deudor para pagar a sus acreedores, a cargo de un liquidador.</li>
<li><strong>Liquidación simplificada:</strong> pensada para personas naturales, con dos variantes según exista o no colaboración voluntaria del deudor (entrega voluntaria de bienes o incautación forzosa).</li>
</ul>
<p>Además, la ley regula mecanismos complementarios como el arbitraje concursal y el reconocimiento de procedimientos de insolvencia iniciados en el extranjero. Elegir el procedimiento correcto es el primer paso, y es justamente en esa decisión donde nuestra clínica puede orientarte.</p>',
   'Clínica de Insolvencia y Reemprendimiento UDP', true, now()),
  ('insolvencia', 'renegociacion-administrativa-ante-superir',
   'Renegociación administrativa ante SUPERIR: cómo funciona',
   'El único procedimiento concursal pensado para tramitarse sin abogado, gratuito y ante la autoridad administrativa.',
   '<p>La renegociación administrativa es el procedimiento concursal disponible para personas naturales que buscan reprogramar sus deudas sin pasar por un tribunal. Se tramita directamente ante la Superintendencia de Insolvencia y Reemprendimiento (SUPERIR), no tiene costo, y —a diferencia de casi todos los demás procedimientos concursales— no requiere patrocinio de abogado.</p>
<p>Para acceder a ella, la persona debe tener al menos dos obligaciones vencidas por más de 90 días, por un monto conjunto superior a 80 UF, y no encontrarse en alguna de las causales de exclusión que contempla la ley (como deudas de origen alimenticio o vinculadas a delitos). Cumplidos los requisitos, SUPERIR cita a una audiencia de determinación del pasivo y luego a una de negociación, en la que deudor y acreedores buscan un acuerdo de pago ajustado a la capacidad real de pago de la persona.</p>
<p>Este procedimiento refleja bien el espíritu de "humanización" del sistema concursal chileno: busca una salida razonable antes de recurrir a alternativas más drásticas como la liquidación.</p>',
   'Clínica de Insolvencia y Reemprendimiento UDP', true, now()),
  ('insolvencia', 'liquidacion-simplificada-entrega-voluntaria-vs-incautacion',
   'Liquidación simplificada: entrega voluntaria vs. incautación forzosa',
   'Dos caminos muy distintos dentro de un mismo procedimiento, según exista o no colaboración del deudor.',
   '<p>La liquidación simplificada es el procedimiento concursal pensado para personas naturales que no lograron —o no intentaron— una renegociación administrativa, y que deben liquidar sus bienes para pagar a sus acreedores. Dentro de este procedimiento existen dos figuras muy distintas:</p>
<p>En la <strong>entrega voluntaria</strong>, es el propio deudor quien solicita el procedimiento y pone a disposición del liquidador sus bienes de forma colaborativa, lo que agiliza considerablemente la tramitación y reduce los costos asociados.</p>
<p>En la <strong>incautación forzosa</strong>, en cambio, son los acreedores quienes solicitan la liquidación ante la falta de pago, y el liquidador debe proceder a la incautación de los bienes del deudor cuando este no colabora voluntariamente. La ley contempla mecanismos de venta, incluyendo la venta electrónica de bienes, para agilizar la realización del activo.</p>
<p>En nuestra clínica podemos orientarte sobre cuál de estos caminos corresponde a tu situación y qué implica cada uno en términos prácticos.</p>',
   'Clínica de Insolvencia y Reemprendimiento UDP', true, now())
ON CONFLICT DO NOTHING;

-- --- Innovación y Emprendimiento ---------------------------------------------

INSERT INTO faqs (clinic_slug, question, answer_html, sort_order, is_published)
VALUES
  ('innovacion-emprendimiento', '¿Qué estructura societaria conviene para partir un emprendimiento?',
   '<p>Depende del número de socios, el nivel de responsabilidad que buscas asumir y tus planes de crecimiento. En la clínica revisamos contigo las alternativas más comunes (empresa individual, SpA, sociedad de responsabilidad limitada) y sus implicancias prácticas.</p>', 1, true),
  ('innovacion-emprendimiento', '¿Cómo protejo el nombre o la idea de mi negocio?',
   '<p>El nombre comercial y las marcas se protegen mediante registro ante el Instituto Nacional de Propiedad Industrial (INAPI). Una idea en sí misma no es protegible, pero sí puede serlo su desarrollo concreto (marca, diseño, invención, know-how documentado en acuerdos de confidencialidad).</p>', 2, true),
  ('innovacion-emprendimiento', '¿Necesito un contrato con mis socios desde el día uno?',
   '<p>Sí. Un pacto de socios simple, por escrito, previene la mayoría de los conflictos societarios más comunes: qué pasa si un socio se retira, cómo se reparten utilidades y qué ocurre si uno no cumple con lo acordado.</p>', 3, true)
ON CONFLICT DO NOTHING;

INSERT INTO articles (clinic_slug, slug, title, excerpt, body_html, author_name, is_published, published_at)
VALUES
  ('innovacion-emprendimiento', 'proteger-tu-idea-antes-de-registrar-una-empresa',
   'Cómo proteger tu idea de negocio antes de registrar una empresa',
   'Pasos legales básicos antes de invertir tiempo y dinero en un nuevo proyecto.',
   '<p>Antes de registrar una sociedad, muchos emprendedores ya han compartido su idea con posibles socios, proveedores o inversionistas. Para proteger ese momento inicial conviene: (1) firmar acuerdos de confidencialidad (NDA) antes de compartir detalles sensibles; (2) documentar por escrito los aportes y expectativas de cada futuro socio; y (3) si existe un desarrollo tecnológico o de diseño concreto, evaluar tempranamente si es protegible mediante registro de marca, patente o modelo de utilidad ante INAPI.</p>
<p>Ninguna de estas medidas exige todavía tener una sociedad constituida, por lo que pueden implementarse desde la etapa de idea. Nuestra clínica puede ayudarte a preparar estos primeros documentos antes de dar el paso siguiente.</p>',
   'Clínica de Innovación y Emprendimiento UDP', true, now()),
  ('innovacion-emprendimiento', 'elegir-estructura-societaria-para-emprender',
   'Elegir la estructura societaria correcta para emprender',
   'Empresa individual, SpA o sociedad de responsabilidad limitada: qué considerar antes de decidir.',
   '<p>La elección de la estructura jurídica de un emprendimiento no es un trámite menor: afecta la responsabilidad patrimonial de los socios, la forma de tomar decisiones y la facilidad para incorporar nuevos inversionistas en el futuro. Las alternativas más comunes para proyectos nuevos son la empresa individual de responsabilidad limitada (EIRL), la sociedad por acciones (SpA) —flexible y hoy la preferida por startups que buscan levantar capital— y la sociedad de responsabilidad limitada tradicional.</p>
<p>En la clínica revisamos contigo el número de socios, el plan de crecimiento y la necesidad de levantar inversión externa para recomendar la estructura más adecuada, y te orientamos en los pasos de constitución.</p>',
   'Clínica de Innovación y Emprendimiento UDP', true, now())
ON CONFLICT DO NOTHING;

-- --- Laboral -----------------------------------------------------------------

INSERT INTO faqs (clinic_slug, question, answer_html, sort_order, is_published)
VALUES
  ('laboral', '¿Qué hago si me despidieron sin causa justificada?',
   '<p>Tienes un plazo de 60 días hábiles desde el despido para reclamar ante la Inspección del Trabajo o presentar una demanda ante el juzgado laboral. En la clínica te orientamos sobre los plazos y la documentación necesaria.</p>', 1, true),
  ('laboral', '¿Qué es el finiquito y por qué es tan importante firmarlo bien?',
   '<p>El finiquito es el documento que liquida las prestaciones adeudadas al término de la relación laboral. Debe ser ratificado ante notario, inspector del trabajo u otro ministro de fe, y conviene revisar los montos antes de firmarlo, ya que en general no admite reclamos posteriores.</p>', 2, true),
  ('laboral', '¿Puedo reclamar horas extras no pagadas?',
   '<p>Sí, siempre que puedas acreditar que trabajaste esas horas (registros de asistencia, correos, testigos). El plazo general de prescripción para cobrar remuneraciones adeudadas es de dos años.</p>', 3, true)
ON CONFLICT DO NOTHING;

INSERT INTO articles (clinic_slug, slug, title, excerpt, body_html, author_name, is_published, published_at)
VALUES
  ('laboral', 'terminacion-de-contrato-tus-derechos-basicos',
   'Terminación de contrato: tus derechos básicos',
   'Qué revisar cuando termina tu relación laboral, sea por despido o renuncia.',
   '<p>Cuando termina una relación laboral, la ley exige que el empleador entregue una carta de aviso indicando la causal invocada, y que liquide las prestaciones pendientes mediante un finiquito. Dependiendo de la causal, puedes tener derecho a indemnización por años de servicio, sustitutiva del aviso previo y al pago de vacaciones proporcionales no utilizadas.</p>
<p>Si consideras que el despido fue injustificado, indebido o improcedente, cuentas con 60 días hábiles desde la separación para reclamar ante la Inspección del Trabajo o demandar ante el juzgado laboral competente. Revisar el finiquito antes de firmarlo —y no hacerlo bajo presión— es uno de los pasos más importantes para proteger tus derechos.</p>',
   'Clínica Laboral UDP', true, now()),
  ('laboral', 'que-es-el-procedimiento-de-tutela-laboral',
   'Qué es el procedimiento de tutela laboral',
   'Una vía especial para cuando se vulneran derechos fundamentales en el trabajo.',
   '<p>El procedimiento de tutela laboral protege a trabajadoras y trabajadores frente a actos del empleador que vulneren derechos fundamentales durante la relación laboral o con ocasión de su término: por ejemplo, discriminación, acoso o represalias por ejercer derechos laborales. Es un procedimiento judicial más rápido que el ordinario y contempla indemnizaciones adicionales si el tribunal constata la vulneración.</p>
<p>El plazo para presentar la denuncia es de 60 días hábiles contados desde el acto que se reclama. En nuestra clínica evaluamos contigo si tu caso corresponde a esta vía especial.</p>',
   'Clínica Laboral UDP', true, now())
ON CONFLICT DO NOTHING;

-- --- Tributario ----------------------------------------------------------

INSERT INTO faqs (clinic_slug, question, answer_html, sort_order, is_published)
VALUES
  ('tributario', '¿Qué hago si el SII observó mi declaración de renta?',
   '<p>Debes revisar el motivo de la observación en el sitio del SII y, si corresponde, responderla con la documentación de respaldo dentro del plazo indicado, antes de que la observación derive en una citación o liquidación.</p>', 1, true),
  ('tributario', '¿Qué diferencia hay entre una citación y una liquidación de impuestos?',
   '<p>La citación es un requerimiento del SII para que el contribuyente aclare, complemente o rectifique su declaración. La liquidación, en cambio, es la determinación formal de un mayor impuesto adeudado, que puede reclamarse ante el Tribunal Tributario y Aduanero.</p>', 2, true),
  ('tributario', '¿Cuánto tiempo tengo para reclamar una liquidación del SII?',
   '<p>El plazo general para presentar un reclamo tributario ante el Tribunal Tributario y Aduanero es de 90 días hábiles desde la notificación de la liquidación o giro.</p>', 3, true)
ON CONFLICT DO NOTHING;

INSERT INTO articles (clinic_slug, slug, title, excerpt, body_html, author_name, is_published, published_at)
VALUES
  ('tributario', 'que-hacer-si-sii-notifica-una-observacion',
   'Qué hacer si el SII te notifica una observación',
   'Los primeros pasos antes de que una observación derive en un problema mayor.',
   '<p>Una observación en tu declaración de renta no es todavía un cobro, sino una alerta del Servicio de Impuestos Internos (SII) sobre una posible inconsistencia. Lo primero es identificar el código de la observación en el sitio del SII y reunir la documentación que respalde tu declaración (boletas, facturas, certificados de gastos o ingresos).</p>
<p>Si no se responde a tiempo o la respuesta no es satisfactoria, el SII puede emitir una citación pidiendo aclaraciones adicionales, y eventualmente una liquidación de impuestos si determina una diferencia a favor del fisco. Actuar en la etapa de observación, con la documentación ordenada, suele evitar procedimientos más largos y costosos más adelante.</p>',
   'Clínica Tributaria UDP', true, now()),
  ('tributario', 'como-reclamar-una-liquidacion-de-impuestos',
   'Cómo reclamar una liquidación de impuestos',
   'El procedimiento ante el Tribunal Tributario y Aduanero, paso a paso.',
   '<p>Si el SII notifica una liquidación de impuestos y el contribuyente no está de acuerdo, puede presentar un reclamo ante el Tribunal Tributario y Aduanero (TTA) dentro de 90 días hábiles desde la notificación. El reclamo debe fundamentarse y acompañar la documentación de respaldo pertinente.</p>
<p>El procedimiento contempla una etapa de discusión escrita, posibilidad de rendir prueba, y una sentencia del tribunal que puede confirmar, modificar o dejar sin efecto la liquidación. En nuestra clínica orientamos a contribuyentes que enfrentan este proceso por primera vez y no cuentan con asesoría tributaria propia.</p>',
   'Clínica Tributaria UDP', true, now())
ON CONFLICT DO NOTHING;
