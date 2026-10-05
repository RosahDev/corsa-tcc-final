# Corsa

Marketplace de fotografia automotiva construido com Next.js 16, PostgreSQL e SQL puro.

## Requisitos

- Node.js 20+
- PostgreSQL local ou um projeto Supabase
- npm

## Configuracao rapida

1. Defina a sua string de conexao do banco em `.env`.
2. Instale as dependencias e prepare o banco:

```bash
cp .env.example .env
npm install
npm run setup
npm run dev
```

> Se o banco for do Supabase, basta preencher `DATABASE_URL` com a URL do projeto e rodar os comandos normalmente. O projeto nao depende de Docker.

O comando `setup` valida a conexao com o banco, aplica migrations e popula dados de demonstracao.

## Deploy na Vercel

A aplicacao precisa de um PostgreSQL acessivel pela internet; o PostgreSQL do
`docker-compose.yml` e apenas para desenvolvimento local. Crie um banco gerenciado
(por exemplo, no Supabase) e, em **Vercel > Settings > Environment Variables**,
configure para Production:

- `DATABASE_URL`: string de conexao do banco gerenciado (no Supabase, use a
  string de conexao do pooler para o deploy serverless).
- `SESSION_SECRET`: segredo aleatorio e privado para assinar sessoes e o carrinho.
- `NEXT_PUBLIC_SITE_URL`: URL publica do site, por exemplo `https://seu-dominio.vercel.app`.

Depois de adicionar ou alterar variaveis, faca um novo deploy. Antes de abrir o
site pela primeira vez, aplique as migrations no banco de producao com
`npm run db:migrate`, usando localmente a mesma `DATABASE_URL` configurada na
Vercel. **Nao execute `npm run setup` em producao**: esse comando tambem roda o
seed de demonstracao, que limpa tabelas existentes e insere dados de exemplo.

## Scripts

| Comando | Descricao |
|---------|-----------|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de producao |
| `npm run lint` | ESLint |
| `npm run db:up` | Verifica se o banco esta disponivel |
| `npm run db:down` | Mensagem para encerrar servico local |
| `npm run db:migrate` | Aplica migrations SQL |
| `npm run db:seed` | Popula dados demo |
| `npm run setup` | db:up + migrate + seed |

## Contas demo (apos seed)

| Perfil | E-mail | Senha |
|--------|--------|-------|
| Comprador | felipe@corsa.dev | senha123 |
| Fotografo | marcos@corsa.dev | senha123 |
| Fotografo | ana@corsa.dev | senha123 |
| Fotografo | ricardo@corsa.dev | senha123 |

## Estrutura

- `app/` rotas App Router (publico, auth, comprador, studio)
- `lib/queries/` SQL parametrizado
- `lib/actions/` Server Actions
- `storage/` originais e previews (gitignored)
- `lib/db/migrations/` schema versionado

## Variaveis de ambiente

```env
# PostgreSQL local
DATABASE_URL=postgresql://corsa:corsa@localhost:5432/corsa

# Ou Supabase
# DATABASE_URL=postgresql://postgres:[SENHA]@db.[PROJETO_ID].supabase.co:5432/postgres?sslmode=require

SESSION_SECRET=string-aleatoria-longa
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## Supabase

Se preferir usar um projeto Supabase, crie um projeto no painel e copie a string de conexão da aba "Database". Como a app usa apenas a variável `DATABASE_URL`, ela funciona igual com PostgreSQL local ou com o Supabase.
