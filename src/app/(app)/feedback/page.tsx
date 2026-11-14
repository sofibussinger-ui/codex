import { context } from "@/lib/auth";
import { sendFeedback } from "@/modules/crm/actions";
import { Submit } from "@/components/ui/submit";
import { Notice } from "@/components/notice";
export default async function Feedback({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const { db, org } = await context();
  const { data, error } = await db
    .from("feedback")
    .select("id,kind,description")
    .eq("organization_id", org)
    .order("created_at", { ascending: false })
    .limit(30);
  if (error) throw new Error("No pudimos cargar los comentarios.");
  return (
    <div className="page">
      <h1>Ayudanos a mejorar</h1>
      <Notice {...await searchParams} />
      <div className="grid-two">
        <form action={sendFeedback} className="card stack">
          <label>
            Tipo
            <select name="kind">
              <option value="error">Encontré un error</option>
              <option value="suggestion">Tengo una sugerencia</option>
            </select>
          </label>
          <label>
            Contanos qué pasó
            <textarea name="description" required maxLength={3000} />
          </label>
          <Submit>Enviar comentario</Submit>
        </form>
        <section className="card">
          <h2>Comentarios registrados</h2>
          {data?.map((f) => (
            <p className="border-b py-3 whitespace-pre-wrap" key={f.id}>
              {f.kind === "error" ? "Error" : "Sugerencia"}: {f.description}
            </p>
          ))}
        </section>
      </div>
    </div>
  );
}
