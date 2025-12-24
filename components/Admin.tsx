
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { fetchDiversFromSupabase } from '../services/supabaseService';
import { TOTAL_ADULT_EUR, CHILD_HOTEL_SURCHARGE_EUR } from '../constants';
import { Language, Theme, ExchangeRates, Diver } from '../types';
import { useAuth } from '../contexts/AuthProvider';
import { AdminAccessRequestsPanel } from './AdminAccessRequestsPanel';
import { 
  Download, 
  RefreshCw,
  ShieldCheck,
  Mail,
  CalendarDays,
  LogOut,
  Loader2,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  Save,
  X,
  Key,
  RotateCcw,
  Copy
} from 'lucide-react';
import { fetchExchangeRates } from '../services/apiService';
import { supabase } from '../services/supabaseClient';
import { hashPin } from '../utils/pinCrypto';

interface Props {
  lang: Language;
  theme: Theme;
  onLogout?: () => void;
}

const Admin: React.FC<Props> = ({ lang, theme, onLogout }) => {
  const { user, isAdmin, logout } = useAuth();
  const [tab, setTab] = useState<'finance' | 'manifest' | 'requests' | 'logs'>('requests');
  const [syncing, setSyncing] = useState(false);
  const [divers, setDivers] = useState<Diver[]>([]);
  const [rates, setRates] = useState<ExchangeRates | null>(null);
  const [newsletterLogs, setNewsletterLogs] = useState<any[]>([]);
  const [attendanceLogs, setAttendanceLogs] = useState<any[]>([]);
  const [divesFromSupabase, setDivesFromSupabase] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingDiver, setEditingDiver] = useState<any>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newDiver, setNewDiver] = useState({ name: '', email: '', is_pro: false, status: 'pending' });
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [showingPin, setShowingPin] = useState<{ [key: string]: string }>({});
  const [pinGenerating, setPinGenerating] = useState<string | null>(null);

  // Fetch data from Supabase
  useEffect(() => {
    if (!isAdmin || !user) {
      console.warn('Admin access denied or user not authenticated');
      return;
    }
    
    const loadAdminData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Fetch users from NEW users table (not divers)
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .order('name');
        
        if (userError) {
          console.warn('Users query error:', userError);
          const cached = localStorage.getItem('kvs_divers_cache');
          if (cached) setDivers(JSON.parse(cached));
        } else {
          const formattedDivers = (userData || []).map(d => ({
            id: d.id,
            name: d.name,
            email: d.email,
            role: d.role === 'admin' ? 'Admin' : 'Member',
            status: d.status || 'pending',
            photo: d.photo_url || '',
            is_pro: d.role === 'admin',
            access_status: d.status
          }));
          setDivers(formattedDivers);
          localStorage.setItem('kvs_divers_cache', JSON.stringify(formattedDivers));
        }

        // Fetch pending requests from NEW users table
        const { data: requestData } = await supabase
          .from('users')
          .select('*')
          .eq('status', 'pending')
          .order('created_at', { ascending: false });
        
        setPendingRequests(requestData || []);

        // Fetch payments from Supabase
        const { data: paymentsData, error: paymentsError } = await supabase
          .from('payments')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (!paymentsError) {
          setPayments(paymentsData || []);
        }

        // Fetch exchange rates (with fallback/cache)
        const rates = await fetchExchangeRates();
        setRates(rates);

        // Load logs from localStorage
        setNewsletterLogs(JSON.parse(localStorage.getItem('kvs_newsletter_logs') || '[]'));
        setAttendanceLogs(JSON.parse(localStorage.getItem('kvs_attendance_logs') || '[]'));
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Error loading admin data';
        console.error(errorMsg, err);
        setError(errorMsg);
      } finally {
        setLoading(false);
      }
    };

    loadAdminData();
  }, [isAdmin, user]);

  // PIN Management Helpers
  const generateRandomPin = (): string => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const handleGeneratePin = useCallback(async (diverId: string, diverName: string) => {
    setPinGenerating(diverId);
    try {
      console.log(`🔄 GENERATING PIN PROTOCOL START for ${diverName} (ID: ${diverId})`);
      
      // EMERGENCY FIX: STEP 0 - Verify user exists in database BEFORE attempting update
      console.log(`🔍 STEP 0: Verifying user exists in database...`);
      const { data: userCheck, error: userCheckError } = await supabase
        .from('users')
        .select('id, name, email, status, pin_code')
        .eq('id', diverId)
        .single();
      
      if (userCheckError) {
        console.error(`❌ USER VERIFICATION ERROR: ${userCheckError.message}`);
        console.error(`❌ User ID ${diverId} not found in users table`);
        throw new Error(`User does not exist: ${userCheckError.message}`);
      }
      
      if (!userCheck) {
        console.error(`❌ USER NOT FOUND: ID ${diverId}`);
        throw new Error(`User ${diverId} not found in database`);
      }
      
      console.log(`✅ User verified in database:`, {
        id: userCheck.id,
        name: userCheck.name,
        email: userCheck.email,
        currentStatus: userCheck.status,
        currentPin: userCheck.pin_code || 'null'
      });
      
      // STEP 1: Generate unique 6-digit PIN (as string, NO hashing)
      let newPin;
      let uniqueAttempts = 0;
      
      do {
        newPin = generateRandomPin();
        console.log(`  📌 Generated candidate PIN: ${newPin}`);
        
        // Check uniqueness in users table
        const { data: existing, error: checkError } = await supabase
          .from('users')
          .select('id')
          .eq('pin_code', newPin)
          .limit(1);
        
        if (checkError) {
          console.error(`  ❌ Uniqueness check error: ${checkError.message}`);
          throw checkError;
        }
        
        if (!existing || existing.length === 0) {
          console.log(`  ✅ PIN ${newPin} is unique`);
          break;
        }
        
        uniqueAttempts++;
        if (uniqueAttempts > 20) {
          throw new Error('Cannot generate unique PIN after 20 attempts');
        }
        console.log(`  ♻️  PIN ${newPin} already exists, trying again...`);
      } while (true);
      
      // STEP 2: Store in CORRECT FIELD - pin_code (plain text, NO hashing)
      console.log(`  💾 SAVING PIN to users.pin_code field: ${newPin}`);
      
      // EMERGENCY FIX: Two-phase approach - try with select, fallback without
      console.log(`  🔄 Attempting UPDATE with SELECT...`);
      const { error: updateError, data: updateData } = await supabase
        .from('users')
        .update({
          pin_code: newPin,
          status: 'approved',
          updated_at: new Date().toISOString()
        })
        .eq('id', diverId)
        .select('id, pin_code, status, name, email');
      
      if (updateError) {
        console.error(`⚠️  UPDATE with SELECT failed: ${updateError.message}`);
        console.log(`💾 Attempting UPDATE without SELECT fallback...`);
        
        // Fallback: Try update without expecting select return
        const { error: updateError2 } = await supabase
          .from('users')
          .update({
            pin_code: newPin,
            status: 'approved',
            updated_at: new Date().toISOString()
          })
          .eq('id', diverId);
        
        if (updateError2) {
          console.error(`❌ UPDATE FAILED (both attempts): ${updateError2.message}`);
          throw updateError2;
        }
        console.log(`✅ UPDATE executed (without select return)`);
      } else {
        console.log(`✅ UPDATE with SELECT returned: ${updateData?.length || 0} rows`);
      }
      
      // STEP 3: VERIFY PIN WAS SAVED - Always do verification query
      console.log('🔍 STEP 2: VERIFYING PIN persistence with fresh SELECT...');
      const { data: verifyData, error: verifyError } = await supabase
        .from('users')
        .select('id, pin_code, status, name, email')
        .eq('id', diverId)
        .single();
      
      if (verifyError) {
        console.error(`❌ VERIFICATION QUERY FAILED: ${verifyError.message}`);
        throw new Error(`Verification failed: ${verifyError.message}`);
      }
      
      if (!verifyData) {
        console.error(`❌ VERIFICATION: User record not found after update`);
        throw new Error('User record not found after PIN update');
      }
      
      console.log(`📊 VERIFICATION RESULT:`, verifyData);
      
      // STEP 4: Check if PIN actually saved
      if (verifyData.pin_code === newPin) {
        console.log(`🎉 ✅ PIN VERIFICATION SUCCESSFUL!`);
        console.log(`    Name: ${verifyData.name}`);
        console.log(`    Email: ${verifyData.email}`);
        console.log(`    PIN: ${verifyData.pin_code}`);
        console.log(`    Status: ${verifyData.status}`);
        console.log(`🔄 GENERATING PIN PROTOCOL END ✅`);
      } else {
        console.error(`❌ PIN VERIFICATION FAILED!`);
        console.error(`    Expected PIN: ${newPin}`);
        console.error(`    Actual PIN in DB: ${verifyData.pin_code || 'null'}`);
        throw new Error(`PIN not saved correctly. Expected ${newPin}, got ${verifyData.pin_code}`);
      }
      
      // Show PIN to user
      setShowingPin(prev => ({ ...prev, [diverId]: newPin }));
      setError(null);
      
      // Auto-hide after 30 seconds
      setTimeout(() => {
        setShowingPin(prev => {
          const newState = { ...prev };
          delete newState[diverId];
          return newState;
        });
      }, 30000);

    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to generate PIN';
      console.error('❌ PIN generation error:', err);
      setError(errorMsg);
    } finally {
      setPinGenerating(null);
    }
  }, []);

  const handleExportPins = useCallback(() => {
    // OPTIMIZATION: Move CSV generation to async operation to prevent blocking UI
    setTimeout(() => {
      const confirmedDivers = divers.filter(d => d.status === 'confirmed');
      
      if (confirmedDivers.length === 0) {
        setError('No confirmed divers to export.');
        return;
      }

      const csvHeaders = ['Name', 'Email', 'Phone', 'Status'];
      const csvRows = confirmedDivers.map(d => [
        d.name,
        d.email,
        d.phone || '',
        d.status
      ]);

      const csvContent = [
        csvHeaders.join(','),
        ...csvRows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `KVS-Divers-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      console.log('✅ PINs exported successfully');
    }, 0); // Move to next microtask
  }, [divers]);

  // CRUD Operations - All wrapped with useCallback
  const handleAddDiver = useCallback(async () => {
    if (!newDiver.name.trim() || !newDiver.email.trim()) {
      setError('Name and email are required');
      return;
    }

    try {
      const { data, error: err } = await supabase
        .from('divers')
        .insert([{ ...newDiver, status: 'confirmed' }])
        .select();

      if (err) throw err;
      
      setDivers([...divers, data[0]]);
      setNewDiver({ name: '', email: '', is_pro: false, status: 'pending' });
      setShowAddForm(false);
      setError(null);
      console.log('✅ Diver added successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add diver');
    }
  }, [divers, newDiver]);

  const handleUpdateDiver = useCallback(async (diverToUpdate: any) => {
    try {
      // Only update fields that exist in the database
      const updateData = {
        name: diverToUpdate.name,
        email: diverToUpdate.email,
        status: diverToUpdate.status,
        is_pro: diverToUpdate.is_pro || false
      };

      const { error: err } = await supabase
        .from('divers')
        .update(updateData)
        .eq('id', diverToUpdate.id);

      if (err) {
        console.error('Update error:', err);
        throw err;
      }

      // Update local state with the updated diver
      setDivers(divers.map(d => 
        d.id === diverToUpdate.id 
          ? { ...d, ...updateData }
          : d
      ));
      setEditingDiver(null);
      setError(null);
      console.log('✅ Diver updated successfully');
    } catch (err) {
      console.error('Update failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to update diver');
    }
  }, [divers]);

  const handleDeleteDiver = useCallback(async (diverId: string) => {
    if (!confirm('Are you sure you want to delete this diver?')) return;

    try {
      const { error: err } = await supabase
        .from('divers')
        .delete()
        .eq('id', diverId);

      if (err) throw err;

      setDivers(divers.filter(d => d.id !== diverId));
      setError(null);
      console.log('✅ Diver deleted successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete diver');
    }
  }, [divers]);

  const handleAcceptRequest = useCallback(async (diver: any) => {
    try {
      console.log(`🔄 Accepting request for ${diver.name}...`);
      const { error: err, data } = await supabase
        .from('divers')
        .update({ status: 'confirmed', access_status: 'approved' })
        .eq('id', diver.id)
        .select('*');  // FIXED: Explicit field selection

      if (err) {
        console.error('❌ Error accepting request:', err);
        throw err;
      }

      console.log('✅ Database updated:', data);
      
      // Refresh pending requests from database to ensure sync
      const { data: updatedRequests } = await supabase
        .from('divers')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });
      
      setPendingRequests(updatedRequests || []);
      setDivers([...divers.filter(d => d.id !== diver.id), { ...diver, status: 'confirmed', access_status: 'approved' }]);
      console.log('✅ Request accepted and pending requests refreshed');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to accept request');
      console.error('Error in handleAcceptRequest:', err);
    }
  }, [divers]);

  const handleDenyRequest = useCallback(async (diverId: string) => {
    try {
      console.log(`🔄 Denying request for diver ID: ${diverId}...`);
      const { error: err, data } = await supabase
        .from('divers')
        .update({ status: 'cancelled' })
        .eq('id', diverId)
        .select();

      if (err) {
        console.error('❌ Error denying request:', err);
        throw err;
      }

      console.log('✅ Database updated:', data);
      
      // Refresh pending requests from database to ensure sync
      const { data: updatedRequests } = await supabase
        .from('divers')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });
      
      setPendingRequests(updatedRequests || []);
      setDivers(divers.filter(d => d.id !== diverId));
      console.log('✅ Request denied and pending requests refreshed');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to deny request');
      console.error('Error in handleDenyRequest:', err);
    }
  }, [divers]);

  const handleSync = useCallback(async () => {
    setSyncing(true);
    setError(null);
    try {
      const data = await fetchDiversFromSupabase();
      setDivers(data);
      localStorage.setItem('kvs_divers_cache', JSON.stringify(data));
      console.log('✅ Synced participants from Supabase');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Sync failed';
      console.error(errorMsg);
      setError(errorMsg);
    } finally {
      setSyncing(false);
    }
  }, []);

  const handleExportData = useCallback(() => {
    // OPTIMIZATION: Move CSV generation to async operation to prevent blocking UI
    setTimeout(() => {
      const headers = ['Category', 'Identifier', 'Details', 'Timestamp'];
      const rows: string[][] = [];
      divers.forEach(d => rows.push(['Participant', d.name, `Email: ${d.email || 'N/A'}`, new Date().toISOString()]));
      payments.forEach(p => rows.push(['Payment', `Diver ${p.diver_id}`, `Amount: ${p.amount_eur}€ (${p.payment_method})`, p.created_at || new Date().toISOString()]));
      newsletterLogs.forEach(l => rows.push(['Newsletter', l.email, `Date: ${l.date}`, l.date]));
      attendanceLogs.forEach(a => rows.push(['Attendance', a.user, `Email: ${a.email}`, a.date]));
      
      const csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n" + rows.map(r => r.join(",")).join("\n");
      const link = document.createElement("a");
      link.setAttribute("href", encodeURI(csvContent));
      link.setAttribute("download", `KVS_Full_Data_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      console.log('✅ Data exported successfully');
    }, 0); // Move to next microtask
  }, [divers, payments, newsletterLogs, attendanceLogs]);

  const handleLogout = useCallback(async () => {
    try {
      await logout();
      onLogout?.();
    } catch (err) {
      console.error('Logout failed:', err);
    }
  }, [logout, onLogout]);

  const calculateFinancials = () => {
    // Support both old schema (paid_to_agency, paid_to_adnan) and new schema (amount_eur, payment_method)
    let total = 0;
    let agencyTotal = 0;
    let cashTotal = 0;
    
    payments.forEach(p => {
      // New schema (amount_eur, payment_method)
      if ('amount_eur' in p && 'payment_method' in p) {
        total += p.amount_eur || 0;
        if (p.payment_method === 'agency') agencyTotal += p.amount_eur || 0;
        if (p.payment_method === 'cash') cashTotal += p.amount_eur || 0;
      } 
      // Old schema (paid_to_agency, paid_to_adnan)
      else if ('paid_to_agency' in p || 'paid_to_adnan' in p) {
        const agency = p.paid_to_agency || 0;
        const adnan = p.paid_to_adnan || 0;
        const amount = agency + adnan;
        total += amount;
        agencyTotal += agency;
        cashTotal += adnan; // adnan cash on site
      }
    });
    
    return { total, agencyTotal, cashTotal };
  };

  // Memoize financial calculations to prevent excessive re-renders
  const finances = useMemo(() => calculateFinancials(), [payments]);

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8">
        <ShieldCheck className="w-16 h-16 text-red-400" />
        <div className="text-center px-6">
          <h2 className="text-2xl font-bold mb-2">Admin Access Required</h2>
          <p className="text-gray-600">Your account does not have admin privileges.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`max-w-7xl mx-auto px-6 py-12 space-y-12 transition-colors duration-300 ${theme === 'dark' ? 'bg-[#001219] text-white' : ''}`}>
      {/* Header with logout */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black flex items-center gap-4 mb-2">
            <ShieldCheck className="w-10 h-10 text-cyan-500" /> ORGANIZER HUB
          </h2>
          <p className="text-xs text-cyan-500 font-bold uppercase tracking-[0.3em]">Expedition Management • {user?.email}</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={handleSync} 
            disabled={syncing || loading} 
            className="p-4 rounded-3xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 transition disabled:opacity-50"
            title="Sync data from Google Sheets"
          >
            <RefreshCw className={`w-5 h-5 ${syncing || loading ? 'animate-spin' : ''}`} />
          </button>
          <button 
            onClick={handleExportData} 
            disabled={loading}
            className="px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-3xl text-xs font-bold flex items-center gap-3 transition disabled:opacity-50"
          >
            <Download className="w-4 h-4" /> Export Data
          </button>
          <button 
            onClick={handleLogout}
            className="px-6 py-4 bg-red-600 hover:bg-red-700 text-white rounded-3xl text-xs font-bold flex items-center gap-3 transition"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-6 rounded-[20px]">
          <p className="text-red-800 dark:text-red-300 font-semibold">⚠️ Error: {error}</p>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center gap-4 bg-blue-50 dark:bg-blue-900/20 p-8 rounded-[20px]">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          <span className="text-blue-800 dark:text-blue-300 font-semibold">Loading admin data...</span>
        </div>
      )}

      {/* Financial Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-cyan-500/10 dark:bg-cyan-900/20 p-8 rounded-[20px] border border-cyan-500/20">
          <p className="text-[10px] font-black uppercase text-cyan-600 dark:text-cyan-400 tracking-widest mb-2">Total Collected</p>
          <p className="text-3xl font-black text-cyan-700 dark:text-cyan-300">{finances.total.toFixed(0)}€</p>
          <p className="text-xs text-gray-500 mt-2">{payments.length} payments</p>
        </div>
        <div className="bg-amber-500/10 dark:bg-amber-900/20 p-8 rounded-[20px] border border-amber-500/20">
          <p className="text-[10px] font-black uppercase text-amber-600 dark:text-amber-400 tracking-widest mb-2">Agency (SJJ)</p>
          <p className="text-3xl font-black text-amber-700 dark:text-amber-300">{finances.agencyTotal.toFixed(0)}€</p>
          <p className="text-xs text-gray-500 mt-2">Via agency transfers</p>
        </div>
        <div className="bg-emerald-500/10 dark:bg-emerald-900/20 p-8 rounded-[20px] border border-emerald-500/20">
          <p className="text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-400 tracking-widest mb-2">Cash (MLE)</p>
          <p className="text-3xl font-black text-emerald-700 dark:text-emerald-300">{finances.cashTotal.toFixed(0)}€</p>
          <p className="text-xs text-gray-500 mt-2">On-site payments</p>
        </div>
        <div className="bg-purple-500/10 dark:bg-purple-900/20 p-8 rounded-[20px] border border-purple-500/20">
          <p className="text-[10px] font-black uppercase text-purple-600 dark:text-purple-400 tracking-widest mb-2">Registered Divers</p>
          <p className="text-3xl font-black text-purple-700 dark:text-purple-300">{divers.filter(d => d.status === 'confirmed').length} / 19</p>
          <p className="text-xs text-gray-500 mt-2">{Math.round(divers.filter(d => d.status === 'confirmed').length / 19 * 100)}% registered</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex p-2 rounded-full max-w-2xl mx-auto bg-gray-100 dark:bg-gray-800 overflow-x-auto">
        {['requests', 'finance', 'manifest', 'logs'].map((t) => (
          <button 
            key={t} 
            onClick={() => setTab(t as any)} 
            className={`flex-1 py-4 px-6 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
              tab === t 
                ? 'bg-cyan-600 text-white shadow-lg' 
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Finance Tab */}
      {tab === 'finance' && (
        <div className="rounded-[20px] border border-gray-200 dark:border-gray-700 overflow-hidden shadow-lg bg-white dark:bg-gray-800">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-100 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
              <tr>
                <th className="px-8 py-4 text-xs font-black uppercase text-gray-700 dark:text-gray-300">Diver Name</th>
                <th className="px-8 py-4 text-xs font-black uppercase text-gray-700 dark:text-gray-300">Email</th>
                <th className="px-8 py-4 text-xs font-black uppercase text-gray-700 dark:text-gray-300">Total (€)</th>
                <th className="px-8 py-4 text-xs font-black uppercase text-gray-700 dark:text-gray-300">Status</th>
              </tr>
            </thead>
            <tbody>
              {divers.length > 0 ? divers.map((d, i) => {
                // Support both old and new schema for matching diver payments
                const diverPayments = payments.filter(p => {
                  // New schema: diver_id UUID reference
                  if ('diver_id' in p && p.diver_id === d.id) return true;
                  // Old schema: match by name
                  if ('name' in p && typeof p.name === 'string' && p.name.includes(d.name)) return true;
                  return false;
                });
                
                // Calculate total from both schemas
                let totalPaid = 0;
                diverPayments.forEach(p => {
                  if ('amount_eur' in p) {
                    totalPaid += p.amount_eur || 0;
                  } else if ('paid_to_agency' in p || 'paid_to_adnan' in p) {
                    totalPaid += (p.paid_to_agency || 0) + (p.paid_to_adnan || 0);
                  }
                });
                
                return (
                  <tr key={i} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                    <td className="px-8 py-5 font-bold">{d.name}</td>
                    <td className="px-8 py-5 text-sm text-gray-600 dark:text-gray-400">{d.email || 'N/A'}</td>
                    <td className="px-8 py-5 font-black text-cyan-600 dark:text-cyan-400">{totalPaid}€</td>
                    <td className="px-8 py-5"><span className={`px-3 py-1 rounded-full text-xs font-bold ${totalPaid > 0 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'}`}>{totalPaid > 0 ? '✓ Paid' : 'Pending'}</span></td>
                  </tr>
                );
              }) : (
                <tr><td colSpan={4} className="px-8 py-12 text-center text-gray-500">No divers registered yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Logs Tab */}
      {tab === 'logs' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white dark:bg-gray-800 p-10 rounded-[20px] border border-gray-200 dark:border-gray-700 shadow-lg">
            <h3 className="text-xl font-black flex items-center gap-3 mb-6">
              <Mail className="text-cyan-500" /> Newsletter Subscriptions ({newsletterLogs.length})
            </h3>
            <div className="space-y-4 max-h-[400px] overflow-y-auto">
              {newsletterLogs.map((l, i) => (
                <div key={i} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                  <p className="font-bold text-gray-900 dark:text-white">{l.email}</p>
                  <p className="text-[10px] font-black text-gray-400 mt-1 uppercase">{new Date(l.date).toLocaleDateString()}</p>
                </div>
              ))}
              {newsletterLogs.length === 0 && <p className="text-gray-400 text-center py-10">No subscriptions yet.</p>}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-10 rounded-[20px] border border-gray-200 dark:border-gray-700 shadow-lg">
            <h3 className="text-xl font-black flex items-center gap-3 mb-6">
              <CalendarDays className="text-emerald-500" /> Attendance Confirmed ({attendanceLogs.length})
            </h3>
            <div className="space-y-4 max-h-[400px] overflow-y-auto">
              {attendanceLogs.map((l, i) => (
                <div key={i} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                  <p className="font-bold text-gray-900 dark:text-white">{l.user}</p>
                  <p className="text-[10px] font-black text-gray-400 mt-1 uppercase">{l.email} • {new Date(l.date).toLocaleDateString()}</p>
                </div>
              ))}
              {attendanceLogs.length === 0 && <p className="text-gray-400 text-center py-10">No confirmations yet.</p>}
            </div>
          </div>
        </div>
      )}

      {/* Requests Tab - Uses new AdminAccessRequestsPanel */}
      {tab === 'requests' && (
        <AdminAccessRequestsPanel />
      )}

      {/* Manifest Tab - CRUD for Divers */}
      {tab === 'manifest' && (
        <div className="bg-white dark:bg-gray-800 p-10 rounded-[20px] border border-gray-200 dark:border-gray-700 shadow-lg space-y-8">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <h3 className="text-2xl font-black">📋 Divers Management</h3>
            <div className="flex gap-2">
              <button
                onClick={handleExportPins}
                className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-bold flex items-center gap-2 transition"
              >
                <Download className="w-4 h-4" /> Export CSV
              </button>
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold flex items-center gap-2 transition"
              >
                <Plus className="w-4 h-4" /> Add Diver
              </button>
            </div>
          </div>

          {/* Add Form */}
          {showAddForm && (
            <div className="bg-blue-50 dark:bg-blue-900/20 p-8 rounded-lg border border-blue-300 dark:border-blue-700 space-y-4">
              <input
                type="text"
                placeholder="Full Name"
                value={newDiver.name}
                onChange={(e) => setNewDiver({ ...newDiver, name: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <input
                type="email"
                placeholder="Email Address"
                value={newDiver.email}
                onChange={(e) => setNewDiver({ ...newDiver, email: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={newDiver.is_pro}
                  onChange={(e) => setNewDiver({ ...newDiver, is_pro: e.target.checked })}
                  className="w-5 h-5"
                />
                <span className="text-sm font-bold dark:text-white">Professional/Instructor</span>
              </label>
              <div className="flex gap-3">
                <button
                  onClick={handleAddDiver}
                  className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold flex items-center justify-center gap-2 transition"
                >
                  <Save className="w-4 h-4" /> Save
                </button>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 px-4 py-3 bg-gray-400 hover:bg-gray-500 text-white rounded-lg font-bold flex items-center justify-center gap-2 transition"
                >
                  <X className="w-4 h-4" /> Cancel
                </button>
              </div>
            </div>
          )}

          {/* Divers List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[600px] overflow-y-auto">
            {divers.length > 0 ? divers.map((d) => (
              <div key={d.id} className={`p-6 rounded-lg border ${editingDiver?.id === d.id ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700' : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600'}`}>
                {editingDiver?.id === d.id ? (
                  <div className="space-y-4">
                    <input
                      type="text"
                      placeholder="Name"
                      value={editingDiver.name || ''}
                      onChange={(e) => setEditingDiver({ ...editingDiver, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-800 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    <input
                      type="email"
                      placeholder="Email"
                      value={editingDiver.email || ''}
                      onChange={(e) => setEditingDiver({ ...editingDiver, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-800 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    <select
                      value={editingDiver.status || 'pending'}
                      onChange={(e) => setEditingDiver({ ...editingDiver, status: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-800 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editingDiver.is_pro || false}
                        onChange={(e) => setEditingDiver({ ...editingDiver, is_pro: e.target.checked })}
                        className="w-4 h-4 rounded"
                      />
                      <span className="text-sm font-bold dark:text-white">Professional/Instructor</span>
                    </label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleUpdateDiver(editingDiver)}
                        className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded font-bold text-sm flex items-center justify-center gap-2 transition"
                      >
                        <Save className="w-4 h-4" /> Save
                      </button>
                      <button
                        onClick={() => setEditingDiver(null)}
                        className="flex-1 px-3 py-2 bg-gray-400 hover:bg-gray-500 text-white rounded font-bold text-sm flex items-center justify-center gap-2 transition"
                      >
                        <X className="w-4 h-4" /> Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="text-lg font-black text-gray-900 dark:text-white">{d.name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">📧 {d.email || 'No email'}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">👤 {d.role}</p>
                    <p className="text-xs font-bold mt-3 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 inline-block">{d.status}</p>
                    
                    {/* PIN Display and Management */}
                    {showingPin[d.id] ? (
                      <div className="mt-4 p-3 bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 rounded">
                        <p className="text-xs text-gray-600 dark:text-gray-300 mb-2">🔐 Access PIN (expires in 30 seconds):</p>
                        <div className="flex items-center gap-2">
                          <p className="text-2xl font-black text-green-700 dark:text-green-400 font-mono">{showingPin[d.id]}</p>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(showingPin[d.id]);
                              alert('PIN copied to clipboard!');
                            }}
                            className="p-2 bg-green-600 hover:bg-green-700 text-white rounded text-xs transition"
                            title="Copy PIN"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ) : null}

                    <div className="flex gap-2 mt-4">
                      {d.status === 'confirmed' && (
                        <button
                          onClick={() => handleGeneratePin(d.id!, d.name)}
                          disabled={pinGenerating === d.id}
                          className="flex-1 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded font-bold text-xs flex items-center justify-center gap-2 transition disabled:opacity-50"
                        >
                          {pinGenerating === d.id ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" /> Generating...
                            </>
                          ) : (
                            <>
                              <Key className="w-4 h-4" /> Generate PIN
                            </>
                          )}
                        </button>
                      )}
                      <button
                        onClick={() => setEditingDiver({ 
                          id: d.id,
                          name: d.name || '',
                          email: d.email || '',
                          status: d.status || 'pending',
                          is_pro: d.is_pro || false,
                          role: d.role || 'Adult'
                        })}
                        className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-bold text-xs flex items-center justify-center gap-2 transition"
                      >
                        <Edit2 className="w-4 h-4" /> Edit
                      </button>
                      <button
                        onClick={() => handleDeleteDiver(d.id!)}
                        className="flex-1 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded font-bold text-xs flex items-center justify-center gap-2 transition"
                      >
                        <Trash2 className="w-4 h-4" /> Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            )) : (
              <p className="col-span-full text-center text-gray-500 py-12">No divers registered yet.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
