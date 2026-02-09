-- WR2 - Roles (super_admin, dono, financeiro), convites e notificações

-- 1. Role em profiles: quem pode acessar o painel (super_admin, dono, financeiro)
ALTER TABLE wr2.profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'dono';
-- super_admin = acesso total; dono = dono da empresa; financeiro = setor financeiro

-- 2. Convites para colaborador se cadastrar (link que o dono envia)
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

-- 3. Notificações (dono/financeiro veem quando colaborador se cadastra)
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
