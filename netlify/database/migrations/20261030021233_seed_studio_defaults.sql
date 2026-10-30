INSERT INTO service_categories (name, slug) VALUES
  ('Bridal', 'bridal'), ('Hair', 'hair'), ('Skincare', 'skincare'), ('Makeup', 'makeup')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO settings (setting_key, setting_value, is_public) VALUES
  ('studio_name', 'Anu Glamora', true),
  ('studio_address', 'Paliwal Chauraha, Shikohabad', true),
  ('booking_timezone', 'Asia/Kolkata', true)
ON CONFLICT (setting_key) DO NOTHING;
