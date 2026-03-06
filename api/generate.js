module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  try {
    let body = req.body;
    if (typeof body === 'string') {
      body = JSON.parse(body);
    }
    if (!body || Object.keys(body).length === 0) {
      const chunks = [];
      for await (const chunk of req) {
        chunks.push(chunk);
      }
      body = JSON.parse(Buffer.concat(chunks).toString());
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();

    // Retorna o erro exato da Anthropic se não for 200
    if (!response.ok) {
      return res.status(response.status).json({ anthropic_error: data, body_received: body });
    }

    return res.status(200).json(data);

  } catch (err) {
    return res.status(500).json({ error: 'Erro interno', detail: err.message });
  }
}
