
import React, { useState, useEffect } from 'react';
import { Diver, Language, Theme } from '../types';
import { fetchDiversFromSupabase } from '../services/supabaseService';

const DEFAULT_OCEAN_IMAGE = "https://images.unsplash.com/photo-1544551763-77ef2d0cfc6c?q=80&w=1170&auto=format&fit=crop";
import { 
  Search, 
  Users, 
  X, 
  ShieldAlert, 
  Phone, 
  Loader2, 
  Waves, 
  Mail,
  MapPin,
  Star,
  Cake,
  Hash,
  RefreshCw,
  UtensilsCrossed,
  HeartPulse,
  CheckCircle,
  ShieldCheck,
  TrendingUp,
  ChevronRight,
  User
} from 'lucide-react';

interface Props {
  isAdmin: boolean;
  lang: Language;
  theme: Theme;
}

const ADMIN_NAMES = ["Davor", "Adnan", "Samir"];

const Participants: React.FC<Props> = ({ isAdmin, lang, theme }) => {
  const [divers, setDivers] = useState<Diver[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDiver, setSelectedDiver] = useState<Diver | null>(null);

  const loadData = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const data = await fetchParticipantsFromSheet();
      setDivers(data);
      localStorage.setItem('kvs_divers_cache', JSON.stringify(data));
    } catch (err) {
      console.error("Failed to sync sheet data");
      const cached = localStorage.getItem('kvs_divers_cache');
      if (cached) setDivers(JSON.parse(cached));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(() => loadData(), 300000);
    return () => clearInterval(interval);
  }, []);

  const filteredDivers = divers.filter(d => 
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const translations = {
    BS: {
      crew: "KVS Crew",
      subtitle: "Službena lista putnika",
      members: "Članova",
      searchPlaceholder: "Traži po imenu ili emailu...",
      verifiedMember: "VERIFIKOVANI ČLAN",
      administrator: "ADMINISTRATOR",
      experience: "Iskustvo",
      totalDives: "Urona ukupno",
      status: "Status",
      ready: "SPREMAN",
      dietary: "Dietary Notes",
      none: "Nema ograničenja",
      email: "E-mail adresa",
      phone: "Kontakt telefon",
      location: "Lokacija",
      emergency: "KONTAKT ZA HITNE SLUČAJEVE",
      emergencyRel: "Ime i Prezime",
      emergencyPhone: "Broj Telefona",
      close: "Zatvori Profil",
      scanning: "Skeniranje članova tima...",
      details: "Vidi detalje"
    },
    EN: {
      crew: "KVS Crew",
      subtitle: "Official Passenger List",
      members: "Members",
      searchPlaceholder: "Search by name or email...",
      verifiedMember: "VERIFIED MEMBER",
      administrator: "ADMINISTRATOR",
      experience: "Experience",
      totalDives: "Total Dives",
      status: "Status",
      ready: "READY",
      dietary: "Dietary Notes",
      none: "None",
      email: "Email Address",
      phone: "Contact Phone",
      location: "Location",
      emergency: "EMERGENCY CONTACT",
      emergencyRel: "Full Name",
      emergencyPhone: "Phone Number",
      close: "Close Profile",
      scanning: "Scanning team members...",
      details: "View details"
    }
  };

  const t = translations[lang];

  const isUserAdmin = (name: string) => {
    return ADMIN_NAMES.some(adminName => name.toLowerCase().includes(adminName.toLowerCase()));
  };

  if (loading && divers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <Loader2 className="w-10 h-10 text-[#0a9396] animate-spin" />
        <p className="text-sm font-black text-[#005f73] uppercase tracking-[0.3em] animate-pulse">{t.scanning}</p>
      </div>
    );
  }

  return (
    <div className={`max-w-7xl mx-auto px-6 space-y-10 pb-24 animate-in slide-in-from-bottom duration-500 transition-colors duration-300 ${theme === 'dark' ? 'bg-[#001219]' : ''}`}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pt-10">
        <div className="flex items-center gap-4">
          <div className="bg-[#005f73] p-4 rounded-[24px] shadow-xl shadow-[#005f73]/20">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className={`text-3xl font-black tracking-tight flex items-center gap-3 ${theme === 'dark' ? 'text-white' : 'text-[#001219]'}`}>
              {t.crew}
            </h2>
            <p className="text-[10px] font-black text-[#0a9396] uppercase tracking-[0.3em] mt-1">{t.subtitle}</p>
          </div>
          <button 
            onClick={() => loadData(true)} 
            className={`p-2 hover:bg-cyan-50/10 rounded-full transition-colors ml-2 ${refreshing ? 'animate-spin text-[#0a9396]' : 'text-gray-300 hover:text-[#0a9396]'}`}
            title="Sync"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
        <div className={`flex items-center gap-2 px-6 py-2 rounded-full border shadow-sm ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-cyan-50'}`}>
          <span className={`text-sm font-black ${theme === 'dark' ? 'text-cyan-400' : 'text-[#001219]'}`}>{divers.length}</span>
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t.members}</span>
        </div>
      </div>

      <div className="relative group max-w-xl">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-[#0a9396] transition-colors" />
        <input 
          type="text"
          placeholder={t.searchPlaceholder}
          className={`w-full border shadow-sm rounded-full py-5 pl-14 pr-6 text-sm focus:outline-none focus:ring-4 transition-all placeholder-gray-400 ${
            theme === 'dark' ? 'bg-white/5 border-white/10 text-white focus:ring-cyan-500/20' : 'bg-white border-cyan-50 text-[#001219] focus:ring-cyan-500/10'
          }`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredDivers.map((diver) => {
          const isActuallyAdmin = isUserAdmin(diver.name);
          return (
            <div 
              key={diver.id} 
              onClick={() => setSelectedDiver(diver)}
              className={`rounded-[48px] p-6 pt-10 flex flex-col items-center text-center group hover:shadow-2xl transition-all duration-500 cursor-pointer border relative overflow-hidden ${
                theme === 'dark' ? 'bg-white/5 border-white/10 hover:border-[#0a9396]/30' : 'bg-white border-cyan-50 hover:border-[#0a9396]/30'
              }`}
            >
              <div className={`absolute top-0 right-0 w-32 h-32 rounded-full -translate-y-1/2 translate-x-1/2 transition-colors ${theme === 'dark' ? 'bg-cyan-500/5 group-hover:bg-[#0a9396]/10' : 'bg-cyan-50 group-hover:bg-[#0a9396]/10'}`} />
              
              <div className="relative w-full mb-6 flex flex-col items-center justify-center" style={{ overflow: 'visible' }}>
                <div className="absolute inset-0 bg-gradient-to-br from-[#0a9396] to-[#005f73] rounded-[32px] blur-2xl opacity-10 group-hover:opacity-30 transition-opacity" />
                
                {/* ADJUSTED WHITE FRAME: Height increased and shifted down (spušten rub) */}
                <div 
                  className={`w-[170px] rounded-[48px] relative z-30 border-[6px] border-white transition-all duration-500 group-hover:scale-110 group-hover:-rotate-1 flex flex-col items-center bg-white shadow-[0_20px_50px_rgba(0,95,115,0.2)] group-hover:shadow-[0_30px_70px_rgba(0,95,115,0.35)]`}
                  style={{ overflow: 'visible' }}
                >
                  {/* Image Section: Height increased for full visibility */}
                  <div className="w-full h-44 flex items-center justify-center p-4">
                    {diver.photo && diver.photo !== '' ? (
                      <img 
                        src={diver.photo} 
                        alt={diver.name} 
                        className="w-full h-full object-contain block"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = DEFAULT_OCEAN_IMAGE;
                        }}
                      />
                    ) : (
                      <User className="w-16 h-16 text-gray-300" />
                    )}
                  </div>

                  {/* VERIFIKOVANI ČLAN / ADMINISTRATOR Tag: Integrated into frame base */}
                  <div className={`w-full py-3 border-t flex items-center justify-center gap-1.5 px-3 ${isActuallyAdmin ? 'bg-[#ee9b00]/5 border-[#ee9b00]/10' : 'bg-emerald-500/5 border-emerald-500/10'}`}>
                    <CheckCircle className={`w-3 h-3 ${isActuallyAdmin ? 'text-[#ee9b00]' : 'text-emerald-500'}`} />
                    <span className={`text-[8px] font-black uppercase tracking-widest leading-none ${isActuallyAdmin ? 'text-[#ee9b00]' : 'text-emerald-600'}`}>
                      {isActuallyAdmin ? t.administrator : t.verifiedMember}
                    </span>
                  </div>
                </div>

                {isActuallyAdmin && (
                  <div className="absolute -top-3 -right-2 bg-[#ee9b00] p-2 rounded-2xl border-4 border-white shadow-lg z-40 transform rotate-12">
                    <Star className="w-4 h-4 text-white fill-current" />
                  </div>
                )}
              </div>

              <h4 className={`font-black text-xl mb-2 truncate w-full tracking-tight px-4 ${theme === 'dark' ? 'text-white' : 'text-[#001219]'}`}>{diver.name}</h4>
              
              <div className="flex flex-wrap justify-center gap-2 mt-2 px-2">
                <span className={`text-[9px] px-3 py-1 rounded-full font-black uppercase tracking-widest border ${
                  isActuallyAdmin ? 'bg-amber-50 text-amber-600 border-amber-100' : 
                  diver.role === 'Child' ? 'bg-pink-50 text-pink-600 border-pink-100' : 'bg-cyan-50 text-[#005f73] border-cyan-100'
                }`}>
                  {isActuallyAdmin ? t.administrator : (diver.role === 'Child' ? 'Child' : 'Member')}
                </span>
                
                {isAdmin && (
                  <span className="badge-placeno text-[9px] px-3 py-1 rounded-full font-black uppercase tracking-widest bg-emerald-500 text-white shadow-lg shadow-emerald-500/20">
                    PLAĆENO
                  </span>
                )}
              </div>

              <div className="mt-8 flex items-center justify-between w-full px-6 py-4 border-t border-gray-100/5 group-hover:bg-[#0a9396]/5 rounded-b-[48px] transition-all duration-500">
                 <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t.details}</span>
                 <ChevronRight className="w-4 h-4 text-[#0a9396] transform group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Diver Detail Modal */}
      {selectedDiver && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/80 backdrop-blur-xl animate-in fade-in duration-500 overflow-y-auto">
          <div className={`w-full max-w-lg rounded-[60px] overflow-hidden relative shadow-2xl animate-in zoom-in-95 duration-500 border-none my-auto ${theme === 'dark' ? 'bg-[#001219] text-white' : 'bg-white text-[#001219]'}`}>
            <button 
              onClick={() => setSelectedDiver(null)}
              className="absolute top-8 right-8 p-3 bg-gray-500/10 rounded-full hover:bg-red-500/20 hover:text-red-500 transition-all z-[100] shadow-lg"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="h-44 bg-gradient-to-br from-[#0a9396] to-[#005f73] relative overflow-hidden">
              <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px]" />
              <div className="absolute -bottom-24 left-1/2 -translate-x-1/2 z-50 flex items-center justify-center">
                <div 
                  className="w-60 rounded-[56px] border-[10px] border-white shadow-[0_30px_70px_rgba(0,0,0,0.5)] bg-white relative flex flex-col items-center transform transition-transform hover:scale-105 duration-700"
                  style={{ overflow: 'visible' }}
                >
                  <div className="w-full h-60 flex items-center justify-center p-6">
                    {selectedDiver.photo && selectedDiver.photo !== '' ? (
                      <img 
                        src={selectedDiver.photo} 
                        className="w-full h-full object-contain block" 
                        alt={selectedDiver.name} 
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = DEFAULT_OCEAN_IMAGE;
                        }} 
                      />
                    ) : (
                      <User className="w-20 h-20 text-gray-200" />
                    )}
                  </div>
                  {/* Verified badge mirrored in modal frame bottom */}
                  <div className={`w-full py-4 flex items-center justify-center gap-2 px-6 border-t ${isUserAdmin(selectedDiver.name) ? 'bg-[#ee9b00]/10 border-[#ee9b00]/5' : 'bg-emerald-500/10 border-emerald-500/5'}`}>
                     <CheckCircle className={`w-4 h-4 ${isUserAdmin(selectedDiver.name) ? 'text-[#ee9b00]' : 'text-emerald-500'}`} />
                     <span className={`text-[10px] font-black uppercase tracking-[0.3em] ${isUserAdmin(selectedDiver.name) ? 'text-[#ee9b00]' : 'text-emerald-600'}`}>
                        {isUserAdmin(selectedDiver.name) ? t.administrator : t.verifiedMember}
                     </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-44 pb-12 px-10 text-center">
              <h3 className="text-4xl font-black tracking-tight">{selectedDiver.name}</h3>
              
              <div className="flex items-center justify-center gap-3 mt-3">
                <span className="text-sm text-[#0a9396] font-black uppercase tracking-[0.3em]">
                  {isUserAdmin(selectedDiver.name) ? t.administrator : selectedDiver.role}
                </span>
                <span className="text-gray-300">•</span>
                <div className="flex items-center gap-2 text-sm font-bold text-gray-500">
                  <Cake className="w-4 h-4 text-[#ee9b00]" />
                  {selectedDiver.birthDate} ({selectedDiver.age} g.)
                </div>
              </div>

              <div className="mt-10 grid grid-cols-2 gap-4">
                <div className="bg-cyan-500/5 p-6 rounded-[32px] border border-cyan-500/10">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Waves className="w-5 h-5 text-cyan-500" />
                    <span className="text-[10px] font-black text-cyan-500 uppercase tracking-widest">{t.experience}</span>
                  </div>
                  <div className={`text-3xl font-black ${theme === 'dark' ? 'text-white' : 'text-[#001219]'}`}>{selectedDiver.dives}</div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">{t.totalDives}</p>
                </div>
                <div className="bg-emerald-500/5 p-6 rounded-[32px] border border-emerald-500/10">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <TrendingUp className="w-5 h-5 text-emerald-500" />
                    <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">{t.status}</span>
                  </div>
                  <div className={`text-2xl font-black ${theme === 'dark' ? 'text-white' : 'text-[#001219]'}`}>{t.ready}</div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Expedition ready</p>
                </div>
              </div>

              <div className={`mt-6 border p-6 rounded-[32px] flex items-center gap-6 shadow-sm ${theme === 'dark' ? 'bg-amber-500/5 border-amber-500/10' : 'bg-[#fff8f0] border-amber-100'}`}>
                <div className="p-4 bg-white rounded-2xl shadow-sm">
                  <UtensilsCrossed className="w-8 h-8 text-[#ee9b00]" />
                </div>
                <div className="text-left">
                  <p className="text-[10px] text-amber-500 font-black uppercase tracking-[0.2em]">{t.dietary}</p>
                  <p className={`text-base font-bold mt-1 ${theme === 'dark' ? 'text-white' : 'text-[#001219]'}`}>{selectedDiver.dietaryRestrictions || t.none}</p>
                </div>
              </div>

              <div className="mt-10 space-y-4 text-left">
                <div className="flex items-center gap-4 group">
                  <div className="w-12 h-12 rounded-2xl bg-gray-500/5 flex items-center justify-center group-hover:bg-cyan-500/10 transition-colors">
                    <Mail className="w-5 h-5 text-cyan-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{t.email}</p>
                    <p className={`text-sm font-bold ${theme === 'dark' ? 'text-gray-200' : 'text-[#001219]'}`}>{selectedDiver.email || 'N/A'}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 group">
                  <div className="w-12 h-12 rounded-2xl bg-gray-500/5 flex items-center justify-center group-hover:bg-cyan-500/10 transition-colors">
                    <Phone className="w-5 h-5 text-cyan-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{t.phone}</p>
                    <p className={`text-sm font-bold ${theme === 'dark' ? 'text-gray-200' : 'text-[#001219]'}`}>{selectedDiver.phone1 || 'N/A'}</p>
                  </div>
                </div>

                {isAdmin && (
                  <div className="pt-10 mt-6 border-t border-gray-500/10 space-y-6 animate-in slide-in-from-top-4 duration-500">
                    <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-[32px] p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <HeartPulse className="w-5 h-5 text-emerald-500" />
                        <h4 className="text-[10px] font-black uppercase text-emerald-500 tracking-[0.3em]">{t.emergency}</h4>
                      </div>
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <p className="text-[9px] text-emerald-600/60 uppercase font-black tracking-widest">{t.emergencyRel}</p>
                          <p className={`text-sm font-black mt-1 ${theme === 'dark' ? 'text-white' : 'text-[#001219]'}`}>
                            {selectedDiver.emergencyContact?.name}
                          </p>
                        </div>
                        <div>
                          <p className="text-[9px] text-emerald-600/60 uppercase font-black tracking-widest">{t.emergencyPhone}</p>
                          <p className={`text-sm font-black mt-1 tracking-wider ${theme === 'dark' ? 'text-white' : 'text-[#001219]'}`}>{selectedDiver.emergencyContact?.phone}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <button 
                onClick={() => setSelectedDiver(null)}
                className="btn-primary w-full mt-10 py-5 text-xs tracking-[0.3em]"
              >
                {t.close}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Participants;
