import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function notificarWhatsAppAdmin(pedido) {
  const webhookUrl = process.env.WHATSAPP_NOTIFY_URL;
  const apiKey = process.env.WHATSAPP_API_KEY;
  const destino = process.env.ADMIN_WHATSAPP || '5582993643044';

  const texto = [
    `✅ *Pagamento Aprovado - Loja TC*`,
    `*Pedido:* #${pedido.id}`,
    `*Personagem:* ${pedido.personagem}${pedido.servidor ? ` (${pedido.servidor})` : ''}`,
    `*Quantidade:* ${Number(pedido.quantidade).toLocaleString('pt-BR')} TC`,
    `*Valor:* R$ ${Number(pedido.valor_total).toFixed(2).replace('.', ',')}`,
    `*Método:* ${String(pedido.metodo_pagamento || '').toUpperCase()}`,
    `*Cliente:* ${pedido.cliente_nome} (${pedido.whatsapp})`,
  ].join('\n');

  if (!webhookUrl) {
    console.log('WHATSAPP_NOTIFY_URL não configurado. Resumo do pagamento aprovado:\n', texto);
    return;
  }

  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(apiKey ? { Authorization: `Bearer ${apiKey}`, apikey: apiKey } : {}),
      },
      body: JSON.stringify({
        number: destino,
        text: texto,
        message: texto,
      }),
    });
  } catch (err) {
    console.error('Falha ao enviar notificação WhatsApp:', err);
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido.' });
  }

  const accessToken = process.env.MP_ACCESS_TOKEN;
  if (!accessToken) {
    return res.status(500).json({ error: 'MP_ACCESS_TOKEN não configurado.' });
  }

  const topic = req.query.type || req.query.topic || req.body?.type || req.body?.action;
  const paymentId =
    req.query['data.id'] ||
    req.query.id ||
    req.body?.data?.id ||
    (typeof req.body?.resource === 'string' && req.body.resource.split('/').pop());

  if (topic && !String(topic).includes('payment') && topic !== 'payment') {
    return res.status(200).json({ received: true, ignoredTopic: topic });
  }

  if (!paymentId) {
    return res.status(200).json({ received: true, info: 'Sem paymentId.' });
  }

  try {
    const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!mpRes.ok) {
      console.error('Falha ao consultar pagamento no MP:', paymentId, mpRes.status);
      return res.status(200).json({ received: true, warning: 'Pagamento não consultado.' });
    }

    const payment = await mpRes.json();
    const pedidoId = Number(payment.external_reference);
    const statusMp = payment.status; // approved, pending, rejected, cancelled, etc.

    if (!Number.isInteger(pedidoId) || pedidoId <= 0) {
      return res.status(200).json({ received: true, info: 'Sem external_reference válido.' });
    }

    let pedidoRecemAprovado = null;

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const { rows: pedidoRows } = await client.query(
        'SELECT * FROM pedidos_tc WHERE id = $1 FOR UPDATE',
        [pedidoId]
      );
      const pedido = pedidoRows[0];

      if (!pedido) {
        await client.query('ROLLBACK');
        return res.status(200).json({ received: true, info: 'Pedido não encontrado.' });
      }

      if (statusMp === 'approved') {
        if (pedido.status === 'pendente') {
          if (number(pedido.quantidade) > 0) {
          await client.query(
            `UPDATE loja_tc
             SET estoque = GREATEST(0, estoque - $1),
                 atualizado_em = NOW()
             WHERE id = 1`,
            [Number(pedido.quantidade)]
          );

          await client.query(
            `UPDATE pedidos_tc
             SET status = 'pago',
                 mp_preference_id = COALESCE(mp_preference_id, $1)
             WHERE id = $2`,
            [String(payment.preference_id || paymentId), pedidoId]
          );

          pedidoRecemAprovado = {
            ...pedido,
            status: 'pago',
          };
        }
      } else if (statusMp === 'cancelled' || statusMp === 'rejected') {
        if (pedido.status === 'pendente') {
          await client.query(
            `UPDATE pedidos_tc SET status = 'cancelado' WHERE id = $1`,
            [pedidoId]
          );
        }
      }

      await client.query('COMMIT');
    } catch (dbErr) {
      await client.query('ROLLBACK');
      throw dbErr;
    } finally {
      client.release();
    }

    if (pedidoRecemAprovado) {
      await notificarWhatsAppAdmin(pedidoRecemAprovado);
    }

    return res.status(200).json({ received: true, pedidoId, statusMp });
  } catch (err) {
    console.error('Erro em /api/webhook-mp:', err);
    return res.status(500).json({ error: 'Erro ao processar webhook.' });
  }
}