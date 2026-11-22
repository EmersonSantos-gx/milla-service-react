import pool from '../_db.js';

export default async function handler(req, res) {
  const auth = req.headers.authorization || '';
  if (auth !== `Bearer ${process.env.ADMIN_TOKEN}`) {
    return res.status(401).json({ error: 'Não autorizado.' });
  }

  const id = Number(req.query.id);
  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: 'ID inválido.' });
  }

  if (req.method === 'PATCH') {
    try {
      const { aprovado } = req.body || {};
      const { rows } = await pool.query(
        'UPDATE avaliacoes SET aprovado = $1 WHERE id = $2 RETURNING *',
        [Boolean(aprovado), id]
      );
      if (!rows.length) return res.status(404).json({ error: 'Avaliação não encontrada.' });
      return res.status(200).json(rows[0]);
    } catch {
      return res.status(500).json({ error: 'Erro ao atualizar avaliação.' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      await pool.query('DELETE FROM avaliacoes WHERE id = $1', [id]);
      return res.status(200).json({ ok: true });
    } catch {
      return res.status(500).json({ error: 'Erro ao excluir avaliação.' });
    }
  }

  return res.status(405).json({ error: 'Método não permitido.' });
}