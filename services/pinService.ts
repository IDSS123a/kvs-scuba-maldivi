import { supabase } from './supabaseClient';

/**
 * SIMPLIFIED PIN Service - Emergency Mode
 * Direct database operations, no complex logic
 */

/**
 * Verify PIN - EXTREME DEBUG MODE
 */
export const verifyPin = async (pin: string): Promise<any> => {
  console.log('🔍 PIN VERIFICATION DEBUG START ====================');
  console.log('📱 Input PIN:', pin, 'Type:', typeof pin, 'Length:', pin?.length);
  
  // EXTREME PIN CLEANING
  const cleanPin = (pin || '').toString().trim();
  console.log('🧹 Cleaned PIN:', cleanPin, 'Length:', cleanPin.length);
  
  // VALIDATE FORMAT
  if (!cleanPin || cleanPin.length !== 6 || !/^\d{6}$/.test(cleanPin)) {
    console.log('❌ INVALID PIN FORMAT - Expected 6 digits');
    console.log('🔍 PIN VERIFICATION DEBUG END ====================');
    return null;
  }
  
  try {
    // METHOD 1: Direct exact match
    console.log('🔍 METHOD 1: Direct exact match query...');
    const { data: exactMatch, error: exactError } = await supabase
      .from('users')
      .select('*')
      .eq('pin_code', cleanPin)
      .limit(1);
    
    console.log('📊 Method 1 results:', {
      found: exactMatch?.length || 0,
      error: exactError?.message || 'none',
      data: exactMatch
    });
    
    if (exactMatch && exactMatch.length > 0) {
      const user = exactMatch[0];
      console.log('✅ FOUND USER via exact match:', {
        name: user.name,
        email: user.email,
        status: user.status,
        pin_code: user.pin_code
      });
      
      if (user.status === 'approved' || user.status === 'active') {
        // Activate if not already
        if (user.status !== 'active') {
          console.log('🔄 Updating status to active...');
          const { error: updateErr } = await supabase
            .from('users')
            .update({ status: 'active', updated_at: new Date().toISOString() })
            .eq('id', user.id);
          
          if (updateErr) {
            console.warn('⚠️ Status update warning:', updateErr);
          } else {
            user.status = 'active';
            console.log('✅ Status updated to active');
          }
        }
        console.log('🎉 PIN VERIFICATION SUCCESS');
        console.log('🔍 PIN VERIFICATION DEBUG END ====================');
        return user;
      } else {
        console.log('❌ USER NOT APPROVED. Current status:', user.status);
        console.log('🔍 PIN VERIFICATION DEBUG END ====================');
        return null;
      }
    }
    
    // METHOD 2: Get all PINs and search manually
    console.log('🔍 METHOD 2: Manual PIN search...');
    const { data: allUsers, error: allError } = await supabase
      .from('users')
      .select('*')
      .not('pin_code', 'is', null);
    
    console.log('📊 Method 2 results:', {
      total_with_pins: allUsers?.length || 0,
      error: allError?.message || 'none'
    });
    
    if (allUsers && allUsers.length > 0) {
      console.log('📋 All available PINs:');
      allUsers.forEach(u => {
        const match = u.pin_code?.toString().trim() === cleanPin;
        console.log(`  ${match ? '✅' : '  '} ${u.email}: PIN=${u.pin_code}, Status=${u.status}`);
      });
      
      // Manual search in JavaScript
      const foundUser = allUsers.find(user => {
        if (!user.pin_code) return false;
        const dbPin = user.pin_code.toString().trim();
        return dbPin === cleanPin;
      });
      
      if (foundUser) {
        console.log('✅ FOUND USER via manual search:', {
          name: foundUser.name,
          email: foundUser.email,
          status: foundUser.status
        });
        
        if (foundUser.status === 'approved' || foundUser.status === 'active') {
          if (foundUser.status !== 'active') {
            await supabase
              .from('users')
              .update({ status: 'active', updated_at: new Date().toISOString() })
              .eq('id', foundUser.id);
            foundUser.status = 'active';
          }
          console.log('🎉 PIN VERIFICATION SUCCESS (manual search)');
          console.log('🔍 PIN VERIFICATION DEBUG END ====================');
          return foundUser;
        }
      }
    }
    
    // METHOD 3: Debug - show all available PINs
    console.log('🔍 METHOD 3: FINAL DEBUG - ALL USERS WITH PINS:');
    const { data: debugData } = await supabase
      .from('users')
      .select('name, email, pin_code, status')
      .not('pin_code', 'is', null)
      .order('pin_code');
    
    if (debugData && debugData.length > 0) {
      console.table(debugData.map(u => ({
        Name: u.name,
        Email: u.email,
        'PIN Code': u.pin_code || '(null)',
        Status: u.status,
        'Matches Input?': u.pin_code?.toString().trim() === cleanPin ? '✅ YES' : '❌ NO'
      })));
    } else {
      console.log('❌ NO USERS WITH PINs FOUND IN DATABASE');
    }
    
    console.log('❌ PIN NOT FOUND in any search method');
    console.log('🔍 PIN VERIFICATION DEBUG END ====================');
    return null;
    
  } catch (error) {
    console.error('💥 PIN VERIFICATION CRASHED:', error);
    console.log('🔍 PIN VERIFICATION DEBUG END ====================');
    return null;
  }
};

/**
 * Generate unique PIN - with collision checking
 */
export const generateUniquePin = async (): Promise<string> => {
  let generatedPin: string;
  let attempts = 0;
  const maxAttempts = 10;
  
  do {
    generatedPin = Math.floor(100000 + Math.random() * 900000).toString();
    attempts++;
    
    console.log(`📌 Generated PIN (attempt ${attempts}):`, generatedPin);
    
    // Check if PIN already exists in database
    const { data: existing, error } = await supabase
      .from('users')
      .select('id')
      .eq('pin_code', generatedPin)
      .maybeSingle();
    
    if (error) {
      console.error('⚠️ Error checking PIN uniqueness:', error);
      // Continue anyway
      break;
    }
    
    if (!existing) {
      console.log('✅ PIN is unique:', generatedPin);
      break;
    }
    
    console.log('⚠️ PIN already exists, trying another...');
    
    if (attempts >= maxAttempts) {
      console.error('❌ Could not generate unique PIN after', maxAttempts, 'attempts');
      break;
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
    
    // Update user with new PIN and status
    const { data: updateData, error: updateError } = await supabase
      .from('users')
      .update({
        status: 'approved',
        pin_code: pin,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .eq('status', 'pending')  // Only update if still pending
      .select('id, name, email, pin_code, status');
    
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
        .select('id, name, email, pin_code, status')
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
    
    if (savedUser.pin_code !== pin) {
      console.error('❌ PIN mismatch! Expected:', pin, 'Got:', savedUser.pin_code);
      console.warn('⚠️ Using PIN from database:', savedUser.pin_code);
      return {
        success: true,
        pin: savedUser.pin_code || pin
      };
    }
    
    console.log('✅ PIN verified in database:', pin);
    
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
        status: 'rejected',
        updated_at: new Date().toISOString()
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
