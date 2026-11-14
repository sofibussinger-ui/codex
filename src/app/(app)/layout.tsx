import Link from "next/link";
import { context } from "@/lib/auth";
import { logout, switchOrganization } from "@/modules/crm/actions";
import { Button } from "@/components/ui/button";
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { organization, members, org } = await context();
  return (
    <>
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-5 py-4 flex items-center justify-between gap-4 flex-wrap">
          <Link href="/mi-dia" className="font-bold tracking-widest">
            KUL{" "}
            <span className="font-normal tracking-normal">
              / {organization?.name}
            </span>
          </Link>
          <nav className="row text-sm" aria-label="Navegación principal">
            <Link href="/mi-dia">Mi día</Link>
            <Link href="/empresas">Empresas</Link>
            <Link href="/oportunidades">Oportunidades</Link>
            <Link href="/feedback">Enviar comentario</Link>
            <form action={logout}>
              <Button variant="outline">Salir</Button>
            </form>
          </nav>
          {members.length > 1 && (
            <form action={switchOrganization} className="row">
              <label>
                Organización
                <select name="organization" defaultValue={org}>
                  {members.map((m) => (
                    <option key={m.organization_id} value={m.organization_id}>
                      {m.organization_id}
                    </option>
                  ))}
                </select>
              </label>
              <Button>Cambiar</Button>
            </form>
          )}
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-5 py-8">{children}</main>
      <footer className="mx-auto max-w-6xl px-5 py-6 text-sm muted">
        A1 · Entorno de pruebas. No ingresar datos comerciales reales.
      </footer>
    </>
  );
}
