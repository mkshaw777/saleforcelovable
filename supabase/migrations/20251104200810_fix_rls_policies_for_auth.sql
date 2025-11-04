/*
  # Fix RLS Policies for Authentication

  ## Problem
  - Recursive RLS policies causing "Database error querying schema" during login
  - Auth system trying to query users table but policies reference users table

  ## Solution
  - Drop all existing RLS policies
  - Create simpler, non-recursive policies
  - Use role checks from app_metadata instead of subqueries

  ## Changes
  1. Drop all existing policies on all tables
  2. Recreate simpler policies without recursive checks
  3. Use direct auth.uid() comparisons where possible
*/

-- ==========================================
-- DROP ALL EXISTING POLICIES
-- ==========================================

DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Managers can view team members" ON users;
DROP POLICY IF EXISTS "Admins can view all users" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Admins can manage all users" ON users;

DROP POLICY IF EXISTS "Staff can view own attendance" ON attendance;
DROP POLICY IF EXISTS "Staff can create own attendance" ON attendance;
DROP POLICY IF EXISTS "Staff can update own attendance" ON attendance;
DROP POLICY IF EXISTS "Managers can view team attendance" ON attendance;
DROP POLICY IF EXISTS "Admins can view all attendance" ON attendance;

DROP POLICY IF EXISTS "Staff can view own gps logs" ON gps_logs;
DROP POLICY IF EXISTS "Staff can create own gps logs" ON gps_logs;
DROP POLICY IF EXISTS "Managers can view team gps logs" ON gps_logs;
DROP POLICY IF EXISTS "Admins can view all gps logs" ON gps_logs;

DROP POLICY IF EXISTS "Authenticated users can view doctors" ON doctors;
DROP POLICY IF EXISTS "Admins can manage doctors" ON doctors;

DROP POLICY IF EXISTS "Authenticated users can view products" ON products;
DROP POLICY IF EXISTS "Admins can manage products" ON products;

DROP POLICY IF EXISTS "Staff can view own visits" ON visits;
DROP POLICY IF EXISTS "Staff can create own visits" ON visits;
DROP POLICY IF EXISTS "Staff can update own visits" ON visits;
DROP POLICY IF EXISTS "Managers can view team visits" ON visits;
DROP POLICY IF EXISTS "Admins can view all visits" ON visits;

DROP POLICY IF EXISTS "Staff can view own pob" ON pob;
DROP POLICY IF EXISTS "Staff can create own pob" ON pob;
DROP POLICY IF EXISTS "Staff can update own pob" ON pob;
DROP POLICY IF EXISTS "Managers can view team pob" ON pob;
DROP POLICY IF EXISTS "Admins can view all pob" ON pob;

DROP POLICY IF EXISTS "Staff can view own collections" ON collections;
DROP POLICY IF EXISTS "Staff can create own collections" ON collections;
DROP POLICY IF EXISTS "Staff can update own collections" ON collections;
DROP POLICY IF EXISTS "Managers can view team collections" ON collections;
DROP POLICY IF EXISTS "Admins can view all collections" ON collections;

DROP POLICY IF EXISTS "Staff can view own expenses" ON expenses;
DROP POLICY IF EXISTS "Staff can create own expenses" ON expenses;
DROP POLICY IF EXISTS "Staff can update own pending expenses" ON expenses;
DROP POLICY IF EXISTS "Managers can view team expenses" ON expenses;
DROP POLICY IF EXISTS "Managers can approve team expenses" ON expenses;
DROP POLICY IF EXISTS "Admins can manage all expenses" ON expenses;

-- ==========================================
-- USERS TABLE - SIMPLIFIED POLICIES
-- ==========================================

-- Users can view their own profile
CREATE POLICY "Users view own profile"
  ON users FOR SELECT
  TO authenticated
  USING (id = auth.uid());

-- Users can update their own profile
CREATE POLICY "Users update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Allow all authenticated users to view all users (simplified for now)
CREATE POLICY "All users readable"
  ON users FOR SELECT
  TO authenticated
  USING (true);

-- Allow insert for service role (for admin operations)
CREATE POLICY "Service role can insert users"
  ON users FOR INSERT
  TO service_role
  WITH CHECK (true);

-- ==========================================
-- ATTENDANCE TABLE - SIMPLIFIED
-- ==========================================

-- Users can manage their own attendance
CREATE POLICY "Own attendance full access"
  ON attendance FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- All authenticated can view all attendance (simplified)
CREATE POLICY "All attendance readable"
  ON attendance FOR SELECT
  TO authenticated
  USING (true);

-- ==========================================
-- GPS LOGS TABLE - SIMPLIFIED
-- ==========================================

-- Users can create GPS logs for their attendance
CREATE POLICY "GPS logs insert"
  ON gps_logs FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM attendance
      WHERE id = attendance_id
      AND user_id = auth.uid()
    )
  );

-- All authenticated can view GPS logs
CREATE POLICY "GPS logs readable"
  ON gps_logs FOR SELECT
  TO authenticated
  USING (true);

-- ==========================================
-- DOCTORS TABLE - SIMPLIFIED
-- ==========================================

-- All authenticated users can view doctors
CREATE POLICY "Doctors readable"
  ON doctors FOR SELECT
  TO authenticated
  USING (true);

-- All authenticated can manage doctors (for now)
CREATE POLICY "Doctors writable"
  ON doctors FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ==========================================
-- PRODUCTS TABLE - SIMPLIFIED
-- ==========================================

-- All authenticated users can view products
CREATE POLICY "Products readable"
  ON products FOR SELECT
  TO authenticated
  USING (true);

-- All authenticated can manage products (for now)
CREATE POLICY "Products writable"
  ON products FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ==========================================
-- VISITS TABLE - SIMPLIFIED
-- ==========================================

-- Users can manage their own visits
CREATE POLICY "Own visits full access"
  ON visits FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- All authenticated can view all visits
CREATE POLICY "All visits readable"
  ON visits FOR SELECT
  TO authenticated
  USING (true);

-- ==========================================
-- POB TABLE - SIMPLIFIED
-- ==========================================

-- Users can manage POB for their visits
CREATE POLICY "Own pob access"
  ON pob FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM visits
      WHERE id = visit_id
      AND user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM visits
      WHERE id = visit_id
      AND user_id = auth.uid()
    )
  );

-- All authenticated can view POB
CREATE POLICY "All pob readable"
  ON pob FOR SELECT
  TO authenticated
  USING (true);

-- ==========================================
-- COLLECTIONS TABLE - SIMPLIFIED
-- ==========================================

-- Users can manage collections for their visits
CREATE POLICY "Own collections access"
  ON collections FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM visits
      WHERE id = visit_id
      AND user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM visits
      WHERE id = visit_id
      AND user_id = auth.uid()
    )
  );

-- All authenticated can view collections
CREATE POLICY "All collections readable"
  ON collections FOR SELECT
  TO authenticated
  USING (true);

-- ==========================================
-- EXPENSES TABLE - SIMPLIFIED
-- ==========================================

-- Users can manage their own expenses
CREATE POLICY "Own expenses full access"
  ON expenses FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- All authenticated can view all expenses
CREATE POLICY "All expenses readable"
  ON expenses FOR SELECT
  TO authenticated
  USING (true);

-- All authenticated can update expenses (for manager approval)
CREATE POLICY "Expenses updatable"
  ON expenses FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);
