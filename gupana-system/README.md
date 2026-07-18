# Gupana Electrical Supplies — Service Request & Inquiry Management System

A full-stack system for **Gupana Electrical Supplies and Installation Services**: clients submit service requests and inquiries and track their appointments; admins manage everything from one dashboard.

## What's in this package

```
gupana-system/
├── database/
│   └── schema.sql          PostgreSQL schema + seed data (ERD: users, services,
│                            service_requests, appointments, inquiries,
│                            notifications, activity_logs, schedule_blocks)
├── backend/                 Node.js + Express REST API
│   ├── src/
│   │   ├── server.js
│   │   ├── config/          db connection, seed script, helpers
│   │   ├── middleware/      JWT auth
│   │   └── routes/          auth, users, services, service-requests,
│   │                        appointments, inquiries, notifications,
│   │                        activity-logs, reports, client-dashboard
│   ├── package.json
│   └── .env.example
└── frontend/                 Plain HTML/CSS/JS, multiple pages, no build step
    ├── shared/
    │   ├── css/theme.css      one shared stylesheet for every page
    │   └── js/
    │       ├── core.js         config, API helper, toast, modal, formatters
    │       ├── demo-data.js    sample data used automatically offline
    │       ├── admin-shell.js  admin header/sidebar/bottom-nav + auth guard
    │       ├── admin-pages.js  admin page logic (one function per page)
    │       ├── client-shell.js client header/sidebar/bottom-nav + auth guard
    │       └── client-pages.js client page logic (one function per page)
    ├── admin/                 login.html, dashboard.html, users.html,
    │                          services.html, requests.html, appointments.html,
    │                          inquiries.html, notifications.html, reports.html,
    │                          activity.html, settings.html, more.html
    └── client/                login.html, register.html, dashboard.html,
                               services.html, requests.html, appointments.html,
                               inquiries.html, profile.html, settings.html
```

Every page is real HTML you can open directly — navigating between pages is normal browser navigation (`<a href="...">`), not a JS router. Shared look-and-feel and logic live in `frontend/shared/`, so styling or fixing a bug once updates every page that uses it.

Both `/admin` and `/client` are **fully responsive**: sidebar + top bar on desktop, and a bottom tab bar + slide-out drawer on mobile — matching the two layouts in your reference images.

**Try it immediately, no setup required:** open `admin/login.html` or `client/login.html` and log in with any email/password. If the page can't reach a backend at the configured API URL, it automatically switches to **demo mode** and fills the interface with sample data (shown via the yellow banner) so you can click through every screen right away.

### Recent changes
- **Admin's scheduling note is now visible to the client** on both the request detail view and the Appointments page, regardless of the request's status.
- **Clients can edit their own profile** (name, phone, address) from Profile → Save Changes.
- **Pricing has been removed from Services** everywhere (admin form, service cards) — money is discussed directly with the client, not shown in the app.
- **Service Requests are now grouped into Recent / Old** (14-day threshold) in addition to the existing status tabs, on the admin Requests page.
- **Admins can delete a service request** directly from the Requests table (trash icon) or its detail view.



## 1. Set up the database

```bash
createdb gupana_db
psql -d gupana_db -f database/schema.sql
```

This creates all tables, indexes, triggers, and seeds the services + an admin account placeholder + sample schedule blocks.

## 2. Set up the backend

```bash
cd backend
cp .env.example .env
# edit .env with your PostgreSQL credentials and a JWT_SECRET
npm install
npm run seed     # sets the real admin password (admin@gupana.com / Admin@123)
npm run dev       # or: npm start
```

The API runs at `http://localhost:4000/api` by default. Health check: `GET /api/health`.

### Key endpoints

| Area | Endpoints |
|---|---|
| Auth | `POST /auth/register`, `POST /auth/login`, `GET /auth/me` |
| Users | `GET/PUT/DELETE /users`, `PUT /users/:id/password` (admin) |
| Services | `GET /services` (public), `POST/PUT/DELETE /services` (admin) |
| Schedule blocks | `GET /schedule-blocks` (public), `POST/DELETE` (admin) |
| Service requests | `GET/POST /service-requests`, `PUT /service-requests/:id/status` (admin) |
| Appointments | `GET/POST /appointments`, `PUT /appointments/:id/status`, `PUT /appointments/:id/reschedule` |
| Inquiries | `GET/POST /inquiries`, `PUT /inquiries/:id/reply` (admin) |
| Notifications | `GET /notifications`, `PUT /notifications/:id/read`, `PUT /notifications/read-all` |
| Activity logs | `GET /activity-logs` (admin) |
| Reports | `GET /reports/dashboard`, `GET /reports/generate` (admin) |
| Client dashboard | `GET /client-dashboard` |

All routes except `/auth/*`, `GET /services`, and `GET /schedule-blocks` require a `Authorization: Bearer <token>` header (the token returned from login/register).

## 3. Connect the frontend to your backend

Open `frontend/shared/js/core.js` and change one line near the top:

```js
const API_BASE_URL = "https://gupana-electrical-supplies-and.onrender.com/api"; // change this to your deployed backend URL
```

That's it — every admin and client page reads this same file, so you only edit it once. Then also set `CLIENT_ORIGIN` in the backend `.env` to wherever you're hosting/opening these pages from, so CORS allows the requests.

## 4. Deploying

- **Database:** any managed PostgreSQL (Render, Railway, Supabase, RDS, etc.) — just run `schema.sql` against it.
- **Backend:** any Node host (Render, Railway, Fly.io, a VPS with PM2, etc.). Set the `.env` variables in your host's environment settings.
- **Frontend:** the `frontend/` folder can be hosted anywhere static (Netlify, Vercel, GitHub Pages, S3, or your own web server) or simply opened locally — just point `API_BASE_URL` in `shared/js/core.js` at your live backend URL. Keep the folder structure intact (`admin/`, `client/`, `shared/`) since the pages reference `shared/` with relative paths.

## Default accounts

| Role | Email | Password |
|---|---|---|
| Admin | admin@gupana.com | Admin@123 (after running `npm run seed`) |
| Client | (register your own via the client portal's "Create one" link) |  |

## Notes

- Passwords are hashed with bcrypt; sessions use JWT (7-day expiry by default, configurable via `JWT_EXPIRES_IN`).
- Every admin action that changes data (approving requests, replying to inquiries, scheduling appointments, editing services/users) is written to `activity_logs`, and triggers a `notifications` row for the affected client.
- The dashboard's "Requests Over Time" chart and status donut are computed live from `service_requests` in `GET /reports/dashboard`.
- The **Reports** page can generate on-screen tables for Service Requests, Appointments, Inquiries, and Activity Logs within a date range; wire up a PDF/CSV export library (e.g. `pdfkit`, `json2csv`) in `backend/src/routes/reports.js` if you need downloadable files.
