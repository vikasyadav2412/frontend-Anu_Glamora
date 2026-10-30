import test from 'node:test';
import assert from 'node:assert/strict';
import { bookingInput, serviceInput, offerInput, galleryInput, minutes, timeLabel } from '../server/validation.js';
import api from '../netlify/functions/api.mts';
import uploads from '../netlify/functions/uploads.mts';

const service = { name: 'Hair styling', category_id: 1, description: 'A personal styling appointment.', price: 500, discounted_price: '', duration_minutes: 60, image_url: '', featured: 'false' };
test('multipart fields preserve false flags and absent discounts', () => {
  const parsed = serviceInput.parse(service);
  assert.equal(parsed.featured,false);
  assert.equal(parsed.discounted_price,null);
  assert.equal(parsed.image_url,null);
  assert.equal(galleryInput.parse({title:'Studio',category:'Studio',alt_text:'Our studio',image_url:'https://example.com/image.png',is_published:'false'}).is_published,false);
});
test('reject invalid service pricing and duration', () => {
  for (const change of [{price:-1},{duration_minutes:0},{discounted_price:600},{price:'NaN'}]) assert.equal(serviceInput.safeParse({...service,...change}).success,false);
});
test('bookings reject invalid calendar dates and clock times', () => {
  const booking = {service_id:1,appointment_date:'2026-11-20',start_time:'10:30'};
  assert.equal(bookingInput.safeParse(booking).success,true);
  assert.equal(bookingInput.safeParse({...booking,appointment_date:'2026-02-30'}).success,false);
  assert.equal(bookingInput.safeParse({...booking,start_time:'24:00'}).success,false);
  assert.equal(timeLabel(minutes('10:30')+90),'12:00');
});
test('offers reject reversed dates and percentages above 100', () => {
  const offer = {code:'BEAUTY',discount_type:'percentage',discount_value:20,starts_at:'2026-11-01T10:00',expires_at:'2026-12-01T10:00'};
  assert.equal(offerInput.safeParse(offer).success,true);
  assert.equal(offerInput.safeParse({...offer,discount_value:101}).success,false);
  assert.equal(offerInput.safeParse({...offer,expires_at:'2026-10-01T10:00'}).success,false);
});
test('reject cross-origin and missing-origin mutations before handling data', async () => {
  for (const headers of [{Origin:'https://untrusted.example'},{}]) {
    const response = await api(new Request('https://studio.example/api/contact',{method:'POST',headers}));
    assert.equal(response.status,403);
  }
});
test('auth checks reject unauthenticated profile access', async () => {
  const response = await api(new Request('https://studio.example/api/auth/me'));
  assert.equal(response.status,401);
  assert.equal((await response.json()).success,false);
});
test('image routes reject invalid paths and writes before accessing storage', async () => {
  assert.equal((await uploads(new Request('https://studio.example/uploads/gallery/test.svg'))).status,404);
  assert.equal((await uploads(new Request('https://studio.example/uploads/gallery/test.png',{method:'POST'}))).status,405);
});
