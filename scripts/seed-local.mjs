import { createClient } from "@supabase/supabase-js";
import { pathToFileURL } from "node:url";
export const orgA = "10000000-0000-4000-8000-000000000001";
export const orgB = "20000000-0000-4000-8000-000000000001";
export const password = "Local-Ficticio-2026!";
export function localAdmin() {
  process.loadEnvFile(".env.test.local");
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url || !["127.0.0.1", "localhost"].includes(new URL(url).hostname))
    throw new Error("Fixtures permitidos únicamente en Supabase local.");
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY)
    throw new Error("Falta la clave administrativa local de pruebas.");
  return createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
function check(result) {
  if (result.error) throw result.error;
  return result.data;
}
export async function seed() {
  const admin = localAdmin();
  check(
    await admin.from("organizations").upsert([
      { id: orgA, name: "KUL Performance · FICTICIO" },
      { id: orgB, name: "Organización B · FICTICIO" },
    ]),
  );
  const { users } = check(await admin.auth.admin.listUsers());
  /** @type {Record<string,{id:string,email:string,org:string}>} */
  const accounts = {};
  for (const [name, org, role] of [
    ["manuel", orgA, "commercial"],
    ["direccion", orgA, "admin"],
    ["externo", orgB, "commercial"],
    ["colega", orgA, "commercial"],
  ]) {
    const email = `${name}@kul.example`;
    let user = users.find((u) => u.email === email);
    if (!user)
      user = check(
        await admin.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
        }),
      ).user;
    else check(await admin.auth.admin.updateUserById(user.id, { password }));
    check(
      await admin
        .from("memberships")
        .upsert({ organization_id: org, user_id: user.id, role, active: true }),
    );
    accounts[name] = { id: user.id, email, org };
  }
  for (const org of [orgA, orgB])
    for (const [i, name] of [
      "Por contactar",
      "Contacto iniciado",
      "Reunión agendada",
      "Propuesta enviada",
      "Negociación",
    ].entries()) {
      const id = `${org === orgA ? "3" : "4"}0000000-0000-4000-8000-${String(i + 1).padStart(12, "0")}`;
      check(
        await admin
          .from("stages")
          .upsert({ id, organization_id: org, name, position: i }),
      );
    }
  return { admin, accounts };
}
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  await seed();
  console.log(
    "Fixtures locales listos: manuel@kul.example y direccion@kul.example. Contraseña de prueba documentada en README.",
  );
}
