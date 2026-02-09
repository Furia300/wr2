-- WR2 Serviços - Schema isolado (NÃO MISTURAR COM AEGIS)
-- Execute no Supabase Dashboard: SQL Editor > New query > Colar e Run

-- 1. Criar schema wr2
CREATE SCHEMA IF NOT EXISTS wr2;

-- 2. Tabela de perfis WR2
CREATE TABLE IF NOT EXISTS wr2.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  empresa TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. RLS
ALTER TABLE wr2.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "wr2_select_own" ON wr2.profiles;
CREATE POLICY "wr2_select_own" ON wr2.profiles FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "wr2_update_own" ON wr2.profiles;
CREATE POLICY "wr2_update_own" ON wr2.profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "wr2_insert_own" ON wr2.profiles;
CREATE POLICY "wr2_insert_own" ON wr2.profiles FOR INSERT WITH CHECK (auth.uid() = id);
