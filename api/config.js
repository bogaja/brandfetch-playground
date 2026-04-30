export default function handler(req, res) {
  const clientId = process.env.BRANDFETCH_CLIENT_ID;
  if (!clientId) {
    return res.status(500).json({ error: "Missing BRANDFETCH_CLIENT_ID env var" });
  }
  res.status(200).json({ client_id: clientId });
}
