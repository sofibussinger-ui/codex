import Link from "next/link";
import { context } from "@/lib/auth";
import { createOpportunity } from "@/modules/crm/actions";
import { Submit } from "@/components/ui/submit";
import { Notice } from "@/components/notice";
export default async function Opportunities({
  searchParams,
}: {
  searchParams: Promise<{ company?: string; error?: string; message?: string }>;
}) {
  const { db, org } = await context();
  const params = await searchParams;
  const results = await Promise.all([
    db
      .from("companies")
      .select("id,name")
      .eq("organization_id", org)
      .order("name"),
    db
      .from("stages")
      .select("id,name")
      .eq("organization_id", org)
      .order("position"),
    db
      .from("opportunities")
      .select("id,title,status")
      .eq("organization_id", org)
      .order("created_at", { ascending: false }),
  ]);
  if (results.some((r) => r.error))
    throw new Error("No pudimos cargar las oportunidades.");
  const companies = results[0].data!;
  const stages = results[1].data!;
  const opps = results[2].data!;
  return (
    <div className="page">
      <h1>Oportunidades</h1>
      <Notice {...params} />
      <div className="grid-two">
        <section className="card">
          <h2 className="mb-4">Nueva oportunidad</h2>
          {companies.length && stages.length ? (
            <form action={createOpportunity} className="stack">
              <label>
                Empresa
                <select name="company_id" defaultValue={params.company}>
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Nombre de la oportunidad
                <input
                  name="title"
                  placeholder="Por ejemplo, sitio web y publicidad"
                  required
                  maxLength={160}
                />
              </label>
              <label>
                Etapa
                <select name="stage_id">
                  {stages.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </label>
              <Submit>Crear oportunidad</Submit>
            </form>
          ) : (
            <p className="muted">
              Primero registrá una empresa. La organización también necesita sus
              etapas configuradas.
            </p>
          )}
        </section>
        <section className="card">
          <h2>Mis oportunidades</h2>
          {!opps.length && (
            <p className="muted mt-4">
              Las oportunidades que crees aparecerán acá.
            </p>
          )}
          <ul className="divide-y divide-slate-100">
            {opps.map((o) => (
              <li key={o.id} className="py-4">
                <Link className="font-semibold" href={`/oportunidades/${o.id}`}>
                  {o.title}
                </Link>
                <p className="text-sm muted">
                  {
                    (
                      {
                        open: "Abierta",
                        won: "Ganada",
                        lost: "Perdida",
                      } as Record<string, string>
                    )[o.status]
                  }
                </p>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
