# Backend — Django REST Framework API

## What's here

- Custom User model (`accounts/models.py`) with a `role` field: `ADMIN` or `ATTENDEE`
- Auth endpoints:
  - `POST /api/auth/register/` — create an account
  - `POST /api/auth/login/` — log in, get back a token
  - `GET /api/auth/me/` — check who you're currently logged in as (requires token)
  - `POST /api/auth/password-reset/` — request a password reset (sends a link)
  - `POST /api/auth/password-reset-confirm/` — use that link's uid/token to set a new password
- Event endpoints (`events/` app):
  - `GET /api/events/` — list all events. Supports filters: `?location=...`, `?date_from=YYYY-MM-DD`, `?date_to=YYYY-MM-DD`, `?upcoming=true`
  - `POST /api/events/` — create an event (**Admin only**)
  - `GET /api/events/{id}/` — view one event
  - `PUT /api/events/{id}/` — update an event (**Admin only**)
  - `DELETE /api/events/{id}/` — delete an event (**Admin only**)
  - `POST /api/events/{id}/rsvp/` — RSVP to an event (any logged-in user)
  - `DELETE /api/events/{id}/rsvp/` — cancel your RSVP
  - `GET /api/events/{id}/guest_list/` — see who's RSVP'd (**Admin only**)

## Testing with Postman

A ready-to-import collection is included: `Eventry.postman_collection.json`.

1. Open Postman → **File → Import** → select that file
2. Make sure the server is running (`python manage.py runserver`)
3. Run requests in this order (they're already in the right order in the collection):
   1. **Register Admin** — automatically saves the admin's token
   2. **Register Attendee** — automatically saves the attendee's token
   3. **Create Event (Admin)** — automatically saves the new event's ID
   4. Everything else — already wired up to use those saved values

You shouldn't need to copy/paste any tokens or IDs by hand — the collection saves them automatically as you go (via each request's "Tests" tab, visible if you want to see how).

## Setup (first time only)

```bash
# 1. Create a virtual environment (a private box for this project's Python packages)
python -m venv venv

# 2. Activate it
# On Windows (Git Bash):
source venv/Scripts/activate
# On Mac/Linux:
source venv/bin/activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Create the database
python manage.py migrate

# 5. Run the server
python manage.py runserver
```

The API will be running at `http://127.0.0.1:8000/`.

## Trying it out

**Register a user:**
```bash
curl -X POST http://127.0.0.1:8000/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{"username": "sarah", "email": "sarah@example.com", "password": "SuperSecret123", "role": "ADMIN"}'
```

**Log in:**
```bash
curl -X POST http://127.0.0.1:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username": "sarah", "password": "SuperSecret123"}'
```

Both return a `token` — copy it and use it like this to check who you are:
```bash
curl http://127.0.0.1:8000/api/auth/me/ \
  -H "Authorization: Token PASTE_YOUR_TOKEN_HERE"
```

## Admin panel

Django comes with a built-in admin dashboard for viewing/editing data visually,
no API calls needed.

```bash
python manage.py createsuperuser
```

Follow the prompts, then visit `http://127.0.0.1:8000/admin/` and log in.

## About password reset emails

By default (no setup needed), "sending" an email just prints it to the
terminal running `python manage.py runserver` — so the project works
out of the box.

**To send real emails to your Gmail instead:**

1. Turn on 2-Step Verification on your Google account (required first):
   https://myaccount.google.com/security
2. Generate an "App Password" (a special 16-character password just for
   this app, separate from your real Gmail password):
   https://myaccount.google.com/apppasswords
3. In the `backend/` folder, copy `.env.example` to a new file called `.env`
4. Fill in your Gmail address and the app password you just generated:
   ```
   GMAIL_USER=youraddress@gmail.com
   GMAIL_APP_PASSWORD=your16charapppassword
   ```
5. Restart the server (`python manage.py runserver`)

That's it — password reset emails will now actually arrive in your Gmail
inbox instead of printing to the terminal. `.env` is git-ignored, so your
real password never gets uploaded to GitHub.
