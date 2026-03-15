-- NGO Management Platform - Phase 2 Schema Migration
-- Run this in Supabase SQL Editor AFTER 001_initial_schema.sql

-- ============================================================
-- 1. Expand the role check constraint to include event_coordinator
-- ============================================================
ALTER TABLE users
  DROP CONSTRAINT IF EXISTS users_role_check;

ALTER TABLE users
  ADD CONSTRAINT users_role_check
  CHECK (role IN ('volunteer', 'admin', 'event_coordinator'));

-- ============================================================
-- 2. Extend the events table with Phase 2 fields
-- ============================================================
ALTER TABLE events
  ADD COLUMN IF NOT EXISTS duration_hours    NUMERIC(5,2),
  ADD COLUMN IF NOT EXISTS max_volunteers    INTEGER,
  ADD COLUMN IF NOT EXISTS recurring_type   VARCHAR(20) DEFAULT 'none'
    CHECK (recurring_type IN ('none', 'weekly')),
  ADD COLUMN IF NOT EXISTS recurring_day    VARCHAR(15),
  ADD COLUMN IF NOT EXISTS poster_url       TEXT,
  ADD COLUMN IF NOT EXISTS required_sessions INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS instagram_post   TEXT,
  ADD COLUMN IF NOT EXISTS facebook_post    TEXT;

-- ============================================================
-- 3. Volunteer Attendance table (per-session tracking)
-- ============================================================
CREATE TABLE IF NOT EXISTS volunteer_attendance (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  volunteer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_id     UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  date         DATE NOT NULL DEFAULT CURRENT_DATE,
  present      BOOLEAN NOT NULL DEFAULT true,
  marked_by    UUID REFERENCES users(id),
  created_at   TIMESTAMP DEFAULT NOW(),
  UNIQUE (volunteer_id, event_id, date)
);

-- ============================================================
-- 4. Coordinator ↔ Event assignments
-- ============================================================
CREATE TABLE IF NOT EXISTS coordinator_event_assignments (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coordinator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_id       UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  assigned_at    TIMESTAMP DEFAULT NOW(),
  assigned_by    UUID REFERENCES users(id),
  UNIQUE (coordinator_id, event_id)
);

-- ============================================================
-- 5. Indexes for new tables
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_attendance_volunteer  ON volunteer_attendance(volunteer_id);
CREATE INDEX IF NOT EXISTS idx_attendance_event      ON volunteer_attendance(event_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date       ON volunteer_attendance(date);
CREATE INDEX IF NOT EXISTS idx_coordinator_assign    ON coordinator_event_assignments(coordinator_id);
CREATE INDEX IF NOT EXISTS idx_coordinator_event     ON coordinator_event_assignments(event_id);

-- ============================================================
-- 6. Success notice
-- ============================================================
DO $$
BEGIN
  RAISE NOTICE 'Phase 2 schema migration applied successfully!';
  RAISE NOTICE 'New tables: volunteer_attendance, coordinator_event_assignments';
  RAISE NOTICE 'Events table extended with: duration_hours, max_volunteers, recurring_type,';
  RAISE NOTICE '  recurring_day, poster_url, required_sessions, instagram_post, facebook_post';
  RAISE NOTICE 'Role constraint updated to include: event_coordinator';
END $$;
