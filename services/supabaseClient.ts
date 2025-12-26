import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// ============ CRITICAL DEBUG LOGGING ============
console.log('=== SUPABASE CLIENT INITIALIZATION ===');
console.log('VITE_SUPABASE_URL:', supabaseUrl ? '✅ PRESENT' : '❌ MISSING');
console.log('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✅ PRESENT' : '❌ MISSING');
console.log('Supabase Project:', supabaseUrl.split('.supabase.co')[0] || 'UNKNOWN');
console.log('='.repeat(40));

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('🚨 CRITICAL: Supabase credentials are NOT configured!');
  console.error('Required: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local');
  console.warn(
    'Supabase credentials are not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env.local file. The application will run with limited functionality.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Verify client is created
console.log('✅ Supabase client instantiated successfully');

// ========== AUTHENTICATION FUNCTIONS ==========

export const signInWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
      queryParams: {
        prompt: 'consent',
      },
    },
  });

  if (error) {
    console.error('Google sign-in error:', error);
    throw error;
  }

  return data;
};

export const signInWithEmail = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
};

export const signUpWithEmail = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) throw error;
  return data;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
};

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string;
          role: 'admin' | 'member' | 'pending';
          status: 'pending' | 'approved' | 'rejected' | 'active' | 'revoked';
          pin_code: string | null;
          pin_hash: string | null;
          phone: string | null;
          ssi_number: string | null;
          experience_level: string | null;
          avg_consumption: number | null;
          created_at: string;
          updated_at: string;
          approved_at: string | null;
          approved_by: string | null;
          rejected_at: string | null;
          rejected_by: string | null;
          rejection_reason: string | null;
        };
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['users']['Insert']>;
      };
      payments: {
        Row: {
          id: string;
          user_id: string;
          amount_to_agency: number;
          amount_to_adnan: number;
          status: 'pending' | 'partial' | 'paid' | 'refunded';
          payment_date: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['payments']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['payments']['Insert']>;
      };
      audit_logs: {
        Row: {
          id: string;
          user_id: string | null;
          action: string;
          details: any;
          ip_address: string | null;
          user_agent: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['audit_logs']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['audit_logs']['Insert']>;
      };
      checklist_items: {
        Row: {
          id: string;
          user_id: string;
          item_id: string;
          is_completed: boolean;
          completed_at: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['checklist_items']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['checklist_items']['Insert']>;
      };
    };
  };
};
