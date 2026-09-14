import { redirect } from "next/navigation";

import { createClient as createAdminClient } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/server";

import ManagerDashboardClient from "./manager-dashboard-client";

export default async function ManagerDashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/manager/login");
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Configurazione Supabase mancante.");
  }

  const supabaseAdmin = createAdminClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const { data } = await supabaseAdmin
    .from("manager_profiles")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!data) {
    redirect("/manager");
  }

  return (
    <ManagerDashboardClient
      userId={user.id}
      userEmail={user.email ?? ""}
      initialData={data}
    />
  );
}
