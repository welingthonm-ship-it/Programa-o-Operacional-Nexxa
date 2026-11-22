-- Tabela única de documentos do portal (mesma estrutura de caminhos do portal no Claude):
--   data/programacao/dias/{AAAA-MM-DD}   programação importada por dia
--   data/programacao/manual/{ROTA_DATA}  programação lançada à mão
--   data/separacao/uploads/{id}          arquivos de separação importados
--   data/separacao/manual/{ROTA_DATA}    rotas/volumes lançados à mão
--   data/ajustes/rotas/{ROTA_DATA}       barras arrastadas na linha do tempo
create table if not exists public.docs (
  path        text primary key,
  colecao     text not null,
  data        jsonb not null,
  updated_at  timestamptz not null default now()
);
create index if not exists docs_colecao_idx on public.docs (colecao);

alter table public.docs enable row level security;

-- Projetos novos do Supabase não dão acesso às tabelas para a chave pública: libera aqui.
grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on table public.docs to anon, authenticated;

-- Acesso aberto com a chave pública (anon): qualquer pessoa com o link lê e edita.
-- Para restringir, troque "anon" por "authenticated" e ative login no Supabase.
drop policy if exists "docs_select" on public.docs;
drop policy if exists "docs_insert" on public.docs;
drop policy if exists "docs_update" on public.docs;
drop policy if exists "docs_delete" on public.docs;
create policy "docs_select" on public.docs for select to anon, authenticated using (true);
create policy "docs_insert" on public.docs for insert to anon, authenticated with check (true);
create policy "docs_update" on public.docs for update to anon, authenticated using (true) with check (true);
create policy "docs_delete" on public.docs for delete to anon, authenticated using (true);

-- Atualização em tempo real entre quem estiver com o portal aberto.
do $$ begin
  alter publication supabase_realtime add table public.docs;
exception when duplicate_object then null; end $$;
