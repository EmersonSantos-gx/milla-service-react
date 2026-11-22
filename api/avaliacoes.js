import pool from './_db.js';

function isAuthorized(req) {
  const adminToken = process.env.ADMIN_TOKEN;
  if (!adminToken) return false;
  const authHeader = req.headers.authorization || '';
  const bearerToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
  const customToken = (req.headers['x-admin-token'] || '').trim();
  return bearerToken === adminToken || customToken === adminToken;
}

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const isAdminReq = req.query.all === 'true' || req.query.all === '1';

      if (isAdminReq) {
        if (!isAuthorized(req)) {
          return res.status(401).json({ error: 'Não autorizado.' });
        }

        const { rows } = await pool.query(
          'SELECT * FROM avaliacoes ORDER BY aprovado ASC, criado_em DESC'
        );
        return res.status(200).json(rows);
      }

      const { rows } = await pool.query(
        'SELECT id, nome, personagem, servidor, level, estrelas, descricao, criado_em FROM avaliacoes WHERE aprovado = TRUE ORDER BY criado_em DESC'
      );
      return res.status(200).json(rows);
    } catch (err) {
      console.error('ERRO NO BANCO:', err);
      return res.status(500).json({ error: err.message });
    }
  }

  if (req.method === 'POST') {
    try {
      const { nome, personagem, servidor, level, estrelas, descricao, website } = req.body || {};

      // Honeypot anti-spam: bots preenchem este campo invisível
      if (website) {
        return res.status(201).json({ ok: true });
      }

      if (!nome?.trim() || !personagem?.trim() || !servidor?.trim() || !descricao?.trim()) {
        return res.status(400).json({ error: 'Preencha todos os campos obrigatórios.' });
      }

      const lvl = Math.max(1, Math.min(5000, Number(level) || 1));
      const stars = Math.max(1, Math.min(5, Number(estrelas) || 5));

      await pool.query(
        `INSERT INTO avaliacoes (nome, personagem, servidor, level, estrelas, descricao, aprovado)
         VALUES ($1, $2, $3, $4, $5, $6, FALSE)`,
        [
          nome.trim().slice(0, 80),
          personagem.trim().slice(0, 80),
          servidor.trim().slice(0, 60),
          lvl,
          stars,
          descricao.trim().slice(0, 400),
        ]
      );

      return res.status(201).json({ ok: true, message: 'Avaliação enviada para aprovação!' });
    } catch (err) {
      console.error('ERRO AO SALVAR AVALIAÇÃO:', err);
      return res.status(500).json({ error: 'Erro ao salvar avaliação.' });
    }
  }

  return res.status(405).json({ error: 'Método não permitido.' });
}