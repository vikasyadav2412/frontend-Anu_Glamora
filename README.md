# Anu Glamora

The React frontend and backend deploy together on Netlify. The frontend calls `/api` on its own domain, so no separate backend hosting or frontend API URL is required.

## Deployment

Netlify uses `npm run build` and publishes `dist`. Functions live in `netlify/functions`. Netlify Database provides Postgres storage; schema migrations in `netlify/database/migrations` apply automatically during deployment. Uploaded images persist in Netlify Blobs and are served through `/uploads/*`.

Netlify Identity handles customer registration, sign-in, confirmation emails, password recovery, and admin authorization. Identity activation has been configured for this project. Accounts use email addresses to sign in. Registration requires email confirmation with the default Identity settings.

After deployment, visit `/api/health` to confirm the database connection. Add services and gallery images through the admin workspace; the fresh database starts with service categories and basic studio settings, but no service catalogue, bookings, or customer accounts.

## First administrator

1. Open this project's Netlify dashboard and go to Identity.
2. Invite your administrator email address.
3. Open the invitation email, follow the link, and set a password.
4. Open that user's details in the Identity dashboard, add `admin` in Roles, and save.
5. Sign in at `/admin/login` with that email and password.

The `admin` role must be assigned in the dashboard. Users cannot grant themselves administrative access. New administrators can also sign up normally, confirm their email, and then receive the role from the dashboard.

The admin workspace manages services, bookings, gallery images, offers, reports, settings, and contact messages. Contact enquiries are stored in the database and appear under Messages; contact submissions do not send email notifications.

## Existing backend data

This repository contains a Netlify adaptation of the routes in `vikasyadav2412/baclend-Anu_Glamora`. It replaces the separate Express/MySQL server and local upload directory. Existing MySQL records, image files, and password hashes are not imported. Existing customers need Netlify Identity accounts. No changes to the separate backend repository are required for this deployment.

## Development and checks

Install dependencies with `npm install`, then use `netlify dev --port 8889`. Plain `vite` only serves the frontend and does not emulate the backend. Do not manually apply database migrations; Netlify manages them during deployment.

- `npm test`: validation, request-origin protection, unauthenticated profile access, and image-route checks.
- `npm run typecheck`: TypeScript checks for backend code and the database schema.

Appointments use the studio's India time zone and reject conflicting reservations inside a database transaction. Uploads accept JPG, PNG, WebP, GIF, or AVIF up to 4 MB. Uploaded images are public; gallery publication controls listing visibility, not file access.
