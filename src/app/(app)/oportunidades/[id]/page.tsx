import { formatDate } from "@/modules/activities/dates";
import { notFound } from "next/navigation";
import { randomUUID } from "node:crypto";
import { context } from "@/lib/auth";
import { recordCall, updateOpportunity } from "@/modules/crm/actions";
import { Submit } from "@/components/ui/submit";
import { DateInput } from "@/components/date-input";
import { Notice } from "@/components/notice";
export default async function Opportunity({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const { id } = await params;
  const { db, org, organization } = await context();
  const { data: o, error } = await db
    .from("opportunities")
    .select("*")
    .eq("organization_id", org)
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error("No pudimos cargar la oportunidad.");
  if (!o) notFound();
  const [company, stages, activities] = await Promise.all([
    db
      .from("companies")
      .select("name")
      .eq("organization_id", org)
      .eq("id", o.company_id)
      .single(),
    db
      .from("stages")
      .select("id,name")
      .eq("organization_id", org)
      .order("position"),
    db
      .from("activities")
      .select("id,title,notes,completed_at,due_at")
      .eq("organization_id", org)
      .eq("opportunity_id", id)
      .order("created_at", { ascending: false }),
  ]);
  if ([company, stages, activities].some((r) => r.error))
    throw new Error("No pudimos cargar el historial.");
  return (
    <div className="page">
      <div>
        <p className="muted">{company.data?.name}</p>
        <h1>{o.title}</h1>
      </div>
      <Notice {...await searchParams} />
      <div className="grid-two">
        <section className="card">
          <h2 className="mb-4">Registrar llamada y próximo paso</h2>
          <form action={recordCall} className="stack">
            <input type="hidden" name="opportunity" value={id} />
            <input type="hidden" name="request" value={randomUUID()} />
            <label>
              Resultado de la llamada
              <textarea
                name="note"
                maxLength={5000}
                placeholder="Qué hablaron y qué acordaron"
              />
            </label>
            <label>
              Próximo seguimiento
              <input
                name="followup_title"
                required
                maxLength={200}
                placeholder="Por ejemplo, llamar para revisar la propuesta"
              />
            </label>
            <label>
              Cuándo
              <DateInput name="followup_at" />
            </label>
            <Submit>Guardar llamada y seguimiento</Submit>
          </form>
        </section>
        <section className="card">
          <h2 className="mb-4">Actualizar oportunidad</h2>
          <form action={updateOpportunity} className="stack">
            <input type="hidden" name="id" value={id} />
            <label>
              Etapa
              <select name="stage_id" defaultValue={o.stage_id}>
                {stages.data?.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Estado
              <select name="status" defaultValue={o.status}>
                <option value="open">Abierta</option>
                <option value="won">Ganada</option>
                <option value="lost">Perdida</option>
              </select>
            </label>
            <Submit>Actualizar oportunidad</Submit>
          </form>
        </section>
      </div>
      <section className="card">
        <h2>Historial y próximos pasos</h2>
        <ul className="divide-y divide-slate-100">
          {activities.data?.map((a) => (
            <li key={a.id} className="py-4">
              <h3>{a.title}</h3>
              <p className="muted text-sm">
                {a.completed_at ? "Realizada" : "Pendiente"} ·{" "}
                {formatDate(
                  a.due_at,
                  organization?.timezone || "America/Argentina/Buenos_Aires",
                )}
              </p>
              <p className="whitespace-pre-wrap">{a.notes}</p>
            </li>
          ))}
        </ul>
        {!activities.data?.length && (
          <p className="muted mt-3">
            Registrá la primera llamada para iniciar el historial.
          </p>
        )}
      </section>
    </div>
  );
}
