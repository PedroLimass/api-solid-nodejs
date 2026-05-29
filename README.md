# API SOLID — GymPass Style App

API REST construída em **Node.js + TypeScript** para uma aplicação no estilo **GymPass**, onde usuários podem fazer check-ins em academias próximas. Projeto desenvolvido como estudo de **princípios SOLID**, **arquitetura limpa** e **testes automatizados** (TDD).

## Stack

| Camada | Tecnologia |
|--------|------------|
| Runtime | Node.js (ESM) |
| Linguagem | TypeScript 6 |
| HTTP | [Fastify](https://fastify.dev/) 5 |
| ORM | [Prisma](https://www.prisma.io/) 7 (Rust-free) |
| Banco | PostgreSQL 16 (via Docker) |
| Validação | [Zod](https://zod.dev/) |
| Hash de senha | [bcryptjs](https://github.com/dcodeIO/bcrypt.js) |
| Datas | [Day.js](https://day.js.org/) |
| Testes | [Vitest](https://vitest.dev/) |
| Lint | ESLint (`@rocketseat/eslint-config`) |
| Dev tools | `tsx`, `tsup`, `prisma studio` |

## Arquitetura

O projeto segue **Clean Architecture** com separação clara de responsabilidades:

```
src/
├── env/                       # Validação de variáveis de ambiente (Zod)
├── http/
│   ├── controllers/           # Handlers HTTP (Fastify)
│   └── routes.ts              # Definição de rotas
├── lib/
│   └── prisma.ts              # Instância única do PrismaClient + tipos
├── repositories/
│   ├── in-memory/             # Implementações em memória (para testes)
│   ├── prisma/                # Implementações com Prisma
│   ├── users-repository.ts    # Interfaces (contratos)
│   ├── check-ins-repository.ts
│   └── gyms-repository.ts
├── use-cases/
│   ├── errors/                # Erros de domínio
│   ├── factories/             # Factories para injeção de dependência
│   └── *.ts                   # Casos de uso (lógica de negócio)
├── utils/
│   └── get-distance-between-coordinates.ts
├── app.ts                     # Configuração do Fastify
└── server.ts                  # Entry point
```

### Padrões adotados

- **SOLID** — especialmente Dependency Inversion (use cases dependem de interfaces, não de implementações)
- **Repository Pattern** — abstração da camada de dados
- **Factory Pattern** — composição de casos de uso
- **Use Cases** — uma classe por caso de uso, com método `execute()`
- **In-memory repositories** — testes unitários rápidos, sem mocks complexos

## Pré-requisitos

- **Node.js** ≥ 20.19
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
cp .env.exemple .env

# 4. Suba o PostgreSQL
docker compose up -d

# 5. Rode as migrations
npx prisma migrate dev

# 6. Inicie a API em modo desenvolvimento
npm run start:dev
```

A API estará disponível em `http://localhost:3333`.

## Variáveis de ambiente

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `NODE_ENV` | Ambiente de execução | `dev` \| `test` \| `production` |
| `PORT` | Porta HTTP | `3333` |
| `DATABASE_URL` | Conexão PostgreSQL | `postgresql://docker:docker@localhost:5432/apisolid` |
| `JWT_SECRET` | Chave para assinar tokens JWT | string aleatória |

## Scripts disponíveis

| Comando | Descrição |
|---------|-----------|
| `npm run start:dev` | Sobe o servidor em modo watch (`tsx`) |
| `npm start` | Roda o build de produção |
| `npm run build` | Gera o bundle em `build/` (`tsup`) |
| `npm test` | Roda todos os testes |
| `npm run test:watch` | Roda os testes em modo watch |
| `npm run test:coverage` | Gera relatório de cobertura |
| `npm run test:ui` | Abre o UI do Vitest no navegador |
| `npm run studio` | Abre o Prisma Studio para inspecionar o banco |
| `npm run lint` | Roda o ESLint |
| `npm run lint:fix` | Corrige problemas de lint automaticamente |

## Testes

O projeto usa **Vitest** com repositórios in-memory para testes unitários rápidos:

```bash
npm test                # Roda uma vez
npm run test:watch      # Modo watch
npm run test:coverage   # Com cobertura
npm run test:ui         # Interface visual
```

Cada caso de uso tem seu arquivo `.spec.ts` cobrindo o caminho feliz e os de erro.

## Modelo de dados

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│    User     │         │  CheckIn    │         │     Gym     │
├─────────────┤         ├─────────────┤         ├─────────────┤
│ id          │◄────────│ user_id     │         │ id          │
│ name        │         │ gym_id      │────────►│ title       │
│ email       │         │ created_at  │         │ description │
│ password    │         │ validated_at│         │ phone       │
│ created_at  │         └─────────────┘         │ latitude    │
└─────────────┘                                 │ longitude   │
                                                └─────────────┘
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
- [ ] Validação do check-in apenas por administradores
- [ ] Cadastro de academia apenas por administradores

### Requisitos não-funcionais (RNFs)

- [x] Senha criptografada (bcrypt)
- [x] Dados persistidos em PostgreSQL
- [x] Listas paginadas (20 itens por página)
- [ ] Autenticação via JWT

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

Em desenvolvimento. JWT e middlewares de autorização ainda não implementados.

## Licença

ISC
