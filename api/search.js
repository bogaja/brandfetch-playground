export default async function handler(req, res) {
  const q = req.query?.q;
  if (!q) return res.status(400).json({ error: "missing q" });

  const clientId = process.env.BRANDFETCH_CLIENT_ID;
  if (!clientId) return res.status(500).json({ error: "Missing BRANDFETCH_CLIENT_ID" });

  try {
    const r = await fetch(
      `https://api.brandfetch.io/v2/search/${encodeURIComponent(q)}?c=${clientId}`,
    );
    const text = await r.text();
    res.setHeader("Content-Type", "application/json");
    res.status(r.status).send(text);
  } catch (e) {
    res.status(502).json({ error: "upstream failure", detail: String(e) });
  }
}
