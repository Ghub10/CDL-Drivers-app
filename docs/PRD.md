# Product Requirements Document (PRD)
## CDL Drivers — Recruiter & Driver Marketplace

---

## 1. Product Overview

CDL Drivers is a mobile-first web application that connects Commercial Driver's License (CDL) holders with recruiters and transportation companies. Drivers create profiles listing their CDL classes, endorsements, availability, and contact information. Recruiters search by location (city, zip/radius, map) and filter by CDL type and endorsements to find available drivers in their area. The app enables in-app messaging and displays driver contact info so recruiters can reach out directly.

---

## 2. Problem Statement

Recruiters and transportation companies struggle to find qualified CDL drivers with the right endorsements (Hazmat, Tanker, Passenger, etc.) who are available and ready to work in a specific geographic area. Drivers with in-demand credentials often lack visibility to employers seeking them. There is no simple, focused tool that bridges this gap for the US market.

---

## 3. Target Users

| User Type | Description |
|-----------|-------------|
| **Drivers** | CDL holders (Class A, B, or C) with one or more endorsements. They create profiles, set availability, and want to be discovered by recruiters. |
| **Recruiters** | Staff at transportation companies or recruiting firms. They search for drivers by location and qualifications, then contact drivers via in-app messaging or direct phone/email. |

---

## 4. Assumptions

- Users have reliable internet access; offline mode is not required.
- CDL and endorsement terminology follows US FMCSA standards.
- Geographic scope is United States only (addresses, zip codes, maps).
- Drivers self-report CDL and endorsement information; no automated verification in MVP.
- Email verification is sufficient for account creation; no additional identity verification.
- Resume uploads are supported (PDF or common document formats).

---

## 5. Core User Flows

### Flow 1: Driver signs up and creates profile
1. Driver visits app → chooses "I'm a Driver"
2. Signs up with email → receives verification email → verifies
3. Logs in → completes profile (name, phone, email, CDL classes, endorsements, location: zip + city + state, availability status, start date, full/part-time, resume upload)
4. Profile becomes visible to recruiters

### Flow 2: Recruiter signs up and searches for drivers
1. Recruiter visits app → chooses "I'm a Recruiter"
2. Signs up with email, name, company name, phone → receives verification email → verifies
3. Logs in → enters search (city, state, zip + radius, or map view)
4. Applies filters (CDL class, endorsements, availability)
5. Views driver list → selects driver → sees full profile with contact info
6. Sends in-app message and/or contacts via phone/email

### Flow 3: Driver receives and responds to recruiter outreach
1. Driver receives notification (email, in-app)
2. Opens app → views messages from recruiters
3. Can respond in-app or communicate directly via phone/email

---

## 6. Screen Requirements

| Screen | User | Purpose |
|--------|------|---------|
| Landing / Role Selection | Both | Choose "I'm a Driver" or "I'm a Recruiter" |
| Sign Up | Both | Email, password, role-specific fields |
| Email Verification | Both | Confirm email before full access |
| Login | Both | Authenticate returning users |
| Driver: Profile Create/Edit | Driver | Enter or update profile data |
| Driver: My Messages | Driver | View and respond to recruiter messages |
| Recruiter: Search | Recruiter | City, zip/radius, map; filters for CDL/endorsements |
| Recruiter: Driver List | Recruiter | Paginated list of matching drivers |
| Recruiter: Driver Detail | Recruiter | Full profile, contact info, message button |
| Recruiter: Messages | Recruiter | View and send messages to drivers |
| No Connection | Both | Shown when offline |

---

## 7. Data Model

### User (base)
- id, email, passwordHash, role (driver | recruiter), emailVerified, createdAt

### Driver (extends User)
- name, phone, email (display)
- cdlClasses: [A, B, C] (multi-select)
- endorsements: [H, N, T, P, S, X]
- zipCode, city, state
- availabilityStatus: "actively_looking" | "open_to_offers"
- availabilityStartDate: date
- employmentType: "full_time" | "part_time"
- resumeUrl: string (file reference)

### Recruiter (extends User)
- name, companyName, phone

### Message
- id, senderId, recipientId, content, createdAt
- Links Driver ↔ Recruiter conversations

---

## 8. Functional Requirements

### MVP
- User sign up (driver/recruiter) with email verification
- Driver profile creation: name, phone, email, CDL classes (A/B/C multi), endorsements (H,N,T,P,S,X), zip+city+state, availability status, start date, full/part-time, resume upload
- Recruiter search: by city/state, zip + radius, map view; filters for CDL class and endorsements
- Driver list with basic info; link to full profile
- Driver detail with contact info and message button
- In-app messaging between recruiter and driver
- Email notifications when new message received
- No connection message when offline

### Phase 2
- Browser push notifications
- Optional: automated phone call alerts (requires telephony integration)
- Recruiter company profile enhancements
- Driver profile completeness indicator
- Saved searches / favorites for recruiters

### Phase 3
- CDL/document verification (manual or third-party)
- Analytics dashboard for recruiters
- Driver application tracking
- Enhanced map clustering and filters

---

## 9. Non-Goals (Out of Scope for MVP)

- Native mobile apps (iOS/Android)
- Offline data caching or sync
- Automated CDL verification
- Payment or subscription features
- Support for non-US geography
- Video calls or advanced communication

---

## 10. Edge Cases

- Driver has no endorsements: allow profile with CDL class only
- Recruiter search returns no results: show clear message and suggest broadening filters
- Duplicate email sign up: prevent; show "already registered" message
- Unverified email: block full access until verified
- Resume file too large: enforce size limit (e.g., 5MB); show error
- Invalid zip code: validate US zip format; show error
- Message from unrecognized recruiter: driver can block or report (Phase 2)

---

## 11. Success Metrics

- Number of driver profiles created
- Number of recruiter accounts
- Search sessions per recruiter per week
- Messages sent (recruiter → driver)
- Driver profile views and contact info views
- Email verification completion rate

---

## 12. Future Roadmap

- Phase 2: Push notifications, saved searches, recruiter profiles
- Phase 3: Verification, analytics, application tracking
- Longer term: Premium features, API for job boards, integration with background check services
