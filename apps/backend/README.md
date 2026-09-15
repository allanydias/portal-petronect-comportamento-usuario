# Petronect Behavior Backend

Backend funcional para o MVP de identificação e comportamento de fornecedores.

## O que está pronto

- Node.js + TypeScript.
- API local com Express para desenvolvimento.
- Handlers compatíveis com AWS Lambda/API Gateway.
- `serverless.yml` para AWS, usando Open Serverless (`osls`), CLI MIT e sem dependência do Serverless Dashboard.
- DynamoDB com tabelas Users, Sessions, Events e SupplierProfiles.
- Modo local persistido em `.data/db.json`.
- 8 fornecedores fictícios gerados automaticamente.
- Validação de CNPJ e payloads com Zod.
- CNPJ puro não é armazenado.
- `supplierId` é derivado por HMAC SHA-256 + salt.
- Primeiro clique deduplicado por página/sessão.
- Score de interesse.
- Frequência 7/30 dias.
- Tempo total e por seção.
- Último acesso/ação.
- Palavras pesquisadas.
- Motor de recomendações por regras.

## Estrutura

```text
apps/backend/
├── scripts/
│   └── reset-local.ts
├── src/
│   ├── handlers/
│   ├── mock/
│   ├── repositories/
│   ├── schemas/
│   ├── services/
│   ├── types/
│   ├── utils/
│   └── local.ts
├── .env.example
├── package.json
├── serverless.yml
└── tsconfig.json
```

## Executar localmente

Pré-requisito: Node.js 22+.

No terminal, dentro da pasta:

```powershell
npm install
Copy-Item .env.example .env
npm run dev
```

Se estiver usando Prompt de Comando (cmd), em vez de PowerShell:

```cmd
copy .env.example .env
```

A API ficará disponível em:

```text
http://localhost:3001
```

Teste no navegador:

```text
http://localhost:3001/health
http://localhost:3001/analytics/dashboard
http://localhost:3001/analytics/suppliers
```

## Fluxo recomendado para o frontend

### 1. Login

`POST /auth/login`

```json
{
  "cnpj": "12.345.678/0001-95",
  "role": "Comercial"
}
```

Resposta:

```json
{
  "userId": "usr_...",
  "supplierId": "sup_...",
  "cnpjMasked": "12.***.***/0001-**",
  "role": "Comercial"
}
```

### 2. Iniciar sessão

`POST /session/start`

```json
{
  "userId": "usr_...",
  "supplierId": "sup_..."
}
```

### 3. Registrar evento

`POST /events`

```json
{
  "sessionId": "sess_...",
  "userId": "usr_...",
  "supplierId": "sup_...",
  "eventName": "guide_open",
  "page": "training",
  "section": "Leilões",
  "itemId": "guia-leilao",
  "metadata": {
    "interest": "Leilões"
  }
}
```

### 4. Ver dashboard

`GET /analytics/dashboard`

### 5. Ver fornecedor

`GET /analytics/suppliers/{supplierId}`

### 6. Recomendação

`GET /recommendations/{supplierId}`

### 7. Encerrar sessão

`POST /session/end`

```json
{
  "sessionId": "sess_..."
}
```

## Endpoints

| Método | Endpoint | Função |
|---|---|---|
| GET | `/health` | Status da API |
| POST | `/auth/login` | Identifica fornecedor sem guardar CNPJ puro |
| POST | `/session/start` | Inicia sessão |
| POST | `/session/end` | Finaliza sessão |
| POST | `/events` | Registra evento |
| GET | `/events` | Consulta eventos da demo |
| GET | `/analytics/dashboard` | Métricas agregadas |
| GET | `/analytics/suppliers` | Lista perfis comportamentais |
| GET | `/analytics/suppliers/:supplierId` | Detalhes + jornada |
| GET | `/recommendations/:supplierId` | Recomendação explicável |
| POST | `/admin/reset` | Reinicia dados locais |

## Dados locais

Na primeira execução, é criado automaticamente:

```text
.data/db.json
```

Ele contém dados fictícios e persiste seus cliques entre reinicializações.

Para voltar ao estado original:

```powershell
npm run reset:local
```

## AWS

Configure credenciais AWS e um salt seguro:

```powershell
$env:SUPPLIER_HASH_SALT="um-segredo-forte"
npm run deploy:aws
```

O `serverless.yml` é compatível com Open Serverless (`osls`) e provisiona:

- API Gateway HTTP API
- AWS Lambda
- DynamoDB
- IAM mínimo necessário

O backend usa `DATA_MODE=dynamo` automaticamente quando implantado pela configuração Serverless.

## LGPD — pontos para produção

Este MVP evita armazenar o CNPJ puro nos eventos e usa identificador pseudonimizado. Isso não encerra as obrigações de LGPD. Antes de produção, incluir:

- definição formal de base legal e finalidade;
- aviso de privacidade/transparência;
- política de retenção e descarte;
- controles de acesso ao dashboard;
- criptografia e gestão de segredos;
- trilha de auditoria;
- minimização de metadados;
- gestão de direitos do titular quando aplicável;
- avaliação de impacto e governança com Jurídico/DPO;
- não incluir dados pessoais desnecessários em `metadata`.

## Azure equivalente

- AWS Lambda → Azure Functions
- API Gateway → Azure API Management
- DynamoDB → Azure Cosmos DB
- CloudWatch → Azure Monitor / Application Insights

A camada de serviços e regras pode ser reaproveitada. O principal ponto de troca é o repositório.
