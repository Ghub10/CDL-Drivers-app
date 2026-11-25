# CDL Drivers

A mobile-first web app that connects CDL (Commercial Driver's License) holders with recruiters and transportation companies. Drivers create profiles; recruiters search by location and qualifications.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:5173 in your browser.

## Build

```bash
npm run build
```

Output is in `dist/`.

## Email verification (demo)

**No real emails are sent.** After sign-up you’ll see a “verify” screen: tap **I verified — continue** to simulate clicking a link in an email. A future version can plug in SendGrid, Resend, or Supabase Auth for real messages.

## Feature summary

- **Drivers**: Sign up, verify email, create profile (CDL classes, endorsements, location, availability, resume), view and respond to messages
- **Recruiters**: Sign up, verify email, search drivers (city, state, zip, radius), filter by CDL class and endorsements, view driver details with contact info, message drivers
- **Messaging**: In-app messaging between recruiters and drivers
- **Offline**: Shows "No connection" message when offline

## Demo drivers

On first load, the app merges **14 fictional seeded drivers** (users + profiles) from [`src/data/demoDrivers.ts`](src/data/demoDrivers.ts) via [`src/lib/seedDemoDrivers.ts`](src/lib/seedDemoDrivers.ts). Location defaults to Salt Lake City, UT; endorsement text from the seed list is mapped to CDL endorsement codes (H, N, P, S, T, X).

Sign in as any seeded driver with password **`demo123`** (pre-verified). The login page also has **Try the demo** buttons for the demo recruiter (`recruiter@demo.com`) and the demo driver (`driver@demo.com`); both use password **`demo123`**.

## Tech stack

- Vite + React + TypeScript + TailwindCSS
- Demo mode: data lives in the browser (localStorage), no setup needed
- Optional Supabase mode (set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`): real accounts and database. Resumes go in a **private** `resumes` storage bucket and recruiters open them through short-lived signed links.
- The "Companies Hiring" list is sample data for demonstration only; it is not a live job board.

## Colors / theming

Edit **[`src/styles/theme.css`](src/styles/theme.css)** to change hex values. Those CSS variables are wired into Tailwind in `tailwind.config.js`.

**Add a new color:** set e.g. `--color-promo: #7c3aed;` in `theme.css`, add `promo: 'var(--color-promo)'` under `theme.extend.colors`, then use `bg-promo`, `text-promo`, etc.

Built-in tokens include **primary**, **accent** (secondary highlight), neutrals, and **success** / **error** / **warning**.

## Deploy (Vercel)

1. Push to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Build command: `npm run build`
4. Output directory: `dist`
5. Deploy

## Remaining enhancements (Phase 2)

- Browser push notifications
- Map view (Mapbox/Google Maps)
- Saved searches for recruiters
- Email notifications (requires backend)

## Live demo

https://cdl-drivers.vercel.app
