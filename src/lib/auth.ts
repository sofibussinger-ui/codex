import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { supabase } from "@/lib/supabase/server";
export async function context() {
  const db = await supabase();
  const {
    data: { user },
    error,
  } = await db.auth.getUser();
  if (error || !user) redirect("/login");
  const { data: members, error: memberError } = await db
    .from("memberships")
    .select("organization_id,role")
    .eq("user_id", user.id)
    .eq("active", true);
  if (memberError) throw new Error("No pudimos verificar tus permisos.");
  if (!members?.length) redirect("/login?error=Sin%20organización%20activa");
  const selected = (await cookies()).get("kul-organization")?.value;
  const membership =
    members.find((m) => m.organization_id === selected) ?? members[0];
  const { data: organization } = await db
    .from("organizations")
    .select("name,timezone")
    .eq("id", membership.organization_id)
    .single();
  return {
    db,
    user,
    org: membership.organization_id,
    role: membership.role,
    organization,
    members,
  };
}
