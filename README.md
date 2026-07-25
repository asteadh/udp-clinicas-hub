# Hub Negocios UDP

Sitio de colaboración de 4 clínicas jurídicas de la Universidad Diego Portales:

- Insolvencia y Reemprendimiento
- Innovación y Emprendimiento
- Laboral
- Tributario

Landing pública con contenido de cada clínica (FAQs, artículos, galería de fotos de
clases/actividades, equipo) y un panel de administración donde cada clínica gestiona
su propio contenido, con un superadmin que ve/edita todo.

## Arquitectura

Monorepo pnpm workspaces + Turborepo: frontend Next.js separado en landing y admin,
backend en Go dueño de la lógica/persistencia, Postgres como base de datos, MinIO
para storage de imágenes.

```
apps/
  web/      Next.js — landing pública               (puerto 3100)
  admin/    Next.js — panel de administración         (puerto 3101)
  api/      Go — API HTTP                             (puerto 4000)
  studio/   Prisma Studio (solo inspección de datos)   (puerto 5555)
packages/
  db/           Prisma como tooling de schema/migraciones (Go es el runtime real)
  ui/           Componentes compartidos (prefijo Hub*) + design tokens
  api-client/   Cliente TS tipado, único canal de datos entre frontends y la API Go
  config/       tsconfig compartido
infra/k8s/      Manifiestos Kubernetes para despliegue
```

## Desarrollo local

```sh
pnpm install
cp .env.sample .env
docker compose up -d db minio minio-init redis
pnpm dev
```

La API aplica las migraciones de `apps/api/migrations/` automáticamente al iniciar.
Para sembrar las 4 clínicas y (opcionalmente) un superadmin de emergencia:

```sh
pnpm seed
pnpm seed:demo   # contenido de ejemplo para la clínica "laboral"
```

## Roles de administración

- **superadmin**: acceso total a las 4 clínicas y a la configuración del sistema.
- **clinic_admin**: acceso de escritura únicamente a su propia clínica (FAQs,
  artículos, galería, equipo, consultas de contacto).
