import type { VercelRequest, VercelResponse } from '@vercel/node';

const CR_API_KEY = process.env.CR_API_KEY ?? '';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const segments = Array.isArray(req.query.path) ? req.query.path : [req.query.path ?? ''];
  const path = segments.join('/');

  // Debug: return the constructed URL
  if (req.query.debug === '1') {
    return res.status(200).json({ path, segments, upstream: `https://proxy.royaleapi.dev/v1/${path}` });
  }

  const upstream = `https://proxy.royaleapi.dev/v1/${path}`;

  try {
    const response = await fetch(upstream, {
      headers: {
        Authorization: `Bearer ${CR_API_KEY}`,
        Accept: 'application/json',
      },
    });

    const text = await response.text();
    try {
      res.status(response.status).json(JSON.parse(text));
    } catch {
      res.status(502).json({ error: 'Invalid JSON from upstream', body: text.slice(0, 200) });
    }
  } catch (err) {
    res.status(502).json({ error: 'Upstream fetch failed', detail: String(err) });
  }
}