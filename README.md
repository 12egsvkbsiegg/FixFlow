# Complaint Tracker System (MERN + JWT)

A full stack complaint management app where users can register/login, submit complaints, track status, and admins can manage all complaints from a dashboard.

## Features

- User signup/login with JWT authentication
- Complaint submission by logged-in users
- Complaint status tracking (`Pending` / `Resolved`)
- Admin dashboard (total/pending/resolved)
- Email notifications on complaint submission and status updates

## Tech Stack

- Frontend: React + Vite
- Backend: Node.js + Express
- Database: MongoDB
- Auth: JWT

## Project Structure

- `frontend` - React client (Vite)
- `backend` - Express API + MongoDB + JWT auth

## Backend Setup

```bash
cd backend
npm install
npm run dev
```

Required `.env` values:

- `MONGODB_URI`
- `JWT_SECRET`

Optional email `.env` values:

- `EMAIL_FROM`
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`
- `SMTP_SECURE`

If SMTP values are not set, app uses JSON transport (logs mail payload in server console).

Gmail SMTP needs a 16‑digit App Password (normal Gmail password will not work).

## Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Optional `.env` value:

- `VITE_API_BASE` (default `http://localhost:5000/api`)

## API Endpoints

### Auth

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/auth/me`

### Complaints

- `POST /api/complaints` (user/admin)
- `GET /api/complaints/my` (user/admin)
- `GET /api/complaints` (admin)
- `PATCH /api/complaints/:id/status` (admin)

### Admin

- `GET /api/admin/dashboard` (admin)

## Default Flow

1. Signup as `user` and submit complaint.
2. Signup/login as `admin` and update complaint status.
3. User sees status update in their complaint list.

## Notes

- Gmail-only email validation is enabled for signup/login.
- To receive real emails, configure SMTP in `backend/.env` and restart the backend.
