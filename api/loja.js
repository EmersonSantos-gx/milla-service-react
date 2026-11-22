import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const { rows } = await pool.query('SELECT * FROM loja_tc WHERE id = 1');
      if (!rows.length) {
        return res.status(404).json({ error: 'Configuração da loja não encontrada.' });
      }
      return res.status(200).json(rows[0]);
    } catch (err) {
      console.error('Erro GET /api/loja:', err);
      return res.status(500).json({ error: 'Erro ao carregar a loja.' });
    }
  }

  if (req.method === 'PUT') {
    const token = req.headers['x-admin-token'] || req.headers.authorization?.replace('Bearer ', '');
    if (!token || token !== process.env.ADMIN_TOKEN) {
      return res.status(401).json({ error: 'Não autorizado.' });
    }

    const {
      nome,
      descricao,
      imagem_url,
      preco_unitario,
      estoque,
      minimo_tc,
      ativo,
      pix_ativo,
      cartao_ativo,
    } = req.body;

    try {
      const { rows } = await pool.query(
        `UPDATE loja_tc
         SET nome = COALESCE($1, nome),
             descricao = COALESCE($2, descricao),
             imagem_url = COALESCE($3, imagem_url),
             preco_unitario = COALESCE($4, preco_unitario),
             estoque = COALESCE($5, estoque),
             minimo_tc = COALESCE($6, minimo_tc),
             ativo = COALESCE($7, ativo),
             pix_ativo = COALESCE($8, pix_ativo),
             cartao_ativo = COALESCE($9, cartao_ativo),
             atualizado_em = NOW()
         WHERE id = 1
         RETURNING *`,
        [
          nome,
          descricao,
          imagem_url,
          preco_unitario,
          estoque,
          minimo_tc,
          ativo,
          pix_ativo,
          cartao_ativo,
        ]
      );
      return res.status(200).json(rows[0]);
    } catch (err) {
      console.error('Erro PUT /api/loja:', err);
      return res.status(500).json({ error: 'Erro ao atualizar a loja.' });
    }
  }

  return res.status(405).json({ error: 'Método não permitido.' });
}