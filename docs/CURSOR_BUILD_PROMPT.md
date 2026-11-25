# Cursor Build Prompt
## Implementation Instructions for CDL Drivers

---

## Role Definition

You are a senior mobile web engineer working inside this repository. Build a mobile-first web application that connects CDL drivers with recruiters. Follow the specifications in `/docs/` and implement incrementally.

---

## Goal Summary

- **Drivers** create profiles with CDL classes, endorsements, location, availability, and resume.
- **Recruiters** search by city, zip/radius, and map; filter by CDL and endorsements; view driver profiles; message drivers and see contact info.
- **Both** require accounts with email verification. No offline support — show "no connection" when offline.

---

## Approved Tech Stack

- Vite + React + TypeScript
- TailwindCSS for styling
- Supabase: Auth, PostgreSQL, Storage (or Firebase if preferred)
- Map: Mapbox GL or Google Maps for map view
- Geocoding: for zip → coordinates (radius search)

---

## Project Structure

```
src/
├── components/ui/      # Button, Input, Card
├── components/forms/   # ProfileForm, SearchForm
├── components/layout/  # Header, Nav
├── contexts/           # AuthContext
├── hooks/              # useAuth, useSearch, useMessages
├── lib/                # supabase client, utils
├── pages/              # Landing, SignUp, Login, VerifyEmail, DriverProfile, etc.
├── routes/
├── types/
├── App.tsx
└── main.tsx
```

---

## Ordered Build Steps

1. Initialize Vite + React + TypeScript + Tailwind; configure Supabase (or chosen backend).
2. Implement design system tokens (colors, typography, spacing) in Tailwind config.
3. Build UI primitives: Button, Input, Card.
4. Auth: sign up, login, email verification; AuthContext.
5. Role selection on landing; route guard by role.
6. Driver profile form and save (CRUD).
7. Recruiter search form: city/state, zip + radius; filters for CDL and endorsements.
8. Driver list and detail pages; integrate map view.
9. Messaging: create messages, list threads, send/receive; real-time optional.
10. Email notification on new message (Supabase function or external service).
11. No-connection overlay when `navigator.onLine === false`.
12. Polish: loading states, error handling, responsive layout.

---

## Working Rules

- Make incremental commits; small, logical changes.
- Keep files small and readable; favor clarity over cleverness.
- Mobile-first: design for 320px width first; scale up.
- No feature creep; stick to MVP scope.
- Briefly comment or document major architectural decisions.

---

## Definition of Done

- [ ] Driver can sign up, verify email, create profile (all fields)
- [ ] Recruiter can sign up, verify email, search by city/zip/map
- [ ] Recruiter can filter by CDL class and endorsements
- [ ] Recruiter sees driver list and detail with contact info
- [ ] In-app messaging works between recruiter and driver
- [ ] Driver receives email when new message arrives
- [ ] Offline shows "no connection" message
- [ ] App runs via `npm install` and `npm run dev`
- [ ] Mobile-friendly; touch targets ≥ 44px
