-- WR2 - Controle de acesso: status, permissoes granulares, RLS corrigidas
-- Execute no Supabase Dashboard: SQL Editor > New query > Colar e Run
--
-- IMPORTANTE: Esta migration exige que o schema wr2 e as tabelas já existam.
-- Se aparecer "schema wr2 does not exist", rode ANTES (na ordem):
--   1) 20250209000001_create_wr2_schema.sql
--   2) 20250209000002_wr2_full_schema.sql
--   3) 20250209000003_wr2_roles_convites_notificacoes.sql
-- Depois rode esta (4) 20250209000004_wr2_access_control.sql

CREATE SCHEMA IF NOT EXISTS wr2;

-- ============================================
-- 1. STATUS em empresas
-- ============================================
ALTER TABLE wr2.empresas ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'pendente';
ALTER TABLE wr2.empresas ADD COLUMN IF NOT EXISTS aprovado_por UUID REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE wr2.empresas ADD COLUMN IF NOT EXISTS aprovado_em TIMESTAMPTZ;
ALTER TABLE wr2.empresas ADD COLUMN IF NOT EXISTS motivo_rejeicao TEXT;

CREATE INDEX IF NOT EXISTS idx_empresas_status ON wr2.empresas(status);

-- ============================================
-- 2. STATUS em colaboradores
-- ============================================
ALTER TABLE wr2.colaboradores ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'ativo';
ALTER TABLE wr2.colaboradores ADD COLUMN IF NOT EXISTS aprovado_por UUID REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE wr2.colaboradores ADD COLUMN IF NOT EXISTS aprovado_em TIMESTAMPTZ;
ALTER TABLE wr2.colaboradores ADD COLUMN IF NOT EXISTS motivo_rejeicao TEXT;

CREATE INDEX IF NOT EXISTS idx_colaboradores_status ON wr2.colaboradores(status);

-- ============================================
-- 3. STATUS em profiles
-- ============================================
ALTER TABLE wr2.profiles ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'aprovado';

CREATE INDEX IF NOT EXISTS idx_profiles_status ON wr2.profiles(status);

-- ============================================
-- 4. Tabela de permissoes granulares
-- ============================================
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

-- ============================================
-- 5. CORRIGIR RLS — substituir USING(true)
-- ============================================

-- EMPRESAS
DROP POLICY IF EXISTS "wr2_empresas_all" ON wr2.empresas;

CREATE POLICY "wr2_empresas_select_super" ON wr2.empresas
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM wr2.profiles WHERE id = auth.uid() AND role = 'super_admin')
  );

CREATE POLICY "wr2_empresas_select_own" ON wr2.empresas
  FOR SELECT USING (
    id IN (SELECT empresa_id FROM wr2.profiles WHERE id = auth.uid())
  );

CREATE POLICY "wr2_empresas_insert" ON wr2.empresas
  FOR INSERT WITH CHECK (true);

CREATE POLICY "wr2_empresas_update_super" ON wr2.empresas
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM wr2.profiles WHERE id = auth.uid() AND role = 'super_admin')
  );

CREATE POLICY "wr2_empresas_update_own" ON wr2.empresas
  FOR UPDATE USING (
    id IN (SELECT empresa_id FROM wr2.profiles WHERE id = auth.uid() AND role IN ('dono', 'financeiro'))
  );

-- COLABORADORES
DROP POLICY IF EXISTS "wr2_colaboradores_all" ON wr2.colaboradores;

CREATE POLICY "wr2_colaboradores_select" ON wr2.colaboradores
  FOR SELECT USING (
    empresa_id IN (SELECT empresa_id FROM wr2.profiles WHERE id = auth.uid())
    OR EXISTS (SELECT 1 FROM wr2.profiles WHERE id = auth.uid() AND role = 'super_admin')
  );

CREATE POLICY "wr2_colaboradores_insert" ON wr2.colaboradores
  FOR INSERT WITH CHECK (
    empresa_id IN (SELECT empresa_id FROM wr2.profiles WHERE id = auth.uid())
    OR EXISTS (SELECT 1 FROM wr2.profiles WHERE id = auth.uid() AND role = 'super_admin')
  );

CREATE POLICY "wr2_colaboradores_update" ON wr2.colaboradores
  FOR UPDATE USING (
    empresa_id IN (SELECT empresa_id FROM wr2.profiles WHERE id = auth.uid())
    OR EXISTS (SELECT 1 FROM wr2.profiles WHERE id = auth.uid() AND role = 'super_admin')
  );

-- CONDOMINIOS
DROP POLICY IF EXISTS "wr2_condominios_all" ON wr2.condominios;

CREATE POLICY "wr2_condominios_select" ON wr2.condominios
  FOR SELECT USING (
    empresa_id IN (SELECT empresa_id FROM wr2.profiles WHERE id = auth.uid())
    OR EXISTS (SELECT 1 FROM wr2.profiles WHERE id = auth.uid() AND role = 'super_admin')
  );

CREATE POLICY "wr2_condominios_insert" ON wr2.condominios
  FOR INSERT WITH CHECK (
    empresa_id IN (SELECT empresa_id FROM wr2.profiles WHERE id = auth.uid())
    OR EXISTS (SELECT 1 FROM wr2.profiles WHERE id = auth.uid() AND role = 'super_admin')
  );

-- RECIBOS
DROP POLICY IF EXISTS "wr2_recibos_all" ON wr2.recibos;

CREATE POLICY "wr2_recibos_select" ON wr2.recibos
  FOR SELECT USING (
    colaborador_id IN (
      SELECT c.id FROM wr2.colaboradores c
      JOIN wr2.profiles p ON p.empresa_id = c.empresa_id
      WHERE p.id = auth.uid()
    )
    OR EXISTS (SELECT 1 FROM wr2.profiles WHERE id = auth.uid() AND role = 'super_admin')
  );

CREATE POLICY "wr2_recibos_insert" ON wr2.recibos
  FOR INSERT WITH CHECK (
    colaborador_id IN (
      SELECT c.id FROM wr2.colaboradores c
      JOIN wr2.profiles p ON p.empresa_id = c.empresa_id
      WHERE p.id = auth.uid()
    )
    OR EXISTS (SELECT 1 FROM wr2.profiles WHERE id = auth.uid() AND role = 'super_admin')
  );

-- CONVITES (token e o segredo, select aberto para validacao)
DROP POLICY IF EXISTS "wr2_convites_all" ON wr2.convites;

CREATE POLICY "wr2_convites_select" ON wr2.convites
  FOR SELECT USING (true);

CREATE POLICY "wr2_convites_insert" ON wr2.convites
  FOR INSERT WITH CHECK (
    empresa_id IN (SELECT empresa_id FROM wr2.profiles WHERE id = auth.uid())
    OR EXISTS (SELECT 1 FROM wr2.profiles WHERE id = auth.uid() AND role = 'super_admin')
  );

CREATE POLICY "wr2_convites_update" ON wr2.convites
  FOR UPDATE USING (true);

-- NOTIFICACOES
DROP POLICY IF EXISTS "wr2_notificacoes_all" ON wr2.notificacoes;

CREATE POLICY "wr2_notificacoes_select" ON wr2.notificacoes
  FOR SELECT USING (
    empresa_id IN (SELECT empresa_id FROM wr2.profiles WHERE id = auth.uid())
    OR EXISTS (SELECT 1 FROM wr2.profiles WHERE id = auth.uid() AND role = 'super_admin')
  );

CREATE POLICY "wr2_notificacoes_insert" ON wr2.notificacoes
  FOR INSERT WITH CHECK (true);

-- PERMISSOES
CREATE POLICY "wr2_permissoes_select" ON wr2.permissoes
  FOR SELECT USING (
    profile_id = auth.uid()
    OR empresa_id IN (
      SELECT empresa_id FROM wr2.profiles WHERE id = auth.uid() AND role IN ('dono', 'financeiro')
    )
    OR EXISTS (SELECT 1 FROM wr2.profiles WHERE id = auth.uid() AND role = 'super_admin')
  );

CREATE POLICY "wr2_permissoes_insert" ON wr2.permissoes
  FOR INSERT WITH CHECK (
    empresa_id IN (
      SELECT empresa_id FROM wr2.profiles WHERE id = auth.uid() AND role IN ('dono', 'financeiro')
    )
    OR EXISTS (SELECT 1 FROM wr2.profiles WHERE id = auth.uid() AND role = 'super_admin')
  );

CREATE POLICY "wr2_permissoes_update" ON wr2.permissoes
  FOR UPDATE USING (
    empresa_id IN (
      SELECT empresa_id FROM wr2.profiles WHERE id = auth.uid() AND role IN ('dono', 'financeiro')
    )
    OR EXISTS (SELECT 1 FROM wr2.profiles WHERE id = auth.uid() AND role = 'super_admin')
  );

-- PROFILES (adicionar policies para super_admin e mesma empresa)
CREATE POLICY "wr2_profiles_select_super" ON wr2.profiles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM wr2.profiles p2 WHERE p2.id = auth.uid() AND p2.role = 'super_admin')
  );

CREATE POLICY "wr2_profiles_select_empresa" ON wr2.profiles
  FOR SELECT USING (
    empresa_id IN (SELECT p2.empresa_id FROM wr2.profiles p2 WHERE p2.id = auth.uid())
  );

CREATE POLICY "wr2_profiles_update_super" ON wr2.profiles
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM wr2.profiles p2 WHERE p2.id = auth.uid() AND p2.role = 'super_admin')
  );
