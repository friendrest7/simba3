# Supabase setup

1. Open the Supabase SQL Editor and run `supabase/schema.sql`.
2. In Authentication settings, enable Email authentication.
3. Enable Phone authentication and configure an SMS provider supported by Supabase.
4. Set the Site URL to the deployed application URL and add local/Vercel callback URLs, including `http://localhost:3000/auth/callback`.
5. The schema creates a public Storage bucket named `simba-assets`.
6. Upload the landing video to `simba-assets/Landing/`.
7. Open the uploaded object, choose **Get URL**, and copy its public URL.
8. Set that URL as `NEXT_PUBLIC_HERO_VIDEO_URL`.

## Staff accounts

Staff accounts are separate from customer accounts. Do not use a customer's Auth user for staff access.

Create a new staff user in Supabase Authentication first. Then assign that separate user's role in the SQL Editor:

```sql
update public.profiles
set role = 'manager', branch_id = 'kigali-kic'
where email = 'manager@example.com';
```

Valid staff roles are `manager`, `admin`, `driver`, and `ceo`. The staff checkbox only requests a staff workspace; access is granted only when the database profile has the matching role.

Use a public object URL for a permanent landing video. Signed URLs are suitable for private files but can expire.

Keep `SUPABASE_SERVICE_ROLE_KEY` server-only. Never prefix it with `NEXT_PUBLIC_` or expose it in browser code.
