import { formatDate, localDay } from "@/modules/activities/dates";
import Link from "next/link";
import { context } from "@/lib/auth";
import { updateActivity, completeActivity } from "@/modules/crm/actions";
import { Submit } from "@/components/ui/submit";
import { Button } from "@/components/ui/button";
import { DateInput } from "@/components/date-input";
import { Notice } from "@/components/notice";
export default async function MyDay({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const { db, org, user, organization } = await context();
  const { data, error } = await db
    .from("activities")
    .select("id,title,due_at,opportunity_id")
    .eq("organization_id", org)
    .eq("owner_id", user.id)
    .is("completed_at", null)
    .order("due_at");
  if (error) throw new Error("No pudimos cargar tus pendientes.");
  const now = new Date();
  const tz = organization?.timezone || "America/Argentina/Buenos_Aires";
  const day = (d: Date) => localDay(d, tz);
  const today = day(now);
  const groups = [
    { title: "Atrasadas", items: data.filter((a) => new Date(a.due_at) < now) },
    {
      title: "Para hoy",
      items: data.filter(
        (a) => new Date(a.due_at) >= now && day(new Date(a.due_at)) === today,
      ),
    },
    {
      title: "Próximas",
      items: data.filter(
        (a) => new Date(a.due_at) >= now && day(new Date(a.due_at)) !== today,
      ),
    },
  ];
  return (
    <div className="page">
      <div className="row justify-between">
        <div>
          <p className="muted">Tu agenda comercial</p>
          <h1>Mi día</h1>
          <p className="muted">Un próximo paso para cada oportunidad.</p>
        </div>
        <Button asChild>
          <Link href="/empresas">Registrar empresa</Link>
        </Button>
      </div>
      <Notice {...await searchParams} />
      {!data.length && (
        <section className="card">
          <h2>Todo al día</h2>
          <p className="muted">
            Registrá una empresa, creá una oportunidad y programá tu primer
            seguimiento.
          </p>
          <Link href="/oportunidades">Ver oportunidades →</Link>
        </section>
      )}
      {groups.map((g) => (
        <section key={g.title}>
          <h2 className="mb-3">
            {g.title} <span className="muted text-sm">({g.items.length})</span>
          </h2>
          {!g.items.length ? (
            <p className="muted text-sm">Sin actividades.</p>
          ) : (
            <div className="grid gap-3">
              {g.items.map((a) => (
                <article className="card" key={a.id}>
                  <div className="row justify-between">
                    <div>
                      <h3>{a.title}</h3>
                      <p className="text-sm muted">
                        {formatDate(a.due_at, tz)}
                      </p>
                      <Link
                        className="text-sm"
                        href={`/oportunidades/${a.opportunity_id}`}
                      >
                        Abrir oportunidad →
                      </Link>
                    </div>
                    <form action={completeActivity}>
                      <input type="hidden" name="id" value={a.id} />
                      <Submit>Completar</Submit>
                    </form>
                  </div>
                  <details className="mt-3">
                    <summary>Editar o reprogramar</summary>
                    <form action={updateActivity} className="stack mt-3">
                      <input type="hidden" name="id" value={a.id} />
                      <label>
                        Seguimiento
                        <input
                          name="title"
                          defaultValue={a.title}
                          required
                          maxLength={200}
                        />
                      </label>
                      <label>
                        Nueva fecha
                        <DateInput name="due_at" initial={a.due_at} />
                      </label>
                      <Submit>Guardar cambios</Submit>
                    </form>
                  </details>
                </article>
              ))}
            </div>
          )}
        </section>
      ))}
      <small>
        Agenda mostrada en {tz}. Al programar, usá la hora local de tu
        dispositivo.
      </small>
    </div>
  );
}
