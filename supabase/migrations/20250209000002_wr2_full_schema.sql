-- WR2 Serviços - Schema completo (NÃO MISTURAR COM AEGIS)
-- Execute no Supabase Dashboard: SQL Editor

-- Empresas
CREATE TABLE IF NOT EXISTS wr2.empresas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cnpj TEXT UNIQUE NOT NULL,
  nome_responsavel TEXT NOT NULL,
  funcao TEXT,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Condominios (departamentos)
CREATE TABLE IF NOT EXISTS wr2.condominios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID REFERENCES wr2.empresas(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Colaboradores
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

-- Tipos de recibo
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

-- Recibos
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

-- Atualizar profiles para incluir empresa_id
ALTER TABLE wr2.profiles ADD COLUMN IF NOT EXISTS empresa_id UUID REFERENCES wr2.empresas(id) ON DELETE SET NULL;
ALTER TABLE wr2.profiles ADD COLUMN IF NOT EXISTS cnpj TEXT;
ALTER TABLE wr2.profiles ADD COLUMN IF NOT EXISTS nome_responsavel TEXT;
ALTER TABLE wr2.profiles ADD COLUMN IF NOT EXISTS funcao TEXT;

-- RLS empresas
ALTER TABLE wr2.empresas ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "wr2_empresas_all" ON wr2.empresas;
CREATE POLICY "wr2_empresas_all" ON wr2.empresas FOR ALL USING (true);

-- RLS condominios
ALTER TABLE wr2.condominios ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "wr2_condominios_all" ON wr2.condominios;
CREATE POLICY "wr2_condominios_all" ON wr2.condominios FOR ALL USING (true);

-- RLS colaboradores
ALTER TABLE wr2.colaboradores ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "wr2_colaboradores_all" ON wr2.colaboradores;
CREATE POLICY "wr2_colaboradores_all" ON wr2.colaboradores FOR ALL USING (true);

-- RLS recibos
ALTER TABLE wr2.recibos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "wr2_recibos_all" ON wr2.recibos;
CREATE POLICY "wr2_recibos_all" ON wr2.recibos FOR ALL USING (true);
