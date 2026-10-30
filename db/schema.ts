import { pgTable, serial, text, integer, boolean, timestamp, date, numeric, check } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const customers = pgTable('customers', {
  id: text().primaryKey(), name: text().notNull(), email: text().notNull(), phone: text(),
  created_at: timestamp().defaultNow().notNull(),
});
export const categories = pgTable('service_categories', {
  id: serial().primaryKey(), name: text().notNull(), slug: text().notNull().unique(), is_active: boolean().default(true).notNull(),
});
export const services = pgTable('services', {
  id: serial().primaryKey(), category_id: integer().notNull().references(() => categories.id),
  name: text().notNull(), slug: text().notNull().unique(), description: text().notNull(),
  price: numeric({ precision: 12, scale: 2 }).notNull(), discounted_price: numeric({ precision: 12, scale: 2 }),
  duration_minutes: integer().notNull(), image_url: text(), featured: boolean().default(false).notNull(),
  is_active: boolean().default(true).notNull(), created_at: timestamp().defaultNow().notNull(),
});
export const appointments = pgTable('appointments', {
  id: serial().primaryKey(), customer_id: text().notNull().references(() => customers.id),
  service_id: integer().notNull().references(() => services.id), booking_reference: text().notNull().unique(),
  appointment_date: date().notNull(), start_minute: integer().notNull(), end_minute: integer().notNull(),
  status: text().default('pending').notNull(), total_amount: numeric({ precision: 12, scale: 2 }).notNull(),
  customer_notes: text(), created_at: timestamp().defaultNow().notNull(),
}, (t) => [check('valid_booking_time', sql`${t.start_minute} >= 0 AND ${t.end_minute} <= 1440 AND ${t.end_minute} > ${t.start_minute}`)]);
export const gallery = pgTable('gallery', {
  id: serial().primaryKey(), title: text().notNull(), category: text().notNull(), image_url: text().notNull(),
  alt_text: text().notNull(), caption: text(), is_published: boolean().default(true).notNull(), created_at: timestamp().defaultNow().notNull(),
});
export const offers = pgTable('coupons', {
  id: serial().primaryKey(), code: text().notNull().unique(), discount_type: text().notNull(),
  discount_value: numeric({ precision: 12, scale: 2 }).notNull(), min_order: numeric({ precision: 12, scale: 2 }).default('0').notNull(),
  starts_at: timestamp({ mode: 'string' }).notNull(), expires_at: timestamp({ mode: 'string' }).notNull(),
  usage_limit: integer(), is_active: boolean().default(true).notNull(),
});
export const settings = pgTable('settings', {
  setting_key: text().primaryKey(), setting_value: text().notNull(), is_public: boolean().default(true).notNull(),
});
export const messages = pgTable('contact_messages', {
  id: serial().primaryKey(), name: text().notNull(), email: text().notNull(), topic: text().notNull(),
  message: text().notNull(), created_at: timestamp().defaultNow().notNull(),
});
