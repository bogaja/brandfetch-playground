// Brandfetch Playground — Bun server
// Reads credentials from environment variables (.env) with optional fallback
// to the local Claude Code skill at ~/.claude/skills/brandfetch/credentials.json
// (only used during local dev — never relied on in production).

import { existsSync } from "node:fs";

type Creds = { client_id: string; api_key: string };

async function loadCredentials(): Promise<Creds> {
  // 1. Environment variables (production / .env file)
  const envClient = process.env.BRANDFETCH_CLIENT_ID;
  const envKey = process.env.BRANDFETCH_API_KEY;
  if (envClient && envKey) {
    return { client_id: envClient, api_key: envKey };
  }

  // 2. Local fallback — Claude Code skill credentials (developer convenience)
  const skillPath = `${process.env.HOME}/.claude/skills/brandfetch/credentials.json`;
  if (existsSync(skillPath)) {
    try {
      const data = await Bun.file(skillPath).json();
      if (data?.client_id && data?.api_key) {
        console.log("  ℹ  Using credentials from Claude Code skill (local dev)");
        return { client_id: data.client_id, api_key: data.api_key };
      }
    } catch {}
  }

  console.error("\n  ✖  Missing credentials.\n");
  console.error("  Set BRANDFETCH_CLIENT_ID and BRANDFETCH_API_KEY in your environment");
  console.error("  or create a .env file (see .env.example).\n");
  console.error("  Get keys: https://developers.brandfetch.com/dashboard\n");
  process.exit(1);
}

const creds = await loadCredentials();
const PORT = Number(process.env.PORT ?? 3737);
const HERE = import.meta.dir;

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });

const proxy = (status: number, text: string) =>
  new Response(text, {
    status,
    headers: { "Content-Type": "application/json" },
  });

Bun.serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url);

    // ---- Static ----
    if (url.pathname === "/" || url.pathname === "/index.html") {
      return new Response(Bun.file(`${HERE}/index.html`));
    }
    if (url.pathname === "/favicon.ico") {
      return new Response(null, { status: 204 });
    }

    // ---- Public config (only client_id is exposed; api_key stays server-side) ----
    if (url.pathname === "/api/config") {
      return json({ client_id: creds.client_id });
    }

    // ---- Search proxy (client_id auth — could be direct from browser, proxied for consistency) ----
    if (url.pathname === "/api/search") {
      const q = url.searchParams.get("q") ?? "";
      if (!q) return json({ error: "missing q" }, 400);
      const r = await fetch(
        `https://api.brandfetch.io/v2/search/${encodeURIComponent(q)}?c=${creds.client_id}`,
      );
      return proxy(r.status, await r.text());
    }

    // ---- Brand proxy (Bearer auth — must stay server-side) ----
    if (url.pathname.startsWith("/api/brand/")) {
      const domain = decodeURIComponent(url.pathname.slice("/api/brand/".length));
      const r = await fetch(
        `https://api.brandfetch.io/v2/brands/${encodeURIComponent(domain)}`,
        { headers: { Authorization: `Bearer ${creds.api_key}` } },
      );
      return proxy(r.status, await r.text());
    }

    // ---- Transaction proxy (POST, Bearer auth) ----
    if (url.pathname === "/api/transaction" && req.method === "POST") {
      const body = await req.text();
      const r = await fetch("https://api.brandfetch.io/v2/brands/transaction", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${creds.api_key}`,
          "Content-Type": "application/json",
        },
        body,
      });
      return proxy(r.status, await r.text());
    }

    return new Response("Not found", { status: 404 });
  },
});

console.log(`\n  🎨 Brandfetch Playground`);
console.log(`     → http://localhost:${PORT}\n`);
