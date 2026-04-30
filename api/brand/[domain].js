export default async function handler(req, res) {
  const { domain } = req.query;
  if (!domain) return res.status(400).json({ error: "missing domain" });

  const apiKey = process.env.BRANDFETCH_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "Missing BRANDFETCH_API_KEY" });

  try {
    const r = await fetch(
      `https://api.brandfetch.io/v2/brands/${encodeURIComponent(domain)}`,
      { headers: { Authorization: `Bearer ${apiKey}` } },
    );
    const text = await r.text();
    res.setHeader("Content-Type", "application/json");
    res.status(r.status).send(text);
  } catch (e) {
    res.status(502).json({ error: "upstream failure", detail: String(e) });
  }
}
