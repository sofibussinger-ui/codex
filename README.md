# KUL SaaS · A1

Primer hito: iniciar sesión → registrar inmobiliaria → crear oportunidad → registrar llamada y seguimiento → actualizar/completar el seguimiento en **Mi día**, con persistencia PostgreSQL.

## Requisitos

- Node.js 24 LTS, npm y Docker Desktop/Engine.
- VS Code y Git. No requiere servicios pagos para desarrollo local.

## Ejecutar localmente

```bash
npm ci
npx supabase start
npx supabase db reset
```

`db reset` elimina los datos del proyecto **local**. No utilizarlo para operar producción.

1. Copiar `.env.example` a `.env.local`.
2. Obtener URL y clave pública/anon con `npx supabase status` y completar `.env.local`.
3. Crear `.env.test.local` con esas dos variables y `SUPABASE_SERVICE_ROLE_KEY` usando exclusivamente la clave administrativa **local**. Este archivo está ignorado por Git; nunca usar esa clave en una variable `NEXT_PUBLIC_*`.
4. Ejecutar `npm run seed:local` para crear organizaciones y cuentas ficticias.
5. Ejecutar `npm run dev` y abrir http://localhost:3000.

Cuentas exclusivamente ficticias:

- `manuel@kul.example` — comercial.
- `direccion@kul.example` — administrador.
- `externo@kul.example` — comercial de otra organización.
- `colega@kul.example` — otro comercial de la primera organización.

Contraseña local de todas: `Local-Ficticio-2026!`. **Nunca crear estas cuentas ni reutilizar esa contraseña en producción.** El script de fixtures rechaza URLs que no sean localhost/127.0.0.1.

Sin variables configuradas, `/login` muestra instrucciones; no simula persistencia ni autenticación.

## Verificar

```bash
npm run lint
npm run typecheck
npm test
npm run test:integration
npx playwright install chromium
npm run test:e2e
npm run build
```

Las pruebas de integración requieren `.env.test.local`, Supabase local y sus migraciones. Las de navegador requieren también `.env.local` y `npm run seed:local`. Usan datos ficticios y crean registros de prueba. No ejecutar con datos reales. Las pruebas de seguridad modifican temporalmente la membresía ficticia de Manuel: no ejecutarlas a la vez que las pruebas de navegador.

## Alcance de esta entrega

Implementado: login/logout, selección de organización si el usuario tiene varias, empresas y fuente, oportunidades y etapas, registro transaccional e idempotente de llamada con seguimiento, Mi día, edición y finalización de seguimientos, historial de actividades, cambio de etapa/estado y feedback simple. RLS, relaciones compuestas e historial de etapas se definen en migraciones.

Todavía faltan para completar A1: contactos, ítems económicos, tareas/reuniones independientes, edición/archivo de empresas, Kanban, administración de usuarios/etapas, recuperación de contraseña en interfaz y mejoras de feedback (pantalla de origen y estados). No hay A2 ni integraciones externas.

**No habilitado para datos reales.** Falta validar recuperación de acceso e invitaciones, controles del entorno definitivo, backups programados, restauración completa del entorno definitivo y revisión de seguridad previa al piloto.

## Estructura y decisiones

- `src/app`: páginas y navegación.
- `src/modules/crm`: acciones de servidor y validación Zod.
- `src/lib`: autenticación y conexión SSR de Supabase.
- `src/components`: controles reutilizables; botón con patrón shadcn/ui, Radix Slot y CVA.
- `supabase/migrations`: esquema, restricciones, RLS y funciones transaccionales.
- `tests`: validaciones, seguridad sobre Supabase y recorrido Playwright.

La UI usa tokens CSS provisionales, sin fuentes ni recursos externos. No hay ORM, caché compartida de datos comerciales ni clave administrativa en la aplicación. Las operaciones habituales usan la sesión del usuario y RLS. La fecha de agenda se presenta según la organización; al programar se usa la zona horaria del dispositivo.

Documentación adicional: [seguridad](docs/security.md), [recuperación](docs/backup-restore.md), [decisiones y referencias](docs/decisions.md).
