# Recuperación: condición previa a datos reales

## Ensayo local

Con datos ficticios, exportar esquema y datos de `public` y `auth` con `pg_dump` a un archivo fuera de Git; restaurar en una base separada, nunca sobre la original. Conservar ACL y funciones de acceso. Verificar conteos, relaciones, RLS, historial y credenciales ficticias. Una copia de tablas comerciales sola no recupera usuarios ni configuración de Auth.

El ensayo de base no demuestra recuperación completa del servicio: también se deben comprobar inicio de sesión y permisos tras restaurar en un entorno aislado con Auth y PostgREST conectados a la base recuperada.

## Antes del piloto real

- Elegir el entorno y comprobar capacidades de backup del plan; no asumir que un plan gratuito incluye recuperación suficiente.
- Acordar pérdida máxima de datos y tiempo de recuperación tolerables.
- Configurar frecuencia, retención y acceso restringido a copias cifradas.
- Guardar configuración operativa y secretos mediante un mecanismo seguro separado de Git.
- Ejecutar restauración completa aislada, verificar acceso y documentar resultado.
- Definir responsable y procedimiento de incidentes.

No hay backups programados ni autorización para datos reales en esta entrega. No se contrataron servicios.
