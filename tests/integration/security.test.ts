import { beforeAll, describe, it, expect } from "vitest";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { seed, orgA, orgB, password } from "../../scripts/seed-local.mjs";
import { randomUUID } from "node:crypto";
let admin: SupabaseClient,
  manuel: SupabaseClient,
  external: SupabaseClient,
  colleague: SupabaseClient;
let company: string,
  opportunity: string,
  otherOpportunity: string,
  foreignCompany: string,
  stageA: string,
  stageB: string,
  manuelId: string;
const api = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
beforeAll(async () => {
  const fixtures = await seed();
  admin = fixtures.admin;
  manuelId = fixtures.accounts.manuel.id;
  for (const [name, set] of [
    ["manuel", (c: SupabaseClient) => (manuel = c)],
    ["externo", (c: SupabaseClient) => (external = c)],
    ["colega", (c: SupabaseClient) => (colleague = c)],
  ] as const) {
    const client = api();
    const result = await client.auth.signInWithPassword({
      email: fixtures.accounts[name].email,
      password,
    });
    if (result.error) throw result.error;
    set(client);
  }
  const a = await admin
    .from("stages")
    .select("id")
    .eq("organization_id", orgA)
    .order("position")
    .limit(1)
    .single();
  stageA = a.data!.id;
  const b = await admin
    .from("stages")
    .select("id")
    .eq("organization_id", orgB)
    .order("position")
    .limit(1)
    .single();
  stageB = b.data!.id;
  const c = await manuel
    .from("companies")
    .insert({ organization_id: orgA, name: "Inmobiliaria ficticia seguridad" })
    .select("id")
    .single();
  if (c.error) throw c.error;
  company = c.data.id;
  const fc = await external
    .from("companies")
    .insert({ organization_id: orgB, name: "Empresa ficticia externa" })
    .select("id")
    .single();
  foreignCompany = fc.data!.id;
  const o = await manuel
    .from("opportunities")
    .insert({
      organization_id: orgA,
      company_id: company,
      stage_id: stageA,
      title: "Oportunidad ficticia",
    })
    .select("id")
    .single();
  if (o.error) throw o.error;
  opportunity = o.data.id;
  const co = await colleague
    .from("opportunities")
    .insert({
      organization_id: orgA,
      company_id: company,
      stage_id: stageA,
      title: "Oportunidad de otro comercial",
    })
    .select("id")
    .single();
  otherOpportunity = co.data!.id;
}, 30000);
describe("RLS y flujo transaccional en Supabase real", () => {
  it("rechaza credenciales inválidas", async () => {
    const { error } = await api().auth.signInWithPassword({
      email: "manuel@kul.example",
      password: "incorrecta",
    });
    expect(error).toBeTruthy();
  });
  it("anon no lee ni inserta datos comerciales", async () => {
    const anon = api();
    expect((await anon.from("companies").select("*")).error).toBeTruthy();
    expect(
      (
        await anon.from("companies").insert({
          organization_id: orgA,
          name: "No permitida",
          owner_id: manuelId,
        })
      ).error,
    ).toBeTruthy();
  });
  it("otra organización no lee ni modifica registros de KUL", async () => {
    expect(
      (await external.from("companies").select("id").eq("id", company)).data,
    ).toEqual([]);
    expect(
      (
        await external
          .from("companies")
          .update({ name: "Intrusión" })
          .eq("id", company)
          .select()
      ).data,
    ).toEqual([]);
    expect(
      (await external.from("opportunities").select("id").eq("id", opportunity))
        .data,
    ).toEqual([]);
  });
  it("impide crear registros y relaciones cruzadas", async () => {
    expect(
      (
        await manuel
          .from("companies")
          .insert({ organization_id: orgB, name: "Intrusión" })
      ).error,
    ).toBeTruthy();
    expect(
      (
        await manuel.from("opportunities").insert({
          organization_id: orgA,
          company_id: foreignCompany,
          stage_id: stageA,
          title: "Cruce",
        })
      ).error,
    ).toBeTruthy();
    expect(
      (
        await manuel.from("opportunities").insert({
          organization_id: orgA,
          company_id: company,
          stage_id: stageB,
          title: "Cruce etapa",
        })
      ).error,
    ).toBeTruthy();
  });
  it("comercial no cambia roles, asigna a otros ni edita oportunidades ajenas", async () => {
    const r = await manuel
      .from("memberships")
      .update({ role: "admin" })
      .eq("user_id", manuelId)
      .select();
    expect(r.error || r.data?.length === 0).toBeTruthy();
    expect(
      (
        await manuel
          .from("opportunities")
          .update({ title: "Intrusión" })
          .eq("id", otherOpportunity)
          .select()
      ).data,
    ).toEqual([]);
    expect(
      (
        await manuel.from("companies").insert({
          organization_id: orgA,
          name: "Asignación no permitida",
          owner_id: (await colleague.auth.getUser()).data.user!.id,
        })
      ).error,
    ).toBeTruthy();
  });
  it("guarda llamada y seguimiento una sola vez ante reintento", async () => {
    const request = randomUUID();
    const payload = {
      org: orgA,
      opportunity,
      note: "Prueba",
      followup_title: "Seguimiento ficticio",
      followup_at: new Date().toISOString(),
      request,
    };
    expect((await manuel.rpc("record_call", payload)).error).toBeNull();
    expect((await manuel.rpc("record_call", payload)).error).toBeNull();
    const { data, error } = await manuel
      .from("activities")
      .select("*")
      .eq("request_id", request);
    expect(error).toBeNull();
    expect(data).toHaveLength(2);
    expect(data!.find((a) => a.kind === "call").completed_at).toBeTruthy();
    const follow = data!.find((a) => a.kind === "followup");
    expect(follow.completed_at).toBeNull();
    expect(
      (
        await manuel
          .from("activities")
          .update({
            title: "Seguimiento actualizado",
            completed_at: new Date().toISOString(),
          })
          .eq("id", follow.id)
      ).error,
    ).toBeNull();
    expect(
      (
        await manuel
          .from("activities")
          .select("title,completed_at")
          .eq("id", follow.id)
          .single()
      ).data?.title,
    ).toBe("Seguimiento actualizado");
  });
  it("revierte también la llamada si falla el seguimiento", async () => {
    const request = randomUUID();
    expect(
      (
        await manuel.rpc("record_call", {
          org: orgA,
          opportunity,
          note: "No persistir",
          followup_title: "x".repeat(201),
          followup_at: new Date().toISOString(),
          request,
        })
      ).error,
    ).toBeTruthy();
    expect(
      (await manuel.from("activities").select("id").eq("request_id", request))
        .data,
    ).toEqual([]);
  });
  it("no permite registrar actividad en oportunidad ajena", async () => {
    expect(
      (
        await manuel.rpc("record_call", {
          org: orgA,
          opportunity: otherOpportunity,
          note: "Intrusión",
          followup_title: "No permitida",
          followup_at: new Date().toISOString(),
          request: randomUUID(),
        })
      ).error,
    ).toBeTruthy();
  });
  it("desactivar membresía bloquea una sesión existente", async () => {
    await admin
      .from("memberships")
      .update({ active: false })
      .eq("organization_id", orgA)
      .eq("user_id", manuelId);
    try {
      expect((await manuel.from("companies").select("id")).data).toEqual([]);
      expect(
        (
          await manuel
            .from("companies")
            .insert({ organization_id: orgA, name: "No permitida" })
        ).error,
      ).toBeTruthy();
    } finally {
      await admin
        .from("memberships")
        .update({ active: true })
        .eq("organization_id", orgA)
        .eq("user_id", manuelId);
    }
  });
});
