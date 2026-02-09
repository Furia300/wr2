/**
 * Script one-time: cria o Super Admin e grava as credenciais em SUPER_ADMIN_CREDENCIAIS.txt
 * Uso: node scripts/create-super-admin.js
 */
const fs = require("fs");
const path = require("path");

// Carregar .env.local (raiz do projeto)
const envFile = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(envFile)) {
  const content = fs.readFileSync(envFile, "utf8").replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  content.split("\n").forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
      const idx = trimmed.indexOf("=");
      const key = trimmed.slice(0, idx).trim();
      let val = trimmed.slice(idx + 1).trim();
      if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
      if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
      process.env[key] = val;
    }
  });
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error("Configure NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no .env.local");
  process.exit(1);
}

const EMAIL = "superadmin@wr2.local";
const SENHA = "TrocarSenha123!";

async function main() {
  const { createClient } = require("@supabase/supabase-js");
  const supabase = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: existing } = await supabase
    .schema("wr2")
    .from("profiles")
    .select("id")
    .eq("role", "super_admin")
    .limit(1)
    .maybeSingle();

  if (existing) {
    console.log("Já existe um Super Admin. Use a tela de login.");
    return;
  }

  const { data: userData, error: authError } = await supabase.auth.admin.createUser({
    email: EMAIL,
    password: SENHA,
    email_confirm: true,
  });

  if (authError) {
    console.error("Erro ao criar usuário:", authError.message);
    process.exit(1);
  }

  if (!userData.user) {
    console.error("Falha ao criar usuário.");
    process.exit(1);
  }

  await supabase.schema("wr2").from("profiles").upsert({
    id: userData.user.id,
    email: userData.user.email,
    role: "super_admin",
  });

  const credenciais = `
WR2 — Super Admin (credenciais temporárias)
==========================================
Email: ${EMAIL}
Senha: ${SENHA}

Altere a senha no painel: faça login em /wr2/login e use "Alterar senha" no dashboard.
Após alterar, você pode apagar este arquivo.
==========================================
`;
  const outPath = path.join(__dirname, "..", "SUPER_ADMIN_CREDENCIAIS.txt");
  fs.writeFileSync(outPath, credenciais.trim(), "utf8");
  console.log("Super Admin criado com sucesso.");
  console.log("Credenciais gravadas em: SUPER_ADMIN_CREDENCIAIS.txt");
  console.log("Email:", EMAIL);
  console.log("Senha:", SENHA);
  console.log("\nFaça login em /wr2/login e altere a senha no painel.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
