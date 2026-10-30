import { z } from 'zod';
const flag = z.preprocess(v => v === 'true' ? true : v === 'false' ? false : v, z.boolean());
const money = z.coerce.number().finite().nonnegative().max(10000000);
const image = z.string().max(1000).refine(v => /^https?:\/\//.test(v) || /^\/uploads\/[a-z0-9/-]+\.(jpg|png|webp|gif|avif)$/.test(v), 'Enter a valid image URL.');
export const serviceInput = z.object({
  name: z.string().trim().min(2).max(150), category_id: z.coerce.number().int().positive(),
  description: z.string().trim().min(10).max(2000), price: money,
  discounted_price: z.preprocess(v => v === '' || v === undefined ? null : v, money.nullable()),
  duration_minutes: z.coerce.number().int().min(1).max(720), image_url: z.preprocess(v => v === '' || v === undefined ? null : v, image.nullable()),
  featured: flag.default(false),
}).refine(v => v.discounted_price === null || v.discounted_price <= v.price, 'Discounted price must not exceed price.');
export const galleryInput = z.object({ title: z.string().trim().min(2).max(150), category: z.string().trim().min(2).max(80), image_url: image, alt_text: z.string().trim().min(2).max(255), caption: z.string().max(500).nullable().optional(), is_published: flag.default(true) });
export const offerInput = z.object({ code: z.string().trim().min(3).max(50).transform(v => v.toUpperCase()), discount_type: z.enum(['percentage','fixed']), discount_value: money, min_order: money.default(0), starts_at: z.string().refine(v => Number.isFinite(Date.parse(v))), expires_at: z.string().refine(v => Number.isFinite(Date.parse(v))), usage_limit: z.preprocess(v => v === '' || v === undefined ? null : v, z.coerce.number().int().positive().nullable()), is_active: flag.default(true) }).refine(v => Date.parse(v.expires_at) > Date.parse(v.starts_at), 'Expiry must follow the start date.').refine(v => v.discount_type !== 'percentage' || v.discount_value <= 100, 'Percentage cannot exceed 100.');
export const bookingInput = z.object({ service_id: z.coerce.number().int().positive(), appointment_date: z.iso.date(), start_time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/), notes: z.string().max(1000).optional() });
export const contactInput = z.object({ name: z.string().trim().min(2).max(100), email: z.email().max(190), topic: z.string().trim().min(2).max(100), message: z.string().trim().min(10).max(3000) });
export function minutes(time: string) { const [h,m] = time.split(':').map(Number); return h * 60 + m; }
export function timeLabel(value: number) { return `${String(Math.floor(value/60)).padStart(2,'0')}:${String(value%60).padStart(2,'0')}`; }
