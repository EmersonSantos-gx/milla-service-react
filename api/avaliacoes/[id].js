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

  const id = Number(req.query.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: 'ID inválido.' });
  }

  if (req.method === 'PATCH') {
    const { aprovado } = req.body || {};
    if (typeof aprovado !== 'boolean') {
      return res.status(400).json({ error: 'Campo "aprovado" deve ser booleano.' });
    }

    try {
      const { rows } = await pool.query(
        'UPDATE avaliacoes SET aprovado = $1 WHERE id = $2 RETURNING *',
        [aprovado, id]
      );
      if (!rows.length) {
        return res.status(404).json({ error: 'Avaliação não encontrada.' });
      }
      return res.status(200).json(rows[0]);
    } catch (err) {
      console.error('Erro PATCH /api/avaliacoes/[id]:', err);
      return res.status(500).json({ error: 'Erro ao atualizar avaliação.' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const { rows } = await pool.query(
        'DELETE FROM avaliacoes WHERE id = $1 RETURNING id',
        [id]
      );
      if (!rows.length) {
        return res.status(404).json({ error: 'Avaliação não encontrada.' });
      }
      return res.status(200).json({ deleted: true, id: rows[0].id });
    } catch (err) {
      console.error('Erro DELETE /api/avaliacoes/[id]:', err);
      return res.status(500).json({ error: 'Erro ao excluir avaliação.' });
    }
  }

  return res.status(405).json({ error: 'Método não permitido.' });
}