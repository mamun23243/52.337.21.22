# Management System — Railway Setup

## Services

Use two Railway services from this repository:

### Backend
- Builder: Dockerfile
- Dockerfile path: `/backend/Dockerfile`
- Public port: `4000`

Variables:
- `DATABASE_URL` = your Aiven MySQL connection string
- `JWT_SECRET` = long random secret
- `JWT_REFRESH_SECRET` = another long random secret
- `FRONTEND_URL` = frontend Railway domain
- `NODE_ENV` = `production`
- `ADMIN_EMAIL` = your admin email
- `ADMIN_USERNAME` = your admin username
- `ADMIN_NAME` = your admin name
- `ADMIN_PASSWORD` = your strong admin password

### Frontend
- Builder: Dockerfile
- Dockerfile path: `/frontend/Dockerfile`
- Public port: `80`
- `VITE_API_URL` = backend Railway domain

## Database

The backend Dockerfile runs:

`npx prisma migrate deploy`

The first database initialization should be performed with the schema migration available in your deployment workflow, then run:

`npm run prisma:seed`

Set `ADMIN_PASSWORD` before seeding. Never commit a real password or `.env`.

## Login

Admin:
- use the `ADMIN_EMAIL` / `ADMIN_PASSWORD` values you configured in Railway.

Users:
- Admin creates users from `/admin/users`.
- Only ACTIVE users can log in.
- USER role is redirected to `/user/dashboard`.
- Admin/manager roles are redirected to `/admin/dashboard`.

## Important

This package is a ready implementation baseline. Before production use, review your existing Prisma migrations if your current Aiven database already contains data. Do not blindly reset or delete an existing database.

## Existing database warning

If your Aiven database already contains an important existing application/schema, BACK UP the database before deploying this package. This version uses `prisma db push` to initialize/synchronize the Prisma schema instead of shipping a generated migration history. Do not use it against an important existing database until the current schema has been compared.
