import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { supabase } from '../services/supabaseClient';

interface DiagnosticResult {
  name: string;
  status: 'idle' | 'testing' | 'success' | 'failed';
  message: string;
  details?: string;
}

export const SystemDiagnostics: React.FC = () => {
  const [results, setResults] = useState<DiagnosticResult[]>([
    { name: 'Supabase Client Initialization', status: 'idle', message: 'Click "Run Diagnostics" to start' },
    { name: 'Database Read Test (divers table)', status: 'idle', message: 'Pending' },
    { name: 'Database Write Test (test_log table)', status: 'idle', message: 'Pending' },
    { name: 'RLS Policy Validation', status: 'idle', message: 'Pending' },
    { name: 'Admin Audit Log Access', status: 'idle', message: 'Pending' },
  ]);

  const [isRunning, setIsRunning] = useState(false);

  const runDiagnostics = async () => {
    setIsRunning(true);
    const newResults: DiagnosticResult[] = [...results];

    // Test 1: Client Initialization
    try {
      newResults[0].status = 'testing';
      setResults([...newResults]);

      const clientCheck = supabase ? 'success' : 'failed';
      newResults[0].status = clientCheck === 'success' ? 'success' : 'failed';
      newResults[0].message = clientCheck === 'success' 
        ? 'Supabase client initialized successfully' 
        : 'Client not initialized';
      newResults[0].details = `URL: ${import.meta.env.VITE_SUPABASE_URL}, Key present: ${!!import.meta.env.VITE_SUPABASE_ANON_KEY}`;
    } catch (err: any) {
      newResults[0].status = 'failed';
      newResults[0].message = err.message;
    }
    setResults([...newResults]);

    // Test 2: Database Read Test
    try {
      newResults[1].status = 'testing';
      setResults([...newResults]);

      const { data, error, count } = await supabase
        .from('divers')
        .select('id,name,email', { count: 'exact' })
        .limit(1);

      if (error) throw error;

      newResults[1].status = 'success';
      newResults[1].message = `Successfully read from divers table`;
      newResults[1].details = `Found ${count} total records. Sample: ${data?.[0]?.name || 'No data'}`;
    } catch (err: any) {
      newResults[1].status = 'failed';
      newResults[1].message = `Read failed: ${err.message}`;
      newResults[1].details = JSON.stringify(err, null, 2);
    }
    setResults([...newResults]);

    // Test 3: Database Write Test
    try {
      newResults[2].status = 'testing';
      setResults([...newResults]);

      const testMessage = `System diagnostic at ${new Date().toISOString()}`;
      const { data, error } = await supabase
        .from('admin_audit_log')
        .insert([
          {
            action: 'SYSTEM_DIAGNOSTIC_TEST',
            details: { test: true, timestamp: new Date().toISOString() },
          },
        ]);

      if (error) throw error;

      newResults[2].status = 'success';
      newResults[2].message = `✅ Successfully wrote to admin_audit_log`;
      newResults[2].details = `Write successful: ${JSON.stringify(data)}`;
    } catch (err: any) {
      newResults[2].status = 'failed';
      newResults[2].message = `Write failed: ${err.message}`;
      newResults[2].details = JSON.stringify(err, null, 2);
    }
    setResults([...newResults]);

    // Test 4: RLS Policy Validation
    try {
      newResults[3].status = 'testing';
      setResults([...newResults]);

      const { data, error } = await supabase
        .from('access_requests')
        .select('*')
        .limit(1);

      if (error) {
        if (error.code === '42P01') {
          newResults[3].status = 'failed';
          newResults[3].message = 'access_requests table does not exist';
        } else if (error.message.includes('permission')) {
          newResults[3].status = 'failed';
          newResults[3].message = '🚨 RLS POLICY BLOCKING READS - anon key lacks permission';
          newResults[3].details = error.message;
        } else {
          throw error;
        }
      } else {
        newResults[3].status = 'success';
        newResults[3].message = 'RLS policies allow anonymous reads';
        newResults[3].details = `Retrieved ${data?.length || 0} records`;
      }
    } catch (err: any) {
      newResults[3].status = 'failed';
      newResults[3].message = err.message;
      newResults[3].details = JSON.stringify(err, null, 2);
    }
    setResults([...newResults]);

    // Test 5: Admin Audit Log Access
    try {
      newResults[4].status = 'testing';
      setResults([...newResults]);

      const { data, error, count } = await supabase
        .from('admin_audit_log')
        .select('*', { count: 'exact' })
        .limit(5);

      if (error) throw error;

      newResults[4].status = 'success';
      newResults[4].message = `✅ Admin audit log accessible`;
      newResults[4].details = `${count} total records. Latest: ${data?.[0]?.action || 'No action'}`;
    } catch (err: any) {
      newResults[4].status = 'failed';
      newResults[4].message = `Access failed: ${err.message}`;
      newResults[4].details = JSON.stringify(err, null, 2);
    }
    setResults([...newResults]);

    setIsRunning(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'testing':
        return <RefreshCw className="w-5 h-5 text-yellow-500 animate-spin" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  return (
    <div className="bg-gray-900 text-white p-6 rounded-lg max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">🔧 System Diagnostics</h1>

      <button
        onClick={runDiagnostics}
        disabled={isRunning}
        className="mb-6 px-6 py-3 bg-cyan-600 hover:bg-cyan-700 rounded-lg font-semibold disabled:opacity-50"
      >
        {isRunning ? 'Running Tests...' : 'Run Full Diagnostics'}
      </button>

      <div className="space-y-4">
        {results.map((result, idx) => (
          <div
            key={idx}
            className={`p-4 rounded-lg border-2 ${
              result.status === 'success'
                ? 'border-green-500 bg-green-900/20'
                : result.status === 'failed'
                ? 'border-red-500 bg-red-900/20'
                : result.status === 'testing'
                ? 'border-yellow-500 bg-yellow-900/20'
                : 'border-gray-600 bg-gray-800'
            }`}
          >
            <div className="flex items-center gap-3 mb-2">
              {getStatusIcon(result.status)}
              <div>
                <h3 className="font-bold text-lg">{result.name}</h3>
                <p className="text-sm text-gray-300">{result.message}</p>
              </div>
            </div>
            {result.details && (
              <pre className="text-xs bg-black/30 p-2 rounded mt-2 overflow-auto max-h-32 text-gray-400">
                {result.details}
              </pre>
            )}
          </div>
        ))}
      </div>

      <div className="mt-8 p-4 bg-gray-800 rounded-lg">
        <h3 className="font-bold mb-2">📋 CRITICAL CHECKLIST:</h3>
        <ul className="text-sm space-y-1 text-gray-300">
          <li>✅ All 5 tests show "success"</li>
          <li>✅ No "RLS POLICY BLOCKING" errors</li>
          <li>✅ Write test confirms data reaches Supabase</li>
          <li>✅ Check Supabase Dashboard → admin_audit_log table for test records</li>
        </ul>
      </div>
    </div>
  );
};
