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
      const {
        nome_completo,
        whatsapp,
        personagem_origem,
        quantidade,
        chave_pix,
        comprovante_base64,
      } = req.body || {};

      const qtd = Number(quantidade);
      if (
        !nome_completo?.trim() ||
        !whatsapp?.trim() ||
        !personagem_origem?.trim() ||
        !chave_pix?.trim() ||
        !comprovante_base64?.startsWith('data:image/') ||
        !Number.isInteger(qtd) ||
        qtd < 25 ||
        qtd % 25 !== 0
      ) {
        return res.status(400).json({
          error: 'Preencha todos os campos, informe múltiplos de 25 TC e anexe a imagem.',
        });
      }

      if (comprovante_base64.length > 2_500_000) {
        return res.status(400).json({ error: 'A imagem é muito grande. Tente um print menor.' });
      }

      const { rows: lojaRows } = await pool.query('SELECT * FROM loja_tc WHERE id = 1');
      const loja = lojaRows[0];

      if (!loja || !loja.compra_ativo) {
        return res.status(400).json({ error: 'A compra de Tibia Coins está temporariamente pausada.' });
      }

      const valorTotal = Number((qtd * Number(loja.preco_compra_unitario)).toFixed(2));

      const { rows } = await pool.query(
        `INSERT INTO compras_tc
          (nome_completo, whatsapp, personagem_origem, personagem_destino, quantidade, valor_total, chave_pix, comprovante_base64)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING id, nome_completo, whatsapp, personagem_origem, personagem_destino, quantidade, valor_total, chave_pix, status, criado_em`,
        [
          nome_completo.trim(),
          whatsapp.trim(),
          personagem_origem.trim(),
          loja.personagem_recebimento,
          qtd,
          valorTotal,
          chave_pix.trim(),
          comprovante_base64,
        ]
      );

      return res.status(201).json(rows[0]);
    } catch (err) {
      console.error('Erro POST /api/compras-tc:', err);
      return res.status(500).json({ error: 'Erro ao registrar solicitação de venda.' });
    }
  }

  if (req.method === 'GET') {
    if (!isAdmin(req)) return res.status(401).json({ error: 'Não autorizado.' });

    try {
      const { rows } = await pool.query(
        'SELECT * FROM compras_tc ORDER BY id DESC LIMIT 100'
      );
      return res.status(200).json(rows);
    } catch (err) {
      console.error('Erro GET /api/compras-tc:', err);
      return res.status(500).json({ error: 'Erro ao carregar compras de TC.' });
    }
  }

  if (req.method === 'PATCH') {
    if (!isAdmin(req)) return res.status(401).json({ error: 'Não autorizado.' });

    const client = await pool.connect();
    try {
      const { id, status } = req.body || {};
      if (!id || !['pendente', 'pago', 'devolvido'].includes(status)) {
        return res.status(400).json({ error: 'Dados inválidos.' });
      }

      await client.query('BEGIN');

      const { rows: atuais } = await client.query(
        'SELECT * FROM compras_tc WHERE id = $1 FOR UPDATE',
        [id]
      );
      const compraAtual = atuais[0];
      if (!compraAtual) {
        await client.query('ROLLBACK');
        return res.status(404).json({ error: 'Solicitação não encontrada.' });
      }

      const { rows: atualizadas } = await client.query(
        'UPDATE compras_tc SET status = $1 WHERE id = $2 RETURNING *',
        [status, id]
      );

      let novoEstoque = null;

      // Soma no estoque somente na transição para "pago"
      if (compraAtual.status !== 'pago' && status === 'pago') {
        const { rows: lojaRows } = await client.query(
          'UPDATE loja_tc SET estoque = estoque + $1, atualizado_em = NOW() WHERE id = 1 RETURNING estoque',
          [Number(compraAtual.quantidade)]
        );
        novoEstoque = lojaRows[0]?.estoque ?? null;
      }

      await client.query('COMMIT');
      return res.status(200).json({ ...atualizadas[0], novo_estoque: novoEstoque });
    } catch (err) {
      await client.query('ROLLBACK');
      console.error('Erro PATCH /api/compras-tc:', err);
      return res.status(500).json({ error: 'Erro ao atualizar status.' });
    } finally {
      client.release();
    }
  }

  return res.status(405).json({ error: 'Método não permitido.' });
}