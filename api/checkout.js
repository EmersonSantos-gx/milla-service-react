import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const extrairTcDoSlug = (id = '') => {
  const match = String(id).match(/^tc-(?:custom-)?(\d+)$/i);
  return match ? Number(match[1]) : 0;
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido.' });
  }

  const {
    nome,
    whatsapp,
    personagem,
    servidor,
    metodo,
    cupom,
    itens,
    quantidade, // compatibilidade com chamadas antigas
  } = req.body || {};

  const nomeLimpo = String(nome || '').trim();
  const whatsLimpo = String(whatsapp || '').replace(/\D/g, '');
  const charLimpo = String(personagem || '').trim();
  const servidorLimpo = String(servidor || '').trim() || null;
  const metodoEscolhido = metodo === 'cartao' ? 'cartao' : 'pix';
  const cupomLimpo = String(cupom || '').trim().toUpperCase();

  if (!nomeLimpo || whatsLimpo.length < 10 || !charLimpo) {
    return res.status(400).json({
      error: 'Preencha seu nome, WhatsApp com DDD e nome do personagem.',
    });
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

    const precoUnitarioTc = Number(loja.preco_unitario) || 0.196;
    let totalTcPedido = 0;
    let subtotal = 0;
    const descricoes = [];

    // Modo 1: Checkout vindo do Carrinho (array itens)
    if (Array.isArray(itens) && itens.length > 0) {
      const { rows: produtosDb } = await client.query(
        'SELECT id, slug, nome, preco FROM produtos WHERE ativo = TRUE'
      );
      const mapaPorSlug = new Map(produtosDb.map((p) => [p.slug, p]));
      const mapaPorId = new Map(produtosDb.map((p) => [String(p.id), p]));

      for (const item of itens) {
        const qtdItem = Math.max(1, Math.floor(Number(item.quantidade) || 1));
        const tcPorUnidade = Number(item.tcQtd) || extrairTcDoSlug(item.id);

        if (tcPorUnidade > 0) {
          const minimo = Number(loja.minimo_tc) || 25;
          if (tcPorUnidade < minimo || tcPorUnidade % 25 !== 0) {
            await client.query('ROLLBACK');
            return res.status(400).json({
              error: `Quantidade de TC deve ser a partir de ${minimo} TC em múltiplos de 25.`,
            });
          }

          const tcItemTotal = tcPorUnidade * qtdItem;
          totalTcPedido += tcItemTotal;
          subtotal += tcItemTotal * precoUnitarioTc;
          descricoes.push(`${qtdItem}x ${tcPorUnidade.toLocaleString('pt-BR')} Tibia Coins`);
        } else {
          const prod = mapaPorSlug.get(String(item.id)) || mapaPorId.get(String(item.dbId || item.id));
          if (!prod) {
            await client.query('ROLLBACK');
            return res.status(400).json({
              error: `O produto "${item.nome || item.id}" não está mais disponível.`,
            });
          }
          subtotal += Number(prod.preco) * qtdItem;
          descricoes.push(`${qtdItem}x ${prod.nome}`);
        }
      }
    } else {
      // Modo 2: Compatibilidade com chamadas antigas (somente quantidade de TC)
      const qtd = Number(quantidade);
      const minimo = Number(loja.minimo_tc) || 25;
      if (!Number.isFinite(qtd) || qtd < minimo || qtd % 25 !== 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({
          error: `A quantidade deve ser a partir de ${minimo} TC em múltiplos de 25.`,
        });
      }
      totalTcPedido = qtd;
      subtotal = qtd * precoUnitarioTc;
      descricoes.push(`${qtd.toLocaleString('pt-BR')} Tibia Coins`);
    }

    // Valida estoque apenas se houver Tibia Coins no pedido
    if (totalTcPedido > 0 && totalTcPedido > Number(loja.estoque)) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        error: `Estoque insuficiente. Disponível agora: ${Number(loja.estoque).toLocaleString('pt-BR')} TC.`,
      });
    }

    // Descontos (PIX -5% e Cupom MILLA5 -R$ 5,00)
    const descontoPix = metodoEscolhido === 'pix' ? subtotal * 0.05 : 0;
    const descontoCupom = cupomLimpo === 'MILLA5' ? 5.0 : 0;
    const valorTotal = Math.max(1, Number((subtotal - descontoPix - descontoCupom).toFixed(2)));
    const resumoItens = descricoes.join(', ');

    const { rows: pedidoRows } = await client.query(
      `INSERT INTO pedidos_tc
        (cliente_nome, whatsapp, personagem, servidor, quantidade, valor_total, metodo_pagamento, status, resumo_itens)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'pendente', $8)
       RETURNING id`,
      [
        nomeLimpo,
        whatsLimpo,
        charLimpo,
        servidorLimpo,
        totalTcPedido,
        valorTotal,
        metodoEscolhido,
        resumoItens,
      ]
    );

    const pedidoId = pedidoRows[0].id;

    const protocol = req.headers['x-forwarded-proto'] || 'https';
    const host = req.headers.host;
    const baseUrl = `${protocol}://${host}`;
    const isHttps = baseUrl.startsWith('https://');

    const excludedPaymentTypes = [{ id: 'ticket' }];
    if (metodoEscolhido === 'pix') {
      excludedPaymentTypes.push({ id: 'credit_card' }, { id: 'debit_card' }, { id: 'prepaid_card' });
    } else {
      excludedPaymentTypes.push({ id: 'bank_transfer' });
    }

    const mpPayload = {
      items: [
        {
          id: `pedido-${pedidoId}`,
          title: `${resumoItens.slice(0, 180)} - ${charLimpo}`,
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
    };

    if (isHttps) {
      mpPayload.auto_return = 'approved';
    }

    const mpResponse = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(mpPayload),
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
      valor_total: valorTotal,
      resumo_itens: resumoItens,
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Erro POST /api/checkout:', err);
    return res.status(500).json({ error: 'Erro interno ao processar o pedido.' });
  } finally {
    client.release();
  }
}