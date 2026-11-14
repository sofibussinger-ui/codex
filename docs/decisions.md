# Decisiones de esta entrega

- Se implementa primero el recorrido comercial aprobado; el resto de A1 continúa por módulos.
- Next.js App Router con Server Components y Server Actions; autorización en cada acción y en PostgreSQL. Sin cachear datos comerciales entre usuarios.
- PostgreSQL/Supabase SSR; política multiempresa desde la primera migración. Registro público desactivado en configuración local.
- Llamada y seguimiento obligatorios en una transacción; reintentos de la misma solicitud no duplican actividades.
- Fechas como `timestamptz`. Interfaz en español, organización configurada inicialmente en Buenos Aires.
- Permisos administrativos de configuración siguen pendientes en UI; fixtures locales crean miembros y etapas.
- Dependencias fijadas mediante package-lock.json. Node 24 LTS. Los tipos de Node se alinearon con el runtime y Vitest; ESLint se actualizó a la versión estable compatible y se verificó el árbol de dependencias.

Referencias oficiales consultadas al iniciar:

- https://nextjs.org/docs/app/getting-started/installation
- Guías incluidas en `node_modules/next/dist/docs`: Server Actions y Proxy, requeridas por AGENTS.md.
- https://supabase.com/docs/guides/auth/server-side/nextjs
- https://ui.shadcn.com/docs/components/button
- https://vitest.dev/guide/
- https://playwright.dev/docs/intro

El entorno completo local de Supabase agotó el espacio disponible del sandbox; se verificará el núcleo con servicios reducidos si ese límite persiste. Las limitaciones y resultados efectivos se registran en docs/verification.md, sin afirmar pruebas que no se hayan ejecutado.
