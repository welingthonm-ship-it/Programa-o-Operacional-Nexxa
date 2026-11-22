# Programação Operacional · Nexxa

Portal da expedição para planejar o carregamento nas docas: linha do tempo das 7 docas com arrastar e soltar, % separado por carga, docas em uso, sequência de carregamento e agendamento dos motoristas (imprimível).

## Regras do plano
- 290 volumes em 1h20 de carregamento.
- 7 docas das 21h às 05h; 4 docas no resto do dia (docas 5 a 7 só abrem às 21h).
- Cada carga pode começar até 1h antes do horário; rotas marcadas como antecipadas (NEXXA) até 6h antes. Cargas da noite que passariam das 05h são adiantadas.
- Chegada do motorista = meia hora cheia anterior ao início do carregamento.

## Dados
Na área **Dados** do portal:
- **Importar programação** (.xlsx/.csv no formato PROGRAMAÇÃO_23) — troca só os dias que vierem no arquivo.
- **Importar separação** (.xlsx/.csv no formato Separação) — vale o último arquivo.
- **Lançar rota do dia com volumes** e **Incluir na programação** — lançamentos à mão, que continuam valendo depois de novas importações.

## Estrutura
- `index.html` — o portal (HTML + CSS + JS, sem build), no visual Nexxa da Torre de Controle.
- `logo-nexxa.png` — logo do cabeçalho.
- `runtime.js` — liga o portal ao Supabase (tabela `docs`) e atualiza em tempo real.
- `api/config.js` — função da Vercel que entrega `SUPABASE_URL` e `SUPABASE_ANON_KEY` ao navegador.
- `supabase/schema.sql` — cria a tabela `docs`, as políticas e o tempo real.
- `supabase/seed.sql` — dados atuais (programação 22–23/11 e separação).

## Como publicar
1. **Supabase**: crie um projeto, abra o SQL Editor e rode `supabase/schema.sql` e depois `supabase/seed.sql`.
2. **Vercel**: importe este repositório (Framework: *Other*, sem comando de build) e crie as variáveis de ambiente:
   - `SUPABASE_URL` — Project URL (Settings → API)
   - `SUPABASE_ANON_KEY` — chave `anon` pública (Settings → API)
3. Faça o deploy. A cada push na branch `main` a Vercel publica de novo.

> Acesso público: com as políticas do `schema.sql`, qualquer pessoa com o link da Vercel pode ver o plano, importar os arquivos de programação e separação e lançar rotas, sem login. Para restringir, ative login no Supabase e troque `anon` por `authenticated` nas políticas.
