# Test Plan
## CDL Drivers — Practical Test Scenarios

---

## Core User Flows

### Driver sign up and profile
1. Visit app, choose "I'm a Driver"
2. Sign up with valid email and password — account created
3. Check email, click verification link — redirected to app, verified
4. Log in — land on profile creation/edit
5. Fill all profile fields (CDL A, endorsements H and N, zip 60601, Chicago IL, etc.) — save succeeds
6. View profile — data displayed correctly

### Recruiter sign up and search
1. Visit app, choose "I'm a Recruiter"
2. Sign up with name, email, company, phone, password — account created
3. Verify email, log in — land on search
4. Search by city "Chicago" — driver list shows matching drivers
5. Search by zip 60601, radius 50 miles — results include nearby drivers
6. Apply filter: CDL Class A, Endorsement Hazmat — list filters correctly
7. Switch to map view — drivers appear on map
8. Click driver in list — full profile opens
9. See contact info (phone, email) and Message button — present and correct

### Messaging
1. Recruiter sends message to driver — message appears in thread
2. Driver receives email notification — email received
3. Driver opens app, views messages — message visible
4. Driver replies — recruiter sees reply in thread

---

## Edge Cases

| Scenario | Expected |
|----------|----------|
| Duplicate email sign up | Error: "Email already registered" |
| Login with unverified email | Prompt to verify; limit access |
| Invalid zip code (non-US, bad format) | Validation error on save |
| Resume file > 5MB | Error: "File too large" |
| Search returns no results | Message: "No drivers found. Try broadening filters." |
| Driver with no endorsements | Profile allowed; endorsements optional |
| Offline — any action | "No connection" screen with Retry |

---

## Data Persistence

- Create driver profile, refresh page — profile persists
- Send message, refresh — message still in thread
- Log out, log in — session restored, data intact

---

## UI Validation

- Required fields empty on sign up — validation errors shown
- Invalid email format — error on submit
- Password too short — error on submit
- Touch targets (buttons, links) — at least 44x44px
- Forms on mobile — readable, no horizontal scroll
