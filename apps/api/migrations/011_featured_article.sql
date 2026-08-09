-- Columna destacada: la que la home muestra como vista previa.
--
-- Es una sola en todo el sitio, no una por clínica, porque el hueco de la home
-- es uno. El índice único parcial lo garantiza en la base en vez de confiarlo a
-- la aplicación: solo puede existir una fila con is_featured = true.
ALTER TABLE articles
  ADD COLUMN IF NOT EXISTS is_featured boolean NOT NULL DEFAULT false;

CREATE UNIQUE INDEX IF NOT EXISTS articles_featured_unique
  ON articles ((is_featured)) WHERE is_featured;
