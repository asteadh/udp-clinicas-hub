INSERT INTO clinics (slug, name, short_description, color_primary, sort_order, is_active)
VALUES
  ('insolvencia', 'Clínica de Insolvencia y Reemprendimiento',
   'Asesoría legal en procedimientos concursales y reemprendimiento.', '#0F766E', 1, true),
  ('innovacion', 'Clínica de Innovación y Emprendimiento',
   'Acompañamiento jurídico a proyectos de innovación y nuevos negocios.', '#D97706', 2, true),
  ('laboral', 'Clínica Laboral',
   'Orientación y representación en materias de derecho del trabajo.', '#1D4ED8', 3, true),
  ('tributario', 'Clínica Tributaria',
   'Asesoría en obligaciones y controversias tributarias.', '#6B1F3B', 4, true)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  short_description = EXCLUDED.short_description,
  color_primary = EXCLUDED.color_primary,
  sort_order = EXCLUDED.sort_order,
  is_active = EXCLUDED.is_active,
  updated_at = now();
