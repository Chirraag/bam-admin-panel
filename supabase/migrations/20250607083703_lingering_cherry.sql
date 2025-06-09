/*
  # Create CRM Admin Panel Tables

  1. New Tables
    - `crm_users`
      - `id` (uuid, primary key)
      - `email` (text, unique, not null)
      - `password_hash` (text, not null)
      - `created_at` (timestamptz, default now())
    
    - `column_metadata` 
      - `id` (uuid, primary key)
      - `column_name` (text, unique, not null)
      - `column_type` (text, not null)
      - `dropdown_options` (text array, nullable)
      - `created_at` (timestamptz, default now())

  2. Notes
    - No RLS policies (keeping it simple)
    - No triggers or functions
    - Assumes clients table already exists
*/

-- Create crm_users table for admin panel authentication
CREATE TABLE IF NOT EXISTS crm_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create column_metadata table to track dynamic columns
CREATE TABLE IF NOT EXISTS column_metadata (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  column_name text UNIQUE NOT NULL,
  column_type text NOT NULL CHECK (column_type IN ('string', 'integer', 'date', 'timestamp', 'boolean', 'dropdown')),
  dropdown_options text[],
  created_at timestamptz DEFAULT now()
);