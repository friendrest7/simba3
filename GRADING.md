# Simba Marketplace Grader Guide

## Live demo

https://simba3-ashy.vercel.app

## Test accounts

- Buyer / Customer: `buyer@test.com` / `password123`
- Market Rep / Admin: `admin@test.com` / `admin123`

## Verified catalog

- 789 products from `simba_productsog.json`
- 11 categories and 98 subcategories
- Product API: `/api/products`
- Catalog UI: `/shop`
- Server pagination plus instant search
- Category, subcategory, RWF price, and stock-state filters
- Relevance, price, and name sorting

## Browser test routes

- Product details and zoom: `/products/catalog-13001`
- Cart: `/cart`
- Checkout: `/checkout`
- Promotions: `/promotions`
- Profile and saved addresses: `/account`
- Buyer orders, tracking, Buy Again, recurring orders: `/dashboard/client`
- Admin analytics and order status controls: `/dashboard/admin`

## Trust and localization

- English, French, and Kinyarwanda are available in the header.
- Theme and language preferences persist in local storage.
- Cloudinary images use optimized Next.js AVIF/WebP output and local fallbacks.
- Reviews require a delivered order containing the reviewed product.

## Backend setup

Run `supabase/schema.sql`, then `supabase/commerce-upgrade.sql`, then `npm run seed:demo`.
The seed script is non-destructive and never deletes existing users.
