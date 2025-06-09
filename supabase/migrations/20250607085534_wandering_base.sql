/*
  # Create Admin Panel Database Functions

  1. Functions
    - `execute_sql(sql text)` - Executes dynamic SQL commands (for ALTER TABLE operations)
    - `get_table_schema(table_name text)` - Returns table schema information

  2. Security
    - Functions are marked as SECURITY DEFINER to allow execution
    - Grant execute permissions to anon and authenticated users
*/

-- Create function to execute dynamic SQL (for ALTER TABLE operations)
CREATE OR REPLACE FUNCTION execute_sql(sql text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE sql;
END;
$$;

-- Create function to get table schema information
CREATE OR REPLACE FUNCTION get_table_schema(table_name text)
RETURNS TABLE(
  column_name text,
  data_type text,
  is_nullable text,
  column_default text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.column_name::text,
    c.data_type::text,
    c.is_nullable::text,
    c.column_default::text
  FROM information_schema.columns c
  WHERE c.table_name = $1
    AND c.table_schema = 'public'
  ORDER BY c.ordinal_position;
END;
$$;

-- Grant execute permissions to allow the admin panel to use these functions
GRANT EXECUTE ON FUNCTION execute_sql(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_table_schema(text) TO anon, authenticated;