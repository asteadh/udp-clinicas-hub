INSERT INTO clinics (slug, name, short_description, description_html, icon, color_primary, contact_email, sort_order, is_active)
VALUES
  ('insolvencia', 'Clínica de Insolvencia y Reemprendimiento',
   'Asesoría legal en procedimientos concursales y reemprendimiento.',
   '<p>La Clínica de Insolvencia y Reemprendimiento de la Facultad de Derecho UDP orienta a personas y micro/pequeñas empresas sobre los procedimientos concursales de la Ley 20.720: renegociación administrativa ante SUPERIR, reorganización y liquidación (ordinaria y simplificada). Nuestro enfoque es el de la ley: no castigar el sobreendeudamiento, sino ofrecer una salida ordenada y una segunda oportunidad real de reemprender.</p>',
   'scale', '#0F766E', 'insolvencia@hubnegocios.udp.cl', 1, true),
  ('innovacion-emprendimiento', 'Clínica de Innovación y Emprendimiento',
   'Acompañamiento jurídico a proyectos de innovación y nuevos negocios.',
   '<p>La Clínica de Innovación y Emprendimiento acompaña jurídicamente a estudiantes, egresados y emprendedores en las primeras decisiones legales de un proyecto: elección de estructura societaria, protección de propiedad intelectual, contratos iniciales con socios y proveedores, y cumplimiento normativo básico para partir con el pie derecho.</p>',
   'lightbulb', '#D97706', 'innovacion@hubnegocios.udp.cl', 2, true),
  ('laboral', 'Clínica Laboral',
   'Orientación y representación en materias de derecho del trabajo.',
   '<p>La Clínica Laboral entrega orientación y representación gratuita a trabajadoras y trabajadores en materias de derecho del trabajo: términos de contrato, despidos, cobro de prestaciones y procedimientos ante la Inspección del Trabajo y los tribunales laborales.</p>',
   'briefcase', '#1D4ED8', 'laboral@hubnegocios.udp.cl', 3, true),
  ('tributario', 'Clínica Tributaria',
   'Asesoría en obligaciones y controversias tributarias.',
   '<p>La Clínica Tributaria asesora a personas naturales y pequeños contribuyentes en el cumplimiento de sus obligaciones tributarias y en controversias con el Servicio de Impuestos Internos (SII): observaciones a declaraciones, citaciones, liquidaciones y procedimientos de reclamo.</p>',
   'calculator', '#6B1F3B', 'tributario@hubnegocios.udp.cl', 4, true)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  short_description = EXCLUDED.short_description,
  description_html = EXCLUDED.description_html,
  icon = EXCLUDED.icon,
  color_primary = EXCLUDED.color_primary,
  contact_email = EXCLUDED.contact_email,
  sort_order = EXCLUDED.sort_order,
  is_active = EXCLUDED.is_active,
  updated_at = now();

-- The clinic previously seeded under the 'innovacion' slug is renamed to
-- 'innovacion-emprendimiento' to match packages/ui/src/tokens.ts
-- (hubClinicColors) and packages/api-client/src/types.ts (ClinicSlug). A
-- local dev reset (drop + recreate + reseed) is expected rather than an
-- in-place data migration of the old slug's dependent rows.
DELETE FROM clinics WHERE slug = 'innovacion';
