# Premium Eletronics Hub Monorepo

## Estrutura

- `apps/web`: aplicação React + Vite (loja, login, área cliente e admin)
- `apps/api`: base de domínio e `schema.prisma` para futura integração com PostgreSQL
- `packages/contracts`: tipos e contratos compartilhados entre web e api
- `public`: arquivos públicos da loja/admin (logos, favicons, imagens estáticas)

## Scripts principais

```sh
npm run dev
npm run build
npm run test
npm run lint
```

Esses scripts delegam para o workspace web (`@premium/web`).
