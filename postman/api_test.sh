#!/bin/bash
BASE="http://127.0.0.1:8000/api"
pass=0; fail=0
check() {
  local desc="$1" expect="$2" got="$3"
  if [ "$got" == "$expect" ]; then echo "PASS  $desc ($got)"; pass=$((pass+1));
  else echo "FAIL  $desc (expected $expect, got $got)"; fail=$((fail+1)); fi
}

echo "== Register organizer =="
R=$(curl -s -w "\n%{http_code}" -X POST $BASE/auth/register/ -H "Content-Type: application/json" \
  -d '{"username":"alice","email":"alice@example.com","password":"SuperSecret123!","role":"admin"}')
CODE=$(echo "$R" | tail -1); BODY=$(echo "$R" | sed '$d')
check "register organizer" 201 "$CODE"
TOKEN_ALICE=$(echo "$BODY" | python3 -c "import sys,json;print(json.load(sys.stdin)['token'])")

echo "== Register attendee =="
R=$(curl -s -w "\n%{http_code}" -X POST $BASE/auth/register/ -H "Content-Type: application/json" \
  -d '{"username":"bob","email":"bob@example.com","password":"SuperSecret123!"}')
CODE=$(echo "$R" | tail -1); BODY=$(echo "$R" | sed '$d')
check "register attendee" 201 "$CODE"
TOKEN_BOB=$(echo "$BODY" | python3 -c "import sys,json;print(json.load(sys.stdin)['token'])")

echo "== Login organizer =="
R=$(curl -s -w "\n%{http_code}" -X POST $BASE/auth/login/ -H "Content-Type: application/json" \
  -d '{"username":"alice","password":"SuperSecret123!"}')
CODE=$(echo "$R" | tail -1); BODY=$(echo "$R" | sed '$d')
check "login organizer" 200 "$CODE"
# Login issues a fresh token (resets its expiry clock), which invalidates the
# token we got from Register above — so re-capture it here.
TOKEN_ALICE=$(echo "$BODY" | python3 -c "import sys,json;print(json.load(sys.stdin)['token'])")

echo "== Me endpoint =="
CODE=$(curl -s -o /dev/null -w "%{http_code}" $BASE/auth/me/ -H "Authorization: Token $TOKEN_ALICE")
check "get current user" 200 "$CODE"

echo "== Events list without auth (should be blocked) =="
CODE=$(curl -s -o /dev/null -w "%{http_code}" $BASE/events/)
check "events list unauthenticated" 401 "$CODE"

echo "== Create event as alice =="
R=$(curl -s -w "\n%{http_code}" -X POST $BASE/events/ -H "Authorization: Token $TOKEN_ALICE" -H "Content-Type: application/json" \
  -d '{"title":"React Meetup","description":"Learn React","date":"2026-09-15T18:00:00Z","location":"Chennai","capacity":50}')
CODE=$(echo "$R" | tail -1); BODY=$(echo "$R" | sed '$d')
check "create event" 201 "$CODE"
EVENT_ID=$(echo "$BODY" | python3 -c "import sys,json;print(json.load(sys.stdin)['id'])")

echo "== List events as bob =="
CODE=$(curl -s -o /dev/null -w "%{http_code}" $BASE/events/ -H "Authorization: Token $TOKEN_BOB")
check "list events authenticated" 200 "$CODE"

echo "== Bob tries to edit alice's event (should be forbidden) =="
CODE=$(curl -s -o /dev/null -w "%{http_code}" -X PATCH $BASE/events/$EVENT_ID/ -H "Authorization: Token $TOKEN_BOB" -H "Content-Type: application/json" -d '{"title":"Hacked"}')
check "non-organizer edit blocked" 403 "$CODE"

echo "== Bob RSVPs going =="
R=$(curl -s -w "\n%{http_code}" -X POST $BASE/rsvps/ -H "Authorization: Token $TOKEN_BOB" -H "Content-Type: application/json" \
  -d "{\"event\":$EVENT_ID,\"status\":\"going\"}")
CODE=$(echo "$R" | tail -1)
check "create rsvp" 201 "$CODE"

echo "== Filter events by location =="
CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/events/?location=Chennai" -H "Authorization: Token $TOKEN_ALICE")
check "filter events by location" 200 "$CODE"

echo "== Alice adds guest to guest list =="
R=$(curl -s -w "\n%{http_code}" -X POST $BASE/guests/ -H "Authorization: Token $TOKEN_ALICE" -H "Content-Type: application/json" \
  -d "{\"event\":$EVENT_ID,\"name\":\"Carol\",\"email\":\"carol@example.com\",\"plus_ones\":1}")
CODE=$(echo "$R" | tail -1)
check "add guest" 201 "$CODE"

echo "== Bob tries to view guest list for alice's event (should be forbidden) =="
CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/guests/by-event/$EVENT_ID/" -H "Authorization: Token $TOKEN_BOB")
check "non-organizer guest list blocked" 404 "$CODE"

echo "== Alice views guest list nested under event =="
CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/guests/by-event/$EVENT_ID/" -H "Authorization: Token $TOKEN_ALICE")
check "organizer guest list nested view" 200 "$CODE"

echo "== Password reset request =="
R=$(curl -s -w "\n%{http_code}" -X POST $BASE/auth/password-reset/ -H "Content-Type: application/json" -d '{"email":"alice@example.com"}')
CODE=$(echo "$R" | tail -1); BODY=$(echo "$R" | sed '$d')
check "password reset request" 200 "$CODE"
RUID=$(echo "$BODY" | python3 -c "import sys,json;print(json.load(sys.stdin)['uid'])")
PTOKEN=$(echo "$BODY" | python3 -c "import sys,json;print(json.load(sys.stdin)['token'])")

echo "== Password reset confirm =="
CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST $BASE/auth/password-reset-confirm/ -H "Content-Type: application/json" \
  -d "{\"uid\":\"$RUID\",\"token\":\"$PTOKEN\",\"new_password\":\"NewSuperSecret456!\"}")
check "password reset confirm" 200 "$CODE"

echo ""
echo "RESULTS: $pass passed, $fail failed"
