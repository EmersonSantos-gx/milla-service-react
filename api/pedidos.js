import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

function autorizado(req) {
  const token = req.headers['x-admin-token'] || req.headers.authorization?.replace('Bearer ', '');
  return Boolean(process.env.ADMIN_TOKEN && token === process.env.ADMIN_TOKEN);
}

export default async function handler(req, res) {
  if (!autorizado(req)) {
    return res.status(401).json({ error: 'Não autorizado.' });
  }

  if (req.method === 'GET') {
    try {
      const { rows } = await pool.query(
        'SELECT * FROM pedidos_tc ORDER BY criado_em DESC LIMIT 50'
      );
      return res.status(200).json(rows);
    } catch (err) {
      console.error('Erro GET /api/pedidos:', err);
      return res.status(500).json({ error: 'Erro ao buscar pedidos.' });
    }
  }

  if (req.method === 'PATCH') {
    const { id, status } = req.body || {};
    const statusPermitidos = ['pendente', 'pago', 'entregue', 'cancelado'];
    if (!Number.isInteger(Number(id)) || !statusPermitidos.includes(status)) {
      return res.status(400).json({ error: 'Dados inválidos para atualizar pedido.' });
    }

    try {
      const { rows } = await pool.query(
        'UPDATE pedidos_tc SET status = $1 WHERE id = $2 RETURNING *',
        [status, Number(id)]
      );
      if (!rows.length) {
        return res.status(404).json({ error: 'Pedido não encontrado.' });
      }
      return res.status(200).json(rows[0]);
    } catch (err) {
      console.error('Erro PATCH /api/pedidos:', err);
      return res.status(500).json({ error: 'Erro ao atualizar pedido.' });
    }
  }

  return res.status(405).json({ error: 'Método não permitido.' });
}