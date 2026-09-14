# API

Base URL: the backend Railway domain.

## Auth
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `GET /api/me`

## Dashboard
- `GET /api/dashboard`

## Users
- `GET /api/users`
- `POST /api/users`
- `PUT /api/users/:id`
- `DELETE /api/users/:id`

All protected endpoints require the secure session cookie created by login.
