# FixFlow Complaint Tracker System (MERN + JWT)

Full‑stack complaint management app where users register/login, submit complaints, track status, and admins manage all complaints from a dashboard.

## Project Title

FixFlow Complaint Tracker System

## Project Summary

This project allows citizens/users to register complaints, track their status, and receive email notifications when the status changes. Admins can view all complaints, update status, and manage the workflow from a dashboard.

## Features

- User signup/login with JWT authentication
- Complaint submission by logged-in users
- Complaint status tracking (`Pending` / `In Progress` / `Resolved` / `Rejected`)
- Admin dashboard (total + status breakdown)
- Email notifications on complaint submission and status updates

## Tech Stack

- Frontend: React + Vite
- Backend: Node.js + Express
- Database: MongoDB
- Auth: JWT
- Styling: Tailwind CSS + custom CSS

## Project Structure

- `frontend` - React client (Vite)
- `backend` - Express API + MongoDB + JWT auth

## Quick Start (Windows)

1. Start backend
   ```
   cd backend
   npm install
   copy .env
   npm run dev
   ```
2. Start frontend (new terminal)
   ```
   cd frontend
   npm install
   copy .env
   npm run dev
   ```
3. Open the app
   - Vite dev server (usually): `http://localhost:5173`

## Backend Setup

```bash
cd backend
npm install
npm run dev
```

Required `.env` values:

- `MONGODB_URI`
- `JWT_SECRET`

email `.env` values:

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

## Email Setup (Gmail SMTP)

1. Enable 2‑Step Verification on your Google account.
2. Create a 16‑digit App Password.
3. Update `backend/.env`:
   ```
   EMAIL_FROM=yourgmail@gmail.com
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=465
   SMTP_USER=yourgmail@gmail.com
   SMTP_PASS=your_app_password
   SMTP_SECURE=true
   ```
4. Restart backend.

## Environment Files

Use these templates to keep setup consistent:

- `backend/.env`
- `frontend/.env`

## Troubleshooting

- `ERR_CONNECTION_REFUSED :5000`
  - Backend is not running. Start it with `npm run dev` in `backend`.
- `npm ERR! ERESOLVE`
  - Dependency mismatch. Re-run `npm install` after syncing `package.json`.
- PowerShell: `npm.ps1 cannot be loaded`
  - Use Command Prompt, or run `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` in PowerShell.
- Logo/Favicon not showing
  - Ensure images are in `frontend/public` and referenced as `/filename.png` in `index.html`.

## How To Run (Install + Start)

1. Backend setup
   ```bat
   cd backend
   npm install
   copy .env.example .env
   npm run dev
   ```
2. Frontend setup (new terminal)
   ```bat
   cd frontend
   npm install
   copy .env.example .env
   npm run dev
   ```
3. Open the app
   - Vite dev server (usually): `http://localhost:5173`

## How To Use (User Steps)

1. Open the app and signup with a valid Gmail address.
2. Login and submit a new complaint with description + location + optional image.
3. Track status in "My Complaints".
4. If you are an admin, open "All Complaints" and update status.
5. Email notifications are sent on submission and on status updates.

## Author

Lakshay
