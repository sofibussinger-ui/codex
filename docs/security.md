# Seguridad de A1

Cada acción de servidor verifica identidad con `auth.getUser()` y membresía activa. El proxy renueva cookies con `getClaims()`; no sustituye autorización. El selector de organización se valida contra membresías del usuario.

RLS cubre todas las tablas públicas. Administradores operan dentro de sus organizaciones. Comerciales comparten lectura de empresas, pero solo editan las propias; oportunidades y actividades se limitan al responsable. No hay políticas de borrado ni escritura de membresías desde la aplicación.

Claves foráneas compuestas impiden relacionar organizaciones diferentes. Triggers bloquean mover datos a otra organización, exigen responsables activos y conservan cambios de etapa. La función transaccional de llamada utiliza `SECURITY INVOKER`, aplica RLS y recibe una clave idempotente.

Las funciones con `SECURITY DEFINER` tienen `search_path` vacío y propósito limitado. `member_role` solo consulta la membresía del usuario autenticado; los triggers no se exponen como operaciones administrativas.

Antes de producción: revisar privilegios efectivos, escaneo de dependencias, configuración Auth, límites de autenticación, recuperación/invitación, HTTPS, logs sin datos sensibles y backups con restauración. Las claves privilegiadas se reservan a herramientas administrativas locales; el frontend no recibe ninguna.

El repositorio público no debe contener datos reales ni dumps, credenciales, capturas con información comercial o archivos de entorno. Los resultados de pruebas y trazas están ignorados.
