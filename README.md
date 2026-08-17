# Event Management Platform

A web app to manage events, track RSVPs, and send reminders. Admins can create
events, manage guest lists, and monitor attendance. Users can view event
details and register.

## Project structure

```
event-platform/
├── frontend/    React app (Vite) — the UI
├── backend/     Django REST Framework API — auth, events, RSVPs, reminders
└── README.md    You are here
```

## Status

🚧 In progress — following a 3-week build plan.

- **Week 1:** User registration, authentication, basic layout
  - ✅ Day 1: Frontend project setup, basic layout (header/sidebar/footer)
  - ✅ Day 2: Backend setup, User model with roles, register/login/me API endpoints
  - ✅ Day 3: Frontend registration/login forms connected to the backend
  - ✅ Day 4: Password reset (backend endpoints + frontend forms)
  - ✅ Day 5: Styled and mobile-responsive auth pages
- **Week 2:** Event creation and management
  - ✅ Day 6: Event model + full CRUD API (Admin-only create/edit/delete)
  - ✅ Day 7: Frontend event management UI (create form, connected to API)
  - ✅ Day 8: Event list with filtering (location, date, upcoming-only)
  - ✅ Day 9: RSVP model + API endpoints, guest list (Admin-only)
  - ✅ Day 10: Styling and mobile-responsiveness pass on event pages
- **Week 3:** Guest list, attendance tracking, and reminders

## Getting started (frontend)

```bash
cd frontend
npm install
npm run dev
```

Then open `http://localhost:5173` in your browser.

## Getting started (backend)

Not built yet — coming in Day 2.

## Roles

- **Admin** — creates and manages events, guest lists, sends reminders, views reports
- **Attendee** — browses events, registers, views event details
