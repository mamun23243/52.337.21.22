# Management System — Railway Ready

## Deploy
1. Create a Railway project.
2. Add a MySQL database.
3. Add a service from `backend/`.
4. Set backend variables from `backend/.env.example`.
5. Set `SEED_ADMIN_EMAIL` and `SEED_ADMIN_PASSWORD` if desired.
6. Deploy backend and verify `/health`.
7. Add a second service from `frontend/`.
8. Set `VITE_API_URL` to the deployed backend URL.
9. Deploy frontend.

## Default seed
Email: admin@example.com
Password: ChangeMe123!

Change the password immediately in production.

## Important
This package is a Railway deployment foundation. It intentionally does not pretend to contain the full prior ZIP's unseen business modules, because that ZIP was not available in this chat.
