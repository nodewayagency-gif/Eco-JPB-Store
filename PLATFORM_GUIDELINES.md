# Diretrizes da Plataforma Eco-JPB-Store

Este documento serve como referência para a arquitetura, segurança e padrões de desenvolvimento da plataforma. Todas as IAs e desenvolvedores devem seguir estas diretrizes.

## 🏛️ Arquitetura de Dados

### 1. Acesso ao Supabase (Modelo Proxy Seguro)
- **NUNCA** utilize o cliente do Supabase no Frontend (lado do cliente).
- **VALIDACÕES NA PLATAFORMA**: Não utilizamos Row Level Security (RLS) no banco de dados. Todas as validações de permissão, regras de negócio e integridade de dados devem ser feitas na camada da aplicação (Next.js).
- **ADMIN CLIENT**: Utilize exclusivamente o `supabaseAdmin` (localizado em `@/lib/supabase`) dentro de Server Components ou Server Actions.
- **SERVICE_ROLE_KEY**: Esta chave mestra é utilizada no servidor para ignorar o RLS e permitir que a plataforma controle o acesso. Nunca a exponha no frontend.

### 2. Identificadores (IDs)
- **Modelos de Negócio**: Devem usar IDs **Inteiros Sequenciais** (`autoincrement`) para facilitar a referência humana (ex: Pedido #123, Produto #45).
- **Segurança e Usuários**: O modelo `User` e tabelas de autenticação devem manter IDs do tipo **String (UUID/CUID)** para compatibilidade com o Supabase Auth e segurança.

---

## 🛡️ Segurança

### 1. Cabeçalhos de Resposta (HTTP Headers)
- A plataforma utiliza **Content Security Policy (CSP)** rigorosa para prevenir XSS.
- **HSTS** está ativo para garantir conexões apenas via HTTPS.
- Novas integrações de scripts externos devem ser adicionadas à lista de permissões no `next.config.mjs`.

### 2. Gestão de Permissões
- As permissões de acesso (ADMIN, OPERATOR) são validadas na plataforma através de e-mails configurados em variáveis de ambiente (`ADMIN_EMAILS`, `OPERATOR_EMAILS`).
- Verifique sempre a sessão do usuário (`auth()`) antes de executar operações sensíveis em Server Actions.

---

## 🚀 Padrões de Desenvolvimento

### 1. Server Actions
- Utilize Server Actions para todas as operações de escrita (POST, PUT, DELETE).
- Sempre valide os dados de entrada (preferencialmente com bibliotecas como `Zod`) antes de persistir no banco.

### 2. Estoque e Auditoria
- Toda alteração de estoque deve gerar um registro na tabela `InventoryLog`, detalhando o tipo de alteração (VENDA, REPOSIÇÃO, AJUSTE), a quantidade e o motivo.

### 3. Variáveis de Ambiente
- Consulte sempre o `.env.example` para garantir que todas as chaves necessárias (NextAuth, Supabase, Gateways) estão configuradas corretamente.

---

**Nota para IAs:** Ao gerar código para este projeto, certifique-se de que a lógica de segurança e validação esteja presente no arquivo da Action/Componente, respeitando a ausência de RLS no banco de dados.
