# Wise Sales Mini E-commerce

Entrega fullstack do teste técnico da Wise Sales, construída com foco em uma implementação mais próxima de produção: backend em Python com camadas bem separadas, regras de negócio explícitas para carrinho/cupons e frontend React organizado por contexto, hooks e componentes reutilizáveis.

## Visão geral

A aplicação implementa um mini e-commerce com:

- catálogo de produtos com filtro por categoria;
- carrinho com adição, atualização, remoção e cálculo de subtotal/total;
- aplicação de cupons percentuais e fixos com validação de expiração e status;
- feedback visual nas interações do frontend;
- testes automatizados cobrindo fluxos críticos de backend e frontend;
- Docker Compose para subir banco, API e SPA juntos.

## Stack escolhida
- **FastAPI**: boa ergonomia para APIs, validação nativa e documentação automática.
- **psycopg2 com raw SQL**: atende ao requisito do teste mantendo controle explícito das queries.
- **Arquitetura em camadas**: `routes -> services -> repositories` para isolar HTTP, regras de negócio e persistência.
- **Alembic**: versionamento de schema.

### Frontend
- **React + Vite**: experiência moderna, rápida e simples de manter.
- **Context API + reducer**: estado global do carrinho com transições previsíveis.
- **Tailwind CSS**: velocidade de implementação com consistência visual.
- **Vitest + Testing Library**: testes focados no comportamento do usuário.

## Estrutura do projeto
.
├── backend/
│   ├── alembic/
│   ├── src/
│   │   ├── repositories/
│   │   ├── routes/
│   │   └── services/
│   └── tests/
├── frontend/
│   └── src/
│       ├── api/
│       ├── components/
│       ├── context/
│       ├── hooks/
│       ├── pages/
│       └── utils/
├── docker-compose.yml
└── seed.sql

## Funcionalidades implementadas
### Backend
- `GET /products`: lista produtos, com suporte a `?category=`.
- `GET /products/{id}`: retorna um produto específico.
- `GET /cart`: retorna itens, subtotal, desconto, total e cupom aplicado.
- `POST /cart/items`: adiciona produto ao carrinho validando estoque.
- `PATCH /cart/items/{id}`: atualiza quantidade ou remove o item quando `quantity = 0`.
- `DELETE /cart/items/{id}`: remove um item do carrinho.
- `POST /cart/coupon`: valida e aplica cupom ativo/não expirado.
- tratamento consistente de erros com status `400`, `404` e `409`

## Funcionalidades implementadas

### Backend
- `GET /products`: lista produtos, com suporte a `?category=`.
- `GET /products/{id}`: retorna um produto específico.
- `GET /cart`: retorna itens, subtotal, desconto, total e cupom aplicado.
- `POST /cart/items`: adiciona produto ao carrinho validando estoque.
- `PATCH /cart/items/{id}`: atualiza quantidade ou remove o item quando `quantity = 0`.
- `DELETE /cart/items/{id}`: remove um item do carrinho.
- `POST /cart/coupon`: valida e aplica cupom ativo/não expirado.
- tratamento consistente de erros com status `400`, `404` e `409`.

### Frontend
- catálogo responsivo com cards de produto e indicação de indisponibilidade;
- filtro por categoria consumindo a API;
- carrinho com controles de quantidade, remoção e resumo financeiro;
- feedback de sucesso/erro e loading por ação;
- estado global compartilhado entre páginas com Context API.

## Como rodar

### Pré-requisitos
- Docker + Docker Compose
- Python 3.11+
- Node.js 18+

### Ambiente
```bash
cp .env.example .env
```

### Subir tudo via Docker Compose
```bash
docker compose up --build
```

Serviços disponíveis:
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:8000`
- PostgreSQL: `localhost:5432`

## Execução local sem Docker
### Backend
```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn src.main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Testes e qualidade

### Backend
```bash
cd backend
ruff check .
pytest --cov=src --cov-report=term-missing
```