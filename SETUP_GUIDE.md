# Quick Setup Guide - Megapro Field Force App

## Step 1: Create Your First Admin User

Since the app uses Supabase Auth, you need to create users through the Supabase Dashboard.

### Method 1: Using Supabase Dashboard (Recommended)

1. **Go to Supabase Dashboard**
   - Navigate to: https://app.supabase.com
   - Select your project: `jakmfygqwuhimqxgxhla`

2. **Create Auth User**
   - Click "Authentication" in left sidebar
   - Click "Users" tab
   - Click "Add user" button
   - Select "Create new user"
   - Enter:
     - Email: `admin@megapro.com`
     - Password: `Admin@123456` (or your preferred password)
     - Email Confirm: Toggle ON (or they'll need to verify email)
   - Click "Create user"
   - **Copy the User UID** (you'll need this next)

3. **Add User Profile**
   - Click "Table Editor" in left sidebar
   - Select "users" table
   - Click "Insert" → "Insert row"
   - Fill in:
     - `id`: Paste the User UID you copied (e.g., `a1b2c3d4-...`)
     - `name`: `Admin User`
     - `email`: `admin@megapro.com` (must match auth email)
     - `role`: Select `ADMIN` from dropdown
     - `manager_id`: Leave NULL
   - Click "Save"

4. **Test Login**
   - Run: `npm run dev`
   - Open: http://localhost:5173
   - Login with: `admin@megapro.com` / `Admin@123456`

### Method 2: Using SQL (Faster for Multiple Users)

1. **Go to SQL Editor**
   - Click "SQL Editor" in Supabase Dashboard
   - Click "New query"

2. **Run this SQL** (replace with your desired credentials):

```sql
-- Note: You need to create the auth user first through the Dashboard,
-- then use its UID here. Supabase doesn't allow SQL-based auth user creation.

-- After creating auth user with UID 'YOUR-USER-UID-HERE', run:
INSERT INTO users (id, name, email, role, manager_id)
VALUES
  ('YOUR-USER-UID-HERE', 'Admin User', 'admin@megapro.com', 'ADMIN', NULL);
```

## Step 2: Create Manager and Staff Users

### Create a Manager:
1. Create auth user with email `manager@megapro.com`
2. Copy the UID
3. Insert into users table:
```sql
INSERT INTO users (id, name, email, role, manager_id)
VALUES
  ('manager-uid-here', 'John Manager', 'manager@megapro.com', 'MANAGER', NULL);
```

### Create Staff (MR):
1. Create auth user with email `mr@megapro.com`
2. Copy the UID
3. Insert into users table (link to manager):
```sql
INSERT INTO users (id, name, email, role, manager_id)
VALUES
  ('mr-uid-here', 'Jane MR', 'mr@megapro.com', 'STAFF', 'manager-uid-here');
```

## Step 3: Verify Setup

### Test Admin Login:
- Email: `admin@megapro.com`
- You should see: System overview with all stats

### Test Manager Login:
- Email: `manager@megapro.com`
- You should see: Team dashboard (empty if no staff assigned)

### Test MR Login:
- Email: `mr@megapro.com`
- You should see: MR dashboard with "Start Day" button

## Step 4: Test Core Functionality

### As MR User:
1. Click "Start Day" (allow location access)
2. Check the dashboard stats (should show 0 visits initially)
3. Click "End Day" to test GPS calculation

### As Manager User:
1. View team members (should see the MR you created)
2. Check team stats

### As Admin User:
1. View system overview
2. See all users and activities

## Sample Data Already Loaded

The system comes pre-loaded with:

### 10 Sample Doctors:
- Dr. Rajesh Kumar (General Physician) - Mumbai Central
- Dr. Priya Sharma (Cardiologist) - Andheri West
- Dr. Amit Patel (Pediatrician) - Dadar
- And 7 more...

### 8 Sample Products:
- Paracetamol 500mg - ₹45
- Amoxicillin 250mg - ₹120
- Azithromycin 500mg - ₹85
- And 5 more...

## Common Issues

### Issue: "Failed to create user"
**Solution**: Make sure you created the auth user first in Authentication > Users

### Issue: "Permission denied"
**Solution**: Check that:
- User exists in both `auth.users` AND `public.users` tables
- The `id` in users table matches the auth user's UID
- The role is set correctly

### Issue: "No data showing"
**Solution**:
- For Staff: Check if manager_id is set correctly
- For Manager: Check if you have staff assigned to you
- For Admin: Should see all data regardless

### Issue: GPS not working
**Solution**:
- Must use HTTPS (required for geolocation)
- Allow location permissions in browser
- In development, localhost is allowed

## Quick Test Credentials Template

After following steps above, you'll have:

| Role | Email | Initial Setup |
|------|-------|--------------|
| Admin | admin@megapro.com | Can see everything |
| Manager | manager@megapro.com | Can see team data |
| MR | mr@megapro.com | Can track visits |

## Next Steps

1. Create more MRs and assign them to managers
2. Test doctor visits and POB creation
3. Test expense submission
4. Customize the sample data (doctors, products)
5. Configure Supabase Storage for receipt uploads

## Useful SQL Queries

### Check all users:
```sql
SELECT u.name, u.email, u.role, m.name as manager_name
FROM users u
LEFT JOIN users m ON u.manager_id = m.id;
```

### Get user stats:
```sql
SELECT get_user_stats('user-uuid-here');
```

### List all MRs under a manager:
```sql
SELECT * FROM users
WHERE manager_id = 'manager-uuid-here';
```

## Support

If you encounter issues:
1. Check Supabase logs in Dashboard
2. Check browser console for errors
3. Verify RLS policies are enabled
4. Ensure auth user and profile user IDs match

Good luck! 🚀
