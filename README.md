# User Management (Modernizado)

Aplicación React migrada a Vite + TypeScript + Tailwind CSS v4, con arquitectura modular, ESLint/Prettier, Zustand (disponible), React Router y componentes internos `@ctt-library/*`.

## Stack
- Vite + React 18
- TypeScript estricto (`tsconfig.app.json`)
- Tailwind CSS v4 (+ `@tailwindcss/postcss`)
- React Router v6
- Estado: React Query (existente) y opción de Zustand para estado global si se requiere
- Formularios: Formik + Yup (incluidos para uso)
- HTTP: Axios con interceptores (token vía `@ctt-library/auth`)
- i18n: `react-intl`
- Tooling: ESLint + Prettier
- Librerías Azure: `@ctt-library/auth`, `@ctt-library/header`, `@ctt-library/alert`, `@ctt-library/modal`, `@ctt-library/styles`

## Estructura
```
src/
  app/
    providers/AppProviders.tsx     # Auth, QueryClient, Intl y Router
  components/                      # Componentes compartidos
  features/                        # Vistas/módulos (por adoptar en siguientes PRs)
  hooks/                           # Custom hooks
  i18n/                            # Mensajes y helpers i18n
  lib/                             # Axios client, utils
  routes/                          # Definición de rutas
  styles/                          # Entrada CSS global (Tailwind v4 + estilos corporativos)
```

## Configuración de Azure Artifacts (.npmrc)
Crear un fichero `.npmrc` en la raíz (ya incluido):
```
registry=https://registry.npmjs.org/
@ctt-library:registry=https://pkgs.dev.azure.com/CTT-SOT/_packaging/front-libraries/npm/registry/
always-auth=true

//pkgs.dev.azure.com/CTT-SOT/_packaging/front-libraries/npm/registry/:_authToken=${AZURE_NPM_TOKEN}
//pkgs.dev.azure.com/CTT-SOT/_packaging/front-libraries/npm/:_authToken=${AZURE_NPM_TOKEN}
```
- Local: el desarrollador usará su sesión de Azure (`npm login` si aplica) y tendrá acceso al feed.
- CI/CD: define `AZURE_NPM_TOKEN` en variables seguras del pipeline.

Si alguna librería de `@ctt-library/*` no admite instalación sin versión en tu entorno, fija `"*"` o una etiqueta de dist-tag (por ejemplo `"latest"`) para seguir siempre la más reciente compatible. En `package.json` ya se declara `"*"`.

## Scripts
- `npm run dev` – arranque en desarrollo (Vite)
- `npm run build` – build de producción (Vite)
- `npm run preview` – previsualización del build
- `npm run lint` – lint con ESLint (`.ts,.tsx`)
- `npm run format` – formateo con Prettier

## Instalación y ejecución
```
npm install
npm run dev
```
Abre http://localhost:5173

## Estilos (Tailwind v4)
- Entrada global: `src/styles/index.css`
- PostCSS: `@tailwindcss/postcss`
- Variables corporativas: `@import '@ctt-library/styles';` en `index.css`.

## Autenticación e Header
- Proveedor de auth: `@ctt-library/auth` envuelve la app en `AppProviders`.
- El `Header` de `@ctt-library/header` muestra email/rol automáticamente leyendo `useAuth()`.
- Axios añade `Authorization: Bearer <token>` usando `getIdToken()` de `@ctt-library/auth`.

## i18n
- `src/i18n/` contiene `messages/es.ts` y un helper `getMessages`.
- `IntlProvider` se configura en `AppProviders` con `locale='es'`.

## Notas de migración
- Se han conservado rutas y vistas bajo `src/pages/` y `src/components/` (pendiente mover a `features/` si se desea en una siguiente iteración para modularidad total).
- Código legado de autenticación en `src/context/AuthContext.tsx` ya no se usa; puede eliminarse cuando se valide la migración.

## Linting
- ESLint: reglas para hooks (`react-hooks`), accesibilidad (`jsx-a11y`) y orden de imports (`import`).
- Prettier: formateo base. Ajusta reglas a gusto del equipo si es necesario.

## Estado global (opcional)
- Si se necesita estado compartido, usar `Zustand`. Crea stores en `src/stores/` o por feature dentro de `src/features/<modulo>/store`.

## CI/CD
- Asegura que `AZURE_NPM_TOKEN` esté disponible para instalar `@ctt-library/*`.
- Ejecuta los scripts de `build` y opcionalmente `lint`/`format` en pipeline.

## Compatibilidad y alternativas
- Si encuentras paquetes obsoletos (p.ej., `redux-thunk` o CRA), la pila actual reemplaza su funcionalidad con React Query, Zustand y Vite para mejor DX y tiempos de build.
