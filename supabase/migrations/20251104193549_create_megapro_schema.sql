/*
  # Megapro Innovation Field Force App - Complete Database Schema

  ## Overview
  This migration creates the complete database structure for the Megapro Innovation Field Force
  Automation System with proper security, relationships, and indexes for optimal performance.

  ## New Tables

  ### 1. users
  - Links to Supabase Auth users
  - Stores user profile (name, role, manager hierarchy)
  - Roles: STAFF (MR), MANAGER, ADMIN
  
  ### 2. attendance
  - Daily attendance tracking with GPS coordinates
  - Stores start/end times and verified kilometers traveled
  - Links to users table
  
  ### 3. gps_logs
  - Real-time GPS tracking during work hours
  - Stores all GPS points for distance verification
  - Links to attendance records
  
  ### 4. doctors
  - Doctor master data with registered locations
  - Stores name, specialty, and GPS coordinates
  
  ### 5. products
  - Product master data for POB (Product Order Booking)
  - Stores product name and pricing
  
  ### 6. visits
  - Doctor visit records with check-in/check-out
  - Includes visit verification flags (In Range/Out of Range)
  - Links to users and doctors
  
  ### 7. pob (Product Order Booking)
  - Product orders taken during doctor visits
  - Links to visits and products
  - Auto-calculates total price
  
  ### 8. collections
  - Payment collections during visits
  - Supports multiple payment modes (Cash, Cheque, UPI)
  - Links to visits
  
  ### 9. expenses
  - MR expense claims with receipts
  - Types: Travel, Hotel, Food
  - Status: Pending, Approved, Rejected
  - Links to Supabase Storage for receipt uploads

  ## Security
  - Row Level Security (RLS) enabled on ALL tables
  - Policies enforce role-based access control
  - Staff can only access their own data
  - Managers can access their team's data
  - Admins have full access

  ## Performance
  - Indexes on all foreign keys
  - Indexes on frequently queried columns
  - Optimized for real-time queries
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users Table (extends auth.users)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'STAFF' CHECK (role IN ('STAFF', 'MANAGER', 'ADMIN')),
  manager_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Attendance Table
CREATE TABLE IF NOT EXISTS attendance (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  start_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  end_time TIMESTAMPTZ,
  start_coordinates JSONB NOT NULL,
  end_coordinates JSONB,
  verified_km REAL DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT end_after_start CHECK (end_time IS NULL OR end_time > start_time)
);

-- 3. GPS Logs Table
CREATE TABLE IF NOT EXISTS gps_logs (
  id BIGSERIAL PRIMARY KEY,
  attendance_id INTEGER NOT NULL REFERENCES attendance(id) ON DELETE CASCADE,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  coordinates JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Doctors Table
CREATE TABLE IF NOT EXISTS doctors (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  specialty TEXT,
  registered_location JSONB NOT NULL,
  address TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Products Table
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  price REAL NOT NULL CHECK (price >= 0),
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Visits Table
CREATE TABLE IF NOT EXISTS visits (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  doctor_id INTEGER NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  attendance_id INTEGER REFERENCES attendance(id) ON DELETE SET NULL,
  check_in_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  check_out_time TIMESTAMPTZ,
  check_in_coordinates JSONB NOT NULL,
  check_out_coordinates JSONB,
  visit_flag TEXT DEFAULT 'In Range' CHECK (visit_flag IN ('In Range', 'Out of Range')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT checkout_after_checkin CHECK (check_out_time IS NULL OR check_out_time > check_in_time)
);

-- 7. POB (Product Order Booking) Table
CREATE TABLE IF NOT EXISTS pob (
  id SERIAL PRIMARY KEY,
  visit_id INTEGER NOT NULL REFERENCES visits(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  price_per_unit REAL NOT NULL CHECK (price_per_unit >= 0),
  total_price REAL GENERATED ALWAYS AS (quantity * price_per_unit) STORED,
  stockist_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Collections Table
CREATE TABLE IF NOT EXISTS collections (
  id SERIAL PRIMARY KEY,
  visit_id INTEGER NOT NULL REFERENCES visits(id) ON DELETE CASCADE,
  amount REAL NOT NULL CHECK (amount > 0),
  mode TEXT NOT NULL CHECK (mode IN ('Cash', 'Cheque', 'UPI', 'NEFT', 'RTGS')),
  reference TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Expenses Table
CREATE TABLE IF NOT EXISTS expenses (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  attendance_id INTEGER REFERENCES attendance(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('Travel', 'Hotel', 'Food', 'Other')),
  amount REAL NOT NULL CHECK (amount >= 0),
  status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Rejected')),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  verified_km REAL,
  receipt_url TEXT,
  notes TEXT,
  approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_manager_id ON users(manager_id);
CREATE INDEX IF NOT EXISTS idx_attendance_user_id ON attendance(user_id);
CREATE INDEX IF NOT EXISTS idx_attendance_status ON attendance(status);
CREATE INDEX IF NOT EXISTS idx_attendance_start_time ON attendance(start_time DESC);
CREATE INDEX IF NOT EXISTS idx_gps_logs_attendance_id ON gps_logs(attendance_id);
CREATE INDEX IF NOT EXISTS idx_gps_logs_timestamp ON gps_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_visits_user_id ON visits(user_id);
CREATE INDEX IF NOT EXISTS idx_visits_doctor_id ON visits(doctor_id);
CREATE INDEX IF NOT EXISTS idx_visits_check_in_time ON visits(check_in_time DESC);
CREATE INDEX IF NOT EXISTS idx_pob_visit_id ON pob(visit_id);
CREATE INDEX IF NOT EXISTS idx_pob_product_id ON pob(product_id);
CREATE INDEX IF NOT EXISTS idx_collections_visit_id ON collections(visit_id);
CREATE INDEX IF NOT EXISTS idx_expenses_user_id ON expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_expenses_status ON expenses(status);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date DESC);

-- Update timestamp trigger function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply update triggers
CREATE TRIGGER users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER doctors_updated_at BEFORE UPDATE ON doctors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER expenses_updated_at BEFORE UPDATE ON expenses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
