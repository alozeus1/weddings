# Wedding Website (Next.js + TypeScript + Tailwind)

Production-ready wedding website scaffold generated from Figma frame inventory using a single responsive codebase.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Zod validation
- Playwright E2E
- Vercel-ready API integrations:
  - `@vercel/postgres` for RSVP submissions
  - Cloudinary signed uploads + live gallery listing

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

For Neon/Vercel Postgres-backed RSVP and invite requests, `DATABASE_URL` is required.
If your local `.env.local` is missing project env vars, pull them with:

```bash
vercel env pull .env.local
```

This project prefers `DATABASE_URL` and falls back to `POSTGRES_URL` when present.

3. Start dev server:

```bash
npm run dev
```

4. Open:

- `http://localhost:3000`
- `http://localhost:3000/qr`
- `http://localhost:3000/upload`


## Guest List Maintenance

For adding and maintaining RSVP guest entries (JSON + CSV workflows), see:

- [`docs/guestlist.md`](docs/guestlist.md)

## RSVP + Upload Backends

### RSVP API

- Endpoint: `POST /api/rsvp`
- Validation: zod
- Stored fields:
  - `name, email, phone, attending, plusOneName, mealCategory, protein, soup, dietary, message, createdAt`

### Upload API

- Endpoint: `POST /api/cloudinary/sign`
- Returns short-lived upload signature payload (`signature`, `timestamp`, `folder`, `apiKey`, `cloudName`).
- Client uploads directly to `https://api.cloudinary.com/v1_1/<cloudName>/image/upload` using that signed payload.
- Uploads are forced to `CLOUDINARY_FOLDER` and rate-limited per IP at the sign endpoint.

### Live Uploads API

- Endpoint: `GET /api/cloudinary/live-uploads`
- Fetches latest resources from Cloudinary with cursor pagination (`limit` + `next_cursor`).
- `/gallery` and `/live-gallery` load this endpoint and render returned images.
- If `LIVE_UPLOADS_REQUIRE_APPROVAL=true`, only uploads tagged `approved` are returned.

### Storage Behavior

- If `DATABASE_URL` exists: uses Vercel Postgres tables.
- If `DATABASE_URL` is missing in development: uses local JSON fallback in `.data/`.
- If `DATABASE_URL` is missing in production: invite request persistence is disabled and returns a clear error.
- Guest uploads use Cloudinary signed direct uploads.

### Database Health + Migrations

Run migrations (creates `guests` and `invite_requests` if missing):

```bash
npm run db:migrate
```

Seed initial guests from `content/guestlist.json` (insert-only, keeps existing RSVP statuses):

```bash
npm run seed:guests
```

Debug database connectivity:

- `GET /api/health/db`
  - Returns `{ "ok": true }` on success.
  - Returns `{ "ok": false, "error": "..." }` with `500` on failure.

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
- `ADMIN_UPLOAD_PASSWORD` (for moderation)
- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `CLOUDINARY_FOLDER` (optional, defaults to `chibuike-jessica/live-uploads`)
- `LIVE_UPLOADS_REQUIRE_APPROVAL` (`true`/`false`)

4. Trigger deployment.

## Deployment Checklist

- [ ] `npm run build` passes locally
- [ ] `npm run test:e2e` passes locally/CI
- [ ] Vercel env vars configured
- [ ] `/upload` can upload image
- [ ] image appears in Cloudinary under `CLOUDINARY_FOLDER`
- [ ] image appears in `/live-gallery` (`approved` tag required only if approval mode is enabled)
- [ ] `/qr` points to production `/upload`

## Approval Workflow (Optional)

When `LIVE_UPLOADS_REQUIRE_APPROVAL=true`, Live Uploads only show images tagged `approved`.

To approve an image in Cloudinary:

1. Open Media Library and find the upload in `CLOUDINARY_FOLDER`.
2. Add tag `approved` to that asset.
3. Refresh `/gallery` or `/live-gallery`; the image will now appear in the live feed.

## Notes

- Existing Figma static export artifacts are kept under `stitch_home_page_mobile_luxury_wedding/` for visual reference.
- New app code lives at project root (`app/`, `components/`, `content/`, `lib/`).
