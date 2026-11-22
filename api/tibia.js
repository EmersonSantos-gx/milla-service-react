export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido.' });
  }

  const name = (req.query.name || '').trim();
  if (!name) {
    return res.status(400).json({ error: 'Nome do personagem obrigatório.' });
  }

  try {
    const response = await fetch(
      `https://api.tibiadata.com/v4/character/${encodeURIComponent(name)}`,
      {
        headers: {
          Accept: 'application/json',
          'User-Agent': 'MillaService/1.0',
        },
      }
    );

    if (response.status >= 500) {
      return res.status(503).json({
        error: 'TibiaData fora do ar no momento. Preencha servidor e level manualmente.',
      });
    }

    const data = await response.json();
    const char = data?.character?.character || data?.characters?.character;

    if (!response.ok || !char || !char.name) {
      return res.status(404).json({
        error: 'Personagem não encontrado. Preencha servidor e level manualmente.',
      });
    }

    return res.status(200).json({
      name: char.name,
      world: char.world || '',
      level: char.level || '',
      vocation: char.vocation || '',
    });
  } catch (err) {
    console.error('Erro TibiaData:', err);
    return res.status(502).json({
      error: 'Não foi possível consultar a TibiaData agora. Preencha manualmente.',
    });
  }
}