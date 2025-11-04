# Megapro Innovation - Field Force Automation App

A comprehensive field force automation application built with React, TypeScript, and Supabase. This app enables field staff (MRs), managers, and administrators to manage doctor visits, track sales, handle collections, and monitor team performance in real-time.

## Features

### For Field Staff (MR)
- **Daily Attendance Tracking**: Start and end day with GPS coordinates
- **Automatic GPS Logging**: Real-time location tracking during work hours
- **Doctor Visit Management**: Check-in/check-out with location verification (200m radius)
- **Product Order Booking (POB)**: Create orders during doctor visits
- **Payment Collection**: Record payments with multiple modes (Cash, Cheque, UPI, etc.)
- **Expense Management**: Submit expenses with automatic verified KM calculation
- **Real-time Dashboard**: View today's visits, POB, and collections

### For Managers
- **Team Overview**: Monitor all team members in real-time
- **Team Performance**: View aggregated POB, collections, and visit stats
- **Activity Tracking**: See which MRs are active, in visits, or offline
- **Real-time Updates**: Dashboard refreshes automatically

### For Administrators
- **System Overview**: Complete visibility into all operations
- **User Management**: View all MRs and Managers
- **Performance Analytics**: Track system-wide metrics
- **Recent Activity**: Monitor all visits across the organization
- **Live Data**: Real-time updates from all field activities

## Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **Sonner** for toast notifications

### Backend (Supabase)
- **PostgreSQL Database** with Row Level Security (RLS)
- **Supabase Auth** for email/password authentication
- **Edge Functions** for server-side logic (GPS distance calculation)
- **Realtime Subscriptions** for live data updates
- **Storage** for receipt/bill uploads (ready to use)

## Database Schema

### Tables
1. **users** - User profiles with roles (STAFF, MANAGER, ADMIN)
2. **attendance** - Daily attendance with GPS tracking
3. **gps_logs** - Detailed GPS points for distance verification
4. **doctors** - Doctor master data with registered locations
5. **products** - Product catalog for POB
6. **visits** - Doctor visit records with check-in/check-out
7. **pob** - Product order bookings
8. **collections** - Payment collections
9. **expenses** - Expense claims with approval workflow

### Security (RLS Policies)
- Staff can only read/write their own data
- Managers can view their team's data
- Admins have full access
- All authenticated users must be verified

## Setup Instructions

### 1. Clone and Install
```bash
npm install
```

### 2. Environment Variables
The `.env` file is already configured with Supabase credentials:
- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_SUPABASE_ANON_KEY` - Your Supabase anon key

### 3. Database Setup
The database is already configured with:
- All tables created
- RLS policies applied
- Sample doctors and products inserted
- Indexes for performance

### 4. Create Users
You need to create users through Supabase Auth:

#### Option A: Using Supabase Dashboard
1. Go to Supabase Dashboard > Authentication > Users
2. Click "Add user" > "Create new user"
3. Fill in email and password
4. After user is created, go to Database > users table
5. Insert a row with the user's auth UID, name, email, and role

#### Option B: Using the signup endpoint (for development)
You can modify the auth service to enable signup during development.

### 5. Run Development Server
```bash
npm run dev
```

### 6. Build for Production
```bash
npm run build
```

## Default Sample Data

### Doctors (10 sample doctors in Mumbai)
- Dr. Rajesh Kumar (General Physician)
- Dr. Priya Sharma (Cardiologist)
- Dr. Amit Patel (Pediatrician)
- And 7 more...

### Products (8 pharmaceutical products)
- Paracetamol 500mg - ₹45
- Amoxicillin 250mg - ₹120
- Azithromycin 500mg - ₹85
- And 5 more...

## Edge Functions

### calculate-verified-km
Calculates the total distance traveled by an MR during their workday:
- Fetches all GPS logs for an attendance record
- Uses Haversine formula for accurate distance calculation
- Filters out GPS errors and unrealistic speeds
- Updates the `verified_km` column in attendance table
- Automatically called when MR ends their day

## Key Workflows

### MR Daily Workflow
1. Login to app
2. Click "Start Day" (captures GPS)
3. Visit doctors (system tracks GPS automatically)
4. Check-in at doctor location (verifies within 200m)
5. Book orders (POB) and collect payments
6. Check-out from visit
7. At end of day, click "End Day"
8. System calculates verified kilometers via Edge Function
9. Submit expenses (shows verified KM read-only)

### Manager Workflow
1. Login to app
2. View team dashboard (real-time updates)
3. Monitor active MRs and their status
4. Review team performance metrics
5. Approve/reject expense claims (future feature)

### Admin Workflow
1. Login to app
2. View system overview
3. Monitor all activities across organization
4. View recent visits with POB and collection data
5. Manage users and system configuration

## Security Features

### Row Level Security (RLS)
- Every table has RLS enabled
- Policies enforce role-based access
- Data isolation between users
- Secure by default

### Authentication
- Email/password authentication via Supabase Auth
- Session management with auto-refresh
- Secure token-based API calls

### GPS Verification
- Server-side distance calculation (tamper-proof)
- Location verification for doctor visits
- Automatic flagging of out-of-range visits

## Performance Optimizations

- Indexed foreign keys for fast queries
- Paginated data loading (where applicable)
- Real-time subscriptions scoped to necessary data
- Efficient database queries with proper joins
- Automatic caching via Supabase

## Future Enhancements

1. **Manager Approval Workflows**
   - Expense approval/rejection interface
   - Tour plan approvals

2. **Enhanced Reporting**
   - Charts and graphs
   - Export to Excel/PDF
   - Custom date range filters

3. **Offline Support**
   - Local data caching
   - Sync when online

4. **Push Notifications**
   - Pending approvals
   - Daily reminders

5. **Advanced Analytics**
   - Doctor coverage analysis
   - Product performance tracking
   - Territory management

## Troubleshooting

### Users can't see data
- Ensure user has correct role in `users` table
- Check RLS policies are enabled
- Verify manager_id is set correctly for staff

### GPS not working
- Ensure browser has location permissions
- Test on HTTPS (required for geolocation API)

### Build errors
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Clear dist folder: `rm -rf dist`

## Support

For issues or questions, please check:
1. Supabase Dashboard for database/auth logs
2. Browser console for frontend errors
3. Edge Function logs in Supabase Dashboard

## License

Proprietary - Megapro Innovation © 2024
