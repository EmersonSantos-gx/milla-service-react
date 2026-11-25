import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const mapearStatus = (status) => {
  switch (status) {
    case 'entregue':
      return { label: 'Entregue', etapa: 3 };
    case 'pago':
      return { label: 'Pago • Em entrega', etapa: 2 };
    case 'cancelado':
      return { label: 'Cancelado', etapa: 0 };
    default:
      return { label: 'Aguardando Pagamento', etapa: 1 };
  }
};

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido.' });
  }

  try {
    const rawId = String(req.query.id || '').replace(/\D/g, '');
    const id = Number(rawId);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: 'Informe um número de pedido válido (ex: 12).' });
    }

    const { rows } = await pool.query(
      `SELECT id, personagem, servidor, quantidade, valor_total, metodo_pagamento, status, resumo_itens, criado_em
       FROM pedidos_tc
       WHERE id = $1`,
      [id]
    );

    const pedido = rows[0];
    if (!pedido) {
      return res.status(404).json({ error: `Pedido #${id} não encontrado.` });
    }

    const { label, etapa } = mapearStatus(pedido.status);

    return res.status(200).json({
      id: `#${pedido.id}`,
      status: label,
      status_raw: pedido.status,
      etapa,
      item:
        pedido.resumo_itens ||
        `${Number(pedido.quantidade || 0).toLocaleString('pt-BR')} Tibia Coins`,
      personagem: pedido.servidor
        ? `${pedido.personagem} (${pedido.servidor})`
        : pedido.personagem,
      valor: Number(pedido.valor_total),
      metodo_pagamento: pedido.metodo_pagamento,
      atualizadoEm: pedido.criado_em
        ? new Date(pedido.criado_em).toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
          })
        : 'Recente',
    });
  } catch (err) {
    console.error('Erro GET /api/rastrear-pedido:', err);
    return res.status(500).json({ error: 'Erro ao consultar pedido.' });
  }
}
