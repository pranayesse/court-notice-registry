# PendingCase.in — India's Court Notice Registry

A legal transparency platform that makes India's public court case data **findable, searchable, and shareable**. Courts already require public notices in newspapers for absconding accused — this is the digital, cheaper, permanent version.

Live: [court-notice-registry.vercel.app](https://court-notice-registry.vercel.app)

## Why this exists

Court case data in India is already public via eCourts. The problem is discoverability — a CNR number buried in a court system is invisible to employers, landlords, business partners, and the general public. This registry makes that data findable by name, employer, and location, with SEO-indexed case pages that surface in Google searches.

The core insight: **courts already require newspaper public notices for absconding accused**. This is the digital equivalent — cheaper to file, permanent, and actually searchable.

## Product

- **Search** — find cases by accused name, CNR number, court, or employer
- **Verify** — background check anyone in seconds
- **File a notice** — submit a CNR number and the app pulls verified case data directly from eCourts India
- **Case pages** — each case gets a permanent, SEO-indexed URL with hearing timeline, next date alerts, and public sightings
- **Print notice** — generate a formatted public notice PDF for newspaper/legal use
- **Alerts** — email/WhatsApp reminders before hearing dates

## Strategic angles

**SEO flywheel is the real moat.** Every case filed makes the site larger, improving domain authority, making future cases rank better. Filers share links on WhatsApp, driving organic backlinks. No ads needed — the people filing cases *want* the world to find it.

**B2B background verification** is the biggest revenue driver. Companies like AuthBridge and IDfy charge ₹150–500 per name check. A real-time, CNR-verified database undercuts them on price while being more accurate.

**Privacy by design.** The crowd-sourced sighting layer is strictly "public URLs only" — LinkedIn profiles, company registrations, news articles. Phone numbers, home addresses, Aadhaar/PAN numbers, and GPS coordinates are blocked at the submission layer, not moderation.

## Stack

- **Next.js 16** (App Router, ISR, OG images)
- **Prisma 7** + **Supabase** (PostgreSQL)
- **Tailwind CSS** + **shadcn/ui**
- **eCourts India Partner API** — CNR verification
- **Resend** — transactional email
- **Vercel** — hosting + cron jobs

## Local setup

```bash
git clone https://github.com/pranayesse/court-notice-registry
cd court-notice-registry
npm install
cp .env.example .env.local   # fill in your keys
npx prisma migrate dev
npm run dev
```

Required env vars:

```
DATABASE_URL=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ECOURTS_API_KEY=
RESEND_API_KEY=
ADMIN_EMAILS=
CRON_SECRET=
NEXT_PUBLIC_BASE_URL=
```

## Data & privacy

- Case data is sourced exclusively from eCourts India (public government records)
- No Aadhaar, PAN, phone numbers, or location data is stored or displayed
- Dispute and removal requests handled within 72 hours (IT Act 2000 §79)
- Grievance Officer: grievance@pendingcase.in
