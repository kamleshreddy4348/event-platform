# EventHub

A full-stack event management platform — React frontend + Django REST Framework backend.
Covers registration, auth, password reset, role-based access control (Admin/Attendee), event
CRUD + filtering, RSVPs, guest list management, and event reminders/notifications — the full
Week 1–3 project plan.

## Stack

- **Backend:** Django 6, Django REST Framework, Token auth, django-filter, django-cors-headers, SQLite (dev)
- **Frontend:** React 19 (Vite), React Router, Axios, Tailwind CSS v4
- **Design:** a light violet dashboard UI (sidebar + topbar layout, stat cards, live session
  timer) in the style of admin dashboards like EventPro.

## Project structure

```
eventapp/
├── backend/            # Django project — run this first
│   ├── config/          # settings, root urls
│   ├── accounts/        # register, login, logout, me, password reset, Admin/Attendee Profile
│   ├── events/           # Event model + CRUD + search/filter
│   ├── rsvps/             # RSVP model + CRUD
│   ├── guests/             # Guest list model + CRUD + nested "event+guests" view
│   └── notifications/      # Notification model + API + send_event_reminders command
│
├── frontend/            # React (Vite) app — run this second
│   └── src/
│       ├── api/           # axios client with token auth
│       ├── context/        # AuthContext (tracks session start time)
│       ├── components/      # Sidebar, Topbar, SessionTimer, EventCard, form pieces
│       └── pages/           # Dashboard, Login, Register, PasswordReset, EventList,
│                              EventDetail, EventForm, GuestList
│
└── postman/             # API testing — use once the backend is running
    ├── postman_collection.json  # import into Postman to test every endpoint
    ├── api_test.sh               # scripted end-to-end test (curl) — all 15 checks pass
    └── README.md                  # how to use either
```

## Running locally

### 1. Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate        # Windows (Git Bash): source venv/Scripts/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```
API is served at `http://127.0.0.1:8000/api/`. Leave this terminal running.

No `.env` file is required to run locally — without one, emails (password reset, reminders)
print to the console. Copy `.env.example` to `.env` and fill in `EMAIL_HOST` only if you want
real email delivery (see the "Email delivery" note under API overview below).

### 2. Frontend (in a separate terminal)

```bash
cd frontend
npm install
cp .env.example .env    # points at the local API by default
npm run dev
```
App runs at `http://127.0.0.1:5173/`. Register a new account first — the database starts empty.

### 3. Postman / API testing (optional, once the backend is running)

See `postman/README.md` — import `postman/postman_collection.json` into Postman, or run
`postman/api_test.sh` for a scripted end-to-end check.

## API overview

| Area | Endpoint | Notes |
|---|---|---|
| Auth | `POST /api/auth/register/` | body accepts optional `role`: `admin` or `attendee` (default). Returns `{token, user, expires_at}` |
| Auth | `POST /api/auth/login/` | returns `{token, user, expires_at}` — issues a **fresh** token each time, invalidating any previous one for that user |
| Auth | `POST /api/auth/logout/` | requires `Authorization: Token <token>` |
| Auth | `GET  /api/auth/me/` | current user (includes `role`), plus `expires_at` for the active token |
| Auth | `POST /api/auth/password-reset/` | emails a reset link; dev mode (no `EMAIL_HOST` set) also returns `uid`/`token` directly for easy local testing |
| Auth | `POST /api/auth/password-reset-confirm/` | `{uid, token, new_password}` |
| Events | `GET/POST /api/events/` | list/create; **creating requires the Admin role**; supports `?search=`, `?location=`, `?date_after=`, `?date_before=` |
| Events | `GET/PATCH/DELETE /api/events/{id}/` | only the organizer can edit/delete |
| RSVPs | `GET/POST /api/rsvps/` | `?event={id}` to scope; status: `going`/`maybe`/`not_going`; RSVP'ing "going" notifies the organizer |
| Guests | `GET/POST /api/guests/` | organizer-only; `?event={id}` to scope |
| Guests | `GET /api/guests/by-event/{event_id}/` | event + full nested guest list |
| Notifications | `GET /api/notifications/` | current user's notifications, newest first |
| Notifications | `GET /api/notifications/unread-count/` | `{count}` |
| Notifications | `POST /api/notifications/mark-all-read/` | marks every unread notification read |
| Notifications | `PATCH /api/notifications/{id}/` | mark a single notification `{"read": true}` |

All endpoints except register/login/password-reset require `Authorization: Token <token>`.

**Session expiry:** login tokens expire 24 hours after login (`TOKEN_EXPIRE_HOURS` in
`config/settings.py`). An expired token gets a `401` with `"Session expired. Please log in
again."` and is deleted server-side. The frontend tracks the real `expires_at` it gets back
from the API, shows a live countdown in the topbar, and automatically logs the user out —
with a "your session expired" notice on the login page — when it runs out or when any API
call comes back `401`.

**Roles:** every user is `admin` or `attendee` (chosen at registration; defaults to
`attendee`). Only Admins can create events. Once an event exists, only *that event's*
organizer (the Admin who created it) can edit/delete it or manage its guest list — an Admin
can't edit another Admin's event. Attendees can browse every event and RSVP freely.

**Reminders:** `python manage.py send_event_reminders` sends a reminder notification (and a
console-logged/emailed message) to everyone RSVP'd "going" to an event starting within
`REMINDER_WINDOW_HOURS` (default 24). It's idempotent — safe to run on a schedule (cron,
Celery beat, etc.) since each user only ever gets one reminder per event. Organizers also get
an in-app notification whenever someone RSVPs "going" to their event.

**Email delivery:** by default (no `.env`), all emails — password reset links and event
reminders — print to the console instead of sending, and password reset also returns the
`uid`/`token` directly in its API response so you can test the flow without reading server
logs. To send real emails, copy `backend/.env.example` to `backend/.env` and fill in
`EMAIL_HOST` (see the Gmail SMTP walkthrough in that file) — setting `EMAIL_HOST` switches on
real delivery automatically, and password reset stops returning the token in its response
once it does.

To run reminders on an actual schedule rather than by hand, add a cron entry:
```
0 * * * * cd /path/to/backend && venv/bin/python manage.py send_event_reminders
```

## Frontend pages

| Page | URL | Notes |
|---|---|---|
| Dashboard | `/` | Home screen after login — stats, upcoming events, quick actions |
| Login | `/login` | Session timer starts on successful login |
| Register | `/register` | Includes an Admin/Attendee role picker |
| Password reset | `/password-reset` | |
| Events | `/events` | Search + location filter; "Host an event" only shown to Admins |
| Host an event | `/events/new` | Admin only (redirects Attendees to Dashboard) |
| Event detail | `/events/:id` | RSVP buttons; organizer sees edit/delete/guest-list controls |
| Edit event | `/events/:id/edit` | Admin/organizer only |
| Guest list | `/events/:id/guests` | Admin/organizer only |
| Notifications | `/notifications` | Reminders + RSVP updates; bell icon in the topbar shows unread count |

## Pushing to GitHub

This repo is already `git init`-ed and committed locally. To push:

```bash
git remote add origin <your-repo-url>
git branch -M main
git push -u origin main
```
