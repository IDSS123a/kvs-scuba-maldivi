import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { CheckCircle, XCircle, Copy, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthProvider';
import { approveUserWithPin, rejectUserRequest } from '../services/pinService';

interface AccessRequest {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  status: string;
  created_at: string;
}

export const AdminAccessRequestsPanel: React.FC = () => {
  const { user: currentAdmin } = useAuth();
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [generatingPin, setGeneratingPin] = useState<string | null>(null);
  const [showingPin, setShowingPin] = useState<{ [key: string]: string }>({});
  const [rejectReason, setRejectReason] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    fetchPendingRequests();
  }, []);

  const fetchPendingRequests = async () => {
    setLoading(true);
    try {
      const { data, error: queryError } = await supabase
        .from('users')
        .select('id, name, email, phone, status, created_at')
        .eq('status', 'pending')
        .order('created_at', { ascending: true });

      if (queryError) throw queryError;
      setRequests(data || []);
      setError('');
    } catch (err) {
      console.error('❌ Error fetching requests:', err);
      setError('Failed to load pending requests');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (request: AccessRequest) => {
    console.log('═════════════════════════════════════════');
    console.log('🔐 APPROVAL PROCESS START');
    console.log('═════════════════════════════════════════');
    console.log('📋 Request Details:', { id: request.id, name: request.name, email: request.email });
    
    if (!currentAdmin?.id) {
      console.error('❌ CRITICAL: currentAdmin.id is missing');
      setError('Admin user ID not available');
      return;
    }

    console.log('✅ Admin ID verified:', currentAdmin.id);
    setGeneratingPin(request.id);
    
    try {
      console.log('🔄 STEP 1: Calling approveUserWithPin service...');
      
      // Use service to approve and generate PIN
      const result = await approveUserWithPin(request.id, currentAdmin.id);
      
      console.log('📊 STEP 1 Result:', result);
      
      if (!result.success) {
        console.error('❌ STEP 1 FAILED:', result.error);
        setError(`Failed to approve ${request.name}: ${result.error || 'Unknown error'}`);
        setGeneratingPin(null);
        console.log('═════════════════════════════════════════');
        console.log('❌ APPROVAL PROCESS FAILED');
        console.log('═════════════════════════════════════════');
        return;
      }

      const newPin = result.pin!;
      console.log('✅ STEP 1 SUCCESS: PIN generated:', newPin);
      
      // STEP 2: Verify PIN was saved correctly in database
      console.log('🔍 STEP 2: Verifying PIN in database...');
      const { data: verificationData, error: verifyError } = await supabase
        .from('users')
        .select('id, name, email, pin_code, status, updated_at')
        .eq('id', request.id)
        .limit(1);  // CHANGED: .limit(1) instead of .single()
      
      console.log('📊 STEP 2 Result - Database Response:', verificationData);
      if (verifyError) console.error('⚠️ STEP 2 Error:', verifyError);
      
      const verification = verificationData && verificationData.length > 0 ? verificationData[0] : null;
      
      if (!verification) {
        console.error('❌ STEP 2 FAILED: User not found in database after update!');
        setError('❌ Critical: User record was deleted or corrupted!');
        setGeneratingPin(null);
        return;
      }
      
      // PIN verification - handle both string and number types
      const dbPin = verification.pin_code?.toString().trim();
      const expectedPin = newPin.toString().trim();
      
      console.log('🔎 STEP 2 PIN Comparison:', {
        DatabasePIN: dbPin,
        ExpectedPIN: expectedPin,
        DatabaseType: typeof verification.pin_code,
        Match: dbPin === expectedPin ? '✅ YES' : '❌ NO'
      });
      
      if (dbPin !== expectedPin) {
        console.error('❌ STEP 2 FAILED: PIN MISMATCH!');
        console.error('   Expected:', expectedPin, '(type: ' + typeof newPin + ')');
        console.error('   Got from DB:', dbPin, '(type: ' + typeof verification.pin_code + ')');
        setError('⚠️ CRITICAL: PIN was not saved correctly to database! Approval may have failed.');
        setGeneratingPin(null);
        console.log('═════════════════════════════════════════');
        console.log('❌ APPROVAL PROCESS FAILED - PIN MISMATCH');
        console.log('═════════════════════════════════════════');
        return;
      }
      
      console.log('✅ STEP 2 SUCCESS: PIN verified in database:', dbPin);
      console.log('   User Status:', verification.status);
      console.log('   Updated At:', verification.updated_at);
      
      // STEP 3: Verify user status is 'approved'
      console.log('🔍 STEP 3: Checking user status...');
      if (verification.status !== 'approved' && verification.status !== 'active') {
        console.warn('⚠️ STEP 3 WARNING: User status is', verification.status, 'expected: approved/active');
      } else {
        console.log('✅ STEP 3 SUCCESS: User status is correct:', verification.status);
      }
      
      // STEP 4: Display PIN to admin
      console.log('📺 STEP 4: Displaying PIN to admin...');
      setShowingPin({ ...showingPin, [request.id]: newPin });
      
      // Show alert with PIN details
      const message = `
✅ USER APPROVED!

Name: ${request.name}
Email: ${request.email}
PIN Code: ${newPin}

⚠️ IMPORTANT: Send this PIN to the user immediately.
The user can now login with this 6-digit PIN.

Database Status: ${verification.status}
Last Updated: ${new Date(verification.updated_at).toLocaleString()}
      `.trim();
      
      console.log('📢 Showing approval message to admin');
      alert(message);
      
      // STEP 5: Copy PIN to clipboard automatically
      console.log('📋 STEP 5: Copying PIN to clipboard...');
      try {
        await navigator.clipboard.writeText(newPin);
        console.log('✅ STEP 5 SUCCESS: PIN copied to clipboard');
      } catch (clipError) {
        console.warn('⚠️ STEP 5 WARNING: Could not copy to clipboard:', clipError);
      }
      
      // STEP 6: Update UI
      console.log('🎨 STEP 6: Updating UI...');
      setRequests(requests.filter(r => r.id !== request.id));
      setError(''); // Clear any previous errors
      console.log('✅ STEP 6 SUCCESS: UI updated, request removed from pending list');
      
      // STEP 7: Auto-hide PIN after 30 seconds
      console.log('⏰ STEP 7: Setting auto-hide timer (30 seconds)...');
      setTimeout(() => {
        console.log('⏰ STEP 7: 30 seconds passed, hiding PIN from display');
        setShowingPin(prev => {
          const newState = { ...prev };
          delete newState[request.id];
          return newState;
        });
      }, 30000);
      
      // Final summary log
      console.log('═════════════════════════════════════════');
      console.log('✅ APPROVAL PROCESS COMPLETED SUCCESSFULLY');
      console.log('═════════════════════════════════════════');
      console.log('📋 Final Summary:', {
        UserName: request.name,
        UserEmail: request.email,
        AssignedPIN: newPin,
        Status: verification.status,
        ApprovedAt: new Date().toISOString(),
        AdminID: currentAdmin.id
      });
      console.log('═════════════════════════════════════════');

    } catch (err) {
      console.error('═════════════════════════════════════════');
      console.error('💥 EXCEPTION DURING APPROVAL PROCESS');
      console.error('═════════════════════════════════════════');
      console.error('Error object:', err);
      console.error('Error message:', err instanceof Error ? err.message : 'Unknown');
      console.error('Error stack:', err instanceof Error ? err.stack : 'No stack trace');
      setError(`Failed to approve ${request.name}: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setGeneratingPin(null);
    }
  };

  const handleReject = async (request: AccessRequest) => {
    if (!currentAdmin?.id) {
      setError('Admin user ID not available');
      return;
    }

    if (!window.confirm(`Reject request from ${request.name}? This will mark their record as rejected.`)) {
      return;
    }

    try {
      // Use centralized service to reject user
      const success = await rejectUserRequest(
        request.id,
        currentAdmin.id,
        rejectReason[request.id] || 'No reason provided'
      );

      if (!success) {
        setError('Failed to reject request');
        return;
      }

      // Remove from list
      setRequests(requests.filter(r => r.id !== request.id));
      console.log(`✅ Rejected ${request.name}`);
    } catch (err) {
      console.error('❌ Error rejecting request:', err);
      setError('Failed to reject request');
    }
  };

  const copyToClipboard = (pin: string) => {
    navigator.clipboard.writeText(pin);
    console.log('📋 PIN copied to clipboard');
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg">
        <h2 className="text-2xl font-black mb-6 flex items-center gap-3">
          📝 Pending Access Requests ({requests.length})
        </h2>

        {error && (
          <div className="p-4 mb-6 bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-3" />
            <p className="text-gray-600 dark:text-gray-400">Loading requests...</p>
          </div>
        ) : requests.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">
            No pending requests
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {requests.map(req => (
              <div
                key={req.id}
                className="p-6 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-300 dark:border-yellow-700 space-y-3"
              >
                {/* Request Info */}
                <div>
                  <p className="font-black text-lg text-gray-900 dark:text-white">{req.name}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">📧 {req.email}</p>
                  {req.phone && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">📱 {req.phone}</p>
                  )}
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    {new Date(req.created_at).toLocaleDateString()}
                  </p>
                </div>

                {/* PIN Display (if shown) */}
                {showingPin[req.id] && (
                  <div className="p-4 bg-green-100 dark:bg-green-900/40 rounded-lg border border-green-400 dark:border-green-700">
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Generated PIN:</p>
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-2xl font-black text-green-600 dark:text-green-400 tracking-widest">
                        {showingPin[req.id]}
                      </p>
                      <button
                        onClick={() => copyToClipboard(showingPin[req.id])}
                        className="p-2 hover:bg-green-200 dark:hover:bg-green-900 rounded transition"
                        title="Copy PIN"
                      >
                        <Copy className="w-4 h-4 text-green-600 dark:text-green-400" />
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                      Visible for 30 seconds
                    </p>
                  </div>
                )}

                {/* Rejection Reason (if approving) */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleApprove(req)}
                    disabled={generatingPin === req.id}
                    className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition disabled:opacity-50"
                  >
                    {generatingPin === req.id ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4" /> Approve
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => handleReject(req)}
                    className="flex-1 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition"
                  >
                    <XCircle className="w-4 h-4" /> Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAccessRequestsPanel;
