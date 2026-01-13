-- Multi-Course Access System - Database Migration
-- Run this in your Neon database console

-- 1. Create courses catalog table
CREATE TABLE IF NOT EXISTS wolfmed_courses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 2. Create course enrollments table
CREATE TABLE IF NOT EXISTS wolfmed_course_enrollments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  course_slug VARCHAR(100) NOT NULL,
  access_tier VARCHAR(50) DEFAULT 'basic',
  is_active BOOLEAN DEFAULT true,
  enrolled_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP,
  UNIQUE(user_id, course_slug)
);

-- 3. Add course_slug to payments table
ALTER TABLE wolfmed_stripe_payments
ADD COLUMN IF NOT EXISTS course_slug VARCHAR(100);

-- 4. Add course_slug to subscriptions table
ALTER TABLE wolfmed_stripe_subscriptions
ADD COLUMN IF NOT EXISTS course_slug VARCHAR(100);

-- 5. Create indexes
CREATE INDEX IF NOT EXISTS idx_enrollments_user_id ON wolfmed_course_enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course_slug ON wolfmed_course_enrollments(course_slug);
CREATE INDEX IF NOT EXISTS idx_enrollments_is_active ON wolfmed_course_enrollments(is_active);
CREATE INDEX IF NOT EXISTS idx_enrollments_user_course ON wolfmed_course_enrollments(user_id, course_slug);
CREATE INDEX IF NOT EXISTS idx_courses_slug ON wolfmed_courses(slug);
CREATE INDEX IF NOT EXISTS idx_courses_is_active ON wolfmed_courses(is_active);

-- 6. Insert initial courses
INSERT INTO wolfmed_courses (slug, name, description, is_active) VALUES
  ('opiekun-medyczny', 'Opiekun Medyczny', 'Kurs dla opiekunów medycznych', true),
  ('pielegniarstwo', 'Pielęgniarstwo', 'Kurs pielęgniarstwa', true)
ON CONFLICT (slug) DO NOTHING;

-- 7. OPTIONAL: Migrate existing supporters to have opiekun-medyczny enrollment
-- Uncomment and run this after verifying the setup works:
--
-- INSERT INTO wolfmed_course_enrollments (user_id, course_slug, access_tier, is_active)
-- SELECT user_id, 'opiekun-medyczny', 'premium', true
-- FROM wolfmed_users
-- WHERE supporter = true
-- ON CONFLICT (user_id, course_slug) DO NOTHING;
