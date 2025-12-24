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
      divers: {
        Row: {
          id: string;
          name: string;
          email: string | null;
          phone: string | null;
          birth_date: string | null;
          age: number | null;
          total_dives: number;
          start_year: number | null;
          is_pro: boolean;
          photo_url: string | null;
          dietary_restrictions: string | null;
          emergency_contact_name: string | null;
          emergency_contact_relationship: string | null;
          emergency_contact_phone: string | null;
          status: 'confirmed' | 'pending' | 'cancelled';
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['divers']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['divers']['Insert']>;
      };
      payments: {
        Row: {
          id: string;
          diver_id: string;
          amount_eur: number;
          payment_method: 'agency' | 'cash';
          payment_date: string | null;
          status: 'pending' | 'completed' | 'refunded';
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['payments']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['payments']['Insert']>;
      };
      gallery: {
        Row: {
          id: string;
          diver_id: string | null;
          title: string | null;
          description: string | null;
          image_url: string;
          category: 'dive' | 'group' | 'meal' | 'fun' | 'other';
          uploaded_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['gallery']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['gallery']['Insert']>;
      };
      itinerary: {
        Row: {
          id: string;
          day: number;
          date: string;
          title: string;
          description: string | null;
          type: string;
          location: string | null;
          details: Record<string, unknown>;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['itinerary']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['itinerary']['Insert']>;
      };
    };
  };
};
