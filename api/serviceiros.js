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
        ? 'SELECT * FROM serviceiros ORDER BY id ASC'
        : 'SELECT * FROM serviceiros WHERE ativo = TRUE ORDER BY avaliacoes DESC, id ASC';

      const { rows } = await pool.query(query);
      return res.status(200).json(rows);
    } catch (err) {
      console.error('Erro GET /api/serviceiros:', err);
      return res.status(500).json({ error: 'Erro ao carregar serviceiros.' });
    }
  }

  if (!isAdmin(req)) {
    return res.status(401).json({ error: 'Não autorizado.' });
  }

  if (req.method === 'POST') {
    try {
      const {
        nome,
        servidor,
        especialidade,
        telefone,
        whatsapp,
        avatar_url = null,
        avaliacoes = 0,
        verificado = true,
        ativo = true,
      } = req.body || {};

      if (!nome?.trim() || !servidor?.trim() || !telefone?.trim()) {
        return res.status(400).json({ error: 'Informe nome, servidor e telefone.' });
      }

      const whatsLimpo = String(whatsapp || telefone).replace(/\D/g, '');
      const whatsFinal = whatsLimpo.startsWith('55') ? whatsLimpo : `55${whatsLimpo}`;

      const { rows } = await pool.query(
        `INSERT INTO serviceiros
          (nome, servidor, especialidade, telefone, whatsapp, avatar_url, avaliacoes, verificado, ativo)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING *`,
        [
          nome.trim(),
          servidor.trim(),
          (especialidade || 'Quests & Bosses').trim(),
          telefone.trim(),
          whatsFinal,
          avatar_url?.trim() || null,
          Number(avaliacoes) || 0,
          Boolean(verificado),
          Boolean(ativo),
        ]
      );

      return res.status(201).json(rows[0]);
    } catch (err) {
      console.error('Erro POST /api/serviceiros:', err);
      return res.status(500).json({ error: 'Erro ao cadastrar serviceiro.' });
    }
  }

  if (req.method === 'PUT') {
    try {
      const {
        id,
        nome,
        servidor,
        especialidade,
        telefone,
        whatsapp,
        avatar_url,
        avaliacoes,
        verificado,
        ativo,
      } = req.body || {};

      if (!id) return res.status(400).json({ error: 'ID obrigatório.' });

      const { rows } = await pool.query(
        `UPDATE serviceiros
         SET nome = COALESCE($1, nome),
             servidor = COALESCE($2, servidor),
             especialidade = COALESCE($3, especialidade),
             telefone = COALESCE($4, telefone),
             whatsapp = COALESCE($5, whatsapp),
             avatar_url = COALESCE($6, avatar_url),
             avaliacoes = COALESCE($7, avaliacoes),
             verificado = COALESCE($8, verificado),
             ativo = COALESCE($9, ativo)
         WHERE id = $10
         RETURNING *`,
        [
          nome?.trim() ?? null,
          servidor?.trim() ?? null,
          especialidade?.trim() ?? null,
          telefone?.trim() ?? null,
          whatsapp?.trim() ?? null,
          avatar_url ?? null,
          avaliacoes !== undefined ? Number(avaliacoes) : null,
          verificado !== undefined ? Boolean(verificado) : null,
          ativo !== undefined ? Boolean(ativo) : null,
          id,
        ]
      );

      if (!rows[0]) return res.status(404).json({ error: 'Serviceiro não encontrado.' });
      return res.status(200).json(rows[0]);
    } catch (err) {
      console.error('Erro PUT /api/serviceiros:', err);
      return res.status(500).json({ error: 'Erro ao atualizar serviceiro.' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const id = req.query.id || req.body?.id;
      if (!id) return res.status(400).json({ error: 'ID obrigatório.' });

      await pool.query('DELETE FROM serviceiros WHERE id = $1', [id]);
      return res.status(200).json({ ok: true });
    } catch (err) {
      console.error('Erro DELETE /api/serviceiros:', err);
      return res.status(500).json({ error: 'Erro ao excluir serviceiro.' });
    }
  }

  return res.status(405).json({ error: 'Método não permitido.' });
}
