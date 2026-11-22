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
  if (req.method === 'GET') {
    try {
      const { rows } = await pool.query('SELECT * FROM loja_tc WHERE id = 1');
      return res.status(200).json(rows[0] || null);
    } catch (err) {
      console.error('Erro GET /api/loja:', err);
      return res.status(500).json({ error: 'Erro ao carregar dados da loja.' });
    }
  }

  if (req.method === 'PUT') {
    if (!isAdmin(req)) {
      return res.status(401).json({ error: 'Não autorizado.' });
    }

    try {
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
        preco_compra_unitario,
        compra_ativo,
        personagem_recebimento,
      } = req.body || {};

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
             preco_compra_unitario = COALESCE($10, preco_compra_unitario),
             compra_ativo = COALESCE($11, compra_ativo),
             personagem_recebimento = COALESCE($12, personagem_recebimento),
             atualizado_em = NOW()
         WHERE id = 1
         RETURNING *`,
        [
          nome,
          descricao,
          imagem_url,
          preco_unitario !== undefined ? Number(preco_unitario) : null,
          estoque !== undefined ? Number(estoque) : null,
          minimo_tc !== undefined ? Number(minimo_tc) : null,
          typeof ativo === 'boolean' ? ativo : null,
          typeof pix_ativo === 'boolean' ? pix_ativo : null,
          typeof cartao_ativo === 'boolean' ? cartao_ativo : null,
          preco_compra_unitario !== undefined ? Number(preco_compra_unitario) : null,
          typeof compra_ativo === 'boolean' ? compra_ativo : null,
          personagem_recebimento?.trim() || null,
        ]
      );

      return res.status(200).json(rows[0]);
    } catch (err) {
      console.error('Erro PUT /api/loja:', err);
      return res.status(500).json({ error: 'Erro ao atualizar configurações da loja.' });
    }
  }

  return res.status(405).json({ error: 'Método não permitido.' });
}