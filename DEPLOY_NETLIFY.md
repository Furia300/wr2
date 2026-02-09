# Deploy WR2 no Netlify (produção)

## 1. Enviar o código para o GitHub

No terminal, na pasta do projeto (WR2):

```bash
# Se ainda não inicializou o Git
git init

# Adicionar o repositório remoto (seu repo)
git remote add origin https://github.com/appsitenookweb-bit/grupowr2-netlify-proxy.git

# Adicionar todos os arquivos ( .env.local fica de fora pelo .gitignore )
git add .
git commit -m "WR2 Next.js - painel, cadastro, admin, Supabase"

# Enviar (substitui o conteúdo atual do repo pela pasta WR2)
git branch -M main
git push -u origin main --force
```

> **Atenção:** `--force` sobrescreve o que está no repo. Se quiser manter o arquivo `_redirects` que já existe no repo, antes faça um `git pull origin main --allow-unrelated-histories`, ajuste se precisar, e depois `git push`.

---

## 2. Configurar o site no Netlify

1. Acesse [app.netlify.com](https://app.netlify.com) e faça login.
2. **Add new site** → **Import an existing project**.
3. Conecte ao **GitHub** e escolha o repositório **appsitenookweb-bit/grupowr2-netlify-proxy**.
4. **Build settings** (o Netlify deve preencher automaticamente para Next.js):
   - **Build command:** `npm run build`
   - **Publish directory:** deixe em branco (o adapter Next.js cuida disso)
   - **Base directory:** em branco
5. Clique em **Add environment variables** e cadastre:

   | Nome                         | Valor                    | Sensível |
   |-----------------------------|--------------------------|----------|
   | `NEXT_PUBLIC_SUPABASE_URL`  | `https://ecxgmzylatyacpgggldl.supabase.co` | Não |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | (sua chave **anon** do Supabase) | Não |
   | `SUPABASE_SERVICE_ROLE_KEY` | (sua chave **service_role** do Supabase) | **Sim** |

   Use os mesmos valores do seu `.env.local` (Dashboard do Supabase → Settings → API).

6. **Deploy site**.

---

## 3. Depois do deploy

- **URL do site:** algo como `https://nome-aleatorio.netlify.app` (você pode alterar em **Site configuration** → **Domain management**).
- **Painel WR2:** `https://seu-site.netlify.app/wr2`
- **Criar Super Admin (primeira vez):** `https://seu-site.netlify.app/wr2/setup`
- **Login:** `https://seu-site.netlify.app/wr2/login`

---

## 4. Redirecionar o site antigo (Bubble) para o novo (opcional)

Se o site antigo está em outro domínio (ex.: Bubble) e você quer que certas URLs caiam no WR2:

1. No Netlify: **Site configuration** → **Redirects**.
2. Adicione uma regra, por exemplo:
   - **From:** `/wr2/*` ou o path que você usava no Bubble
   - **To:** `/wr2/:splat` (ou a URL do app WR2)
   - **Status:** 200 (rewrite) ou 301 (redirect permanente).

Se o site antigo está em outro host (Bubble), configure o redirect no domínio/ DNS ou na própria Bubble apontando para a nova URL do Netlify.

---

## 5. Resumo

| O quê              | Onde |
|--------------------|------|
| Código             | GitHub: `appsitenookweb-bit/grupowr2-netlify-proxy` |
| Build / deploy     | Netlify (conectado ao repo acima) |
| Variáveis de ambiente | Netlify → Site → Environment variables |
| Supabase           | Mesmo projeto que você já usa no `.env.local` |

Se algo falhar no build, veja o **Deploy log** no Netlify (aba **Deploys** → último deploy → **View deploy log**).
