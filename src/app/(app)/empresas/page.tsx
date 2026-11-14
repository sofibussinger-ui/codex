import Link from "next/link";
import { context } from "@/lib/auth";
import { createCompany } from "@/modules/crm/actions";
import { Submit } from "@/components/ui/submit";
import { Notice } from "@/components/notice";
export default async function Companies({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const { db, org } = await context();
  const { data, error } = await db
    .from("companies")
    .select("id,name,source")
    .eq("organization_id", org)
    .order("created_at", { ascending: false });
  if (error) throw new Error("No pudimos cargar las empresas.");
  return (
    <div className="page">
      <div>
        <h1>Empresas</h1>
        <p className="muted">
          Registrá una inmobiliaria y empezá su seguimiento comercial.
        </p>
      </div>
      <Notice {...await searchParams} />
      <div className="grid-two">
        <section className="card">
          <h2 className="mb-4">Nueva empresa</h2>
          <form action={createCompany} className="stack">
            <label>
              Nombre de la empresa
              <input name="name" required maxLength={160} />
            </label>
            <label>
              Origen del prospecto
              <input
                name="source"
                maxLength={200}
                placeholder="Por ejemplo, búsqueda comercial"
              />
            </label>
            <Submit>Guardar empresa y crear oportunidad</Submit>
          </form>
        </section>
        <section className="card">
          <h2>Empresas registradas</h2>
          {!data?.length && (
            <p className="muted mt-4">
              Todavía no hay empresas. Registrá la primera para comenzar.
            </p>
          )}
          <ul className="divide-y divide-slate-100">
            {data?.map((c) => (
              <li key={c.id} className="py-4">
                <Link
                  href={`/oportunidades?company=${c.id}`}
                  className="font-semibold"
                >
                  {c.name}
                </Link>
                <p className="text-sm muted">
                  {c.source || "Origen sin indicar"}
                </p>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
