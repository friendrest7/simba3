# Simba Marketplace

Production e-commerce platform for Simba Supermarket Rwanda.

## Live Demo

https://simba3-ashy.vercel.app

Feature verification: https://simba3-ashy.vercel.app/features

Latest mobile Lighthouse audit: Performance 81, Accessibility 96, Best Practices 96, SEO 100, LCP 2.7s, CLS 0. Full HTML and JSON reports are in `reports/`.

## Test Credentials

Buyer / Customer:

- Email: `buyer@test.com`
- Password: `password123`

Market Rep / Admin:

- Email: `admin@test.com`
- Password: `admin123`

Both accounts are real Supabase Auth users. The seed script updates them non-destructively and never deletes existing users.

## Catalog Verification

- Canonical source: `simba_productsog.json`
- Products: 789
- Categories: 11
- Subcategories: 98
- API: `/api/products`
- UI: `/shop`

Search covers product name, generated description, inferred brand, category, and subcategory. Filters include category, subcategory, RWF minimum/maximum price, and availability. Sorting includes relevance, price low/high, and name A-Z/Z-A. Results are paginated in groups of 24.

## Commerce

- Product detail pages with zoom gallery, quantity selector, wishlist, ratings, verified reviews, stock state, waitlist, breadcrumbs, and related products
- Persistent guest cart plus authenticated Supabase cart/wishlist sync
- RWF totals, quantity changes, remove controls, count badge, sticky mobile cart, and dynamic cart recommendations
- Kigali district delivery zones, fee calculation, saved addresses, preferred time slots, instructions, and delivery estimate
- Server-owned checkout with MTN MoMo and Airtel Money adapters, payment references, status polling, cash fallback, and order confirmation
- Five-stage tracking: Placed, Confirmed, Packed, Out for Delivery, Delivered
- Order history, details, Buy Again, recently purchased items, and recurring schedules
- Promotions page with deal badges and flash-sale countdown
- Admin revenue/order/top-product analytics and order status management

## Localization, Mobile, and Trust

- English, French, and Kinyarwanda in the visible header switcher
- Language and light/dark theme persistence
- Responsive from 360px, 44px touch targets, mobile drawer, responsive dashboards and checkout
- Cloudinary product images with Next.js AVIF/WebP output and local fallback images
- Loading skeletons, empty states, errors, accessible labels, keyboard focus, and reduced-motion support

## Stack

- React 19
- TypeScript
- Next.js 16
- Supabase Auth, Postgres, RLS, Storage, and Realtime
- Tailwind CSS
- Vercel

The original project is a Next.js application. It intentionally remains on Next.js rather than being rewritten to Vite because it relies on server routes, middleware, server-side authentication, and payment callbacks.

## Local Setup

```bash
npm install
npm run typecheck
npm run lint
npm run build
```

Apply `supabase/schema.sql`, then `supabase/commerce-upgrade.sql`, then:

```bash
npm run seed:demo
```

Copy `.env.example` to `.env.local`. Supabase service-role, MTN, Airtel, email, and AI keys are server-only and must never use a `NEXT_PUBLIC_` prefix.
