-- =============================================================================
-- WR2 - BOOTSTRAP COMPLETO (use quando o schema "wr2" ainda não existir)
-- Execute no Supabase: SQL Editor > New query > Colar e Run UMA VEZ
--
-- Este script roda as 4 migrations em ordem (1 → 2 → 3 → 4).
-- Se você já rodou alguma antes, prefira rodar só as que faltam (ex.: só a 4).
-- =============================================================================

-- ---------- Migration 1: schema + profiles ----------
CREATE SCHEMA IF NOT EXISTS wr2;

CREATE TABLE IF NOT EXISTS wr2.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  empresa TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE wr2.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "wr2_select_own" ON wr2.profiles;
CREATE POLICY "wr2_select_own" ON wr2.profiles FOR SELECT USING (auth.uid() = id);
DROP POLICY IF EXISTS "wr2_update_own" ON wr2.profiles;
CREATE POLICY "wr2_update_own" ON wr2.profiles FOR UPDATE USING (auth.uid() = id);
DROP POLICY IF EXISTS "wr2_insert_own" ON wr2.profiles;
CREATE POLICY "wr2_insert_own" ON wr2.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- ---------- Migration 2: empresas, condominios, colaboradores, recibos ----------
CREATE TABLE IF NOT EXISTS wr2.empresas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cnpj TEXT UNIQUE NOT NULL,
  nome_responsavel TEXT NOT NULL,
  funcao TEXT,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS wr2.condominios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID REFERENCES wr2.empresas(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS wr2.colaboradores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID REFERENCES wr2.empresas(id) ON DELETE CASCADE,
  condominio_id UUID REFERENCES wr2.condominios(id) ON DELETE SET NULL,
  numero_registro SERIAL,
  nome_completo TEXT NOT NULL,
  rg TEXT,
  cpf TEXT,
  email TEXT,
  cargo TEXT,
  data_admissao DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS wr2.tipos_recibo (
  cod TEXT PRIMARY KEY,
  descricao TEXT NOT NULL
);
INSERT INTO wr2.tipos_recibo (cod, descricao) VALUES
  ('0001', 'VALE REFEIÇÃO'),
  ('0002', 'CESTA BASICA'),
  ('0003', 'GRATIFICAÇÃO'),
  ('0004', 'BENEFÍCIOS')
ON CONFLICT (cod) DO NOTHING;

CREATE TABLE IF NOT EXISTS wr2.recibos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  colaborador_id UUID REFERENCES wr2.colaboradores(id) ON DELETE CASCADE,
  tipo_cod TEXT REFERENCES wr2.tipos_recibo(cod),
  descricao TEXT,
  qtds INTEGER DEFAULT 1,
  data_inicio DATE NOT NULL,
  data_final DATE NOT NULL,
  valor_total DECIMAL(12,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE wr2.profiles ADD COLUMN IF NOT EXISTS empresa_id UUID REFERENCES wr2.empresas(id) ON DELETE SET NULL;
ALTER TABLE wr2.profiles ADD COLUMN IF NOT EXISTS cnpj TEXT;
ALTER TABLE wr2.profiles ADD COLUMN IF NOT EXISTS nome_responsavel TEXT;
ALTER TABLE wr2.profiles ADD COLUMN IF NOT EXISTS funcao TEXT;

ALTER TABLE wr2.empresas ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "wr2_empresas_all" ON wr2.empresas;
CREATE POLICY "wr2_empresas_all" ON wr2.empresas FOR ALL USING (true);

ALTER TABLE wr2.condominios ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "wr2_condominios_all" ON wr2.condominios;
CREATE POLICY "wr2_condominios_all" ON wr2.condominios FOR ALL USING (true);

ALTER TABLE wr2.colaboradores ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "wr2_colaboradores_all" ON wr2.colaboradores;
CREATE POLICY "wr2_colaboradores_all" ON wr2.colaboradores FOR ALL USING (true);

ALTER TABLE wr2.recibos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "wr2_recibos_all" ON wr2.recibos;
CREATE POLICY "wr2_recibos_all" ON wr2.recibos FOR ALL USING (true);

-- ---------- Migration 3: roles, convites, notificacoes ----------
ALTER TABLE wr2.profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'dono';

CREATE TABLE IF NOT EXISTS wr2.convites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES wr2.empresas(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  usado_em TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_convites_token ON wr2.convites(token);
CREATE INDEX IF NOT EXISTS idx_convites_empresa ON wr2.convites(empresa_id);
ALTER TABLE wr2.convites ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "wr2_convites_all" ON wr2.convites;
CREATE POLICY "wr2_convites_all" ON wr2.convites FOR ALL USING (true);

CREATE TABLE IF NOT EXISTS wr2.notificacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES wr2.empresas(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL,
  titulo TEXT NOT NULL,
  mensagem TEXT,
  lida BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_notificacoes_empresa ON wr2.notificacoes(empresa_id);
CREATE INDEX IF NOT EXISTS idx_notificacoes_created ON wr2.notificacoes(created_at DESC);
ALTER TABLE wr2.notificacoes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "wr2_notificacoes_all" ON wr2.notificacoes;
CREATE POLICY "wr2_notificacoes_all" ON wr2.notificacoes FOR ALL USING (true);

-- ---------- Migration 4: controle de acesso (status, permissoes, RLS) ----------
ALTER TABLE wr2.empresas ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'pendente';
ALTER TABLE wr2.empresas ADD COLUMN IF NOT EXISTS aprovado_por UUID REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE wr2.empresas ADD COLUMN IF NOT EXISTS aprovado_em TIMESTAMPTZ;
ALTER TABLE wr2.empresas ADD COLUMN IF NOT EXISTS motivo_rejeicao TEXT;
CREATE INDEX IF NOT EXISTS idx_empresas_status ON wr2.empresas(status);

ALTER TABLE wr2.colaboradores ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'ativo';
ALTER TABLE wr2.colaboradores ADD COLUMN IF NOT EXISTS aprovado_por UUID REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE wr2.colaboradores ADD COLUMN IF NOT EXISTS aprovado_em TIMESTAMPTZ;
ALTER TABLE wr2.colaboradores ADD COLUMN IF NOT EXISTS motivo_rejeicao TEXT;
CREATE INDEX IF NOT EXISTS idx_colaboradores_status ON wr2.colaboradores(status);

ALTER TABLE wr2.profiles ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'aprovado';
CREATE INDEX IF NOT EXISTS idx_profiles_status ON wr2.profiles(status);

CREATE TABLE IF NOT EXISTS wr2.permissoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES wr2.profiles(id) ON DELETE CASCADE,
  empresa_id UUID NOT NULL REFERENCES wr2.empresas(id) ON DELETE CASCADE,
  can_view_dashboard BOOLEAN NOT NULL DEFAULT true,
  can_view_colaboradores BOOLEAN NOT NULL DEFAULT false,
  can_edit_colaboradores BOOLEAN NOT NULL DEFAULT false,
  can_approve_colaboradores BOOLEAN NOT NULL DEFAULT false,
  can_view_recibos BOOLEAN NOT NULL DEFAULT false,
  can_edit_recibos BOOLEAN NOT NULL DEFAULT false,
  can_view_condominios BOOLEAN NOT NULL DEFAULT false,
  can_edit_condominios BOOLEAN NOT NULL DEFAULT false,
  can_approve_empresas BOOLEAN NOT NULL DEFAULT false,
  can_view_admin_panel BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(profile_id, empresa_id)
);
CREATE INDEX IF NOT EXISTS idx_permissoes_profile ON wr2.permissoes(profile_id);
CREATE INDEX IF NOT EXISTS idx_permissoes_empresa ON wr2.permissoes(empresa_id);
ALTER TABLE wr2.permissoes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "wr2_empresas_all" ON wr2.empresas;
CREATE POLICY "wr2_empresas_select_super" ON wr2.empresas FOR SELECT USING (EXISTS (SELECT 1 FROM wr2.profiles WHERE id = auth.uid() AND role = 'super_admin'));
CREATE POLICY "wr2_empresas_select_own" ON wr2.empresas FOR SELECT USING (id IN (SELECT empresa_id FROM wr2.profiles WHERE id = auth.uid()));
CREATE POLICY "wr2_empresas_insert" ON wr2.empresas FOR INSERT WITH CHECK (true);
CREATE POLICY "wr2_empresas_update_super" ON wr2.empresas FOR UPDATE USING (EXISTS (SELECT 1 FROM wr2.profiles WHERE id = auth.uid() AND role = 'super_admin'));
CREATE POLICY "wr2_empresas_update_own" ON wr2.empresas FOR UPDATE USING (id IN (SELECT empresa_id FROM wr2.profiles WHERE id = auth.uid() AND role IN ('dono', 'financeiro')));

DROP POLICY IF EXISTS "wr2_colaboradores_all" ON wr2.colaboradores;
CREATE POLICY "wr2_colaboradores_select" ON wr2.colaboradores FOR SELECT USING (empresa_id IN (SELECT empresa_id FROM wr2.profiles WHERE id = auth.uid()) OR EXISTS (SELECT 1 FROM wr2.profiles WHERE id = auth.uid() AND role = 'super_admin'));
CREATE POLICY "wr2_colaboradores_insert" ON wr2.colaboradores FOR INSERT WITH CHECK (empresa_id IN (SELECT empresa_id FROM wr2.profiles WHERE id = auth.uid()) OR EXISTS (SELECT 1 FROM wr2.profiles WHERE id = auth.uid() AND role = 'super_admin'));
CREATE POLICY "wr2_colaboradores_update" ON wr2.colaboradores FOR UPDATE USING (empresa_id IN (SELECT empresa_id FROM wr2.profiles WHERE id = auth.uid()) OR EXISTS (SELECT 1 FROM wr2.profiles WHERE id = auth.uid() AND role = 'super_admin'));

DROP POLICY IF EXISTS "wr2_condominios_all" ON wr2.condominios;
CREATE POLICY "wr2_condominios_select" ON wr2.condominios FOR SELECT USING (empresa_id IN (SELECT empresa_id FROM wr2.profiles WHERE id = auth.uid()) OR EXISTS (SELECT 1 FROM wr2.profiles WHERE id = auth.uid() AND role = 'super_admin'));
CREATE POLICY "wr2_condominios_insert" ON wr2.condominios FOR INSERT WITH CHECK (empresa_id IN (SELECT empresa_id FROM wr2.profiles WHERE id = auth.uid()) OR EXISTS (SELECT 1 FROM wr2.profiles WHERE id = auth.uid() AND role = 'super_admin'));

DROP POLICY IF EXISTS "wr2_recibos_all" ON wr2.recibos;
CREATE POLICY "wr2_recibos_select" ON wr2.recibos FOR SELECT USING (colaborador_id IN (SELECT c.id FROM wr2.colaboradores c JOIN wr2.profiles p ON p.empresa_id = c.empresa_id WHERE p.id = auth.uid()) OR EXISTS (SELECT 1 FROM wr2.profiles WHERE id = auth.uid() AND role = 'super_admin'));
CREATE POLICY "wr2_recibos_insert" ON wr2.recibos FOR INSERT WITH CHECK (colaborador_id IN (SELECT c.id FROM wr2.colaboradores c JOIN wr2.profiles p ON p.empresa_id = c.empresa_id WHERE p.id = auth.uid()) OR EXISTS (SELECT 1 FROM wr2.profiles WHERE id = auth.uid() AND role = 'super_admin'));

DROP POLICY IF EXISTS "wr2_convites_all" ON wr2.convites;
CREATE POLICY "wr2_convites_select" ON wr2.convites FOR SELECT USING (true);
CREATE POLICY "wr2_convites_insert" ON wr2.convites FOR INSERT WITH CHECK (empresa_id IN (SELECT empresa_id FROM wr2.profiles WHERE id = auth.uid()) OR EXISTS (SELECT 1 FROM wr2.profiles WHERE id = auth.uid() AND role = 'super_admin'));
CREATE POLICY "wr2_convites_update" ON wr2.convites FOR UPDATE USING (true);

DROP POLICY IF EXISTS "wr2_notificacoes_all" ON wr2.notificacoes;
CREATE POLICY "wr2_notificacoes_select" ON wr2.notificacoes FOR SELECT USING (empresa_id IN (SELECT empresa_id FROM wr2.profiles WHERE id = auth.uid()) OR EXISTS (SELECT 1 FROM wr2.profiles WHERE id = auth.uid() AND role = 'super_admin'));
CREATE POLICY "wr2_notificacoes_insert" ON wr2.notificacoes FOR INSERT WITH CHECK (true);

CREATE POLICY "wr2_permissoes_select" ON wr2.permissoes FOR SELECT USING (profile_id = auth.uid() OR empresa_id IN (SELECT empresa_id FROM wr2.profiles WHERE id = auth.uid() AND role IN ('dono', 'financeiro')) OR EXISTS (SELECT 1 FROM wr2.profiles WHERE id = auth.uid() AND role = 'super_admin'));
CREATE POLICY "wr2_permissoes_insert" ON wr2.permissoes FOR INSERT WITH CHECK (empresa_id IN (SELECT empresa_id FROM wr2.profiles WHERE id = auth.uid() AND role IN ('dono', 'financeiro')) OR EXISTS (SELECT 1 FROM wr2.profiles WHERE id = auth.uid() AND role = 'super_admin'));
CREATE POLICY "wr2_permissoes_update" ON wr2.permissoes FOR UPDATE USING (empresa_id IN (SELECT empresa_id FROM wr2.profiles WHERE id = auth.uid() AND role IN ('dono', 'financeiro')) OR EXISTS (SELECT 1 FROM wr2.profiles WHERE id = auth.uid() AND role = 'super_admin'));

CREATE POLICY "wr2_profiles_select_super" ON wr2.profiles FOR SELECT USING (EXISTS (SELECT 1 FROM wr2.profiles p2 WHERE p2.id = auth.uid() AND p2.role = 'super_admin'));
CREATE POLICY "wr2_profiles_select_empresa" ON wr2.profiles FOR SELECT USING (empresa_id IN (SELECT p2.empresa_id FROM wr2.profiles p2 WHERE p2.id = auth.uid()));
CREATE POLICY "wr2_profiles_update_super" ON wr2.profiles FOR UPDATE USING (EXISTS (SELECT 1 FROM wr2.profiles p2 WHERE p2.id = auth.uid() AND p2.role = 'super_admin'));
