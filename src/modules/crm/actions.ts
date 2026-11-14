"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { z } from "zod";
import { context } from "@/lib/auth";
import { supabase } from "@/lib/supabase/server";
import {
  companySchema,
  opportunitySchema,
  callSchema,
  activitySchema,
} from "./schemas";
function go(path: string, key: string, message: string): never {
  redirect(`${path}?${key}=${encodeURIComponent(message)}`);
}
function fail(path: string): never {
  go(
    path,
    "error",
    "No pudimos guardar. Revisá los datos y tus permisos e intentá nuevamente.",
  );
}
function values(form: FormData) {
  return Object.fromEntries(form.entries());
}
export async function login(form: FormData) {
  const parsed = z
    .object({ email: z.email(), password: z.string().min(1).max(200) })
    .safeParse(values(form));
  if (!parsed.success) go("/login", "error", "Revisá tu email y contraseña.");
  const db = await supabase();
  const { error } = await db.auth.signInWithPassword(parsed.data);
  if (error)
    go(
      "/login",
      "error",
      "No pudimos iniciar sesión. Revisá tus credenciales.",
    );
  redirect("/mi-dia");
}
export async function logout() {
  const db = await supabase();
  await db.auth.signOut();
  (await cookies()).delete("kul-organization");
  redirect("/login");
}
export async function switchOrganization(form: FormData) {
  const { members } = await context();
  const id = String(form.get("organization"));
  if (!members.some((m) => m.organization_id === id)) fail("/mi-dia");
  (await cookies()).set("kul-organization", id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });
  revalidatePath("/", "layout");
  redirect("/mi-dia");
}
export async function createCompany(form: FormData) {
  const { db, org, user } = await context();
  const parsed = companySchema.safeParse(values(form));
  if (!parsed.success) fail("/empresas");
  const { data, error } = await db
    .from("companies")
    .insert({ ...parsed.data, organization_id: org, owner_id: user.id })
    .select("id")
    .single();
  if (error || !data) fail("/empresas");
  revalidatePath("/empresas");
  redirect(`/oportunidades?company=${data.id}`);
}
export async function createOpportunity(form: FormData) {
  const { db, org, user } = await context();
  const parsed = opportunitySchema.safeParse(values(form));
  if (!parsed.success) fail("/oportunidades");
  const { data, error } = await db
    .from("opportunities")
    .insert({ ...parsed.data, organization_id: org, owner_id: user.id })
    .select("id")
    .single();
  if (error || !data) fail("/oportunidades");
  revalidatePath("/oportunidades");
  redirect(`/oportunidades/${data.id}`);
}
export async function recordCall(form: FormData) {
  const { db, org } = await context();
  const parsed = callSchema.safeParse(values(form));
  if (!parsed.success) fail("/oportunidades");
  const p = parsed.data;
  const path = `/oportunidades/${p.opportunity}`;
  const { error } = await db.rpc("record_call", {
    org,
    opportunity: p.opportunity,
    note: p.note,
    followup_title: p.followup_title,
    followup_at: p.followup_at,
    request: p.request,
  });
  if (error) fail(path);
  revalidatePath("/mi-dia");
  revalidatePath(path);
  go(
    path,
    "message",
    "Llamada y seguimiento guardados. Encontrá tu próximo paso en Mi día.",
  );
}
export async function updateActivity(form: FormData) {
  const { db, org } = await context();
  const parsed = activitySchema.safeParse(values(form));
  if (!parsed.success) fail("/mi-dia");
  const { id, ...patch } = parsed.data;
  const { data, error } = await db
    .from("activities")
    .update(patch)
    .eq("organization_id", org)
    .eq("id", id)
    .is("completed_at", null)
    .select("id");
  if (error || !data?.length) fail("/mi-dia");
  revalidatePath("/mi-dia");
  go("/mi-dia", "message", "Seguimiento actualizado.");
}
export async function completeActivity(form: FormData) {
  const { db, org } = await context();
  const parsed = z.uuid().safeParse(form.get("id"));
  if (!parsed.success) fail("/mi-dia");
  const { data, error } = await db
    .from("activities")
    .update({ completed_at: new Date().toISOString() })
    .eq("organization_id", org)
    .eq("id", parsed.data)
    .is("completed_at", null)
    .select("id");
  if (error || !data?.length) fail("/mi-dia");
  revalidatePath("/mi-dia");
  go("/mi-dia", "message", "Seguimiento completado.");
}
export async function updateOpportunity(form: FormData) {
  const { db, org } = await context();
  const parsed = z
    .object({
      id: z.uuid(),
      stage_id: z.uuid(),
      status: z.enum(["open", "won", "lost"]),
    })
    .safeParse(values(form));
  if (!parsed.success) fail("/oportunidades");
  const { id, ...patch } = parsed.data;
  const { data, error } = await db
    .from("opportunities")
    .update(patch)
    .eq("organization_id", org)
    .eq("id", id)
    .select("id");
  if (error || !data?.length) fail("/oportunidades");
  revalidatePath("/oportunidades");
  go(`/oportunidades/${id}`, "message", "Oportunidad actualizada.");
}
export async function sendFeedback(form: FormData) {
  const { db, org, user } = await context();
  const parsed = z
    .object({
      kind: z.enum(["error", "suggestion"]),
      description: z.string().trim().min(1).max(3000),
    })
    .safeParse(values(form));
  if (!parsed.success) fail("/feedback");
  const { error } = await db
    .from("feedback")
    .insert({ ...parsed.data, organization_id: org, author_id: user.id });
  if (error) fail("/feedback");
  revalidatePath("/feedback");
  go("/feedback", "message", "Gracias. Tu comentario quedó registrado.");
}
