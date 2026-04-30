# Brandfetch Playground

An interactive playground that exercises **all 4 [Brandfetch](https://brandfetch.com) APIs** in one polished single-page app. Search any company, inspect its full brand profile, customize logos, generate copy-paste embed code, identify merchants from raw transaction strings, compare brands side-by-side, and assemble logo walls — all from one screen.

### 🌐 [**Live Demo → brandfetch-playground.vercel.app**](https://brandfetch-playground.vercel.app)

![Live](https://img.shields.io/badge/live-brandfetch--playground.vercel.app-a78bfa?style=flat&logo=vercel&logoColor=white) ![Bun](https://img.shields.io/badge/runtime-Bun-fbf0df) ![License](https://img.shields.io/badge/license-MIT-a78bfa)

## What's inside

| # | Feature | API used |
|---|---------|----------|
| 1 | **Brand Search & Profile** — live autocomplete; click to load logos, colors, fonts, description, social links | Search + Brand |
| 2 | **Logo Customizer** — tune type, theme, format, height with live preview and copyable URL | Logo |
| 3 | **Embed Code Generator** — copy-paste snippets for HTML, React, Next.js, Markdown, CSS | Logo |
| 4 | **Transaction Detective** — identify the merchant from raw bank/payment strings | Transaction |
| 5 | **Brand Comparison** — diff two brands side-by-side: logo, colors, fonts, description | Brand |
| 6 | **Brand Wall** — paste a list of domains, get a polished logo moodboard (light/dark, 3 logo types) | Logo |

## Quick start

```bash
# 1. Clone
git clone https://github.com/bogaja/brandfetch-playground.git
cd brandfetch-playground

# 2. Get your free API keys at https://developers.brandfetch.com/dashboard
#    You need both:
#    - Client ID (for Logo + Search APIs)
#    - API Key  (for Brand + Transaction APIs)

# 3. Configure
cp .env.example .env
# edit .env, paste your keys

# 4. Run (requires Bun — https://bun.sh)
bun run server.ts

# 5. Open
open http://localhost:3737
```

## Architecture

```
┌────────────────┐
│  Browser       │
│  index.html    │
└───────┬────────┘
        │  /api/*  (relative)
        ▼
┌────────────────────────────────────────┐
│  Bun server (server.ts, ~80 LOC)       │
│  • /api/config       → client_id only  │
│  • /api/search       → proxies Search  │
│  • /api/brand/:dom   → proxies Brand   │
│  • /api/transaction  → proxies Tx      │
└───────┬────────────────────────────────┘
        │  Bearer auth (server-side only)
        ▼
   api.brandfetch.io
```

**Why a proxy?** The Brand API and Transaction API require Bearer authentication that must never reach the browser. The server keeps the API key, and the client only ever sees the public client ID.

## Files

| File | Purpose |
|------|---------|
| `server.ts` | Bun server with the 4 proxy routes |
| `index.html` | Single-file UI — vanilla JS, no build step |
| `.env.example` | Template for credentials |
| `.gitignore` | Excludes `.env`, `credentials.json` |
| `package.json` | npm-compatible metadata, scripts |
| `start.sh` | Convenience launcher |

## Configuration

All configuration is via environment variables, loaded automatically from `.env` by Bun.

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `BRANDFETCH_CLIENT_ID` | yes | — | Logo + Search APIs |
| `BRANDFETCH_API_KEY`   | yes | — | Brand + Transaction APIs |
| `PORT`                 | no  | `3737` | Server port |

## API quirks worth knowing

- **Logo API** returns a **302 redirect** to the actual CDN asset. The redirect is fine for `<img src>` and `curl -L`, but a raw `fetch()` on a logo URL won't see the bytes unless you follow redirects.
- **Search API** has `Access-Control-Allow-Origin: *` and works directly from a browser — no proxy strictly required.
- **Brand & Transaction APIs** require Bearer auth and are not safe to call from the browser.
- **Free tier** has tight rate limits — check the dashboard before bulk operations.

## Production deploy

The server is a tiny Bun process. Deploy to any Bun-compatible host:

- **Render / Railway / Fly.io** — set `BRANDFETCH_CLIENT_ID` and `BRANDFETCH_API_KEY` as env vars; run `bun run server.ts`
- **Vercel/Netlify** — works with [Bun runtime support](https://bun.sh/) or by porting `server.ts` to a Node.js handler

## License

MIT
