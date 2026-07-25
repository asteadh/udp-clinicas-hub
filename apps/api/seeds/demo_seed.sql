-- Demo content for the "laboral" clinic, used to preview the landing/admin
-- panel locally without needing to create content by hand first.

INSERT INTO faqs (clinic_slug, question, answer_html, sort_order, is_published)
VALUES
  ('laboral', '¿Quiénes pueden solicitar atención en la clínica?',
   '<p>Cualquier persona que requiera orientación en materias laborales y no cuente con representación legal.</p>', 1, true),
  ('laboral', '¿La atención tiene costo?',
   '<p>No, la atención es gratuita y está a cargo de estudiantes supervisados por docentes.</p>', 2, true),
  ('laboral', '¿Cómo se agenda una hora?',
   '<p>A través del formulario de contacto de la clínica en este sitio.</p>', 3, true)
ON CONFLICT DO NOTHING;

INSERT INTO articles (clinic_slug, slug, title, excerpt, body_html, author_name, is_published, published_at)
VALUES
  ('laboral', 'reforma-jornada-laboral', 'Qué implica la reforma a la jornada laboral',
   'Un resumen de los principales cambios normativos y su impacto práctico.',
   '<p>La reforma introduce ajustes progresivos a la jornada laboral semanal...</p>',
   'Clínica Laboral UDP', true, now())
ON CONFLICT DO NOTHING;

INSERT INTO gallery_albums (clinic_slug, title, description, sort_order, is_published)
VALUES
  ('laboral', 'Actividades 2026', 'Registro fotográfico de talleres y actividades del semestre.', 1, true)
ON CONFLICT DO NOTHING;

INSERT INTO gallery_photos (album_id, image_url, caption, sort_order)
SELECT id, 'https://placehold.co/1200x800?text=Clinica+Laboral', 'Taller de orientación laboral', 1
FROM gallery_albums WHERE clinic_slug = 'laboral' AND title = 'Actividades 2026'
ON CONFLICT DO NOTHING;

INSERT INTO team_members (clinic_slug, full_name, role_title, bio_html, sort_order, is_published)
VALUES
  ('laboral', 'María José Contreras', 'Docente supervisora',
   '<p>Abogada especializada en derecho del trabajo, docente de la Facultad de Derecho UDP.</p>', 1, true),
  ('laboral', 'Tomás Herrera', 'Estudiante en práctica',
   '<p>Estudiante de quinto año, integrante de la clínica laboral.</p>', 2, true)
ON CONFLICT DO NOTHING;
