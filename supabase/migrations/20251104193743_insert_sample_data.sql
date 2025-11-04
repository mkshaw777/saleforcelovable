/*
  # Insert Sample Data for Megapro Innovation App

  ## Purpose
  This migration inserts sample/seed data to help test and demonstrate the application.

  ## Data Inserted:
  1. **Doctors** - 10 sample doctors with realistic data
  2. **Products** - 8 pharmaceutical products with pricing
  
  ## Note
  - Users must be created through Supabase Auth signup
  - This is sample data for development/testing purposes
*/

-- Insert Sample Doctors
INSERT INTO doctors (name, specialty, registered_location, address, phone) VALUES
  ('Dr. Rajesh Kumar', 'General Physician', '{"latitude": 19.0760, "longitude": 72.8777}', 'Mumbai Central Hospital, Mumbai', '+91-9876543210'),
  ('Dr. Priya Sharma', 'Cardiologist', '{"latitude": 19.1136, "longitude": 72.8697}', 'Heart Care Clinic, Andheri West', '+91-9876543211'),
  ('Dr. Amit Patel', 'Pediatrician', '{"latitude": 19.0596, "longitude": 72.8295}', 'Kids Care Hospital, Dadar', '+91-9876543212'),
  ('Dr. Sunita Desai', 'Dermatologist', '{"latitude": 19.0176, "longitude": 72.8561}', 'Skin Specialist Clinic, Worli', '+91-9876543213'),
  ('Dr. Vikram Singh', 'Orthopedic', '{"latitude": 19.0330, "longitude": 72.8640}', 'Bone & Joint Center, Lower Parel', '+91-9876543214'),
  ('Dr. Meera Joshi', 'Gynecologist', '{"latitude": 19.1197, "longitude": 72.9089}', 'Women''s Health Clinic, Powai', '+91-9876543215'),
  ('Dr. Rahul Mehta', 'ENT Specialist', '{"latitude": 18.9220, "longitude": 72.8347}', 'ENT Care Center, Bandra', '+91-9876543216'),
  ('Dr. Kavita Reddy', 'Ophthalmologist', '{"latitude": 19.0728, "longitude": 72.8826}', 'Eye Care Hospital, Matunga', '+91-9876543217'),
  ('Dr. Sanjay Gupta', 'Neurologist', '{"latitude": 19.0895, "longitude": 72.8656}', 'Neuro Care Clinic, Sion', '+91-9876543218'),
  ('Dr. Anjali Nair', 'Psychiatrist', '{"latitude": 19.0522, "longitude": 72.8882}', 'Mind Wellness Center, Parel', '+91-9876543219')
ON CONFLICT DO NOTHING;

-- Insert Sample Products
INSERT INTO products (name, price, description) VALUES
  ('Paracetamol 500mg (Strip of 10)', 45.00, 'Pain relief and fever reducer'),
  ('Amoxicillin 250mg (Strip of 10)', 120.00, 'Antibiotic for bacterial infections'),
  ('Azithromycin 500mg (Strip of 3)', 85.00, 'Antibiotic for respiratory infections'),
  ('Metformin 500mg (Strip of 10)', 25.00, 'Diabetes management medication'),
  ('Atorvastatin 10mg (Strip of 10)', 95.00, 'Cholesterol management'),
  ('Amlodipine 5mg (Strip of 10)', 35.00, 'Blood pressure medication'),
  ('Omeprazole 20mg (Strip of 10)', 55.00, 'Acid reflux and GERD treatment'),
  ('Cetirizine 10mg (Strip of 10)', 18.00, 'Allergy relief medication')
ON CONFLICT (name) DO NOTHING;

-- Note: Sample users with authentication will need to be created through the application
-- The admin can create test users using Supabase Auth after the app is deployed
