// Entrega ao navegador a URL e a chave pública (anon) do Supabase,
// lidas das variáveis de ambiente do projeto na Vercel.
module.exports = (req, res) => {
  res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  const cfg = { url: process.env.SUPABASE_URL || '', anonKey: process.env.SUPABASE_ANON_KEY || '' };
  res.end('window.PC_CONFIG = ' + JSON.stringify(cfg) + ';');
};
