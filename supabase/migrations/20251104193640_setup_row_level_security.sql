/*
  # Row Level Security (RLS) Policies for Megapro Innovation App

  ## Security Model
  
  ### Role Hierarchy:
  1. **STAFF (MR)**: Can only read/write their own data
  2. **MANAGER**: Can read their team's data + their own data
  3. **ADMIN**: Full access to all data

  ## Policy Strategy:
  - All tables have RLS enabled
  - Separate policies for SELECT, INSERT, UPDATE, DELETE
  - Policies check auth.uid() for user identification
  - Managers can access data where user.manager_id = their ID
  - Admins bypass most restrictions

  ## Tables Covered:
  1. users - Profile management
  2. attendance - Daily attendance tracking
  3. gps_logs - GPS tracking data
  4. doctors - Doctor master data
  5. products - Product master data
  6. visits - Doctor visit records
  7. pob - Product orders
  8. collections - Payment collections
  9. expenses - Expense claims
*/

-- ==========================================
-- 1. USERS TABLE POLICIES
-- ==========================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Managers can view their team members
CREATE POLICY "Managers can view team members"
  ON users FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND u.role = 'MANAGER'
      AND users.manager_id = u.id
    )
  );

-- Admins can view all users
CREATE POLICY "Admins can view all users"
  ON users FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND u.role = 'ADMIN'
    )
  );

-- Users can update their own profile (limited fields)
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Admins can insert/update/delete any user
CREATE POLICY "Admins can manage all users"
  ON users FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND u.role = 'ADMIN'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND u.role = 'ADMIN'
    )
  );

-- ==========================================
-- 2. ATTENDANCE TABLE POLICIES
-- ==========================================

ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;

-- Staff can view their own attendance
CREATE POLICY "Staff can view own attendance"
  ON attendance FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Staff can insert their own attendance
CREATE POLICY "Staff can create own attendance"
  ON attendance FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Staff can update their own attendance
CREATE POLICY "Staff can update own attendance"
  ON attendance FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Managers can view team attendance
CREATE POLICY "Managers can view team attendance"
  ON attendance FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = user_id
      AND u.manager_id = auth.uid()
    )
  );

-- Admins can view all attendance
CREATE POLICY "Admins can view all attendance"
  ON attendance FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND u.role = 'ADMIN'
    )
  );

-- ==========================================
-- 3. GPS LOGS TABLE POLICIES
-- ==========================================

ALTER TABLE gps_logs ENABLE ROW LEVEL SECURITY;

-- Staff can view their own GPS logs
CREATE POLICY "Staff can view own gps logs"
  ON gps_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM attendance a
      WHERE a.id = attendance_id
      AND a.user_id = auth.uid()
    )
  );

-- Staff can insert their own GPS logs
CREATE POLICY "Staff can create own gps logs"
  ON gps_logs FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM attendance a
      WHERE a.id = attendance_id
      AND a.user_id = auth.uid()
    )
  );

-- Managers can view team GPS logs
CREATE POLICY "Managers can view team gps logs"
  ON gps_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM attendance a
      JOIN users u ON u.id = a.user_id
      WHERE a.id = attendance_id
      AND u.manager_id = auth.uid()
    )
  );

-- Admins can view all GPS logs
CREATE POLICY "Admins can view all gps logs"
  ON gps_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND u.role = 'ADMIN'
    )
  );

-- ==========================================
-- 4. DOCTORS TABLE POLICIES
-- ==========================================

ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;

-- All authenticated users can view doctors
CREATE POLICY "Authenticated users can view doctors"
  ON doctors FOR SELECT
  TO authenticated
  USING (true);

-- Only admins can manage doctors
CREATE POLICY "Admins can manage doctors"
  ON doctors FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND u.role = 'ADMIN'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND u.role = 'ADMIN'
    )
  );

-- ==========================================
-- 5. PRODUCTS TABLE POLICIES
-- ==========================================

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- All authenticated users can view products
CREATE POLICY "Authenticated users can view products"
  ON products FOR SELECT
  TO authenticated
  USING (true);

-- Only admins can manage products
CREATE POLICY "Admins can manage products"
  ON products FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND u.role = 'ADMIN'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND u.role = 'ADMIN'
    )
  );

-- ==========================================
-- 6. VISITS TABLE POLICIES
-- ==========================================

ALTER TABLE visits ENABLE ROW LEVEL SECURITY;

-- Staff can view their own visits
CREATE POLICY "Staff can view own visits"
  ON visits FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Staff can create their own visits
CREATE POLICY "Staff can create own visits"
  ON visits FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Staff can update their own visits
CREATE POLICY "Staff can update own visits"
  ON visits FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Managers can view team visits
CREATE POLICY "Managers can view team visits"
  ON visits FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = user_id
      AND u.manager_id = auth.uid()
    )
  );

-- Admins can view all visits
CREATE POLICY "Admins can view all visits"
  ON visits FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND u.role = 'ADMIN'
    )
  );

-- ==========================================
-- 7. POB TABLE POLICIES
-- ==========================================

ALTER TABLE pob ENABLE ROW LEVEL SECURITY;

-- Staff can view their own POB
CREATE POLICY "Staff can view own pob"
  ON pob FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM visits v
      WHERE v.id = visit_id
      AND v.user_id = auth.uid()
    )
  );

-- Staff can create their own POB
CREATE POLICY "Staff can create own pob"
  ON pob FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM visits v
      WHERE v.id = visit_id
      AND v.user_id = auth.uid()
    )
  );

-- Staff can update their own POB
CREATE POLICY "Staff can update own pob"
  ON pob FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM visits v
      WHERE v.id = visit_id
      AND v.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM visits v
      WHERE v.id = visit_id
      AND v.user_id = auth.uid()
    )
  );

-- Managers can view team POB
CREATE POLICY "Managers can view team pob"
  ON pob FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM visits v
      JOIN users u ON u.id = v.user_id
      WHERE v.id = visit_id
      AND u.manager_id = auth.uid()
    )
  );

-- Admins can view all POB
CREATE POLICY "Admins can view all pob"
  ON pob FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND u.role = 'ADMIN'
    )
  );

-- ==========================================
-- 8. COLLECTIONS TABLE POLICIES
-- ==========================================

ALTER TABLE collections ENABLE ROW LEVEL SECURITY;

-- Staff can view their own collections
CREATE POLICY "Staff can view own collections"
  ON collections FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM visits v
      WHERE v.id = visit_id
      AND v.user_id = auth.uid()
    )
  );

-- Staff can create their own collections
CREATE POLICY "Staff can create own collections"
  ON collections FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM visits v
      WHERE v.id = visit_id
      AND v.user_id = auth.uid()
    )
  );

-- Staff can update their own collections
CREATE POLICY "Staff can update own collections"
  ON collections FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM visits v
      WHERE v.id = visit_id
      AND v.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM visits v
      WHERE v.id = visit_id
      AND v.user_id = auth.uid()
    )
  );

-- Managers can view team collections
CREATE POLICY "Managers can view team collections"
  ON collections FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM visits v
      JOIN users u ON u.id = v.user_id
      WHERE v.id = visit_id
      AND u.manager_id = auth.uid()
    )
  );

-- Admins can view all collections
CREATE POLICY "Admins can view all collections"
  ON collections FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND u.role = 'ADMIN'
    )
  );

-- ==========================================
-- 9. EXPENSES TABLE POLICIES
-- ==========================================

ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- Staff can view their own expenses
CREATE POLICY "Staff can view own expenses"
  ON expenses FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Staff can create their own expenses
CREATE POLICY "Staff can create own expenses"
  ON expenses FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Staff can update their own pending expenses
CREATE POLICY "Staff can update own pending expenses"
  ON expenses FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid() AND status = 'Pending')
  WITH CHECK (user_id = auth.uid() AND status = 'Pending');

-- Managers can view team expenses
CREATE POLICY "Managers can view team expenses"
  ON expenses FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = user_id
      AND u.manager_id = auth.uid()
    )
  );

-- Managers can approve/reject team expenses
CREATE POLICY "Managers can approve team expenses"
  ON expenses FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = user_id
      AND u.manager_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = user_id
      AND u.manager_id = auth.uid()
    )
  );

-- Admins can view and manage all expenses
CREATE POLICY "Admins can manage all expenses"
  ON expenses FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND u.role = 'ADMIN'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND u.role = 'ADMIN'
    )
  );
