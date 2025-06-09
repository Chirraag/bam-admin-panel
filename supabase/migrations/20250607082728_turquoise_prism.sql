/*
  # Create CRM Admin Panel Database Schema

  1. New Tables
    - `crm_users`
      - `id` (uuid, primary key)
      - `email` (text, unique, not null)
      - `password_hash` (text, not null)
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())
    
    - `column_metadata` 
      - `id` (uuid, primary key)
      - `column_name` (text, unique, not null)
      - `column_type` (text, not null) - supports: string, integer, date, timestamp, boolean, dropdown
      - `dropdown_options` (text array, nullable) - for dropdown type columns
      - `created_at` (timestamptz, default now())
    
    - `clients`
      - `id` (uuid, primary key)
      - `name` (text, not null)
      - `email` (text)
      - `phone` (text)
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated access
    - Set up proper table permissions

  3. Functions
    - Trigger function for updating `updated_at` timestamps
*/

-- Create crm_users table
CREATE TABLE IF NOT EXISTS crm_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create column_metadata table
CREATE TABLE IF NOT EXISTS column_metadata (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  column_name text UNIQUE NOT NULL,
  column_type text NOT NULL CHECK (column_type IN ('string', 'integer', 'date', 'timestamp', 'boolean', 'dropdown')),
  dropdown_options text[],
  created_at timestamptz DEFAULT now()
);

-- Create clients table with base columns
CREATE TABLE IF NOT EXISTS clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT '',
  email text DEFAULT '',
  phone text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create function to automatically update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
DO $$
BEGIN
  -- Drop trigger if exists and recreate for crm_users
  DROP TRIGGER IF EXISTS update_crm_users_updated_at ON crm_users;
  CREATE TRIGGER update_crm_users_updated_at
    BEFORE UPDATE ON crm_users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

  -- Drop trigger if exists and recreate for clients
  DROP TRIGGER IF EXISTS update_clients_updated_at ON clients;
  CREATE TRIGGER update_clients_updated_at
    BEFORE UPDATE ON clients
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
END $$;

-- Enable Row Level Security
ALTER TABLE crm_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE column_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (allowing all operations for now - you can restrict these later)
CREATE POLICY "Allow all operations on crm_users"
  ON crm_users
  FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all operations on column_metadata"
  ON column_metadata
  FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all operations on clients"
  ON clients
  FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);