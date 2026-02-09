import { SupabaseClient } from "@supabase/supabase-js";

export interface UserPermissions {
  role: string;
  status: string;
  empresa_id: string | null;
  can_view_dashboard: boolean;
  can_view_colaboradores: boolean;
  can_edit_colaboradores: boolean;
  can_approve_colaboradores: boolean;
  can_view_recibos: boolean;
  can_edit_recibos: boolean;
  can_view_condominios: boolean;
  can_edit_condominios: boolean;
  can_approve_empresas: boolean;
  can_view_admin_panel: boolean;
}

const ALL_TRUE: Omit<UserPermissions, "role" | "status" | "empresa_id"> = {
  can_view_dashboard: true,
  can_view_colaboradores: true,
  can_edit_colaboradores: true,
  can_approve_colaboradores: true,
  can_view_recibos: true,
  can_edit_recibos: true,
  can_view_condominios: true,
  can_edit_condominios: true,
  can_approve_empresas: true,
  can_view_admin_panel: true,
};

const DONO_DEFAULTS: Omit<UserPermissions, "role" | "status" | "empresa_id"> = {
  can_view_dashboard: true,
  can_view_colaboradores: true,
  can_edit_colaboradores: true,
  can_approve_colaboradores: true,
  can_view_recibos: true,
  can_edit_recibos: true,
  can_view_condominios: true,
  can_edit_condominios: true,
  can_approve_empresas: false,
  can_view_admin_panel: true,
};

const FINANCEIRO_DEFAULTS: Omit<UserPermissions, "role" | "status" | "empresa_id"> = {
  can_view_dashboard: true,
  can_view_colaboradores: true,
  can_edit_colaboradores: true,
  can_approve_colaboradores: true,
  can_view_recibos: true,
  can_edit_recibos: true,
  can_view_condominios: true,
  can_edit_condominios: false,
  can_approve_empresas: false,
  can_view_admin_panel: true,
};

const MINIMAL: Omit<UserPermissions, "role" | "status" | "empresa_id"> = {
  can_view_dashboard: false,
  can_view_colaboradores: false,
  can_edit_colaboradores: false,
  can_approve_colaboradores: false,
  can_view_recibos: false,
  can_edit_recibos: false,
  can_view_condominios: false,
  can_edit_condominios: false,
  can_approve_empresas: false,
  can_view_admin_panel: false,
};

function getDefaults(role: string) {
  if (role === "dono") return DONO_DEFAULTS;
  if (role === "financeiro") return FINANCEIRO_DEFAULTS;
  return MINIMAL;
}

export async function getUserPermissions(
  supabase: SupabaseClient,
  userId: string
): Promise<UserPermissions | null> {
  const { data: profile } = await supabase
    .schema("wr2")
    .from("profiles")
    .select("role, status, empresa_id")
    .eq("id", userId)
    .single();

  if (!profile) return null;

  if (profile.role === "super_admin") {
    return {
      role: "super_admin",
      status: "aprovado",
      empresa_id: profile.empresa_id,
      ...ALL_TRUE,
    };
  }

  const { data: perms } = await supabase
    .schema("wr2")
    .from("permissoes")
    .select("*")
    .eq("profile_id", userId)
    .maybeSingle();

  const defaults = getDefaults(profile.role);

  return {
    role: profile.role,
    status: profile.status || "aprovado",
    empresa_id: profile.empresa_id,
    can_view_dashboard: perms?.can_view_dashboard ?? defaults.can_view_dashboard,
    can_view_colaboradores: perms?.can_view_colaboradores ?? defaults.can_view_colaboradores,
    can_edit_colaboradores: perms?.can_edit_colaboradores ?? defaults.can_edit_colaboradores,
    can_approve_colaboradores: perms?.can_approve_colaboradores ?? defaults.can_approve_colaboradores,
    can_view_recibos: perms?.can_view_recibos ?? defaults.can_view_recibos,
    can_edit_recibos: perms?.can_edit_recibos ?? defaults.can_edit_recibos,
    can_view_condominios: perms?.can_view_condominios ?? defaults.can_view_condominios,
    can_edit_condominios: perms?.can_edit_condominios ?? defaults.can_edit_condominios,
    can_approve_empresas: perms?.can_approve_empresas ?? defaults.can_approve_empresas,
    can_view_admin_panel: perms?.can_view_admin_panel ?? defaults.can_view_admin_panel,
  };
}
