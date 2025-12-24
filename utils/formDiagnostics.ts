/**
 * Form Diagnostics Utility
 * 
 * Provides helper functions to diagnose form submission issues.
 * Run these in browser console to test API connectivity and identify problems.
 */

interface DiagnosticResult {
  success: boolean;
  message: string;
  details?: Record<string, any>;
  nextSteps?: string[];
}

/**
 * Test Supabase Connection
 * Logs environment variable status and connectivity
 */
export async function testSupabaseConnection(): Promise<DiagnosticResult> {
  console.group('🔍 Testing Supabase Connection');
  
  try {
    const url = import.meta.env.VITE_SUPABASE_URL;
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (!url || !key) {
      console.error('❌ Missing environment variables!');
      console.log('VITE_SUPABASE_URL:', url ? '✅ Set' : '❌ Missing');
      console.log('VITE_SUPABASE_ANON_KEY:', key ? '✅ Set' : '❌ Missing');
      console.groupEnd();
      return {
        success: false,
        message: 'Missing environment variables',
        details: {
          urlSet: !!url,
          keySet: !!key
        },
        nextSteps: [
          '1. Check .env.local file exists in project root',
          '2. Verify VITE_SUPABASE_URL is set (no quotes)',
          '3. Verify VITE_SUPABASE_ANON_KEY is set (no quotes)',
          '4. Restart dev server: npm run dev',
          '5. Hard refresh browser: Ctrl+Shift+R'
        ]
      };
    }
    
    console.log('✅ Environment variables found');
    console.log('Supabase URL:', url.substring(0, 30) + '...');
    
    // Test connectivity
    const response = await fetch(`${url}/rest/v1/divers?limit=0`, {
      headers: {
        'apikey': key,
        'Authorization': `Bearer ${key}`
      }
    });
    
    if (response.ok) {
      console.log('✅ Supabase connection successful!');
      console.groupEnd();
      return {
        success: true,
        message: 'Supabase connection is working',
        details: {
          status: response.status,
          statusText: response.statusText
        }
      };
    } else {
      console.error('❌ Supabase connection failed');
      console.log('Status:', response.status);
      console.log('Status Text:', response.statusText);
      console.groupEnd();
      return {
        success: false,
        message: `Supabase connection failed with status ${response.status}`,
        details: {
          status: response.status,
          statusText: response.statusText
        },
        nextSteps: [
          'Check VITE_SUPABASE_URL is correct',
          'Verify Supabase project is active',
          'Check network connection'
        ]
      };
    }
  } catch (err) {
    console.error('❌ Connection test error:', err);
    console.groupEnd();
    return {
      success: false,
      message: 'Connection test failed',
      details: {
        error: err instanceof Error ? err.message : String(err)
      },
      nextSteps: [
        'Check internet connection',
        'Verify firewall allows outgoing connections',
        'Check Supabase status: https://status.supabase.com'
      ]
    };
  }
}

/**
 * Test Form Submission (Direct API Call)
 * Submits test data directly to Supabase without form validation
 */
export async function testFormSubmission(
  testEmail?: string
): Promise<DiagnosticResult> {
  console.group('🧪 Testing Form Submission (Direct API)');
  
  try {
    const url = import.meta.env.VITE_SUPABASE_URL;
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (!url || !key) {
      console.error('❌ Missing environment variables!');
      console.groupEnd();
      return {
        success: false,
        message: 'Missing environment variables (see testSupabaseConnection)',
        nextSteps: ['Run testSupabaseConnection() first']
      };
    }
    
    // Create test data with unique email
    const testData = {
      name: 'Test User',
      email: testEmail || `test-${Date.now()}@example.com`,
      phone: '+387 61 123 4567',
      status: 'pending',
      access_status: 'pending',
      created_at: new Date().toISOString()
    };
    
    console.log('📤 Sending test data:', testData);
    
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
      console.log('✅ SUCCESS! Data inserted:', responseData);
      console.groupEnd();
      return {
        success: true,
        message: 'Form submission test successful!',
        details: {
          status: response.status,
          insertedId: responseData[0]?.id,
          email: responseData[0]?.email
        },
        nextSteps: [
          '1. Check Supabase Dashboard → divers table',
          '2. Verify test data appears in table',
          '3. Form component should work identically'
        ]
      };
    } else {
      console.error('❌ FAILED! Status:', response.status);
      console.error('Response:', responseData);
      
      // Identify the error type
      let errorType = 'Unknown';
      let suggestedFix = '';
      
      if (response.status === 403) {
        errorType = '403 Forbidden (RLS Policy)';
        suggestedFix = 'Apply RLS policies in Supabase SQL Editor (see FORM_ERROR_DEBUG.md)';
      } else if (response.status === 400 && responseData.message?.includes('duplicate')) {
        errorType = '400 Duplicate Email';
        suggestedFix = 'Use a different email: test-' + Date.now() + '@example.com';
      } else if (response.status === 400) {
        errorType = '400 Bad Request (Validation)';
        suggestedFix = 'Check that all fields are correct and match database schema';
      } else if (response.status === 401) {
        errorType = '401 Unauthorized';
        suggestedFix = 'Check VITE_SUPABASE_ANON_KEY is correct';
      }
      
      console.error('ERROR TYPE:', errorType);
      console.error('SUGGESTED FIX:', suggestedFix);
      console.groupEnd();
      
      return {
        success: false,
        message: `Form submission test failed: ${errorType}`,
        details: {
          status: response.status,
          statusText: response.statusText,
          errorType: errorType,
          response: responseData
        },
        nextSteps: [suggestedFix]
      };
    }
  } catch (err) {
    console.error('❌ Test error:', err);
    console.groupEnd();
    return {
      success: false,
      message: 'Form submission test failed',
      details: {
        error: err instanceof Error ? err.message : String(err)
      },
      nextSteps: [
        'Check network connection',
        'Check browser console for error details',
        'Try testSupabaseConnection() first'
      ]
    };
  }
}

/**
 * Run Complete Diagnostic Suite
 * Tests everything needed to diagnose form issues
 */
export async function runFullDiagnostics(): Promise<void> {
  console.log('🔍 Starting Full Diagnostics...\n');
  
  // Test 1: Connection
  console.log('------- TEST 1: Supabase Connection -------');
  const connResult = await testSupabaseConnection();
  console.log(connResult.success ? '✅ PASS' : '❌ FAIL');
  
  if (!connResult.success) {
    console.log('\n❌ Connection test failed. Next steps:');
    connResult.nextSteps?.forEach(step => console.log('   ' + step));
    return;
  }
  
  // Test 2: Form Submission
  console.log('\n------- TEST 2: Form Submission (Direct API) -------');
  const formResult = await testFormSubmission();
  console.log(formResult.success ? '✅ PASS' : '❌ FAIL');
  
  if (!formResult.success) {
    console.log('\n❌ Form submission test failed. Next steps:');
    formResult.nextSteps?.forEach(step => console.log('   ' + step));
    return;
  }
  
  // All tests passed
  console.log('\n✅ ✅ ✅ ALL TESTS PASSED! ✅ ✅ ✅');
  console.log('Form component should work perfectly now.');
}

/**
 * Export diagnostics to global console
 * Makes functions available as window.diag.* in browser
 */
if (typeof window !== 'undefined') {
  (window as any).diag = {
    testConnection: testSupabaseConnection,
    testSubmission: testFormSubmission,
    runAll: runFullDiagnostics
  };
}

/**
 * Usage in Browser Console:
 * 
 * // Test individual components
 * diag.testConnection()
 * diag.testSubmission()
 * 
 * // Run everything
 * diag.runAll()
 * 
 * // Custom email test
 * diag.testSubmission('custom@example.com')
 */
