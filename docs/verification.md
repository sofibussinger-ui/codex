# Verificación del primer recorrido A1

Verificado con datos ficticios en este entorno:

- Compilación de producción de Next.js, TypeScript y ESLint.
- Cuatro pruebas unitarias de validación y fechas.
- Nueve pruebas de integración contra PostgreSQL 17, Supabase Auth (GoTrue v2.197.0) y PostgREST v16.5: autenticación inválida, acceso anónimo, aislamiento, relaciones cruzadas, permisos de comercial, idempotencia, transacción, oportunidades ajenas y membresía desactivada.
- Recorrido Playwright en Chromium de escritorio y móvil (cuatro pruebas): login, empresa, oportunidad, llamada, seguimiento, recarga, edición, nueva sesión y finalización. Acceso sin sesión redirige al login.
- `npm audit --omit=dev --audit-level=high`: sin vulnerabilidades reportadas en dependencias de producción al ejecutar.

## Recuperación local

Se ejecutó `pg_dump -Fc` sobre la base ficticia y `pg_restore --no-owner --exit-on-error` en **otra base**, conservando las ACL. Se recuperaron cuatro usuarios, tres empresas y cuatro actividades en ese ensayo. Se conectaron instancias separadas de Auth y PostgREST a la base restaurada.

`RESTORE_URL=http://127.0.0.1:54328 node scripts/verify-restored-local.mjs` comprobó login con las credenciales previas, recuperación de empresas y actividades, aislamiento y bloqueo de escalamiento de permisos. El script solo admite una API local distinta de la original.

## Límites

El stack completo de Supabase CLI excedió los 8 GB disponibles en el sandbox. Se utilizó un stack reducido con servicios reales, sin mocks de autenticación ni de persistencia. La migración de la aplicación se aplicó sin modificaciones; el bootstrap del entorno creó roles y la función estándar `auth.uid()`.

El ensayo usa otra base dentro del mismo servidor PostgreSQL; no prueba recuperación ante pérdida del servidor. No valida backups administrados, cifrado, retención, configuración de email ni recuperación de cuenta en el entorno definitivo. No se habilita el uso de información comercial real ni se considera A1 completo.
