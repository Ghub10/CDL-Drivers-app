# Architecture Document
## CDL Drivers — Mobile-First Web App

---

## Recommended Tech Stack

| Layer | Recommendation | Rationale |
|-------|----------------|-----------|
| Build Tool | Vite | Fast dev experience, optimized production builds |
| Framework | React | Component-based, large ecosystem |
| Language | TypeScript | Type safety, better tooling |
| Styling | TailwindCSS | Rapid mobile-first styling, utility classes |
| State | React Context + useState/useReducer | Sufficient for MVP; avoid over-engineering |
| Auth | Firebase Auth or Supabase Auth | Email verification, password reset |
| Database | Supabase (PostgreSQL) or Firebase Firestore | Real-time messaging, user/profile storage |
| Storage | Supabase Storage or Firebase Storage | Resume file uploads |
| Maps | Mapbox GL or Google Maps API | Map view for driver search |
| Geocoding | Mapbox Geocoding or Google Geocoding | Zip → coordinates for radius search |
| Hosting | Vercel, Netlify, or Cloudflare Pages | Static/serverless, easy deploy |

**Default stack for implementation:** Vite + React + TypeScript + TailwindCSS + Supabase (Auth, DB, Storage).

---

## Project Folder Structure

```
CDL-Drivers/
├── docs/                    # Product and architecture specs
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── ui/              # Reusable UI (Button, Input, Card)
│   │   ├── forms/           # Profile forms, search forms
│   │   └── layout/          # Header, Nav, layouts
│   ├── contexts/            # Auth, Theme
│   ├── hooks/               # useAuth, useSearch, useMessages
│   ├── lib/                 # API client, utils
│   ├── pages/
│   │   ├── Landing.tsx
│   │   ├── SignUp.tsx
│   │   ├── Login.tsx
│   │   ├── VerifyEmail.tsx
│   │   ├── DriverProfile.tsx
│   │   ├── DriverMessages.tsx
│   │   ├── RecruiterSearch.tsx
│   │   ├── RecruiterDriverList.tsx
│   │   ├── RecruiterDriverDetail.tsx
│   │   └── RecruiterMessages.tsx
│   ├── routes/              # Route definitions
│   ├── types/               # TypeScript types
│   ├── App.tsx
│   └── main.tsx
├── index.html
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

---

## State Management Approach

- **Auth state:** React Context (`AuthContext`) with user, role (driver/recruiter), loading, login/logout/signUp.
- **Local UI state:** `useState` / `useReducer` in components (filters, form inputs).
- **Server state:** Fetch on mount or via Supabase real-time subscriptions for messages.
- Avoid Redux or heavy state libraries for MVP.

---

## Data Persistence Strategy

- **Supabase (recommended):**
  - `users` table (or use Supabase Auth `auth.users`)
  - `profiles` table (driver/recruiter details, linked to `auth.users`)
  - `messages` table (sender_id, recipient_id, content, created_at)
  - Row Level Security (RLS) so users only access their own data and messages.
- **Alternative:** Firebase Firestore with similar collections and security rules.

---

## Offline Capability Strategy

Per requirements: **No offline support.** App requires internet. When `navigator.onLine === false` or fetch fails with network error, show a full-screen "No connection" message with retry option. No IndexedDB, no Service Worker caching for data.

---

## Performance Considerations

- Lazy-load route components (React.lazy + Suspense).
- Paginate driver list (e.g., 20 per page).
- Compress and resize resume previews if displayed.
- Use map clustering when many drivers on map.
- Keep bundle size small; avoid unused dependencies.

---

## Accessibility Considerations

- Semantic HTML (nav, main, header, form labels).
- ARIA labels for icons and map controls.
- Sufficient color contrast (WCAG AA).
- Keyboard navigation for forms and lists.
- Touch targets ≥ 44px on mobile.
- Screen reader announcements for dynamic content (e.g., new messages).
