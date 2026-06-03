# API SOLID — GymPass Style App

API REST construída em **Node.js + TypeScript** para uma aplicação no estilo **GymPass**, onde usuários podem fazer check-ins em academias próximas. Projeto desenvolvido como estudo de **princípios SOLID**, **arquitetura limpa**, **autenticação JWT com RBAC** e **testes automatizados** (unitários + e2e).

## Stack

| Camada | Tecnologia |
|--------|------------|
| Runtime | Node.js (ESM) |
| Linguagem | TypeScript 6 |
| HTTP | [Fastify](https://fastify.dev/) 5 |
| Autenticação | [@fastify/jwt](https://github.com/fastify/fastify-jwt) + [@fastify/cookie](https://github.com/fastify/fastify-cookie) |
| ORM | [Prisma](https://www.prisma.io/) 7 (Rust-free, adapter PG) |
| Banco | PostgreSQL (via Docker) |
| Validação | [Zod](https://zod.dev/) |
| Hash de senha | [bcryptjs](https://github.com/dcodeIO/bcrypt.js) |
| Datas | [Day.js](https://day.js.org/) |
| Testes | [Vitest](https://vitest.dev/) + [Supertest](https://github.com/ladjs/supertest) (e2e) |
| Lint | ESLint (`@rocketseat/eslint-config`) |
| CI | GitHub Actions |
| Dev tools | `tsx`, `tsup`, `prisma studio` |

## Arquitetura

O projeto segue **Clean Architecture** com separação clara de responsabilidades:

```
src/
├── @types/
│   └── fastify-jwt.d.ts        # Tipagem do payload do JWT (sub, role)
├── env/                        # Validação de variáveis de ambiente (Zod)
├── http/
│   ├── controllers/
│   │   ├── users/              # register, authenticate, refresh, profile (+ rotas)
│   │   ├── gyms/               # create, search, nearby (+ rotas)
│   │   └── check-ins/          # create, history, metrics, validate (+ rotas)
│   ├── middlewares/
│   │   ├── verify-jwt.ts       # Garante usuário autenticado
│   │   └── verify-user-role.ts # Garante role (ex.: ADMIN)
│   └── e2e-setup.ts            # Setup global dos testes e2e
├── lib/
│   └── prisma.ts               # Instância única do PrismaClient
├── repositories/
│   ├── in-memory/              # Implementações em memória (para testes)
│   ├── prisma/                 # Implementações com Prisma
│   ├── users-repository.ts     # Interfaces (contratos)
│   ├── check-ins-repository.ts
│   └── gyms-repository.ts
├── use-cases/
│   ├── errors/                 # Erros de domínio
│   ├── factories/              # Factories para injeção de dependência
│   └── *.ts                    # Casos de uso (lógica de negócio)
├── utils/
│   ├── get-distance-between-coordinates.ts
│   └── test/                   # Helpers de teste (autenticação e2e)
├── app.ts                      # Configuração do Fastify (plugins + rotas)
└── server.ts                   # Entry point
```

### Padrões adotados

- **SOLID** — especialmente Dependency Inversion (use cases dependem de interfaces, não de implementações)
- **Repository Pattern** — abstração da camada de dados
- **Factory Pattern** — composição de casos de uso
- **Use Cases** — uma classe por caso de uso, com método `execute()`
- **In-memory repositories** — testes unitários rápidos, sem mocks complexos
- **RBAC** — controle de acesso por papel (`ADMIN` / `MEMBER`) via middleware

## Pré-requisitos

- **Node.js** ≥ 22.12
- **Docker** e **Docker Compose**
- **npm** (ou pnpm / yarn)

## Setup

```bash
# 1. Clone o repositório
git clone https://github.com/PedroLimass/api-solid-nodejs.git
cd api-solid-nodejs

# 2. Instale as dependências (o postinstall roda prisma generate)
npm install

# 3. Configure as variáveis de ambiente
cp .env.example .env

# 4. Suba o PostgreSQL
docker compose up -d

# 5. Rode as migrations
npm run db:migrate

# 6. Inicie a API em modo desenvolvimento
npm run start:dev
```

A API estará disponível em `http://localhost:3333`.

> **Atenção:** o nome do banco no `docker-compose.yml` (`POSTGRESQL_DATABASE=ignitenode03`) precisa coincidir com o nome usado na `DATABASE_URL` do seu `.env`. Ajuste um dos dois antes de rodar as migrations (ex.: usar `apisolid` em ambos).

## Variáveis de ambiente

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `NODE_ENV` | Ambiente de execução | `dev` \| `test` \| `production` |
| `PORT` | Porta HTTP (opcional, default `3333`) | `3333` |
| `DATABASE_URL` | Conexão PostgreSQL | `postgresql://docker:docker@localhost:5432/apisolid` |
| `JWT_SECRET` | Chave para assinar tokens JWT | string aleatória |

## Scripts disponíveis

| Comando | Descrição |
|---------|-----------|
| `npm run start:dev` | Sobe o servidor em modo watch (`tsx`) |
| `npm start` | Roda o build de produção |
| `npm run build` | Gera o bundle em `build/` (`tsup`) |
| `npm test` | Roda os testes unitários |
| `npm run test:watch` | Roda os testes unitários em modo watch |
| `npm run test:coverage` | Gera relatório de cobertura |
| `npm run test:ui` | Abre o UI do Vitest no navegador |
| `npm run test:e2e` | Roda os testes end-to-end |
| `npm run test:e2e:watch` | Roda os testes e2e em modo watch |
| `npm run db:generate` | Gera o Prisma Client |
| `npm run db:migrate` | Aplica as migrations (`prisma migrate dev`) |
| `npm run db:studio` | Abre o Prisma Studio para inspecionar o banco |
| `npm run lint` | Roda o ESLint |
| `npm run lint:fix` | Corrige problemas de lint automaticamente |

## Autenticação

A API usa **JWT** com dois tokens:

- **Access token** — retornado no corpo da resposta (`{ token }`) ao autenticar; contém o `role` do usuário e `sub` (id). Deve ser enviado no header `Authorization: Bearer <token>`. Expira em 7 dias.
- **Refresh token** — armazenado em cookie HTTP-only `refreshToken`. A rota `PATCH /token/refresh` lê apenas o cookie e emite um novo access token.

O controle de acesso por papel é feito pelo middleware `verifyUserRole`, aplicado nas rotas que exigem `ADMIN`.

## Endpoints

| Método | Path | Autenticação | Role |
|--------|------|--------------|------|
| `POST` | `/users` | — | — |
| `POST` | `/sessions` | — | — |
| `PATCH` | `/token/refresh` | Cookie `refreshToken` | — |
| `GET` | `/me` | Bearer JWT | — |
| `GET` | `/gyms/search` | Bearer JWT | — |
| `GET` | `/gyms/nearby` | Bearer JWT | — |
| `POST` | `/gyms` | Bearer JWT | — |
| `GET` | `/check-ins/history` | Bearer JWT | — |
| `GET` | `/check-ins/metrics` | Bearer JWT | — |
| `POST` | `/gyms/:gymId/check-ins` | Bearer JWT | — |
| `PATCH` | `/check-ins/:checkInId/validate` | Bearer JWT | `ADMIN` |

## Testes

O projeto separa testes **unitários** (use cases, com repositórios in-memory) de testes **end-to-end** (rotas HTTP, com Supertest e banco real).

```bash
# Unitários — rápidos, sem banco
npm test
npm run test:watch
npm run test:coverage
npm run test:ui

# End-to-end — exigem PostgreSQL rodando
npm run test:e2e
npm run test:e2e:watch
```

- **Unitários** (`vite.config.ts`): rodam em ambiente `node`, excluindo os specs de `http/`. Cada caso de uso tem seu `.spec.ts` cobrindo caminho feliz e erros.
- **E2E** (`vitest.config.e2e.ts`): incluem apenas `src/http/**/*.spec.ts`, rodam serialmente (`maxWorkers: 1`) e fazem `TRUNCATE` das tabelas antes de cada teste (`src/http/e2e-setup.ts`). O helper `create-and-authenticate-user` cria e autentica um usuário (com opção de torná-lo `ADMIN`).

## CI

Workflows em `.github/workflows/`:

| Workflow | Trigger | O que faz |
|----------|---------|-----------|
| `run-unit-tests.yml` | `push` | `npm ci` + `npm test` (testes unitários) |
| `run-e2e-tests.yml` | `pull_request` | Sobe PostgreSQL como service e roda `npm run test:e2e` |

## Modelo de dados

```
┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│    User      │         │   CheckIn    │         │     Gym      │
├──────────────┤         ├──────────────┤         ├──────────────┤
│ id           │◄────────│ user_id      │         │ id           │
│ name         │         │ gym_id       │────────►│ title        │
│ email        │         │ created_at   │         │ description  │
│ password_hash│         │ validated_at │         │ phone        │
│ role         │         └──────────────┘         │ latitude     │
│ created_at   │                                  │ longitude    │
└──────────────┘                                  └──────────────┘

Role (enum): ADMIN | MEMBER
```

## Especificação funcional

### Requisitos funcionais (RFs)

- [x] Cadastro de usuário
- [x] Autenticação de usuário
- [x] Obter perfil do usuário logado
- [x] Obter número de check-ins do usuário logado
- [x] Histórico de check-ins do usuário
- [x] Buscar academias próximas (até 10km)
- [x] Buscar academias pelo nome
- [x] Realizar check-in em uma academia
- [x] Validar check-in de um usuário
- [x] Cadastrar academia

### Regras de negócio (RNs)

- [x] E-mail não pode ser duplicado
- [x] Apenas 1 check-in por usuário por dia
- [x] Check-in apenas se usuário estiver a menos de 100m da academia
- [x] Validação do check-in até 20 minutos após criado
- [x] Validação do check-in apenas por administradores
- [ ] Cadastro de academia apenas por administradores

### Requisitos não-funcionais (RNFs)

- [x] Senha criptografada (bcrypt)
- [x] Dados persistidos em PostgreSQL
- [x] Listas paginadas (20 itens por página)
- [x] Autenticação via JWT (access token + refresh token em cookie)

## Casos de uso implementados

| Use Case | Descrição |
|----------|-----------|
| `RegisterUseCase` | Cadastra novo usuário |
| `AuthenticateUseCase` | Autentica com email e senha |
| `GetUserProfileUseCase` | Retorna dados do usuário |
| `GetUserMetricsUseCase` | Total de check-ins do usuário |
| `CheckInUseCase` | Realiza check-in numa academia |
| `ValidateCheckInUseCase` | Valida um check-in (admin) |
| `FetchUserCheckInsHistoryUseCase` | Histórico paginado de check-ins |
| `CreateGymUseCase` | Cadastra nova academia |
| `SearchGymsUseCase` | Busca academias por nome |
| `FetchNearbyGymsUseCase` | Lista academias num raio de 10km |

## Status

Funcional, com autenticação JWT e RBAC implementados. Pendência conhecida: restringir o cadastro de academia (`POST /gyms`) a administradores.

## Licença

ISC
