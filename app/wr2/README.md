# Painel WR2 - Setup Completo

## ⚠️ PROJETO ISOLADO - NÃO MISTURAR COM AEGIS

Use um **projeto Supabase separado** apenas para WR2.

---

## 1. Criar projeto no Supabase

1. Acesse [supabase.com/dashboard](https://supabase.com/dashboard)
2. **New Project** → nome: `wr2-servicos` (ou outro)
3. Anote a URL e a **anon key** (Settings > API)

## 2. Configurar variáveis

```bash
cp .env.local.example .env.local
```

Edite `.env.local` e preencha:
```
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

## 3. Criar schema WR2 no banco

No Supabase Dashboard: **SQL Editor** → **New query**

Cole e execute o conteúdo de:
`supabase/migrations/20250209000001_create_wr2_schema.sql`

## 4. Instalar dependências

```bash
npm install
```

## 5. Rodar o projeto

```bash
npm run dev
```

---

## Rotas

| Rota | Descrição |
|------|-----------|
| `/wr2` | Boas-vindas (Log in / Cadastro) |
| `/wr2/login` | Login |
| `/wr2/cadastro` | Novo cadastro |
| `/wr2/dashboard` | Dashboard (após login) |
| `/wr2/colaboradores` | Colaboradores |

## Criar usuário de teste

Supabase Dashboard → **Authentication** → **Users** → **Add user** (email + senha)
