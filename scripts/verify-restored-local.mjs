import assert from "node:assert/strict";
import { createClient } from "@supabase/supabase-js";
process.loadEnvFile(".env.test.local");
const url = process.env.RESTORE_URL;
if (
  !url ||
  !["localhost", "127.0.0.1"].includes(new URL(url).hostname) ||
  url === process.env.NEXT_PUBLIC_SUPABASE_URL
)
  throw new Error(
    "RESTORE_URL debe apuntar a una API local separada de la original.",
  );
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const options = { auth: { persistSession: false, autoRefreshToken: false } };
const manuel = createClient(url, key, options),
  external = createClient(url, key, options);
for (const [client, email] of [
  [manuel, "manuel@kul.example"],
  [external, "externo@kul.example"],
]) {
  const { error } = await client.auth.signInWithPassword({
    email,
    password: "Local-Ficticio-2026!",
  });
  assert.equal(error, null, "La cuenta restaurada debe iniciar sesión");
}
const companies = await manuel.from("companies").select("id,name");
assert.equal(companies.error, null);
assert.ok(companies.data.length > 0, "Deben recuperarse empresas");
const activities = await manuel
  .from("activities")
  .select("id,title,completed_at");
assert.equal(activities.error, null);
assert.ok(activities.data.length > 0, "Deben recuperarse actividades");
const foreign = await external
  .from("companies")
  .select("id")
  .eq("id", companies.data[0].id);
assert.equal(foreign.error, null);
assert.deepEqual(
  foreign.data,
  [],
  "RLS debe conservar aislamiento después de restaurar",
);
const roles = await manuel
  .from("memberships")
  .update({ role: "admin" })
  .eq("user_id", (await manuel.auth.getUser()).data.user.id)
  .select();
assert.ok(
  roles.error || roles.data.length === 0,
  "Restaurar no debe permitir escalar permisos",
);
console.log(
  "Restauración local verificada: login con credenciales conservadas, empresas y actividades recuperadas, aislamiento RLS y permisos.",
);
