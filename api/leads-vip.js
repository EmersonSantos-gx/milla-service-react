import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const isAdmin = (req) =>
  req.headers['x-admin-token'] &&
  req.headers['x-admin-token'] === process.env.ADMIN_TOKEN;

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { contato, origem = 'clube_vip' } = req.body || {};
      const contatoLimpo = String(contato || '').trim();

      if (contatoLimpo.length < 5) {
        return res.status(400).json({ error: 'Informe um WhatsApp ou e-mail válido.' });
      }

      const { rows } = await pool.query(
        `INSERT INTO leads_vip (contato, origem, cupom_liberado)
         VALUES ($1, $2, 'MILLA5')
         ON CONFLICT (contato) DO UPDATE SET origem = EXCLUDED.origem
         RETURNING id, contato, cupom_liberado, criado_em`,
        [contatoLimpo, origem]
      );

      return res.status(201).json({
        ok: true,
        cupom: rows[0]?.cupom_liberado || 'MILLA5',
        lead: rows[0],
      });
    } catch (err) {
      console.error('Erro POST /api/leads-vip:', err);
      return res.status(500).json({ error: 'Erro ao cadastrar alerta VIP.' });
    }
  }

  if (req.method === 'GET') {
    if (!isAdmin(req)) return res.status(401).json({ error: 'Não autorizado.' });

    try {
      const { rows } = await pool.query(
        'SELECT * FROM leads_vip ORDER BY id DESC LIMIT 200'
      );
      return res.status(200).json(rows);
    } catch (err) {
      console.error('Erro GET /api/leads-vip:', err);
      return res.status(500).json({ error: 'Erro ao listar leads VIP.' });
    }
  }

  return res.status(405).json({ error: 'Método não permitido.' });
}
