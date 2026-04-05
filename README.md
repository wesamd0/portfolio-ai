# Wesam Dawod Portfolio

Modern bilingual portfolio built with Next.js, featuring:

- EN/FR language switching
- Project detail pages with clear technical storytelling
- AI-powered Q&A assistant with streaming responses
- Motion-driven UI and responsive design

## Tech Stack

- Next.js 16 (App Router)
- React 19 + TypeScript
- Tailwind CSS + Framer Motion
- Vercel AI SDK + GROQ
- Upstash Redis (optional rate limiting)

## Project Structure

```txt
app/
	page.tsx                    # Home page
	projects/[slug]/page.tsx    # Project detail pages
	api/completion/route.ts     # AI completion endpoint

components/
	hero.tsx                    # Main homepage experience
	ui/*                        # Shared UI primitives

lib/
	projects.ts                 # Localized project content/data
```

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Create a local env file:

```bash
cp .env.example .env.local
```

If you do not have `.env.example`, create `.env.local` manually with the variables below.

3. Run development server:

```bash
npm run dev
```

4. Open:

```txt
http://localhost:3000
```

## Environment Variables

Required for AI chat:

- `GROQ_API_KEY`

Required for contact form email sending:

- `RESEND_API_KEY`
- `CONTACT_FROM_EMAIL`

Optional for contact form destination:

- `CONTACT_RECEIVER_EMAIL`

Optional for API rate limiting:

- `KV_REST_API_URL`
- `KV_REST_API_TOKEN`

If rate-limit vars are not set, the app still runs and AI chat remains available without Upstash-based limiting.

## Scripts

- `npm run dev` - Start dev server (Turbopack)
- `npm run build` - Production build
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Notes

- Project content and ordering are managed in `lib/projects.ts`.
- AI endpoint behavior and prompt context are in `app/api/completion/route.ts`.
- Locale is controlled via query param (`?lang=fr` for French).
