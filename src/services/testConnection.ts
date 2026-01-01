
import { supabase } from './supabaseClient';

export const testSupabaseConnection = async () => {
    console.log('🧪 STARTING SUPABASE CONNECTION TEST...');

    const results = {
        usersTableConfig: { status: 'pending', error: null as any },
        paymentsTableConfig: { status: 'pending', error: null as any },
        rlsCheck: { status: 'pending', details: null as any },
        tables: [] as string[]
    };

    try {
        console.log('1️⃣ Testing READ from public.users...');
        const { data: usersData, error: usersError, count: usersCount } = await supabase
            .from('users')
            .select('count', { count: 'exact', head: true });

        if (usersError) {
            console.error('❌ USERS READ FAILED:', usersError);
            results.usersTableConfig = { status: 'failed', error: usersError };
        } else {
            console.log('✅ USERS READ SUCCESS. Count:', usersCount);
            results.usersTableConfig = { status: 'success', error: null };
            results.tables.push('users');
        }

        console.log('2️⃣ Testing READ from public.payments...');
        const { data: paymentsData, error: paymentsError } = await supabase
            .from('payments')
            .select('count', { count: 'exact', head: true });

        if (paymentsError) {
            console.error('❌ PAYMENTS READ FAILED:', paymentsError);
            results.paymentsTableConfig = { status: 'failed', error: paymentsError };
        } else {
            console.log('✅ PAYMENTS READ SUCCESS');
            results.paymentsTableConfig = { status: 'success', error: null };
            results.tables.push('payments');
        }

        console.log('3️⃣ Testing WRITE to public.audit_logs (Check RLS)...');
        const { error: writeError } = await supabase
            .from('audit_logs')
            .insert([{
                action: 'DIAGNOSTIC_TEST',
                user_id: '00000000-0000-0000-0000-000000000000',
                details: 'Connection Test'
            }]);

        if (writeError) {
            console.warn('⚠️ WRITE FAILED (Expected if RLS denies anonymous):', writeError);
            results.rlsCheck = { status: 'restriction_found', details: writeError };
        } else {
            console.log('✅ WRITE SUCCESS (RLS allows write)');
            results.rlsCheck = { status: 'write_success', details: null };
        }

        console.log('📋 DIAGNOSTIC RESULTS:', JSON.stringify(results, null, 2));
        return results;

    } catch (err: any) {
        console.error('💥 UNEXPECTED ERROR:', err);
        return { error: err.message };
    }
};
