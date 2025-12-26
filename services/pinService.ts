import { supabase } from './supabaseClient';
import { hashPin, verifyPin as bcryptVerifyPin } from '../utils/bcryptPinUtil';

/**
 * SIMPLIFIED PIN Service - Emergency Mode
 * Direct database operations with bcryptjs hashing
 */

/**
 * Verify PIN - SIMPLIFIED CLEAN VERSION with bcryptjs support
 * Checks both pin_code (legacy) and pin_hash (new) formats
 */
export const verifyPin = async (pin: string): Promise<any> => {
  try {
    const cleanPin = pin.trim();
    console.log(`[PIN Service] Verifying PIN: ${cleanPin}`);

    // Query for user with legacy or hashed PIN
    // Accept 'approved', 'active', and 'confirmed' status
    const { data, error } = await supabase
      .from('users')
      .select('id, email, name, role, status, pin_code, pin_hash')
      .in('status', ['approved', 'active', 'confirmed'])
      .limit(100); // Get all eligible users for checking

    if (error) {
      console.error('[PIN Service] Query error:', error);
      return null;
    }

    if (!data || data.length === 0) {
      console.log('[PIN Service] ❌ No active users found');
      return null;
    }

    // Check each user for PIN match (legacy or hashed)
    for (const user of data) {
      console.log(`[PIN Service] Checking user: ${user.email}, has pin_hash: ${!!user.pin_hash}, has pin_code: ${!!user.pin_code}`);

      // Method 1: Check hashed PIN (new format)
      if (user.pin_hash) {
        console.log(`[PIN Service] Attempting hash verification for ${user.email}`);
        const hashMatch = await bcryptVerifyPin(cleanPin, user.pin_hash);
        console.log(`[PIN Service] Hash match result for ${user.email}: ${hashMatch}`);
        if (hashMatch) {
          console.log(`[PIN Service] ✅ User found (hashed): ${user.email}`);
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            status: user.status
          };
        }
      }

      // Method 2: Check legacy plain-text PIN
      if (user.pin_code && user.pin_code.trim() === cleanPin) {
        console.log(`[PIN Service] ✅ User found (legacy PIN): ${user.email}`);
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          status: user.status
        };
      }
    }

    console.log('[PIN Service] ❌ No active user found with this PIN');
    return null;
  } catch (err) {
    console.error('[PIN Service] Exception:', err);
    return null;
  }
};

/**
 * Generate unique 6-digit PIN using database function
 */
export const generateUniquePin = async (): Promise<string> => {
  let generatedPin: string;
  let attempts = 0;
  const maxAttempts = 10;

  do {
    generatedPin = Math.floor(100000 + Math.random() * 900000).toString();
    attempts++;

    console.log(`📌 Generated PIN (attempt ${attempts}):`, generatedPin);

    // ✅ FIXED: Use count() to check if PIN already exists
    const { count, error } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('pin_code', generatedPin);

    if (error) {
      console.error('⚠️ Error checking PIN uniqueness:', error);
      // Continue anyway
      break;
    }

    // ✅ FIXED: Check if count is 0 (PIN is unique)
    if ((count || 0) === 0) {
      console.log('✅ PIN is unique:', generatedPin);
      return generatedPin;
    }

    console.log('⚠️ PIN already exists, trying another...');

    if (attempts >= maxAttempts) {
      console.error('❌ Could not generate unique PIN after', maxAttempts, 'attempts');
      // Generate with timestamp to ensure uniqueness
      generatedPin = Math.floor(100000 + Math.random() * 900000).toString();
      console.log('🔧 Using generated PIN with timestamp fallback:', generatedPin);
      return generatedPin;
    }
  } while (true);

  return generatedPin;
};

/**
 * Approve user with PIN - Generate unique PIN and save to database
 */
export const approveUserWithPin = async (
  userId: string,
  adminId: string
): Promise<{ success: boolean; pin?: string; error?: string }> => {
  try {
    console.log('✅ Starting approval process for user:', userId);

    // Generate unique PIN
    const pin = await generateUniquePin();
    console.log('📌 Generated PIN for approval:', pin);

    // Hash the PIN using bcryptjs
    let pinHash: string;
    try {
      pinHash = await hashPin(pin);
      console.log('🔐 PIN hashed successfully');
    } catch (hashError) {
      console.error('❌ PIN hashing failed:', hashError);
      return {
        success: false,
        error: 'PIN hashing failed'
      };
    }

    // Update user with new PIN, PIN hash, and status
    const { data: updateData, error: updateError } = await supabase
      .from('users')
      .update({
        status: 'approved',
        // pin_code: pin, // SECURE: Do not store plain text PINs anymore (per Fix 4.2)
        pin_hash: pinHash
      })
      .eq('id', userId)
      .eq('status', 'pending')  // Only update if still pending
      .select('id, name, email, pin_hash, status');

    if (updateError) {
      console.error('❌ Update error:', updateError);

      // Check if already approved
      if (updateError.code === '23505') {
        console.log('⚠️ PIN collision, retrying...');
        // Retry with a new PIN
        return approveUserWithPin(userId, adminId);
      }

      return {
        success: false,
        error: updateError.message || 'Update failed'
      };
    }

    let savedUser: any = null;

    // Stage 1: Check if UPDATE returned data
    if (updateData && updateData.length > 0) {
      savedUser = updateData[0];
      console.log('✅ STAGE 1: Data from UPDATE query');
    } else {
      // Stage 2: Fallback to SELECT if UPDATE returned empty
      console.log('⚠️ UPDATE returned empty, falling back to SELECT...');
      const { data: selectData, error: selectError } = await supabase
        .from('users')
        .select('id, name, email, pin_hash, status')
        .eq('id', userId)
        .maybeSingle();

      if (selectError) {
        console.error('❌ SELECT error:', selectError);
        return {
          success: false,
          error: selectError.message || 'Verification failed'
        };
      }

      if (!selectData) {
        console.log('⚠️ User not found or not pending');
        return {
          success: false,
          error: 'User not found or already processed'
        };
      }

      savedUser = selectData;
      console.log('✅ STAGE 2: Data from SELECT query');
    }
    console.log('✅ User approved successfully:', savedUser.name);
    console.log('📌 Assigned PIN:', pin);
    console.log('🔎 Verifying PIN saved to database...');

    // VERIFICATION: Check if pin_hash exists (since we don't store pin_code anymore)
    if (!savedUser.pin_hash) {
      console.error('❌ PIN hash missing in database!');
      return {
        success: false,
        error: 'PIN hash check failed'
      };
    }

    console.log('✅ PIN hash verified in database');

    return {
      success: true,
      pin
    };

  } catch (error: any) {
    console.error('❌ Approval error:', error);
    return {
      success: false,
      error: error.message || 'Approval failed'
    };
  }
};

/**
 * Reject user
 */
export const rejectUserRequest = async (
  userId: string,
  adminId: string,
  reason: string
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('users')
      .update({
        status: 'rejected'
      })
      .eq('id', userId);

    if (error) {
      console.error('❌ Rejection error:', error);
      return false;
    }

    console.log('✅ User rejected');
    return true;

  } catch (error) {
    console.error('❌ Error rejecting user:', error);
    return false;
  }
};

/**
 * Create audit log - NON-CRITICAL
 */
export const createAuditLog = async (
  userId: string,
  action: string,
  details?: any
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('audit_logs')
      .insert({
        user_id: userId,
        action,
        details: JSON.stringify(details || {})
      });

    if (error) {
      console.warn('⚠️ Audit log error:', error);
      return false;
    }

    return true;

  } catch (error) {
    console.warn('⚠️ Audit error:', error);
    return false;
  }
};

/**
 * ✅ NEW: Approve user and send PIN - CRITICAL FUNCTION
 */
export const approveUserAndSendPin = async (
  userId: string,
  adminId?: string
): Promise<{ success: boolean; pin?: string; error?: string }> => {
  try {
    console.log('🔄 Starting approval process for user:', userId);

    // 1. Check if user is still pending
    const { data: user, error: checkError } = await supabase
      .from('users')
      .select('id, email, name, status')
      .eq('id', userId)
      .single();

    if (checkError || !user) {
      console.error('❌ User not found:', checkError);
      return { success: false, error: 'User not found' };
    }

    if (user.status !== 'pending') {
      console.warn('⚠️ User status is not pending:', user.status);
      return { success: false, error: `User status is ${user.status}, cannot approve` };
    }

    // 2. Generate unique PIN
    const pin = await generateUniquePin();
    console.log('✅ Generated unique PIN:', pin);

    // 3. Update user status and PIN
    const { data: updated, error: updateError } = await supabase
      .from('users')
      .update({
        status: 'approved',
        pin_code: pin,
        approved_at: new Date().toISOString(),
        approved_by: adminId || null
      })
      .eq('id', userId)
      .eq('status', 'pending')  // Only if still pending
      .select();

    if (updateError) {
      console.error('❌ Update error:', updateError);
      return { success: false, error: 'Failed to update user status' };
    }

    if (!updated || updated.length === 0) {
      console.error('❌ No rows updated - user status may have changed');
      return { success: false, error: 'User status changed during approval' };
    }

    console.log('✅ User approved successfully');

    // 4. Create audit log
    await createAuditLog(userId, 'user_approved', {
      pin_sent: true,
      email: user.email,
      admin_id: adminId
    });

    return { success: true, pin };

  } catch (error) {
    console.error('💥 Approval process error:', error);
    return { success: false, error: String(error) };
  }
};

/**
 * ✅ NEW: Reject user access request
 */
export const rejectUserAccessRequest = async (
  userId: string,
  adminId?: string,
  reason?: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    console.log('🔄 Rejecting user:', userId);

    const { error: updateError } = await supabase
      .from('users')
      .update({
        status: 'rejected',
        rejected_at: new Date().toISOString(),
        rejected_by: adminId || null,
        rejection_reason: reason || null
      })
      .eq('id', userId)
      .eq('status', 'pending');

    if (updateError) {
      console.error('❌ Rejection error:', updateError);
      return { success: false, error: 'Failed to reject user' };
    }

    // Create audit log
    await createAuditLog(userId, 'user_rejected', {
      reason,
      admin_id: adminId
    });

    console.log('✅ User rejected');
    return { success: true };

  } catch (error) {
    console.error('💥 Rejection error:', error);
    return { success: false, error: String(error) };
  }
};
