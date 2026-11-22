/* Runtime mínimo que substitui o ambiente do portal no Claude:
   dash.calc / dash.draw / dash.data / dash.params e claude.use('db'),
   guardando os documentos numa tabela "docs" do Supabase. */
(function () {
  const DATASETS = {
    programacao_dias: 'data/programacao/dias',
    programacao_manual: 'data/programacao/manual',
    separacao_uploads: 'data/separacao/uploads',
    separacao_manual: 'data/separacao/manual',
    ajustes: 'data/ajustes/rotas'
  };
  const PORCOLECAO = Object.fromEntries(Object.entries(DATASETS).map(([k, v]) => [v, k]));
  const state = {};
  for (const k of Object.keys(DATASETS)) state[k] = { status: 'loading', data: null };
  const calcs = {}, draws = {};
  const qs = new URLSearchParams(location.search);
  let params = {};
  for (const k of ['de', 'ate']) if (qs.get(k)) params[k] = qs.get(k);

  let agendado = false;
  function agendar() {
    if (agendado) return; agendado = true;
    requestAnimationFrame(() => { agendado = false; recalcular(); desenharTudo(); });
  }
  function recalcular() {
    const pend = new Set(Object.keys(calcs));
    let andou = true;
    while (andou && pend.size) {
      andou = false;
      for (const n of [...pend]) {
        const d = calcs[n];
        if (d.inputs.some((i) => pend.has(i))) continue;
        const ins = d.inputs.map((i) => state[i] || { status: 'error', data: null });
        if (ins.some((x) => x.status === 'error')) state[n] = { status: 'error', data: null };
        else if (ins.some((x) => x.status !== 'ok')) state[n] = { status: 'loading', data: null };
        else {
          try { state[n] = { status: 'ok', data: d.fn(...ins.map((x) => x.data)) }; }
          catch (e) { console.error('calc ' + n, e); state[n] = { status: 'error', data: null }; }
        }
        pend.delete(n); andou = true;
      }
    }
  }
  function desenhar(nome) {
    const fn = draws[nome]; if (!fn) return;
    document.querySelectorAll('[data-draw="' + nome + '"]').forEach((el) => {
      try { fn(el); } catch (e) { console.error('draw ' + nome, e); }
    });
  }
  function desenharTudo() { for (const n of Object.keys(draws)) desenhar(n); }

  window.dash = {
    colors: ['#2563eb', '#059669', '#7c3aed', '#ea580c', '#0891b2', '#db2777'],
    calc(nome, def) { calcs[nome] = def; state[nome] = { status: 'loading', data: null }; agendar(); },
    draw(nome, fn) { if (fn) { draws[nome] = fn; agendar(); } else desenhar(nome); },
    data(nome) { return state[nome] || { status: 'error', data: null }; },
    params() { return { ...params }; },
    setParams(p) {
      params = { ...params, ...p };
      const u = new URL(location.href);
      for (const [k, v] of Object.entries(params)) u.searchParams.set(k, v);
      history.replaceState(null, '', u);
      agendar();
    },
    setLink(id) { const u = new URL(location.href); u.hash = id; history.replaceState(null, '', u); }
  };

  // ---------- Supabase ----------
  const cfg = window.PC_CONFIG || {};
  let sb = null;
  if (cfg.url && cfg.anonKey && window.supabase) sb = window.supabase.createClient(cfg.url, cfg.anonKey);
  const nomeDoc = (p) => p.slice(p.lastIndexOf('/') + 1);
  const colecaoDe = (p) => p.slice(0, p.lastIndexOf('/'));

  async function carregar(colecao) {
    const ds = PORCOLECAO[colecao]; if (!ds) return;
    if (!sb) { state[ds] = { status: 'error', data: null }; agendar(); return; }
    const { data, error } = await sb.from('docs').select('path,data').eq('colecao', colecao);
    if (error) { console.error(error); state[ds] = { status: 'error', data: null }; }
    else state[ds] = { status: 'ok', data: data.map((r) => ({ ...r.data, id: nomeDoc(r.path) })) };
    agendar();
  }
  async function carregarTudo() { await Promise.all(Object.values(DATASETS).map(carregar)); }

  const db = {
    doc(path) {
      return {
        async set(dados) {
          const { error } = await sb.from('docs').upsert({ path, colecao: colecaoDe(path), data: dados, updated_at: new Date().toISOString() });
          if (error) throw error;
          await carregar(colecaoDe(path));
        },
        async delete() {
          const { error } = await sb.from('docs').delete().eq('path', path);
          if (error) throw error;
          await carregar(colecaoDe(path));
        }
      };
    }
  };
  window.claude = { use: async (k) => (k === 'db' && sb ? db : null) };

  if (!sb) {
    document.addEventListener('DOMContentLoaded', () => {
      const p = document.getElementById('pc-sem-config'); if (p) p.hidden = false;
    });
  }
  carregarTudo();
  if (sb) {
    sb.channel('docs-mudancas')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'docs' }, (m) => {
        const c = (m.new && m.new.colecao) || (m.old && m.old.colecao);
        if (c) carregar(c); else carregarTudo();
      })
      .subscribe();
    setInterval(carregarTudo, 60000);
  }
  window.addEventListener('resize', () => agendar());
})();
