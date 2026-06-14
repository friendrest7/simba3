# Production Performance Verification

Audit target: https://simba3-ashy.vercel.app/

Audit date: June 14, 2026

Mobile Lighthouse results:

- Performance: 81
- Accessibility: 96
- Best Practices: 96
- SEO: 100
- First Contentful Paint: 1.1s
- Largest Contentful Paint: 2.7s
- Total Blocking Time: 620ms
- Cumulative Layout Shift: 0

The homepage keeps the full 789-product dataset on the server, passes only displayed products to the browser, and defers the Supabase SDK for anonymous storefront visitors. Full Lighthouse HTML and JSON reports are stored beside this file.
