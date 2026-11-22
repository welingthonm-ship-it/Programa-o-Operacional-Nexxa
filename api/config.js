// Entrega ao navegador a URL e a chave pública (publishable) do Supabase.
// Usa as variáveis de ambiente da Vercel, se existirem; senão, o projeto "Programação Operacional".
// A chave publishable é pública por definição (o acesso é controlado pelas políticas da tabela).
module.exports = (req, res) => {
  res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  const cfg = {
    url: process.env.SUPABASE_URL || 'https://ailazwtsqtqotaovldua.supabase.co',
    anonKey: process.env.SUPABASE_ANON_KEY || 'sb_publishable_6DdgeuBHLMrb9ONIr-GYJg_IDsI3jqB'
  };
  res.end('window.PC_CONFIG = ' + JSON.stringify(cfg) + ';');
};
