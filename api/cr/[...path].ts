import type { VercelRequest, VercelResponse } from '@vercel/node';

const CR_API_KEY = process.env.CR_API_KEY ?? '';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const segments = Array.isArray(req.query.path) ? req.query.path : [req.query.path ?? ''];
  const path = segments.map(encodeURIComponent).join('/');

  const upstream = `https://proxy.royaleapi.dev/v1/${path}`;

  try {
    const response = await fetch(upstream, {
      headers: {
        Authorization: `Bearer ${CR_API_KEY}`,
        Accept: 'application/json',
      },
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    res.status(502).json({ error: 'Upstream fetch failed', detail: String(err) });
  }
}
