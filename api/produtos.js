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
      const mostrarTodos = req.query.all === '1' && isAdmin(req);
      const query = mostrarTodos
        ? 'SELECT * FROM produtos ORDER BY ordem ASC, id ASC'
        : 'SELECT * FROM produtos WHERE ativo = TRUE ORDER BY ordem ASC, id ASC';

      const { rows } = await pool.query(query);
      return res.status(200).json(rows);
    } catch (err) {
      console.error('Erro GET /api/produtos:', err);
      return res.status(500).json({ error: 'Erro ao carregar produtos.' });
    }
  }

  if (!isAdmin(req)) {
    return res.status(401).json({ error: 'Não autorizado.' });
  }

  if (req.method === 'POST') {
    try {
      const {
        slug,
        nome,
        descricao,
        preco,
        tag = 'Destaque',
        icone = 'fa-coins',
        cor_icone = 'text-[#FFBF24]',
        destaque = 'Entrega rápida',
        ordem = 0,
        ativo = true,
      } = req.body || {};

      if (!nome?.trim() || !descricao?.trim() || Number(preco) <= 0) {
        return res.status(400).json({ error: 'Preencha nome, descrição e preço válido.' });
      }

      const slugFinal =
        (slug?.trim() || nome.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-')) +
        `-${Date.now().toString().slice(-4)}`;

      const { rows } = await pool.query(
        `INSERT INTO produtos (slug, nome, descricao, preco, tag, icone, cor_icone, destaque, ordem, ativo)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         RETURNING *`,
        [
          slugFinal,
          nome.trim(),
          descricao.trim(),
          Number(preco),
          tag.trim(),
          icone.trim(),
          cor_icone.trim(),
          destaque.trim(),
          Number(ordem) || 0,
          Boolean(ativo),
        ]
      );

      return res.status(201).json(rows[0]);
    } catch (err) {
      console.error('Erro POST /api/produtos:', err);
      return res.status(500).json({ error: 'Erro ao cadastrar produto.' });
    }
  }

  if (req.method === 'PUT') {
    try {
      const { id, nome, descricao, preco, tag, icone, cor_icone, destaque, ordem, ativo } =
        req.body || {};

      if (!id) return res.status(400).json({ error: 'ID do produto obrigatório.' });

      const { rows } = await pool.query(
        `UPDATE produtos
         SET nome = COALESCE($1, nome),
             descricao = COALESCE($2, descricao),
             preco = COALESCE($3, preco),
             tag = COALESCE($4, tag),
             icone = COALESCE($5, icone),
             cor_icone = COALESCE($6, cor_icone),
             destaque = COALESCE($7, destaque),
             ordem = COALESCE($8, ordem),
             ativo = COALESCE($9, ativo)
         WHERE id = $10
         RETURNING *`,
        [
          nome?.trim() ?? null,
          descricao?.trim() ?? null,
          preco !== undefined ? Number(preco) : null,
          tag?.trim() ?? null,
          icone?.trim() ?? null,
          cor_icone?.trim() ?? null,
          destaque?.trim() ?? null,
          ordem !== undefined ? Number(ordem) : null,
          ativo !== undefined ? Boolean(ativo) : null,
          id,
        ]
      );

      if (!rows[0]) return res.status(404).json({ error: 'Produto não encontrado.' });
      return res.status(200).json(rows[0]);
    } catch (err) {
      console.error('Erro PUT /api/produtos:', err);
      return res.status(500).json({ error: 'Erro ao atualizar produto.' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const id = req.query.id || req.body?.id;
      if (!id) return res.status(400).json({ error: 'ID obrigatório.' });

      await pool.query('DELETE FROM produtos WHERE id = $1', [id]);
      return res.status(200).json({ ok: true });
    } catch (err) {
      console.error('Erro DELETE /api/produtos:', err);
      return res.status(500).json({ error: 'Erro ao excluir produto.' });
    }
  }

  return res.status(405).json({ error: 'Método não permitido.' });
}