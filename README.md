# FlowSpec Marketplace

A full-stack marketplace for discovering, buying, and selling AI automation workflows. Built with Next.js 16, Prisma, Supabase, and Stripe.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, React Server Components) |
| Language | TypeScript 5 |
| Database | PostgreSQL via Prisma v7 |
| Auth | Supabase Auth (email/password, magic link) |
| Payments | Stripe Checkout + Stripe Connect (destination charges) |
| UI | shadcn/ui (base-nova), Tailwind CSS v4, Lucide icons |
| Validation | Zod v4 |
| URL State | nuqs (type-safe search params) |
| State | Zustand, React Hook Form |
| Email | Resend |
| Fonts | Geist Sans & Geist Mono (local) |

## Features

**Catalog & Discovery**
- Browse automations with filtering by domain, platform, complexity, tier, and AI model
- Full-text search with PostgreSQL GIN index
- Sort by newest, popular, price, and rating
- Pagination with URL-persisted state
- Detailed automation pages with tabbed content (Overview, FlowSpec, Reviews)

**Creator Economy**
- Creator profiles with public portfolio pages
- 6-step automation submission form (Basics, Details, Integrations, Pricing, FlowSpec, Review)
- Earnings analytics and per-automation performance tracking
- Stripe Connect Express onboarding for payouts
- Commission model: FREE tier (0%), OPEN (25%), CURATED (40%)

**Payments**
- Stripe Checkout for paid automations
- Free automation claiming without Stripe
- Idempotent webhook handling (prevents duplicate purchases)
- Destination charges with automatic creator payouts

**Buyer Dashboard**
- Purchase history with download access
- FlowSpec file downloads
- Review and rating system (1-5 stars)

**Admin Panel**
- Platform-wide statistics
- Submission review queue (approve/reject)
- User management with role badges

**SEO & Performance**
- Dynamic sitemap generation
- OpenGraph and Twitter card metadata
- Route-level loading skeletons and error boundaries
- `robots.txt` blocking private routes

## Project Structure

```
src/
├── app/
│   ├── (auth)/           # Login, register, auth callback
│   ├── api/
│   │   ├── automations/  # CRUD + download + reviews
│   │   ├── checkout/     # Create session, webhook, claim free
│   │   ├── connect/      # Stripe Connect onboard, status, dashboard
│   │   └── reviews/      # User review management
│   ├── catalog/          # Browse & detail pages
│   ├── checkout/         # Checkout flow & success page
│   ├── creators/         # Public creator profiles
│   ├── dashboard/
│   │   ├── admin/        # Admin stats, submissions, users
│   │   ├── creator/      # Creator studio, automations, analytics, payouts
│   │   ├── purchases/    # Buyer purchase history
│   │   ├── reviews/      # Buyer review history
│   │   └── settings/     # Profile settings
│   ├── layout.tsx        # Root layout with fonts, metadata, providers
│   ├── page.tsx          # Homepage with live stats & featured automations
│   ├── sitemap.ts        # Dynamic sitemap
│   └── robots.ts         # Robots.txt config
├── components/
│   ├── catalog/          # AutomationGrid, AutomationCard, filters, review form
│   ├── checkout/         # CheckoutButton
│   ├── dashboard/        # Forms, cards, admin actions
│   ├── layout/           # Navbar, Footer, Sidebar
│   ├── shared/           # StarRating, PriceTag, GenericError, EmptyState
│   └── ui/               # shadcn/ui primitives
├── generated/prisma/     # Generated Prisma client
├── hooks/                # useAuth, custom hooks
└── lib/
    ├── actions/          # Server actions (automation, review, profile)
    ├── auth/             # Session helpers (getCurrentUser, requireRole)
    ├── data/             # Query helpers (creators, purchases, reviews, admin)
    ├── prisma/           # Prisma client singleton
    ├── stripe/           # Stripe server client, Connect helpers
    ├── supabase/         # Supabase server/browser/middleware clients
    ├── utils/            # Format, slug, constants
    └── validators/       # Zod schemas (automation, review, checkout)
```

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database (Supabase recommended)
- Stripe account (test mode for development)

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env.local
```

Fill in the values in `.env.local`:

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key |
| `DATABASE_URL` | PostgreSQL connection string (pooled) |
| `DIRECT_URL` | PostgreSQL direct connection (for migrations) |
| `STRIPE_SECRET_KEY` | Stripe secret key (`sk_test_...`) |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret (`whsec_...`) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key (`pk_test_...`) |
| `RESEND_API_KEY` | Resend API key for transactional email |
| `NEXT_PUBLIC_APP_URL` | App URL (`http://localhost:3000` for dev) |

### 3. Set up the database

```bash
# Push schema to database
npx prisma db push

# Seed with sample data (10 users, 25 automations, 60 reviews)
npm run db:seed
```

### 4. Set up Supabase Storage

In the Supabase Dashboard, create a **private** bucket named `packages`:
- Upload policy: authenticated users with CREATOR role
- Download policy: authenticated users with a valid Purchase record

### 5. Set up Stripe webhook (local development)

```bash
stripe listen --forward-to localhost:3000/api/checkout/webhook
```

Copy the webhook signing secret to `STRIPE_WEBHOOK_SECRET` in `.env.local`.

### 6. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run db:seed` | Seed database with sample data |
| `npx prisma studio` | Open Prisma Studio (database GUI) |
| `npx prisma db push` | Push schema changes to database |
| `npx prisma generate` | Regenerate Prisma client |

## Database Schema

The database includes 14 models covering the full marketplace domain:

- **User** — Accounts linked to Supabase Auth (BUYER, CREATOR, ADMIN roles)
- **CreatorProfile** — Extended creator info (bio, links, Stripe Connect)
- **Automation** — Marketplace listings with FlowSpec content
- **Platform** / **AutomationPlatform** — Supported platforms (Make, Zapier, n8n, etc.)
- **Tool** / **AutomationTool** — Integrated tools (Gmail, Slack, Sheets, etc.)
- **AiModel** / **AutomationAiModel** — AI models used (GPT-4, Claude, Gemini, etc.)
- **Tag** / **AutomationTag** — Categorization tags
- **Purchase** — Transaction records with tier and Stripe session ID
- **Review** — Ratings and written reviews (denormalized to Automation)
- **Payout** — Creator payout tracking

## API Routes

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/automations` | Browse with filtering, search, sort, pagination |
| POST | `/api/automations` | Create automation (creator auth required) |
| GET | `/api/automations/[id]` | Get automation detail |
| PUT | `/api/automations/[id]` | Update automation (owner auth required) |
| DELETE | `/api/automations/[id]` | Delete automation (owner auth required) |
| GET | `/api/automations/[id]/download` | Download FlowSpec (purchase required) |
| GET | `/api/automations/[id]/reviews` | List reviews for automation |
| POST | `/api/automations/[id]/reviews` | Create review (purchase required) |
| GET | `/api/reviews` | Get current user's reviews |
| PUT | `/api/reviews` | Update a review |
| DELETE | `/api/reviews` | Delete a review |
| POST | `/api/checkout/create-session` | Create Stripe Checkout session |
| POST | `/api/checkout/webhook` | Stripe webhook handler |
| POST | `/api/checkout/claim-free` | Claim a free automation |
| POST | `/api/connect/onboard` | Start Stripe Connect onboarding |
| GET | `/api/connect/status` | Get Connect account status |
| POST | `/api/connect/dashboard` | Get Stripe Express dashboard link |

## License

See [LICENSE](LICENSE) for details.
