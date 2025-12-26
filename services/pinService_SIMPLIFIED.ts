import { supabase } from './supabaseClient';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'member';
  status: 'pending' | 'approved' | 'rejected' | 'active';
  avatar_url?: string;
}

/**
 * SIMPLIFIED PIN Service - Clean, Direct Database Operations
 * Single responsibility: Verify PIN against users table
 */

/**
 * Verify user by PIN - Direct query with minimal complexity
 * @param pin - 6-digit PIN string
 * @returns User object if valid active user found, null otherwise
 */
export const verifyPin = async (pin: string): Promise<AuthUser | null> => {
  try {
    const cleanPin = pin.trim();
    console.log(`[PIN Service] Verifying PIN: ${cleanPin}`);
    
    // Single clean query - get active user with this PIN
    const { data, error } = await supabase
      .from('users')
      .select('id, email, name, role, status, avatar_url')
      .eq('pin_code', cleanPin)
      .eq('status', 'active')
      .maybeSingle(); // Returns null if no match, doesn't throw error
    
    if (error) {
      console.error('[PIN Service] Query error:', error);
      return null;
    }
    
    if (data) {
      console.log(`[PIN Service] ✅ User found: ${data.email}`);
      return data as AuthUser;
    } else {
      console.log('[PIN Service] ❌ No active user found with this PIN');
      return null;
    }
  } catch (err) {
    console.error('[PIN Service] Exception:', err);
    return null;
  }
};

/**
 * Generate unique 6-digit PIN
 * @returns Promise<string> - 6-digit PIN
 */
export const generateUniquePin = async (): Promise<string> => {
  try {
    const { data, error } = await supabase
      .rpc('generate_unique_pin');
    
    if (error) {
      console.error('[PIN Service] PIN generation error:', error);
      // Fallback: generate manually
      return generateLocalPin();
    }
    
    if (data) {
      console.log('[PIN Service] PIN generated:', data);
      return data;
    }
    
    return generateLocalPin();
  } catch (err) {
    console.error('[PIN Service] PIN generation exception:', err);
    return generateLocalPin();
  }
};

/**
 * Generate local 6-digit PIN (fallback)
 */
const generateLocalPin = (): string => {
  const pin = Math.floor(Math.random() * 1000000)
    .toString()
    .padStart(6, '0');
  console.log('[PIN Service] Generated local PIN:', pin);
  return pin;
};

/**
 * Create audit log entry for access requests
 */
export const createAuditLog = async (
  userId: string,
  action: string,
  details?: any
): Promise<void> => {
  try {
    const { error } = await supabase
      .from('access_requests_audit')
      .insert([{
        user_id: userId,
        action: action,
        details: details || {}
      }]);
    
    if (error) {
      console.warn('[Audit] Log creation warning:', error);
    } else {
      console.log('[Audit] ✅ Logged action:', action);
    }
  } catch (err) {
    console.warn('[Audit] Exception (non-critical):', err);
  }
};

/**
 * Update user status
 */
export const updateUserStatus = async (
  userId: string,
  status: 'pending' | 'approved' | 'rejected' | 'active'
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('users')
      .update({
        status: status,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);
    
    if (error) {
      console.error('[PIN Service] Status update error:', error);
      return false;
    }
    
    console.log('[PIN Service] ✅ User status updated to:', status);
    return true;
  } catch (err) {
    console.error('[PIN Service] Status update exception:', err);
    return false;
  }
};
