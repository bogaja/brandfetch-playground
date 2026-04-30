export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "method not allowed" });
  }

  const apiKey = process.env.BRANDFETCH_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "Missing BRANDFETCH_API_KEY" });

  // Vercel parses JSON body automatically when Content-Type is application/json
  const body = typeof req.body === "string" ? req.body : JSON.stringify(req.body ?? {});

  try {
    const r = await fetch("https://api.brandfetch.io/v2/brands/transaction", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body,
    });
    const text = await r.text();
    res.setHeader("Content-Type", "application/json");
    res.status(r.status).send(text);
  } catch (e) {
    res.status(502).json({ error: "upstream failure", detail: String(e) });
  }
}
