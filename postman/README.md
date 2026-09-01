# API Testing

Two ways to test the EventHub API — use either, or both.

## 1. Postman (GUI)

1. Open Postman → **Import** → select `postman_collection.json`.
2. Make sure the backend is running (`python manage.py runserver` in `../backend`).
3. Run **Auth → Register** (or **Login**) first. The response token is captured
   automatically into the `{{token}}` collection variable and reused by every
   other request's `Authorization` header — you don't need to copy/paste it.
4. From there, run any request in **Events**, **RSVPs**, or **Guests**. Some
   requests (like "Retrieve Event") depend on `{{event_id}}`, which gets set
   automatically after you run **Create Event** once.

## 2. Scripted (curl)

With the backend running on `127.0.0.1:8000`:

```bash
./api_test.sh
```

This exercises registration, login, permission boundaries (organizer-only
edits/deletes, organizer-only guest list access), event CRUD, filtering,
RSVPs, guest list management, and the full password-reset flow — 15 checks
in total, pass/fail printed per check with a summary at the end.

It creates and cleans up its own test users (`alice`, `bob`) and data, so
it's safe to re-run — though re-running without clearing the database first
will fail the "register" checks with a 400 (username already taken). Reset
with:

```bash
cd ../backend
python manage.py shell -c "from django.contrib.auth import get_user_model; get_user_model().objects.filter(username__in=['alice','bob']).delete()"
```
