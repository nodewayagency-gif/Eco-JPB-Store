# @premium/web-next

Storefront em Next.js App Router com foco em SEO técnico, performance e conversão.

## Scripts

- `npm run dev:next`
- `npm run build:next`

## Variáveis de ambiente

Copie `.env.example` para `.env.local` e configure:

- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_INSTAGRAM_URL`
- `NEXT_PUBLIC_GA4_ID`
- `NEXT_PUBLIC_META_PIXEL_ID`

## Entregas incluídas

- Metadata por página e canonical
- JSON-LD (`Organization`, `WebSite`, `Product`, `BreadcrumbList`)
- `robots.ts` + `sitemap.ts`
- Rotas SEO `/produtos` e `/produtos/[slug]`
- Tracking GA4/Meta para funil (`view_item_list`, `view_item`, `add_to_cart`, `begin_checkout`, `add_payment_info`, `purchase`)

## Checklist de release SEO/Conversão

- `NEXT_PUBLIC_SITE_URL` configurado com domínio final de produção
- `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` configurado (Search Console)
- `NEXT_PUBLIC_GA4_ID` e `NEXT_PUBLIC_META_PIXEL_ID` configurados
- Validar `robots.txt` e `sitemap.xml` em produção
- Validar Rich Results (`Product`, `Breadcrumb`, `Organization`)
- Revisar CWV (LCP, CLS, INP) em mobile e desktop

## Deploy (Vercel)

- Framework preset: Next.js
- Root directory: `apps/web-next`
- Build command: `npm run build --workspaces=false`
- Install command: `npm install --workspaces=false --cache .npm-cache`
