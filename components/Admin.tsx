
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { fetchDiversFromSupabase } from '../services/supabaseService';
import { TOTAL_ADULT_EUR, CHILD_HOTEL_SURCHARGE_EUR } from '../constants';
import { Language, Theme, ExchangeRates, Diver } from '../types';
import { useAuth } from '../contexts/AuthProvider';
import { AdminAccessRequestsPanel } from './AdminAccessRequestsPanel';
import { PaymentManager } from './PaymentManager';
import { UserManagementPanel } from './UserManagementPanel';
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
  Copy,
  ChevronRight,
  ClipboardList
} from 'lucide-react';
import ReadinessDashboard from './admin/ReadinessDashboard';
import { fetchExchangeRates } from '../services/apiService';
import { supabase } from '../services/supabaseClient';
import { hashPin } from '../utils/pinCrypto';
import { translations } from '../utils/translations';

interface Props {
  lang: Language;
  theme: Theme;
  onLogout?: () => void;
}

const Admin: React.FC<Props> = ({ lang, theme, onLogout }) => {
  const { user, isAdmin, logout } = useAuth();

  // Local translations are deprecated in favor of utils/translations.ts
  // Renamed to avoid shadowing the imported 'translations'
  const translations_unused = {
    BS: {
      // Header & Nav
      organizerHub: "ORGANIZATOR HUB",
      expeditionManagement: "UPRAVLJANJE EKSPEDICIJOM",
      exportData: "Izvezi Podatke",
      logout: "Odjava",
      syncData: "Sinhronizuj podatke",
      loadingData: "Učitavanje administratorskih podataka...",

      // Stats
      totalCollected: "Ukupno Prikupljeno",
      registeredDivers: "Registrovanih Ronioca",
      registered: "registrovanih",
      agency: "Agencija (SJJ)",
      viaAgency: "Transakcijski račun",
      cash: "Gotovina (MLE)",
      onSite: "Plaćanje na licu mjesta",
      payments: "uplata",

      // Tabs
      requests: "ZAHTJEVI",
      users: "KORISNICI",
      finance: "FINANSIJE",
      manifest: "MANIFEST",
      logs: "EVIDENCIJA",

      // Actions & Filters
      searchPlaceholder: "Pretraži po imenu...",
      filterStatus: "Filtriraj po statusu...",
      all: "Svi",
      showAdminOnly: "Samo Administratori",
      addNewDiver: "Dodaj Novog Ronioca",

      // Table Headers
      colName: "Ime i Prezime",
      colEmail: "Email",
      colRole: "Uloga",
      colStatus: "Status",
      colPin: "PIN",
      colActions: "Akcije",
      colTotal: "Ukupno (€)",

      // Statuses & Roles
      pending: "Na čekanju",
      confirmed: "Potvrđen",
      cancelled: "Otkazan",
      member: "Član",
      admin: "Administrator",
      active: "Aktivan",
      approved: "Odobren",
      paid: "Plaćeno",

      // Forms (Add/Edit)
      createDiver: "Kreiraj Novog Korisnika",
      editDiver: "Uredi Korisnika",
      labelName: "Ime",
      labelEmail: "Email",
      labelStatus: "Status",
      labelRole: "Sistemska Uloga",
      labelPro: "Profesionalac/Instruktor",
      btnSave: "Sačuvaj",
      btnCancel: "Otkaži",

      // Alerts & Empty States
      deleteConfirmTitle: "Obriši Korisnika",
      deleteConfirmMsg: "Da li ste sigurni da želite obrisati ovog korisnika? Ova akcija je nepovratna.",
      btnConfirmDelete: "Da, Obriši",
      noResults: "Nema korisnika koji odgovaraju pretrazi.",
      noDivers: "Nema registrovanih korisnika.",

      // Payment Manager
      addPaymentTitle: "Dodaj Detalje Uplate",
      diverPayer: "Ronilac / Uplatioc",
      selectDiver: "Odaberi Ronioca...",
      paidToAgency: "Uplaćeno Agenciji (€)",
      paidToLocal: "Plaćeno Lokalno/Keš (€)",
      btnRecordPayment: "EVIDENTIRAJ NOVU UPLATU",
      btnSavePayment: "SAČUVAJ UPLATU",

      // Logs
      logActivity: "Aktivnost",
      logUser: "Korisnik",
      logDetails: "Detalji",
      logTime: "Vrijeme",
    },
    EN: {
      // Header & Nav
      organizerHub: "ORGANIZER HUB",
      expeditionManagement: "EXPEDITION MANAGEMENT",
      exportData: "Export Data",
      logout: "Logout",
      syncData: "Sync data",
      loadingData: "Loading admin data...",

      // Stats
      totalCollected: "Total Collected",
      registeredDivers: "Registered Divers",
      registered: "registered",
      agency: "Agency (SJJ)",
      viaAgency: "Via agency transfers",
      cash: "Cash (MLE)",
      onSite: "On-site payments",
      payments: "payments",

      // Tabs
      requests: "REQUESTS",
      users: "USERS",
      finance: "FINANCE",
      manifest: "MANIFEST",
      logs: "LOGS",

      // Actions & Filters
      searchPlaceholder: "Search by name...",
      filterStatus: "Filter by status...",
      all: "All",
      showAdminOnly: "Show Admin only",
      addNewDiver: "Add New Diver",

      // Table Headers
      colName: "Name",
      colEmail: "Email",
      colRole: "Role",
      colStatus: "Status",
      colPin: "PIN",
      colActions: "Actions",
      colTotal: "Total (€)",

      // Statuses & Roles
      pending: "Pending",
      confirmed: "Confirmed",
      cancelled: "Cancelled",
      member: "Member",
      admin: "Administrator",
      active: "Active",
      approved: "Approved",
      paid: "Paid",

      // Forms (Add/Edit)
      createDiver: "Create New Diver",
      editDiver: "Edit Diver",
      labelName: "Name",
      labelEmail: "Email",
      labelStatus: "Status",
      labelRole: "System Role",
      labelPro: "Professional/Instructor",
      btnSave: "Save",
      btnCancel: "Cancel",

      // Alerts & Empty States
      deleteConfirmTitle: "Delete Diver",
      deleteConfirmMsg: "Are you sure you want to delete this diver? This action cannot be undone.",
      btnConfirmDelete: "Yes, Delete",
      noResults: "No divers found matching your criteria.",
      noDivers: "No divers registered yet.",

      // Payment Manager
      addPaymentTitle: "Add Payment Details",
      diverPayer: "Diver / Payer",
      selectDiver: "Select Diver...",
      paidToAgency: "Paid to Agency (€)",
      paidToLocal: "Paid to Local (€)",
      btnRecordPayment: "RECORD NEW PAYMENT",
      btnSavePayment: "SAVE PAYMENT",

      // Logs
      logActivity: "Activity",
      logUser: "User",
      logDetails: "Details",
      logTime: "Time",
    }
  };

  const t = translations[lang];
  const [tab, setTab] = useState<'finance' | 'manifest' | 'requests' | 'users' | 'logs' | 'readiness'>('requests');
  const [syncing, setSyncing] = useState(false);
  const [divers, setDivers] = useState<Diver[]>([]);
  const [rates, setRates] = useState<ExchangeRates | null>(null);
  const [repairing, setRepairing] = useState(false);

  const handleRepairChecklists = async () => {
    if (!confirm('This will ensure all active/confirmed users have a checklist. Continue?')) return;

    setRepairing(true);
    try {
      // 1. Get all participants
      const { data: users, error: userError } = await supabase
        .from('users')
        .select('id, name')
        .in('status', ['active', 'confirmed']);

      if (userError) throw userError;

      // 2. Standard checklist items template
      const template = [
        { id: 'doc_001', category: 'dokumenti', name: 'Pasoš', name_en: 'Passport', mandatory: true, priority: 'critical', icon: '🛂' },
        { id: 'doc_002', category: 'dokumenti', name: 'Putničko osiguranje', name_en: 'Travel Insurance', mandatory: true, priority: 'critical', icon: '🛡️' },
        { id: 'doc_003', category: 'dokumenti', name: 'Lična karta', name_en: 'ID Card', mandatory: false, priority: 'medium', icon: '🪪' },
        { id: 'doc_005', category: 'dokumenti', name: 'SSI certifikat', name_en: 'SSI Certification', mandatory: true, priority: 'critical', icon: '💳' },
        { id: 'doc_006', category: 'dokumenti', name: 'Potvrda o rezervaciji hotela', name_en: 'Hotel Booking Confirmation', mandatory: false, priority: 'medium', icon: '🏨' },
        { id: 'doc_007', category: 'dokumenti', name: 'Kontakt za hitne slučajeve', name_en: 'Emergency Contact', mandatory: false, priority: 'high', icon: '📞' },
        { id: 'mon_001', category: 'novac', name: 'Dolari (USD)', name_en: 'Dollars (USD)', mandatory: true, priority: 'critical', icon: '💵' },
        { id: 'mon_002', category: 'novac', name: 'Kreditna kartica', name_en: 'Credit Card', mandatory: false, priority: 'high', icon: '💳' },
        { id: 'mon_003', category: 'novac', name: 'Dolari sitno za napojnice', name_en: 'Small USD for tips', mandatory: false, priority: 'medium', icon: '💸' },
        { id: 'div_001', category: 'oprema', name: 'Neopren odijelo 3mm', name_en: 'Wetsuit 3mm', mandatory: true, priority: 'high', icon: '🏄' },
        { id: 'div_002', category: 'oprema', name: 'Maska', name_en: 'Mask', mandatory: true, priority: 'high', icon: '🤿' },
        { id: 'div_003', category: 'oprema', name: 'Disalica (snorkel)', name_en: 'Snorkel', mandatory: true, priority: 'high', icon: '🎋' },
        { id: 'div_004', category: 'oprema', name: 'Peraje', name_en: 'Fins', mandatory: true, priority: 'high', icon: '🧜' },
        { id: 'div_005', category: 'oprema', name: 'Ronilačke čizme', name_en: 'Dive Boots', mandatory: true, priority: 'high', icon: '👢' },
        { id: 'div_006', category: 'oprema', name: 'Diving kompjuter', name_en: 'Dive Computer', mandatory: true, priority: 'critical', icon: '⌚' },
        { id: 'div_007', category: 'oprema', name: 'BCD', name_en: 'BCD', mandatory: true, priority: 'high', icon: '🎒' },
        { id: 'div_008', category: 'oprema', name: 'Regulator', name_en: 'Regulator', mandatory: true, priority: 'high', icon: '🌬️' },
        { id: 'div_009', category: 'oprema', name: 'Octopus', name_en: 'Octopus', mandatory: false, priority: 'high', icon: '🐙' },
        { id: 'div_010', category: 'oprema', name: 'Nož', name_en: 'Dive Knife', mandatory: false, priority: 'medium', icon: '🔪' },
        { id: 'div_011', category: 'oprema', name: 'Podvodna kamera', name_en: 'Underwater Camera', mandatory: false, priority: 'medium', icon: '📷' },
        { id: 'div_012', category: 'oprema', name: 'Torba za opremu', name_en: 'Gear Bag', mandatory: false, priority: 'medium', icon: '👜' },
        { id: 'clo_001', category: 'odjeca', name: 'Kupaći kostimi', name_en: 'Swimwear', mandatory: false, priority: 'high', icon: '🩱' },
        { id: 'clo_002', category: 'odjeca', name: 'Šorc', name_en: 'Shorts', mandatory: false, priority: 'medium', icon: '🩳' },
        { id: 'clo_003', category: 'odjeca', name: 'Bermude', name_en: 'Bermuda', mandatory: false, priority: 'medium', icon: '🩳' },
        { id: 'clo_004', category: 'odjeca', name: 'Majice', name_en: 'T-shirts', mandatory: false, priority: 'medium', icon: '👕' },
        { id: 'clo_005', category: 'odjeca', name: 'Duks', name_en: 'Hoodie', mandatory: false, priority: 'medium', icon: '🧥' },
        { id: 'clo_006', category: 'odjeca', name: 'Jakna', name_en: 'Jacket', mandatory: false, priority: 'medium', icon: '🧥' },
        { id: 'clo_007', category: 'odjeca', name: 'Šešir', name_en: 'Hat', mandatory: false, priority: 'medium', icon: '👒' },
        { id: 'clo_008', category: 'odjeca', name: 'Sunčane naočale', name_en: 'Sunglasses', mandatory: false, priority: 'medium', icon: '🕶️' },
        { id: 'clo_009', category: 'odjeca', name: 'Patike', name_en: 'Sneakers', mandatory: false, priority: 'medium', icon: '👟' },
        { id: 'clo_010', category: 'odjeca', name: 'Čarape', name_en: 'Socks', mandatory: false, priority: 'low', icon: '🧦' },
        { id: 'clo_011', category: 'odjeca', name: 'Donje rublje', name_en: 'Underwear', mandatory: false, priority: 'medium', icon: '🩲' },
        { id: 'clo_012', category: 'odjeca', name: 'Pidžama', name_en: 'Pajamas', mandatory: false, priority: 'low', icon: '👕' },
        { id: 'hea_001', category: 'zdravlje', name: 'UV krema SPF 50+', name_en: 'Sunscreen 50+', mandatory: true, priority: 'high', icon: '🧴' },
        { id: 'hea_002', category: 'zdravlje', name: 'After sun njega', name_en: 'After sun care', mandatory: false, priority: 'medium', icon: '🧴' },
        { id: 'hea_003', category: 'zdravlje', name: 'Sprej protiv komaraca', name_en: 'Mosquito spray', mandatory: false, priority: 'medium', icon: '🦟' },
        { id: 'hea_004', category: 'zdravlje', name: 'Paracetamol', name_en: 'Paracetamol', mandatory: true, priority: 'high', icon: '💊' },
        { id: 'hea_005', category: 'zdravlje', name: 'Ibuprofen', name_en: 'Ibuprofen', mandatory: true, priority: 'high', icon: '💊' },
        { id: 'hea_006', category: 'zdravlje', name: 'Probiotici', name_en: 'Probiotics', mandatory: false, priority: 'medium', icon: '💊' },
        { id: 'hea_007', category: 'zdravlje', name: 'Tablete protiv mučnine', name_en: 'Motion sickness pills', mandatory: false, priority: 'medium', icon: '💊' },
        { id: 'hea_008', category: 'zdravlje', name: 'Flasteri', name_en: 'Plasters', mandatory: false, priority: 'low', icon: '🩹' },
        { id: 'hea_009', category: 'zdravlje', name: 'Gaze', name_en: 'Gauze', mandatory: false, priority: 'low', icon: '🩹' },
        { id: 'hea_010', category: 'zdravlje', name: 'Dezinfekcija', name_en: 'Disinfectant', mandatory: false, priority: 'medium', icon: '🧼' },
        { id: 'hea_011', category: 'zdravlje', name: 'Kapi za uši', name_en: 'Ear drops', mandatory: true, priority: 'high', icon: '💧' },
        { id: 'hea_012', category: 'zdravlje', name: 'Pribor za higijenu', name_en: 'Toiletries', mandatory: false, priority: 'medium', icon: '🪥' },
        { id: 'ele_001', category: 'elektronika', name: 'Podvodno kućište', name_en: 'Underwater Housing', mandatory: false, priority: 'high', icon: '📦' },
        { id: 'ele_002', category: 'elektronika', name: 'Dodatne baterije', name_en: 'Extra batteries', mandatory: false, priority: 'medium', icon: '🔋' },
        { id: 'ele_003', category: 'elektronika', name: 'Punjač za kameru', name_en: 'Camera charger', mandatory: false, priority: 'medium', icon: '🔌' },
        { id: 'ele_004', category: 'elektronika', name: 'Memorijske kartice', name_en: 'Memory cards', mandatory: false, priority: 'medium', icon: '💾' },
        { id: 'ele_005', category: 'elektronika', name: 'Punjač za mobitel', name_en: 'Phone charger', mandatory: false, priority: 'high', icon: '🔌' },
        { id: 'ele_006', category: 'elektronika', name: 'Power bank', name_en: 'Power bank', mandatory: false, priority: 'high', icon: '🔋' },
        { id: 'ele_007', category: 'elektronika', name: 'Putnički adapter za struju (D)', name_en: 'Travel adapter (D)', mandatory: false, priority: 'high', icon: '🔌' }
      ];

      // 3. Populate for each user
      for (const u of users) {
        const items = template.map((item, idx) => ({
          ...item,
          user_id: u.id,
          sort_order: idx
        }));

        await supabase.from('checklist_items').upsert(items, { onConflict: 'id,user_id' });
      }

      alert(`Successfully repaired checklists for ${users.length} users!`);
      window.location.reload();
    } catch (err: any) {
      console.error('Repair failed:', err);
      alert('Failed to repair: ' + err.message);
    } finally {
      setRepairing(false);
    }
  };
  const [newsletterLogs, setNewsletterLogs] = useState<any[]>([]);
  const [divesFromSupabase, setDivesFromSupabase] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingDiver, setEditingDiver] = useState<any>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newDiver, setNewDiver] = useState<Partial<Diver>>({
    name: '',
    email: '',
    isPro: false,
    isDiver: true,
    status: 'pending',
    role: 'Adult'
  });
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
          console.log('📥 LOADING USERS - Raw data sample:', userData?.[0]);

          const formattedDivers = (userData || []).map(d => {
            const result = {
              id: d.id,
              name: d.name,
              email: d.email,
              role: d.role === 'admin' ? 'Admin' : 'Member',
              status: d.status || 'pending',
              photo: d.photo_url || '',
              is_pro: d.is_pro || d.role === 'admin', // Check both is_pro column and role
              isPro: d.is_pro || d.role === 'admin', // Add isPro for consistency
              access_status: d.status
            };

            if (d.name?.includes('Davor')) {
              console.log('📥 LOADING Davor Mulalić:', {
                raw_is_pro: d.is_pro,
                raw_role: d.role,
                calculated_is_pro: result.is_pro,
                calculated_isPro: result.isPro
              });
            }

            return result;
          });

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
    if (!newDiver.name?.trim() || !newDiver.email?.trim()) {
      setError('Name and email are required');
      return;
    }

    try {
      const payload = {
        name: newDiver.name,
        email: newDiver.email,
        status: 'active',
        role: ['mulalic71@gmail.com', 'adnandrnda@hotmail.com', 'samirso@hotmail.com'].includes(newDiver.email?.toLowerCase() || '') ? 'admin' : 'member',
        is_pro: newDiver.isPro,
        is_diver: newDiver.isDiver,
        total_dives: newDiver.isDiver ? newDiver.dives : 0,
        start_year: newDiver.isDiver ? newDiver.startYear : null,
        master_id: newDiver.isDiver ? newDiver.masterId : null,
        ssi_pro_id: newDiver.isDiver ? newDiver.ssiProId : null,
        updated_at: new Date().toISOString()
      };

      const { data, error: err } = await supabase
        .from('users')
        .insert([payload])
        .select();

      if (err) throw err;

      setDivers([...divers, {
        ...data[0],
        isPro: data[0].is_pro,
        isDiver: data[0].is_diver,
        dives: data[0].total_dives,
        startYear: data[0].start_year,
        masterId: data[0].master_id,
        ssiProId: data[0].ssi_pro_id
      } as Diver]);

      setNewDiver({ name: '', email: '', isPro: false, isDiver: true, status: 'pending', role: 'Adult' });
      setShowAddForm(false);
      setError(null);
      console.log('✅ Diver added successfully to users table');
    } catch (err) {
      console.error('Add failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to add participant');
    }
  }, [divers, newDiver]);

  const handleUpdateDiver = useCallback(async (diverToUpdate: any) => {
    try {
      const isPro = diverToUpdate.is_pro || diverToUpdate.isPro || false;

      console.log('🔄 UPDATE DIVER - Input:', {
        name: diverToUpdate.name,
        is_pro: diverToUpdate.is_pro,
        isPro: diverToUpdate.isPro,
        calculated_isPro: isPro
      });

      const payload = {
        name: diverToUpdate.name,
        email: diverToUpdate.email,
        status: diverToUpdate.status,
        role: (diverToUpdate.role || 'member').toLowerCase(), // Ensure lowercase for DB enum match
        is_pro: isPro,
        is_diver: diverToUpdate.isDiver,
        total_dives: diverToUpdate.isDiver ? diverToUpdate.dives : 0,
        start_year: diverToUpdate.isDiver ? diverToUpdate.startYear : null,
        master_id: diverToUpdate.isDiver ? diverToUpdate.masterId : null,
        ssi_pro_id: diverToUpdate.isDiver ? diverToUpdate.ssiProId : null,
        phone: diverToUpdate.phone1,
        address: diverToUpdate.address,
        city: diverToUpdate.city,
        country: diverToUpdate.country,
        birth_date: diverToUpdate.birthDate,
        age: diverToUpdate.age,
        dietary_restriction: diverToUpdate.dietaryRestrictions,
        emergency_contact_name: diverToUpdate.emergencyContact?.name,
        emergency_contact_relationship: diverToUpdate.emergencyContact?.relationship,
        emergency_contact_phone: diverToUpdate.emergencyContact?.phone,
        updated_at: new Date().toISOString()
      };

      console.log('📦 UPDATE DIVER - Payload:', {
        name: payload.name,
        role: payload.role,
        is_pro: payload.is_pro
      });

      const { error: err } = await supabase
        .from('users')
        .update(payload)
        .eq('id', diverToUpdate.id);

      if (err) throw err;

      console.log('✅ Participant updated successfully in users table');

      // Reload data from database to ensure consistency
      const { data: updatedData, error: reloadError } = await supabase
        .from('users')
        .select('*')
        .order('name');

      if (!reloadError && updatedData) {
        const formattedDivers = (updatedData || []).map(d => {
          const result = {
            id: d.id,
            name: d.name,
            email: d.email,
            role: d.role === 'admin' ? 'Admin' : 'Member',
            status: d.status || 'pending',
            photo: d.photo_url || '',
            is_pro: d.is_pro || d.role === 'admin',
            isPro: d.is_pro || d.role === 'admin',
            access_status: d.status
          };

          if (d.name?.includes('Davor')) {
            console.log('🔄 RELOAD Davor Mulalić after update:', {
              raw_is_pro: d.is_pro,
              raw_role: d.role,
              calculated_is_pro: result.is_pro,
              calculated_isPro: result.isPro
            });
          }

          return result;
        });

        setDivers(formattedDivers);
        localStorage.setItem('kvs_divers_cache', JSON.stringify(formattedDivers));
        console.log('🔄 Data reloaded from database after update');
      }

      setEditingDiver(null);
      setError(null);
    } catch (err) {
      console.error('Update failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to update participant');
    }
  }, [divers]);

  const handleDeleteDiver = useCallback(async (diverId: string) => {
    if (!confirm('Are you sure you want to delete this participant?')) return;

    try {
      const { error: err } = await supabase
        .from('users')
        .delete()
        .eq('id', diverId);

      if (err) throw err;

      setDivers(divers.filter(d => d.id !== diverId));
      setError(null);
      console.log('✅ Participant deleted successfully from users table');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete participant');
    }
  }, [divers]);

  const handleAcceptRequest = useCallback(async (diver: any) => {
    try {
      console.log(`🔄 Accepting request for ${diver.name}...`);
      const { error: err, data } = await supabase
        .from('users')
        .update({ status: 'active' })
        .eq('id', diver.id)
        .select('*');

      if (err) throw err;

      console.log('✅ User accepted in users table');

      // Refresh pending requests
      const { data: updatedRequests } = await supabase
        .from('users')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      setPendingRequests(updatedRequests || []);
      setDivers([...divers.filter(d => d.id !== diver.id), { ...diver, status: 'active' }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to accept request');
      console.error('Error in handleAcceptRequest:', err);
    }
  }, [divers]);

  const handleDenyRequest = useCallback(async (diverId: string) => {
    try {
      const { error: err } = await supabase
        .from('users')
        .update({ status: 'rejected' })
        .eq('id', diverId);

      if (err) throw err;

      // Refresh pending requests
      const { data: updatedRequests } = await supabase
        .from('users')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      setPendingRequests(updatedRequests || []);
      setDivers(divers.filter(d => d.id !== diverId));
      console.log('✅ Request denied in users table');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to deny request');
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

      const csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n" + rows.map(r => r.join(",")).join("\n");
      const link = document.createElement("a");
      link.setAttribute("href", encodeURI(csvContent));
      link.setAttribute("download", `KVS_Full_Data_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      console.log('✅ Data exported successfully');
    }, 0); // Move to next microtask
  }, [divers, payments, newsletterLogs]);

  const handleLogout = useCallback(async () => {
    try {
      await logout();
      onLogout?.();
    } catch (err) {
      console.error('Logout failed:', err);
    }
  }, [logout, onLogout]);

  const calculateFinancials = () => {
    // USE EXACT LOGIC FROM PaymentManager.tsx for consistency
    let agency = 0;
    let localCash = 0; // corresponds to 'adnana' + 'kids' in PaymentManager
    let kids = 0;
    let total = 0;

    console.log('💰 CALC FINANCES - Payments Count:', payments.length);

    payments.forEach(p => {
      // Use correct column names matching DB and PaymentManager
      const p_agency = Number(p.paid_to_agency || 0);
      const p_adnan = Number(p.paid_to_adnana || 0); // Correct column name!
      const p_kids = Number(p.add_for_kids || 0);
      const p_amount = Number(p.amount_eur || 0);

      agency += p_agency;
      // In PaymentManager, Cash (MLE) includes both paid_to_adnana and add_for_kids
      localCash += (p_adnan + p_kids);
      kids += p_kids;

      // Total uses amount_eur if available (which is the source of truth for total)
      // or falls back to sum of components if amount_eur is missing
      if (p_amount > 0) {
        total += p_amount;
      } else {
        total += (p_agency + p_adnan + p_kids);
      }
    });

    console.log('💰 FINANCES SYNCED:', { total, agency, localCash, kids });
    return { total, agencyTotal: agency, cashTotal: localCash };
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
    <div className={`w-full mx-auto px-6 py-12 space-y-12 transition-colors duration-300 ${theme === 'dark' ? 'bg-[#001219] text-white' : ''}`}>
      {/* Header with logout */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black flex items-center gap-4 mb-2">
            <ShieldCheck className="w-10 h-10 text-cyan-500" /> {t.organizerHub}
          </h2>
          <p className="text-xs text-cyan-500 font-bold uppercase tracking-[0.3em]">{t.expeditionManagement} • {user?.email}</p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={handleRepairChecklists}
            disabled={repairing}
            className={`flex items-center gap-2 px-6 py-4 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border ${repairing ? 'opacity-50' : 'hover:scale-105 active:scale-95'
              } bg-amber-500 text-white border-amber-400 shadow-lg`}
          >
            {repairing ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
            {lang === 'BS' ? 'POPRAVI LISTE' : 'REPAIR LISTS'}
          </button>
          <button
            onClick={handleSync}
            disabled={syncing || loading}
            className="p-4 rounded-3xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 transition disabled:opacity-50"
            title={t.syncData}
          >
            <RefreshCw className={`w-5 h-5 ${syncing || loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleExportData}
            disabled={loading}
            className="px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-3xl text-xs font-bold flex items-center gap-3 transition disabled:opacity-50"
          >
            <Download className="w-4 h-4" /> {t.exportData}
          </button>
          <button
            onClick={handleLogout}
            className="px-6 py-4 bg-red-600 hover:bg-red-700 text-white rounded-3xl text-xs font-bold flex items-center gap-3 transition"
          >
            <LogOut className="w-4 h-4" /> {t.logout}
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
          <span className="text-blue-800 dark:text-blue-300 font-semibold">{t.loadingData}</span>
        </div>
      )}

      {/* Financial Cards */}
      {/* Financial Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-cyan-500/10 dark:bg-cyan-900/20 p-8 rounded-[20px] border border-cyan-500/20">
          <p className="text-[10px] font-black uppercase text-cyan-600 dark:text-cyan-400 tracking-widest mb-2">{t.totalCollected}</p>
          <p className="text-3xl font-black text-cyan-700 dark:text-cyan-300">{finances.total.toFixed(0)}€</p>
          <p className="text-xs text-gray-500 mt-2">{payments.length} {t.payments}</p>
        </div>
        <div className="bg-amber-500/10 dark:bg-amber-900/20 p-8 rounded-[20px] border border-amber-500/20">
          <p className="text-[10px] font-black uppercase text-amber-600 dark:text-amber-400 tracking-widest mb-2">{t.agency}</p>
          <p className="text-3xl font-black text-amber-700 dark:text-amber-300">{finances.agencyTotal.toFixed(0)}€</p>
          <p className="text-xs text-gray-500 mt-2">{t.viaAgency}</p>
        </div>
        <div className="bg-emerald-500/10 dark:bg-emerald-900/20 p-8 rounded-[20px] border border-emerald-500/20">
          <p className="text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-400 tracking-widest mb-2">{t.cash}</p>
          <p className="text-3xl font-black text-emerald-700 dark:text-emerald-300">{finances.cashTotal.toFixed(0)}€</p>
          <p className="text-xs text-gray-500 mt-2">{t.onSite}</p>
        </div>
        <div className="bg-purple-500/10 dark:bg-purple-900/20 p-8 rounded-[20px] border border-purple-500/20">
          <p className="text-[10px] font-black uppercase text-purple-600 dark:text-purple-400 tracking-widest mb-2">{t.registeredDivers}</p>
          <p className="text-3xl font-black text-purple-700 dark:text-purple-300">{divers.filter(d => d.status === 'confirmed').length} / 19</p>
          <p className="text-xs text-gray-500 mt-2">{Math.round(divers.filter(d => d.status === 'confirmed').length / 19 * 100)}% {t.registered}</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex p-2 rounded-full w-full mx-auto bg-gray-100 dark:bg-gray-800 overflow-x-auto gap-2">
        {(['requests', 'users', 'finance', 'readiness', 'manifest', 'logs'] as const).map((key) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`py-3 px-4 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${tab === key
              ? 'bg-cyan-600 text-white shadow-lg'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
          >
            {key === 'readiness' ? (lang === 'BS' ? 'SPREMNOST' : 'READINESS') : t[key]}
          </button>
        ))}
      </div>

      {/* Readiness Tab */}
      {tab === 'readiness' && (
        <ReadinessDashboard lang={lang} theme={theme} />
      )}

      {/* Finance Tab */}
      {tab === 'finance' && (
        <div className="rounded-[20px] border border-gray-200 dark:border-gray-700 overflow-hidden shadow-lg bg-white dark:bg-gray-800">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-100 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
              <tr>
                <th className="px-8 py-4 text-xs font-black uppercase text-gray-700 dark:text-gray-300">{t.colName}</th>
                <th className="px-8 py-4 text-xs font-black uppercase text-gray-700 dark:text-gray-300">{t.colEmail}</th>
                <th className="px-8 py-4 text-xs font-black uppercase text-gray-700 dark:text-gray-300">{t.colTotal}</th>
                <th className="px-8 py-4 text-xs font-black uppercase text-gray-700 dark:text-gray-300">{t.colStatus}</th>
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
                    <td className="px-8 py-5"><span className={`px-3 py-1 rounded-full text-xs font-bold ${totalPaid > 0 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'}`}>{totalPaid > 0 ? `✓ ${t.paid}` : t.pending}</span></td>
                  </tr>
                );
              }) : (
                <tr><td colSpan={4} className="px-8 py-12 text-center text-gray-500">{t.noDivers}</td></tr>
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

        </div>
      )}

      {/* Requests Tab - Uses new AdminAccessRequestsPanel */}
      {tab === 'requests' && (
        <AdminAccessRequestsPanel />
      )}

      {/* Users Tab - User Management */}
      {tab === 'users' && (
        <div className="bg-white dark:bg-gray-800 p-8 rounded-[20px] border border-gray-200 dark:border-gray-700 shadow-lg">
          <h3 className="text-2xl font-black mb-6">👥 Upravljanje Korisnicima</h3>
          <UserManagementPanel />
        </div>
      )}

      {/* Finance Tab - Payment Management */}
      {tab === 'finance' && (
        <div className="bg-white dark:bg-gray-800 p-8 rounded-[20px] border border-gray-200 dark:border-gray-700 shadow-lg">
          <h3 className="text-2xl font-black mb-6">💰 Upravljanje Finansijama</h3>
          <PaymentManager />
        </div>
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
                placeholder={t.labelName}
                value={newDiver.name}
                onChange={(e) => setNewDiver({ ...newDiver, name: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <input
                type="email"
                placeholder={t.labelEmail}
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
                <span className="text-sm font-bold dark:text-white">{t.labelPro}</span>
              </label>
              <div className="flex gap-3">
                <button
                  onClick={handleAddDiver}
                  className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold flex items-center justify-center gap-2 transition"
                >
                  <Save className="w-4 h-4" /> {t.btnSave}
                </button>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 px-4 py-3 bg-gray-400 hover:bg-gray-500 text-white rounded-lg font-bold flex items-center justify-center gap-2 transition"
                >
                  <X className="w-4 h-4" /> {t.btnCancel}
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
                    <div className="grid grid-cols-2 gap-2">
                      <select
                        value={editingDiver.status || 'pending'}
                        onChange={(e) => setEditingDiver({ ...editingDiver, status: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-800 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                      <select
                        value={(editingDiver.role || 'member').toLowerCase() === 'admin' ? 'admin' : 'member'}
                        onChange={(e) => setEditingDiver({ ...editingDiver, role: e.target.value })}
                        className={`w-full px-3 py-2 border rounded text-sm font-bold outline-none ${(editingDiver.role || '').toLowerCase().includes('admin') ? 'border-red-500 bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white'}`}
                      >
                        <option value="member">Member</option>
                        <option value="admin">ADMINISTRATOR</option>
                      </select>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      {console.log('🔘 CHECKBOX RENDER:', { is_pro: editingDiver.is_pro, isPro: editingDiver.isPro, checked: Boolean(editingDiver.is_pro || editingDiver.isPro) })}
                      <input
                        type="checkbox"
                        checked={Boolean(editingDiver.is_pro || editingDiver.isPro)}
                        onChange={(e) => {
                          console.log('👆 CHECKBOX CHANGED TO:', e.target.checked);
                          setEditingDiver({
                            ...editingDiver,
                            is_pro: e.target.checked,
                            isPro: e.target.checked
                          });
                        }}
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
                              <Loader2 className="w-4 h-4 animate-spin" /> {lang === 'BS' ? 'Generisanje...' : 'Generating...'}
                            </>
                          ) : (
                            <>
                              <Key className="w-4 h-4" /> {lang === 'BS' ? 'Generiši PIN' : 'Generate PIN'}
                            </>
                          )}
                        </button>
                      )}
                      <button
                        onClick={() => {
                          console.log('✏️ CLICKED EDIT for:', {
                            name: d.name,
                            d_is_pro: d.is_pro,
                            d_isPro: d.isPro,
                            d_role: d.role
                          });
                          setEditingDiver({
                            id: d.id,
                            name: d.name || '',
                            email: d.email || '',
                            status: d.status || 'pending',
                            is_pro: d.is_pro || d.isPro || false,
                            isPro: d.is_pro || d.isPro || false,
                            role: d.role || 'Adult'
                          });
                        }}
                        className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-bold text-xs flex items-center justify-center gap-2 transition"
                      >
                        <Edit2 className="w-4 h-4" /> {lang === 'BS' ? 'Uredi' : 'Edit'}
                      </button>
                      <button
                        onClick={() => handleDeleteDiver(d.id!)}
                        className="flex-1 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded font-bold text-xs flex items-center justify-center gap-2 transition"
                      >
                        <Trash2 className="w-4 h-4" /> {lang === 'BS' ? 'Obriši' : 'Delete'}
                      </button>
                    </div>
                  </>
                )}
              </div>
            )) : (
              <p className="col-span-full text-center text-gray-500 py-12">{t.noDivers}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
