import type { Config } from '@netlify/functions';
import { getUser, login, signup, logout, requestPasswordRecovery, verifyRequestOrigin, AuthError, MissingIdentityError, type User } from '@netlify/identity';
import { getStore } from '@netlify/blobs';
import { and, eq, desc, asc, sql, ilike, or, count } from 'drizzle-orm';
import { z } from 'zod';
import { database } from '../../db/index.js';
import { customers, categories, services, appointments, gallery, offers, settings, messages } from '../../db/schema.js';
import { serviceInput, galleryInput, offerInput, bookingInput, contactInput, minutes, timeLabel } from '../../server/validation.js';

function fail(status: number, message: string): never { throw Object.assign(new Error(message), { status }); }
function ok(data: unknown, status = 200) { return Response.json({ success: true, data }, { status, headers: { 'Cache-Control': 'no-store' } }); }
function slug(name: string) { return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g,'') || 'service'; }
function idOf(value: string) { return z.coerce.number().int().positive().parse(value); }
async function body(req: Request): Promise<Record<string, unknown>> {
  if (Number(req.headers.get('content-length')) > 6 * 1024 * 1024) fail(413, 'Request is too large.');
  if (req.headers.get('content-type')?.includes('multipart/form-data')) {
    const form = await req.formData();
    return Object.fromEntries(form.entries());
  }
  try { return await req.json(); } catch { fail(400, 'A valid JSON body is required.'); }
}
async function upload(file: unknown, area: string) {
  if (!(file instanceof File) || !file.size) return null;
  const extensions: Record<string,string> = { 'image/jpeg':'jpg','image/png':'png','image/webp':'webp','image/gif':'gif','image/avif':'avif' };
  const ext = extensions[file.type];
  if (!ext || file.size > 4 * 1024 * 1024) fail(400, 'Upload a JPG, PNG, WebP, GIF, or AVIF image up to 4 MB.');
  const key = `${area}/${crypto.randomUUID()}.${ext}`;
  await getStore('studio-uploads').set(key, await file.arrayBuffer());
  return `/uploads/${key}`;
}
function profile(user: User) { return { id: user.id, email: user.email || '', name: user.name || user.email || 'Customer', role: user.roles?.includes('admin') ? 'admin' : 'customer' }; }
async function identityProfile() {
  const user = await getUser();
  if (!user) fail(401, 'Please sign in to continue.');
  return profile(user);
}
async function requireAdmin() { const user = await identityProfile(); if (user.role !== 'admin') fail(403, 'Administrator access is required.'); return user; }
async function saveProfile(user: Awaited<ReturnType<typeof identityProfile>>) {
  await database().insert(customers).values({ id: user.id, email: user.email, name: user.name }).onConflictDoUpdate({ target: customers.id, set: { email: user.email, name: user.name } });
}

export default async (req: Request) => {
  try {
    const url = new URL(req.url), path = url.pathname.replace(/^\/api\/?/, '').replace(/\/$/, ''), method = req.method;
    const parts = path.split('/');
    if (!['GET','HEAD'].includes(method)) verifyRequestOrigin(req);
    if (path.startsWith('auth/')) {
      if (path === 'auth/me' && method === 'GET') { const user = await identityProfile(); await saveProfile(user); return ok({ user }); }
      if (method !== 'POST') fail(405, 'Method not allowed.');
      if (path === 'auth/logout') { await logout(); return ok(null); }
      const data = await body(req);
      if (path === 'auth/login') {
        const email = z.email().parse(data.identifier);
        const signed = await login(email, z.string().min(8).max(256).parse(data.password));
        const user = profile(signed); await saveProfile(user); return ok({ user });
      }
      if (path === 'auth/register') {
        const input = z.object({ name: z.string().trim().min(2).max(100), email: z.email(), password: z.string().min(8).max(256) }).parse(data);
        const signed = await signup(input.email, input.password, { full_name: input.name });
        if (!signed.confirmedAt) return ok({ user: null, confirmation_required: true }, 201);
        const user = profile(signed); await saveProfile(user); return ok({ user }, 201);
      }
      if (path === 'auth/forgot-password') {
        const email = z.email().parse(data.email);
        try { await requestPasswordRecovery(email); } catch (error) { if (!(error instanceof AuthError) || error.status !== 404) throw error; }
        return ok({ message: 'If the account exists, a password reset link has been sent.' });
      }
      fail(404, 'Route not found.');
    }
    const db = database();
    if (path === 'health' && method === 'GET') { await db.execute(sql`select 1`); return ok({ status: 'ok', database: 'connected' }); }
    if (path === 'contact' && method === 'POST') { const input = contactInput.parse(await body(req)); await db.insert(messages).values(input); return ok({ message: 'Your message has been received.' },201); }
    if (parts[0] === 'services') {
      if (method === 'GET') {
        const conditions = [eq(services.is_active, true)];
        if (parts[1]) conditions.push(eq(services.id, idOf(parts[1])));
        if (url.searchParams.get('category')) conditions.push(eq(categories.slug, url.searchParams.get('category')!));
        const search = url.searchParams.get('search');
        if (search) conditions.push(or(ilike(services.name, `%${search.slice(0,100)}%`), ilike(services.description, `%${search.slice(0,100)}%`))!);
        const size = Math.min(50, Math.max(1, Number(url.searchParams.get('limit')) || 12));
        const page = Math.max(1, Math.floor(Number(url.searchParams.get('page')) || 1));
        const sort = url.searchParams.get('sort');
        const order = sort === 'price-low' ? [asc(services.price)] : sort === 'price-high' ? [desc(services.price)] : [desc(services.featured),desc(services.created_at)];
        const rows = await db.select({ service: services, category: categories.name, category_slug: categories.slug }).from(services).innerJoin(categories, eq(services.category_id, categories.id)).where(and(...conditions)).orderBy(...order).limit(size).offset((page-1)*size);
        const items = rows.map(row => ({ ...row.service, category: row.category, category_slug: row.category_slug }));
        if (parts[1]) { if (!items.length) fail(404,'Service not found.'); return ok(items[0]); }
        const [total] = await db.select({ total: count() }).from(services).innerJoin(categories,eq(services.category_id,categories.id)).where(and(...conditions));
        return ok({ items, pagination: { total: total.total, page, limit: size } });
      }
      await requireAdmin();
      if (method === 'DELETE' && parts[1]) { const rows = await db.update(services).set({ is_active: false }).where(eq(services.id,idOf(parts[1]))).returning(); if (!rows.length) fail(404,'Service not found.'); return ok(null); }
      if (method === 'POST' || method === 'PUT') {
        const raw = await body(req);
        const input = serviceInput.parse(raw);
        const uploaded = await upload(raw.image, 'services');
        const values = { ...input, price: String(input.price), discounted_price: input.discounted_price === null ? null : String(input.discounted_price), image_url: uploaded || input.image_url, slug: `${slug(input.name)}-${method === 'PUT' ? idOf(parts[1]) : crypto.randomUUID().slice(0,8)}` };
        const rows = method === 'POST' ? await db.insert(services).values(values).returning() : await db.update(services).set(values).where(eq(services.id,idOf(parts[1]))).returning();
        if (!rows.length) fail(404,'Service not found.'); return ok(rows[0], method === 'POST' ? 201 : 200);
      }
    }
    if (parts[0] === 'gallery') {
      if (method === 'GET') { if (parts[1] === 'manage') { await requireAdmin(); return ok(await db.select().from(gallery).orderBy(desc(gallery.created_at))); } return ok(await db.select().from(gallery).where(eq(gallery.is_published,true)).orderBy(desc(gallery.created_at))); }
      await requireAdmin();
      if (method === 'DELETE') { const rows = await db.delete(gallery).where(eq(gallery.id,idOf(parts[1]))).returning(); if (!rows.length) fail(404,'Gallery item not found.'); return ok(null); }
      if (method === 'POST' || method === 'PUT') {
        const raw = await body(req);
        // Validate the fields before storing any uploaded file.
        const input = galleryInput.parse({ ...raw, image_url: raw.image instanceof File ? 'https://upload.invalid/image' : raw.image_url });
        const uploaded = await upload(raw.image,'gallery');
        if (parts[1] === 'upload' && !uploaded) fail(400,'Choose an image.');
        const values = { ...input, image_url: uploaded || input.image_url };
        const rows = method === 'POST' ? await db.insert(gallery).values(values).returning() : await db.update(gallery).set(values).where(eq(gallery.id,idOf(parts[1]))).returning();
        if (!rows.length) fail(404,'Gallery item not found.'); return ok(rows[0],method === 'POST' ? 201 : 200);
      }
    }
    if (path === 'offers' && method === 'GET') return ok(await db.select().from(offers).where(and(eq(offers.is_active,true), sql`${offers.starts_at} <= now()`,sql`${offers.expires_at} >= now()`)).orderBy(asc(offers.expires_at)));
    if (parts[0] === 'appointments') {
      const user = await identityProfile();
      if (method === 'POST' && !parts[1]) {
        if (user.role !== 'customer') fail(403,'Sign in with a customer account to book.');
        const data = bookingInput.parse(await body(req));
        // Studio appointments use India local time, independent of the function timezone.
        const now = new Date(Date.now()+330*60000).toISOString().slice(0,16);
        if (`${data.appointment_date}T${data.start_time}` < now) fail(400,'Choose a future appointment time.');
        await saveProfile(user);
        const result = await db.transaction(async tx => {
          // Serialize booking writes, including when the date has no existing appointments.
          await tx.execute(sql`select pg_advisory_xact_lock(771042)`);
          const [service] = await tx.select().from(services).where(and(eq(services.id,data.service_id),eq(services.is_active,true)));
          if (!service) fail(404,'Service not found.');
          const start = minutes(data.start_time), end = start+service.duration_minutes;
          if (end > 1440) fail(400,'The service must finish on the selected day.');
          const conflicts = await tx.select({ id: appointments.id }).from(appointments).where(and(eq(appointments.appointment_date,data.appointment_date),sql`${appointments.status} in ('pending','confirmed','in_progress')`,sql`${appointments.start_minute} < ${end}`,sql`${appointments.end_minute} > ${start}`));
          if (conflicts.length) fail(409,'That time is no longer available. Please choose another slot.');
          const [booking] = await tx.insert(appointments).values({ customer_id: user.id, service_id: service.id, booking_reference: `AG-${crypto.randomUUID().slice(0,12).toUpperCase()}`, appointment_date: data.appointment_date, start_minute: start, end_minute: end, total_amount: service.discounted_price ?? service.price, customer_notes: data.notes }).returning();
          return booking;
        });
        return ok(result,201);
      }
      if (method === 'GET') {
        if (parts[1] === 'availability') {
          const date = z.iso.date().parse(url.searchParams.get('date'));
          const rows = await db.select().from(appointments).where(and(eq(appointments.appointment_date,date),sql`${appointments.status} in ('pending','confirmed','in_progress')`));
          return ok({ booked: rows.map(row => ({ start_time:timeLabel(row.start_minute),end_time:timeLabel(row.end_minute) })) });
        }
        if (parts[1] !== 'my-bookings') await requireAdmin();
        const rows = await db.select({ booking:appointments, customer_name:customers.name, email:customers.email, service_name:services.name }).from(appointments).innerJoin(customers,eq(appointments.customer_id,customers.id)).innerJoin(services,eq(appointments.service_id,services.id)).where(parts[1] === 'my-bookings' ? eq(appointments.customer_id,user.id) : undefined).orderBy(desc(appointments.appointment_date),desc(appointments.start_minute));
        return ok(rows.map(row => ({ ...row.booking, customer_name:row.customer_name,email:row.email,service_name:row.service_name,start_time:timeLabel(row.booking.start_minute),end_time:timeLabel(row.booking.end_minute) })));
      }
      if (method === 'PATCH') {
        if (!['status','cancel'].includes(parts[2])) fail(404,'Route not found.');
        const cancel = parts[2] === 'cancel';
        if (!cancel) await requireAdmin();
        const status = cancel ? 'cancelled' : z.enum(['pending','confirmed','in_progress','completed','cancelled','no_show']).parse((await body(req)).status);
        await db.transaction(async tx => {
          await tx.execute(sql`select pg_advisory_xact_lock(771042)`);
          const [current] = await tx.select().from(appointments).where(eq(appointments.id,idOf(parts[1])));
          if (!current || (cancel && (current.customer_id !== user.id || !['pending','confirmed'].includes(current.status)))) fail(404,'Booking cannot be updated.');
          if (['pending','confirmed','in_progress'].includes(status)) {
            const conflicts = await tx.select().from(appointments).where(and(eq(appointments.appointment_date,current.appointment_date),sql`${appointments.id} <> ${current.id}`,sql`${appointments.status} in ('pending','confirmed','in_progress')`,sql`${appointments.start_minute} < ${current.end_minute}`,sql`${appointments.end_minute} > ${current.start_minute}`));
            if (conflicts.length) fail(409,'This slot now conflicts with another appointment.');
          }
          await tx.update(appointments).set({status}).where(eq(appointments.id,current.id));
        });
        return ok({status});
      }
    }
    if (parts[0] === 'admin') {
      await requireAdmin();
      if (method === 'GET' && parts[1] === 'categories') return ok(await db.select().from(categories).orderBy(asc(categories.name)));
      if (method === 'POST' && parts[1] === 'categories') { const name = z.string().trim().min(2).max(100).parse((await body(req)).name); return ok((await db.insert(categories).values({name,slug:slug(name)}).returning())[0],201); }
      if (method === 'GET' && parts[1] === 'customers') return ok(await db.select().from(customers).orderBy(desc(customers.created_at)));
      if (method === 'GET' && parts[1] === 'messages') return ok(await db.select().from(messages).orderBy(desc(messages.created_at)));
      if (parts[1] === 'offers') {
        if (method === 'GET') return ok(await db.select().from(offers).orderBy(desc(offers.starts_at)));
        if (method === 'DELETE') { const rows = await db.delete(offers).where(eq(offers.id,idOf(parts[2]))).returning(); if (!rows.length) fail(404,'Offer not found.'); return ok(null); }
        if (method === 'POST' || method === 'PUT') { const input = offerInput.parse(await body(req)); const values = {...input,discount_value:String(input.discount_value),min_order:String(input.min_order)}; const rows = method === 'POST' ? await db.insert(offers).values(values).returning() : await db.update(offers).set(values).where(eq(offers.id,idOf(parts[2]))).returning(); if (!rows.length) fail(404,'Offer not found.'); return ok(rows[0],method === 'POST'?201:200); }
      }
      if (parts[1] === 'settings') {
        if (method === 'GET') return ok(await db.select().from(settings).orderBy(asc(settings.setting_key)));
        if (method === 'PUT' && parts[2]) { const key = z.string().regex(/^[a-z_]{1,100}$/).parse(parts[2]), value = z.string().trim().min(1).max(2000).parse((await body(req)).value); await db.insert(settings).values({setting_key:key,setting_value:value}).onConflictDoUpdate({target:settings.setting_key,set:{setting_value:value}}); return ok(null); }
      }
      if (method === 'GET' && parts[1] === 'dashboard') {
        const [totals] = await db.select({ pending:sql<number>`count(*) filter (where status = 'pending')::int`, completed:sql<number>`count(*) filter (where status = 'completed')::int`, today:sql<number>`count(*) filter (where appointment_date = (now() at time zone 'Asia/Kolkata')::date and status not in ('cancelled','no_show'))::int` }).from(appointments);
        const [c] = await db.select({total:count()}).from(customers); const [s] = await db.select({total:count()}).from(services).where(eq(services.is_active,true));
        return ok({...totals,customers:c.total,services:s.total});
      }
      if (method === 'GET' && parts[1] === 'reports') {
        const recent = sql`${appointments.created_at} >= now() - interval '30 days'`;
        const [summary] = await db.select({bookings:count(),completed:sql<number>`count(*) filter (where status = 'completed')::int`,revenue:sql<string>`coalesce(sum(total_amount) filter (where status = 'completed'),0)`}).from(appointments).where(recent);
        const topServices = await db.select({name:services.name,bookings:count()}).from(appointments).innerJoin(services,eq(appointments.service_id,services.id)).where(recent).groupBy(services.id,services.name).orderBy(desc(count())).limit(5);
        return ok({summary,topServices});
      }
    }
    if (path === 'settings' && method === 'GET') return ok(await db.select().from(settings).where(eq(settings.is_public,true)));
    fail(404,'Route not found.');
  } catch (error) {
    if (error instanceof z.ZodError) return Response.json({success:false,error:error.issues[0]?.message || 'Invalid input.'},{status:400});
    if (error instanceof AuthError) return Response.json({success:false,error:error.status === 401 ? 'Invalid email or password, or session expired.' : error.message},{status:error.status || 400});
    if (error instanceof MissingIdentityError) return Response.json({success:false,error:'Account access is not yet available. Please contact the studio.'},{status:503});
    const databaseError = error as { code?: string; cause?: { code?: string } };
    const code = databaseError.code || databaseError.cause?.code;
    if (code === '23505') return Response.json({success:false,error:'An item with these details already exists.'},{status:409});
    if (code === '23503') return Response.json({success:false,error:'The selected related item does not exist.'},{status:400});
    const status = (error as {status?:number})?.status;
    if (status && status >= 400 && status < 500) return Response.json({success:false,error:(error as Error).message},{status});
    // Never return database errors or runtime configuration details to the browser.
    return Response.json({success:false,error:'The service is temporarily unavailable. Please try again.'},{status:503});
  }
};
export const config: Config = { path: '/api/*' };
