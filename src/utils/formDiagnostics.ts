
interface DiagnosticResult {
    success: boolean;
    message: string;
    details?: Record<string, any>;
    nextSteps?: string[];
}

export async function testSupabaseConnection(): Promise<DiagnosticResult> {
    console.group('🔍 Testing Supabase Connection');

    try {
        const url = import.meta.env.VITE_SUPABASE_URL;
        const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

        if (!url || !key) {
            console.error('❌ Missing environment variables!');
            console.groupEnd();
            return {
                success: false,
                message: 'Missing environment variables',
                details: { urlSet: !!url, keySet: !!key },
                nextSteps: [
                    '1. Check .env.local file exists in project root',
                    '2. Verify VITE_SUPABASE_URL is set (no quotes)',
                    '3. Verify VITE_SUPABASE_ANON_KEY is set (no quotes)',
                    '4. Restart dev server: npm run dev',
                    '5. Hard refresh browser: Ctrl+Shift+R'
                ]
            };
        }

        const response = await fetch(`${url}/rest/v1/divers?limit=0`, {
            headers: {
                'apikey': key,
                'Authorization': `Bearer ${key}`
            }
        });

        if (response.ok) {
            console.groupEnd();
            return {
                success: true,
                message: 'Supabase connection is working',
                details: { status: response.status, statusText: response.statusText }
            };
        } else {
            console.groupEnd();
            return {
                success: false,
                message: `Supabase connection failed with status ${response.status}`,
                details: { status: response.status, statusText: response.statusText },
                nextSteps: ['Check VITE_SUPABASE_URL is correct', 'Verify Supabase project is active']
            };
        }
    } catch (err) {
        console.groupEnd();
        return {
            success: false,
            message: 'Connection test failed',
            details: { error: err instanceof Error ? err.message : String(err) },
            nextSteps: ['Check internet connection', 'Check Supabase status: https://status.supabase.com']
        };
    }
}

export async function testFormSubmission(testEmail?: string): Promise<DiagnosticResult> {
    console.group('🧪 Testing Form Submission (Direct API)');

    try {
        const url = import.meta.env.VITE_SUPABASE_URL;
        const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

        if (!url || !key) {
            console.groupEnd();
            return {
                success: false,
                message: 'Missing environment variables',
                nextSteps: ['Run testSupabaseConnection() first']
            };
        }

        const testData = {
            name: 'Test User',
            email: testEmail || `test-${Date.now()}@example.com`,
            phone: '+387 61 123 4567',
            status: 'pending',
            access_status: 'pending',
            created_at: new Date().toISOString()
        };

        const response = await fetch(`${url}/rest/v1/divers`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${key}`,
                'apikey': key,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify(testData)
        });

        const responseData = await response.json();

        if (response.ok) {
            console.groupEnd();
            return {
                success: true,
                message: 'Form submission test successful!',
                details: { status: response.status, insertedId: responseData[0]?.id, email: responseData[0]?.email },
                nextSteps: ['Check Supabase Dashboard → divers table']
            };
        } else {
            console.groupEnd();
            return {
                success: false,
                message: `Form submission test failed: ${response.status}`,
                details: { status: response.status, response: responseData },
                nextSteps: ['Check RLS policies', 'Check database schema']
            };
        }
    } catch (err) {
        console.groupEnd();
        return {
            success: false,
            message: 'Form submission test failed',
            details: { error: err instanceof Error ? err.message : String(err) }
        };
    }
}

export async function runFullDiagnostics(): Promise<void> {
    const connResult = await testSupabaseConnection();
    if (!connResult.success) return;
    await testFormSubmission();
}

if (typeof window !== 'undefined') {
    (window as any).diag = {
        testConnection: testSupabaseConnection,
        testSubmission: testFormSubmission,
        runAll: runFullDiagnostics
    };
}
