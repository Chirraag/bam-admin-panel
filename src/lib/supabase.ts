import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://duxtqqxdctaoleelhrob.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR1eHRxcXhkY3Rhb2xlZWxocm9iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg3NzI2NTcsImV4cCI6MjA2NDM0ODY1N30.ufDSFHXorU71TZf_RLOiXWVBwgdgt_AAUoAWm_9IKbE';

export const supabase = createClient(supabaseUrl, supabaseKey);

export type Database = {
  public: {
    Tables: {
      crm_users: {
        Row: {
          id: string;
          email: string;
          password_hash: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          password_hash: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          password_hash?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      column_metadata: {
        Row: {
          id: string;
          column_name: string;
          column_type: 'string' | 'integer' | 'date' | 'timestamp' | 'boolean' | 'dropdown';
          dropdown_options: string[] | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          column_name: string;
          column_type: 'string' | 'integer' | 'date' | 'timestamp' | 'boolean' | 'dropdown';
          dropdown_options?: string[] | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          column_name?: string;
          column_type?: 'string' | 'integer' | 'date' | 'timestamp' | 'boolean' | 'dropdown';
          dropdown_options?: string[] | null;
          created_at?: string;
        };
      };
    };
  };
};