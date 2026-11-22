import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido.' });
  }

  try {
    const { rows } = await pool.query(
      `SELECT id, servidor, quantidade, criado_em
       FROM pedidos_tc
       WHERE status IN ('pago', 'entregue')
       ORDER BY id DESC
       LIMIT 8`
    );

    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=120');
    return res.status(200).json(rows);
  } catch (err) {
    console.error('Erro em /api/ultimas-vendas:', err);
    return res.status(200).json([]);
  }
}