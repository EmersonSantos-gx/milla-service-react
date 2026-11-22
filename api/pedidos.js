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
  if (!isAdmin(req)) {
    return res.status(401).json({ error: 'Não autorizado.' });
  }

  if (req.method === 'GET') {
    try {
      const { rows } = await pool.query(
        'SELECT * FROM pedidos_tc ORDER BY id DESC LIMIT 100'
      );
      return res.status(200).json(rows);
    } catch (err) {
      console.error('Erro GET /api/pedidos:', err);
      return res.status(500).json({ error: 'Erro ao carregar pedidos.' });
    }
  }

  if (req.method === 'PATCH') {
    try {
      const { id, status, acao } = req.body || {};

      // Cancelamento em lote de todos os pendentes com mais de 1h
      if (acao === 'cancelar_expirados') {
        const { rows } = await pool.query(
          `UPDATE pedidos_tc
           SET status = 'cancelado'
           WHERE status = 'pendente'
             AND criado_em <= NOW() - INTERVAL '1 hour'
           RETURNING *`
        );
        return res.status(200).json({ cancelados: rows });
      }

      if (!id || !['entregue', 'cancelado'].includes(status)) {
        return res.status(400).json({ error: 'Dados inválidos.' });
      }

      if (status === 'cancelado') {
        const { rows } = await pool.query(
          `UPDATE pedidos_tc
           SET status = 'cancelado'
           WHERE id = $1
             AND status = 'pendente'
             AND criado_em <= NOW() - INTERVAL '1 hour'
           RETURNING *`,
          [id]
        );

        if (!rows[0]) {
          return res.status(400).json({
            error: 'Só é possível cancelar pedidos pendentes com mais de 1 hora.',
          });
        }
        return res.status(200).json(rows[0]);
      }

      const { rows } = await pool.query(
        'UPDATE pedidos_tc SET status = \$1 WHERE id = \$2 RETURNING *',
        [status, id]
      );

      if (!rows[0]) {
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