-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create hr_staff table
CREATE TABLE hr_staff (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create assignments table
CREATE TABLE assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  college TEXT NOT NULL,
  location TEXT NOT NULL,
  topic TEXT NOT NULL,
  file_url TEXT,
  text_content TEXT,
  file_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create RLS policies for each table

-- HR Staff policies
ALTER TABLE hr_staff ENABLE ROW LEVEL SECURITY;

CREATE POLICY "HR staff can view their own data" 
  ON hr_staff FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "HR staff can update their own data" 
  ON hr_staff FOR UPDATE 
  USING (auth.uid() = id);

-- Assignments policies
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert assignments" 
  ON assignments FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "HR staff can view all assignments" 
  ON assignments FOR SELECT 
  USING (true);

-- Insert the HR admin credentials
INSERT INTO hr_staff (email, password)
VALUES (
  'yvixownerzlogin@yvix.com',
  -- Note: In a real application, you would use a secure hashing method
  -- This is just for demonstration purposes
  'password_hash_for_1plus1isequaltofive'
);

-- Create storage bucket for assignment documents
-- Note: This needs to be done in the Supabase dashboard 