import { login } from "@/modules/crm/actions";
import { Submit } from "@/components/ui/submit";
import { Notice } from "@/components/notice";
export default async function Login({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const configured =
    !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !!process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  return (
    <main className="mx-auto max-w-md px-5 py-20">
      <p className="font-bold tracking-widest text-teal-800">KUL SaaS</p>
      <h1 className="mt-4">Menos caos. Más ventas.</h1>
      <p className="muted my-4">Ingresá para organizar tu día comercial.</p>
      <div className="card">
        <Notice error={error} />
        {!configured ? (
          <p role="alert">
            Falta configurar Supabase. Seguí las instrucciones de README.md para
            ejecutar el entorno local con datos ficticios.
          </p>
        ) : (
          <form action={login} className="stack">
            <label>
              Email
              <input
                name="email"
                type="email"
                autoComplete="username"
                required
              />
            </label>
            <label>
              Contraseña
              <input
                name="password"
                type="password"
                autoComplete="current-password"
                required
              />
            </label>
            <Submit>Iniciar sesión</Submit>
          </form>
        )}
      </div>
      <p className="mt-4 text-sm muted">
        Piloto en desarrollo · Usar únicamente datos ficticios hasta validar
        seguridad y recuperación.
      </p>
    </main>
  );
}
