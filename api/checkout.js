import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido.' });
  }

  const { nome, whatsapp, personagem, servidor, quantidade, metodo } = req.body || {};

  const nomeLimpo = (nome || '').trim();
  const whatsLimpo = (whatsapp || '').replace(/\D/g, '');
  const charLimpo = (personagem || '').trim();
  const qtd = Number(quantidade);
  const metodoEscolhido = metodo === 'cartao' ? 'cartao' : 'pix';

  if (!nomeLimpo || whatsLimpo.length < 10 || !charLimpo || !Number.isFinite(qtd) || qtd <= 0) {
    return res.status(400).json({ error: 'Preencha todos os dados obrigatórios corretamente.' });
  }

  const accessToken = process.env.MP_ACCESS_TOKEN;
  if (!accessToken) {
    return res.status(500).json({ error: 'MP_ACCESS_TOKEN não configurado no servidor.' });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const { rows: lojaRows } = await client.query('SELECT * FROM loja_tc WHERE id = 1 FOR UPDATE');
    const loja = lojaRows[0];

    if (!loja || !loja.ativo) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'A loja está pausada no momento.' });
    }

    if (metodoEscolhido === 'pix' && !loja.pix_ativo) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Pagamento via PIX indisponível no momento.' });
    }

    if (metodoEscolhido === 'cartao' && !loja.cartao_ativo) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Pagamento via Cartão indisponível no momento.' });
    }

    const minimo = Number(loja.minimo_tc) || 25;
    if (qtd < minimo || qtd % 25 !== 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        error: `A quantidade deve ser a partir de ${minimo} TC em múltiplos de 25.`,
      });
    }

    if (qtd > Number(loja.estoque)) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Quantidade solicitada acima do estoque disponível.' });
    }

    const valorTotal = Number((qtd * Number(loja.preco_unitario)).toFixed(2));

    const { rows: pedidoRows } = await client.query(
      `INSERT INTO pedidos_tc
        (cliente_nome, whatsapp, personagem, servidor, quantidade, valor_total, metodo_pagamento, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'pendente')
       RETURNING id`,
      [nomeLimpo, whatsLimpo, charLimpo, (servidor || '').trim() || null, qtd, valorTotal, metodoEscolhido]
    );

    const pedidoId = pedidoRows[0].id;

    const protocol = req.headers['x-forwarded-proto'] || 'https';
    const host = req.headers.host;
    const baseUrl = `${protocol}://${host}`;

    const excludedPaymentTypes = [{ id: 'ticket' }];
    if (metodoEscolhido === 'pix') {
      excludedPaymentTypes.push({ id: 'credit_card' }, { id: 'debit_card' }, { id: 'prepaid_card' });
    } else {
      excludedPaymentTypes.push({ id: 'bank_transfer' });
    }

    const mpResponse = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        items: [
          {
            id: `tc-${pedidoId}`,
            title: `${qtd} Tibia Coins - ${charLimpo}`,
            quantity: 1,
            currency_id: 'BRL',
            unit_price: valorTotal,
          },
        ],
        external_reference: String(pedidoId),
        payment_methods: {
          excluded_payment_types: excludedPaymentTypes,
        },
        back_urls: {
          success: `${baseUrl}/?pagamento=sucesso&pedido=${pedidoId}`,
          pending: `${baseUrl}/?pagamento=pendente&pedido=${pedidoId}`,
          failure: `${baseUrl}/?pagamento=falha&pedido=${pedidoId}`,
        },
        auto_return: 'approved',
      }),
    });

    const mpData = await mpResponse.json();

    if (!mpResponse.ok || !mpData.id || !mpData.init_point) {
      await client.query('ROLLBACK');
      console.error('Erro Mercado Pago:', mpData);
      return res.status(502).json({ error: 'Falha ao gerar cobrança no Mercado Pago.' });
    }

    await client.query('UPDATE pedidos_tc SET mp_preference_id = $1 WHERE id = $2', [
      mpData.id,
      pedidoId,
    ]);

    await client.query('COMMIT');

    return res.status(200).json({
      pedido_id: pedidoId,
      init_point: mpData.init_point,
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Erro POST /api/checkout:', err);
    return res.status(500).json({ error: 'Erro interno ao processar o pedido.' });
  } finally {
    client.release();
  }
}