# Wedding Website (Next.js + TypeScript + Tailwind)

Production-ready wedding website scaffold generated from Figma frame inventory using a single responsive codebase.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Zod validation
- Playwright E2E
- Vercel-ready API integrations:
  - `@vercel/postgres` for RSVP + upload metadata
  - `@vercel/blob` for guest image storage

## Routes

- `/` Home
- `/our-story`
- `/weekend`
- `/travel`
- `/rsvp`
- `/menu`
- `/registry`
- `/gallery`
- `/faq`
- `/contact`
- `/wedding-party`
- `/families`
- `/upload`
- `/qr`
- `/live-gallery`
- `/admin/uploads` (not in nav; basic auth style gate)

## Content Model

All editable content lives in `/content`:

- `couple.json`
- `story.json`
- `events.json`
- `travel.json`
- `menu.json`
- `registry.json`
- `faq.json`
- `wedding_party.json`
- `families.json`

## Image Structure

- `public/images/placeholders/`
- `public/images/couple/`
- `public/images/wedding-party/`
- `public/images/families/`
- `public/images/menu/`

See `public/images/README.md` for naming conventions.

## Local Development

1. Install dependencies:

```bash
npm install
```

2. Configure env:

```bash
cp .env.example .env.local
```

3. Start dev server:

```bash
npm run dev
```

4. Open:

- `http://localhost:3000`
- `http://localhost:3000/qr`
- `http://localhost:3000/upload`

## RSVP + Upload Backends

### RSVP API

- Endpoint: `POST /api/rsvp`
- Validation: zod
- Stored fields:
  - `name, email, phone, attending, plusOneName, mealCategory, protein, soup, dietary, message, createdAt`

### Upload API

- Endpoint: `POST /api/upload`
- Moderated flow:
  - uploads are saved as `pending`
  - only `approved` show in `/gallery` and `/live-gallery`

### Storage Behavior

- If `DATABASE_URL` exists: uses Vercel Postgres tables.
- If `DATABASE_URL` is missing: uses local JSON fallback in `.data/`.
- If `BLOB_READ_WRITE_TOKEN` exists: uploads are written to Vercel Blob.
- If token is missing: upload URL falls back to placeholder image for local dev.

## QR Code

- `/qr` generates a QR image pointing to `${NEXT_PUBLIC_SITE_URL}/upload`.
- Includes downloadable QR PNG for signage printing.

## Testing

Run quality gates:

```bash
npm run lint
npm run typecheck
npm run build
npm run test:e2e
```

Playwright coverage includes:

- navigation flow
- RSVP submission
- upload flow
- gallery rendering

## CI (GitHub Actions)

Workflow: `.github/workflows/ci.yml`

Runs:

- install (`npm ci`)
- lint
- typecheck
- build
- playwright browsers install
- playwright tests
- report artifact upload

## Deploy to Vercel

1. Push to GitHub repo.
2. Import repo in Vercel.
3. Add env vars in Vercel project settings:

- `NEXT_PUBLIC_SITE_URL` (production URL)
- `DATABASE_URL` (Vercel Postgres)
- `BLOB_READ_WRITE_TOKEN` (Vercel Blob)
- `ADMIN_UPLOAD_PASSWORD` (for moderation)

4. Trigger deployment.

## Deployment Checklist

- [ ] `npm run build` passes locally
- [ ] `npm run test:e2e` passes locally/CI
- [ ] Vercel env vars configured
- [ ] `/upload` can upload image
- [ ] uploaded image starts as `pending`
- [ ] moderation approves image
- [ ] approved image appears in `/live-gallery`
- [ ] `/qr` points to production `/upload`

## Notes

- Existing Figma static export artifacts are kept under `stitch_home_page_mobile_luxury_wedding/` for visual reference.
- New app code lives at project root (`app/`, `components/`, `content/`, `lib/`).
