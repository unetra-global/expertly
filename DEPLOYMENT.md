# Deployment Guide

This guide explains how to deploy the Expertly monorepo (API + Web) to a server using Docker Compose.

## Prerequisites
1. **Docker**: Ensure Docker and Docker Compose are installed on your server.
2. **Environment Variables**: You will need `.env` files for both applications.

## 1. Setup Environment Variables

On your server, you need to populate `.env` files for both the API and Web apps.

- **API Configuration** (`apps/api/.env`):
  Base it on `apps/api/.env.example`. Make sure it includes the `DATABASE_URL` for Supabase, `SUPABASE_JWT_SECRET`, Redis connections, and any AI keys.
  
- **Web Configuration** (`apps/web/.env`):
  Base it on `apps/web/.env.example`. This will likely need `NEXT_PUBLIC_API_URL` (e.g., `http://<your-server-ip>:3001`), and `NEXT_PUBLIC_SUPABASE_URL`.

## 2. Start the Applications

Once your codebase is cloned onto the server and you are in the root directory:

```bash
docker compose up -d --build
```

This command will:
1. Build the NestJS API container using pnpm and Turbo.
2. Build the Next.js Web container using Next standalone build mode.
3. Start both containers in the background (`-d`).

### Stop the applications
To stop the application, run:
```bash
docker compose down
```

## Troubleshooting
- **API not connecting to database**: Check the `DATABASE_URL` in `apps/api/.env`.
- **Containers failing to build**: If a build fails due to missing packages, ensure you've properly synchronized the latest `pnpm-lock.yaml`.
- **View logs**: Run `docker compose logs -f` to see real-time output from both services.
