# portal-petronect-comportamento-usuario

Protótipo funcional para capturar, armazenar e analisar o comportamento dos usuários no Portal Petronect.

## Autores

<a href="https://github.com/sarahscampos/portal-petronect-comportamento-usuario/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=sarahscampos/portal-petronect-comportamento-usuario" />
</a>

## Estrutura

```text
.
├── apps/
│   ├── frontend/          # React + Vite + TypeScript + Tailwind + shadcn/ui
│   └── backend/           # Node.js + Express local + handlers AWS Lambda
├── docs/
│   └── prototypes/        # HTML isolado da primeira demo
├── scripts/               # atalhos PowerShell para subir cada app
├── package.json           # monorepo npm workspaces
└── README.md
```

## Pré-requisitos

- Node.js 22+
- npm (incluso no Node.js)

## Como executar

Na raiz do repositório:

```powershell
npm install
Copy-Item apps\backend\.env.example apps\backend\.env
Copy-Item apps\frontend\.env.example apps\frontend\.env
npm run dev
```

Serviços:

| App | URL |
|---|---|
| Frontend | http://localhost:5173 |
| Backend | http://localhost:3001 |
| Health check | http://localhost:3001/health |

Para subir cada parte isoladamente:

```powershell
npm run dev:backend
npm run dev:frontend
```

Ou use `scripts/start-backend.ps1` e `scripts/start-frontend.ps1`.

## Fluxo integrado

1. Login envia CNPJ/cargo para `POST /auth/login`.
2. O backend devolve `userId`, `supplierId`, CNPJ mascarado e cargo.
3. O frontend inicia uma sessão via `POST /session/start`.
4. Navegação e cliques usam `POST /events`.
5. O primeiro clique de cada página é registrado uma vez por sessão/página.
6. Heartbeats são enviados enquanto a aba está visível.
7. Dashboard usa `GET /analytics/dashboard`.
8. Detalhe do fornecedor usa `GET /analytics/suppliers/:supplierId`.
9. Logout usa `POST /session/end`.

## Rotas do frontend

- `/login`
- `/training`
- `/tools`
- `/dashboard`
- `/dashboard/supplier/:supplierId`

## Scripts úteis

```powershell
npm run lint
npm run lint:fix
npm run typecheck
npm run build
npm run reset:local
```

## Dados locais

Na primeira execução do backend é criado `apps/backend/.data/db.json`, com 8 fornecedores fictícios. O CNPJ puro não é persistido.

Para recriar a base:

```powershell
npm run reset:local
```

## Protótipo HTML

A demo monolítica original permanece em `docs/prototypes/petronect_mvp_demo.html` e não faz parte do fluxo integrado.
