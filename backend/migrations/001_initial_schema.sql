-- NGO Management Platform - Database Schema
-- MVP Tables Only (Phase 1)

-- 1. Users table (core authentication and roles)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('volunteer', 'admin')),
  is_approved BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. Volunteer profiles (extended information)
CREATE TABLE IF NOT EXISTS volunteer_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  date_of_birth DATE,
  gender VARCHAR(20),
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  pincode VARCHAR(10),
  occupation VARCHAR(100),
  skills TEXT,
  profile_picture_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 3. Events table
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  event_type VARCHAR(50),
  event_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  venue TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  max_participants INTEGER,
  registration_deadline DATE,
  is_public BOOLEAN DEFAULT true,
  status VARCHAR(50) DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled')),
  created_by UUID REFERENCES users(id),
  banner_image_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 4. Event registrations (volunteer-event mapping)
CREATE TABLE IF NOT EXISTS event_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  volunteer_id UUID REFERENCES users(id) ON DELETE CASCADE,
  registration_date TIMESTAMP DEFAULT NOW(),
  status VARCHAR(50) DEFAULT 'registered' CHECK (status IN ('registered', 'attended', 'absent', 'cancelled')),
  attendance_marked_at TIMESTAMP,
  attendance_marked_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(event_id, volunteer_id)
);

-- 5. Certificates table
CREATE TABLE IF NOT EXISTS certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  certificate_number VARCHAR(100) UNIQUE NOT NULL,
  event_id UUID REFERENCES events(id),
  volunteer_id UUID REFERENCES users(id),
  volunteer_name VARCHAR(255) NOT NULL,
  event_title VARCHAR(255) NOT NULL,
  event_date DATE NOT NULL,
  issued_date DATE DEFAULT CURRENT_DATE,
  pdf_url TEXT NOT NULL,
  qr_code_data TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 6. Announcements table
CREATE TABLE IF NOT EXISTS announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  target_audience VARCHAR(50) CHECK (target_audience IN ('all', 'volunteers', 'admins')),
  priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  is_pinned BOOLEAN DEFAULT false,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_approved ON users(is_approved);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(event_date);
CREATE INDEX IF NOT EXISTS idx_registrations_event ON event_registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_registrations_volunteer ON event_registrations(volunteer_id);
CREATE INDEX IF NOT EXISTS idx_certificates_number ON certificates(certificate_number);
CREATE INDEX IF NOT EXISTS idx_announcements_audience ON announcements(target_audience);

-- Insert default admin user (password: Admin@123)
-- Password hash for 'Admin@123' using bcrypt
INSERT INTO users (email, password_hash, role, is_approved, is_active)
VALUES ('admin@ngo.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN96UNQu.9N7VpNWxKs1e', 'admin', true, true)
ON CONFLICT (email) DO NOTHING;

-- Success message
DO $$ 
BEGIN 
  RAISE NOTICE 'Database schema created successfully!';
  RAISE NOTICE 'Default admin: admin@ngo.com / Admin@123';
END $$;
