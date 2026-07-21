# Deploying MerchantOps

MerchantOps is a standard Next.js app, so it deploys anywhere Next runs. For a
free live demo, **Vercel + a hosted Postgres** (Neon or Vercel Postgres) is the
simplest path.

## Vercel + Neon (recommended, ~5 minutes)

1. **Create a Postgres database** at [neon.tech](https://neon.tech) (free tier) and copy the connection string.
2. **Switch Prisma to Postgres** — in `prisma/schema.prisma` change:
   ```prisma
   datasource db {
     provider = "postgresql"   // was: "sqlite"
     url      = env("DATABASE_URL")
   }
   ```
3. **Import the repo** at [vercel.com/new](https://vercel.com/new) → select `merchant-ops`.
4. **Set environment variables** in Vercel:
   - `DATABASE_URL` = your Neon connection string
   - `AUTH_SECRET` = a long random string (e.g. `openssl rand -base64 32`)
5. **Set the build command** to run migrations then build:
   ```
   npx prisma migrate deploy && npm run build
   ```
6. **Deploy.** Then seed once from your machine against the prod DB:
   ```
   DATABASE_URL="<neon-url>" npm run db:seed
   ```

Login with `admin@merchantops.dev` / `password123`.

## Docker (any host)

```bash
docker compose up --build   # app + Postgres (see docker-compose.yml)
```
