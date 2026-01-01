
import { supabase } from './supabaseClient';
import { hashPin, verifyPin as bcryptVerifyPin } from '../utils/bcryptPinUtil';

/**
 * Verify PIN
 */
export const verifyPin = async (pin: string): Promise<any> => {
    try {
        const cleanPin = pin.trim();
        console.log(`[PIN Service] Verifying PIN: ${cleanPin}`);

        const { data, error } = await supabase
            .from('users')
            .select('id, email, name, role, status, pin_code, pin_hash')
            .in('status', ['approved', 'active', 'confirmed'])
            .limit(100);

        if (error) {
            console.error('[PIN Service] Query error:', error);
            return null;
        }

        if (!data || data.length === 0) {
            console.log('[PIN Service] ❌ No active users found');
            return null;
        }

        for (const user of data) {
            if (user.pin_hash) {
                const hashMatch = await bcryptVerifyPin(cleanPin, user.pin_hash);
                if (hashMatch) {
                    return {
                        id: user.id,
                        email: user.email,
                        name: user.name,
                        role: user.role,
                        status: user.status
                    };
                }
            }

            if (user.pin_code && user.pin_code.trim() === cleanPin) {
                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    status: user.status
                };
            }
        }

        return null;
    } catch (err) {
        console.error('[PIN Service] Exception:', err);
        return null;
    }
};

/**
 * Generate unique 6-digit PIN
 */
export const generateUniquePin = async (): Promise<string> => {
    let generatedPin: string;
    let attempts = 0;
    const maxAttempts = 10;

    do {
        generatedPin = Math.floor(100000 + Math.random() * 900000).toString();
        attempts++;

        const { count, error } = await supabase
            .from('users')
            .select('*', { count: 'exact', head: true })
            .eq('pin_code', generatedPin);

        if (error) {
            console.error('⚠️ Error checking PIN uniqueness:', error);
            break;
        }

        if ((count || 0) === 0) {
            return generatedPin;
        }

        if (attempts >= maxAttempts) {
            generatedPin = Math.floor(100000 + Math.random() * 900000).toString();
            return generatedPin;
        }
    } while (true);

    return generatedPin;
};

/**
 * Approve user with PIN
 */
export const approveUserWithPin = async (
    userId: string,
    adminId: string
): Promise<{ success: boolean; pin?: string; error?: string }> => {
    try {
        const pin = await generateUniquePin();
        let pinHash: string;
        try {
            pinHash = await hashPin(pin);
        } catch (hashError) {
            return {
                success: false,
                error: 'PIN hashing failed'
            };
        }

        const { data: updateData, error: updateError } = await supabase
            .from('users')
            .update({
                status: 'approved',
                pin_hash: pinHash
            })
            .eq('id', userId)
            .eq('status', 'pending')
            .select('id, name, email, pin_hash, status');

        if (updateError) {
            if (updateError.code === '23505') {
                return approveUserWithPin(userId, adminId);
            }
            return {
                success: false,
                error: updateError.message || 'Update failed'
            };
        }

        let savedUser: any = null;
        if (updateData && updateData.length > 0) {
            savedUser = updateData[0];
        } else {
            const { data: selectData, error: selectError } = await supabase
                .from('users')
                .select('id, name, email, pin_hash, status')
                .eq('id', userId)
                .maybeSingle();

            if (selectError) {
                return {
                    success: false,
                    error: selectError.message || 'Verification failed'
                };
            }
            savedUser = selectData;
        }

        if (!savedUser || !savedUser.pin_hash) {
            return {
                success: false,
                error: 'PIN hash check failed'
            };
        }

        return {
            success: true,
            pin
        };

    } catch (error: any) {
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

        if (error) return false;
        return true;
    } catch (error) {
        return false;
    }
};

/**
 * Create audit log
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

        if (error) return false;
        return true;
    } catch (error) {
        return false;
    }
};

/**
 * Approve user and send PIN
 */
export const approveUserAndSendPin = async (
    userId: string,
    adminId?: string
): Promise<{ success: boolean; pin?: string; error?: string }> => {
    try {
        const { data: user, error: checkError } = await supabase
            .from('users')
            .select('id, email, name, status')
            .eq('id', userId)
            .single();

        if (checkError || !user) {
            return { success: false, error: 'User not found' };
        }

        if (user.status !== 'pending') {
            return { success: false, error: `User status is ${user.status}, cannot approve` };
        }

        const pin = await generateUniquePin();
        const { data: updated, error: updateError } = await supabase
            .from('users')
            .update({
                status: 'approved',
                pin_code: pin,
                approved_at: new Date().toISOString(),
                approved_by: adminId || null
            })
            .eq('id', userId)
            .eq('status', 'pending')
            .select();

        if (updateError || !updated || updated.length === 0) {
            return { success: false, error: 'Failed to update user status' };
        }

        await createAuditLog(userId, 'user_approved', {
            pin_sent: true,
            email: user.email,
            admin_id: adminId
        });

        return { success: true, pin };
    } catch (error) {
        return { success: false, error: String(error) };
    }
};

/**
 * Reject user access request
 */
export const rejectUserAccessRequest = async (
    userId: string,
    adminId?: string,
    reason?: string
): Promise<{ success: boolean; error?: string }> => {
    try {
        const { error: updateError } = await supabase
            .from('users')
            .update({
                status: 'rejected',
                rejected_at: new Date().toISOString(),
                rejection_reason: reason || null
            })
            .eq('id', userId)
            .eq('status', 'pending');

        if (updateError) {
            return { success: false, error: 'Failed to reject user' };
        }

        await createAuditLog(userId, 'user_rejected', {
            reason,
            admin_id: adminId
        });

        return { success: true };
    } catch (error) {
        return { success: false, error: String(error) };
    }
};
