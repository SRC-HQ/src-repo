# Sperm Race – Deployment Guide

This guide covers **Docker** (dev + prod) and **Hetzner VPS with Nginx** deployment, using [Turborepo’s Docker approach](https://turborepo.dev/docs/guides/tools/docker) and best practices.

---

## 1. Local development

From repo root (no need to `cd` into `packages/contracts`):

```bash
bun install
bun run build:contracts   # when you change lib.rs: anchor build + copy types/IDL to packages/contract-types
bun run dev
```

- **build:contracts** runs `anchor build` in `packages/contracts` and copies `target/types/sperm_race.ts` and `target/idl/sperm_race.json` into **packages/contract-types/src**. Commit and push `packages/contract-types` so VPS/CI get types without building contracts.
- Frontend: http://localhost:3000  
- Backend: http://localhost:4000  

Ensure Postgres and Redis are running (local or Docker).

---

## 2. Docker – Development

Use Compose to run API + Web with hot reload and optional Postgres/Redis.

**Option A – Single dev container (like `bun run dev`):**

```bash
# With Postgres + Redis
docker compose -f docker-compose.dev.yml --profile full up

# Or attach to run dev interactively
docker compose -f docker-compose.dev.yml --profile full run --rm dev
```

**Option B – API and Web as separate services:**

```bash
docker compose -f docker-compose.dev.yml --profile split up
```

Create a `.env` from `env.example` and set `DB_URL` / `REDIS_URL` to match the dev Postgres/Redis services (or your host).

**First time in dev container:** If you need updated types/IDL, run from host (with Rust/Anchor) then commit `packages/contract-types`; or run `bun run build:contracts` inside the container if Rust/Anchor are installed there. Then `bun run dev` as usual.

---

## 3. Docker – Production build

Build and run API + Web as production images. **Types/IDL live in `packages/contract-types`** (committed); API and Web depend on `@sperm-race/contract-types`. No `packages/contracts/target` in Docker or on the server.

**When you change `lib.rs` (locally):**

1. From repo root: `bun run build:contracts` (anchor build + copy to `packages/contract-types/src`).
2. Commit and push `packages/contract-types` (small; no multi‑GB `target/`).
3. On VPS: `git pull && docker compose build && docker compose up -d` — no Rust/Anchor needed on the server.

**Build (from repo root):**

```bash
# API
docker build -f apps/api/Dockerfile -t sperm-race-api:latest .

# Web (set build-time env for client)
docker build -f apps/web/Dockerfile -t sperm-race-web:latest . \
  --build-arg NEXT_PUBLIC_API_URL=https://api.yourdomain.com \
  --build-arg NEXT_PUBLIC_WS_URL=wss://api.yourdomain.com \
  --build-arg NEXT_PUBLIC_SOLANA_NETWORK=devnet \
  --build-arg NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com \
  --build-arg NEXT_PUBLIC_PROGRAM_ID=EPLZGLkPntoQswDdtDdgZ3kK1jrQBJC66dgadtyeDEry
```

**Optional – Turbo Remote Cache (faster rebuilds):**

```bash
docker build -f apps/api/Dockerfile -t sperm-race-api:latest . \
  --build-arg TURBO_TEAM=your-team \
  --build-arg TURBO_TOKEN=your-token
```

**Run with Compose:**

```bash
# Ensure .env exists (see env.example)
cp env.example .env
# Edit .env with production values

docker compose up -d
```

- API: `API_PORT` (default 4000)  
- Web: `WEB_PORT` (default 3000)  

**Secrets:** Do **not** put secrets in the image. Use:

- `env_file: .env` (and keep `.env` off the repo), or  
- Docker secrets / your orchestrator’s secret store  

Only `NEXT_PUBLIC_*` and optional `TURBO_*` are build-time; everything else (e.g. `DB_URL`, `REDIS_URL`, `JWT_SECRET`, `BACKEND_WALLET_PRIVATE_KEY`) is runtime via env.

---

## 4. Hetzner VPS + Nginx

Assumptions:

- VPS with Docker and Docker Compose
- Domain (e.g. `app.example.com`, `api.example.com`) pointing to the VPS
- Nginx as reverse proxy and TLS termination

### 4.1 Server setup

```bash
# Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
# Log out and back in

# Docker Compose (if not included)
sudo apt update && sudo apt install -y docker-compose-plugin

# Nginx
sudo apt install -y nginx
```

### 4.2 Project on the server

```bash
git clone <your-repo> sperm-race
cd sperm-race
```

Create production `.env` (do not commit):

```bash
cp env.example .env
nano .env   # set DB_URL, REDIS_URL, JWT_SECRET, BACKEND_WALLET_PRIVATE_KEY, etc.
```

Set **public** URLs for the frontend (build-time for Next.js):

- `NEXT_PUBLIC_API_URL=https://api.yourdomain.com`
- `NEXT_PUBLIC_WS_URL=wss://api.yourdomain.com`
- Other `NEXT_PUBLIC_*` as in `env.example`

### 4.3 Build and run containers

```bash
docker compose build
docker compose up -d
```

Ensure Postgres and Redis are reachable (same host or managed DB). If they run on the host, use the host’s IP or `host.docker.internal` (or host network) in `DB_URL` / `REDIS_URL`.

### 4.4 Nginx reverse proxy

**API** – e.g. `api.yourdomain.com` (HTTP + WebSocket):

```nginx
# /etc/nginx/sites-available/sperm-race-api
map $http_upgrade $connection_upgrade {
    default upgrade;
    ''      close;
}

server {
    listen 80;
    server_name api.yourdomain.com;
    location / {
        proxy_pass http://127.0.0.1:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection $connection_upgrade;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 86400;
    }
}
```

**Web** – e.g. `app.yourdomain.com`:

```nginx
# /etc/nginx/sites-available/sperm-race-web
server {
    listen 80;
    server_name app.yourdomain.com;
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable and reload:

```bash
sudo ln -s /etc/nginx/sites-available/sperm-race-api /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/sperm-race-web /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

### 4.5 TLS with Let’s Encrypt (recommended)

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d api.yourdomain.com -d app.yourdomain.com
```

Certbot will adjust the Nginx config for HTTPS. Ensure in `.env`:

- `NEXT_PUBLIC_API_URL=https://api.yourdomain.com`
- `NEXT_PUBLIC_WS_URL=wss://api.yourdomain.com`

### 4.6 Deployment steps (summary)

1. **Code:** Locally, after contract changes run `bun run build:contracts`, commit `packages/contract-types`, push.
2. **Server:** `cd sperm-race && git pull`.
3. **Env:** Keep `.env` in place (or update only what changed).
4. **Build:** `docker compose build` (optionally with `TURBO_TEAM` / `TURBO_TOKEN`).
5. **Run:** `docker compose up -d`.
6. **Migrations:**  
   `docker compose exec api bun run db:migrate`  
   (or your actual migration command).
7. **Nginx:** No change unless you add/change domains; then reload Nginx and Certbot if needed.

### 4.7 Env as “secrets” on the server

- Store `.env` outside the repo (e.g. `/opt/sperm-race/.env`) and point Compose to it with `env_file`.
- Or use Docker secrets:  
  `echo -n "your-secret" | docker secret create db_url -`  
  and reference in the stack file (Compose v3 secrets).  
- Restrict file permissions: `chmod 600 .env`.

---

## 5. Files added / changed

| Path | Purpose |
|------|--------|
| `packages/contract-types/` | Types + IDL only (committed); API/Web depend on this, not `contracts/target` |
| `scripts/copy-contract-types.sh` | Run after anchor build; copies types/IDL from `contracts/target` → `contract-types/src` |
| `.dockerignore` | Excludes `packages/contracts/target`; apps use `contract-types` from prune |
| `apps/api/Dockerfile` | Multistage: turbo prune → NestJS build (uses `contract-types`) → minimal runner |
| `apps/web/Dockerfile` | Multistage: turbo prune → Next.js standalone (uses `contract-types`) → minimal runner |
| `apps/web/next.config.js` | `output: 'standalone'` for smaller production image |
| `docker-compose.yml` | Production API + Web |
| `docker-compose.dev.yml` | Dev with optional Postgres/Redis and profiles |
| `docs/DEPLOYMENT.md` | This guide |

---

## 6. Troubleshooting

- **API “DB_URL required”:** Set `DB_URL` (and optionally `REDIS_URL`) in `.env` or in the container env.
- **Web 404 / wrong API URL:** Rebuild the web image with the correct `NEXT_PUBLIC_*` build args; they are baked in at build time.
- **WebSocket disconnect:** Ensure Nginx has `Upgrade` and `Connection` (see API Nginx config) and that the frontend uses `wss://` in production.
- **Docker build / “contract types not found”:** Ensure `packages/contract-types/src` is committed (types + IDL). After changing `lib.rs`, run `bun run build:contracts` from root, then commit and push `packages/contract-types`.
