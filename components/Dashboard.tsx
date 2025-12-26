
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthProvider';
import { TRIP_START_DATE } from '../constants';
import { Language, Theme, MaldivesCountryData, ExchangeRates } from '../types';
import EssentialInfoDashboard from './EssentialInfoDashboard';
import {
  ShieldCheck,
  ChevronRight,
  ExternalLink,
  Info,
  CloudSun,
  Thermometer,
  Anchor,
  Compass,
  ArrowDown,
  CalendarDays,
  X,
  CheckCircle2,
  Waves,
  Loader2,
  Clock,
  Navigation,
  Sparkles,
  Globe,
  Phone,
  Coins,
  HeartPulse,
  Fish,
  AlertTriangle,
  Scale
} from 'lucide-react';
import { getDiveTips } from '../services/geminiService';
import { getPrayerTimes, MaafushiData, PrayerTimes } from '../services/maldivesService';
import { fetchWeather, WeatherData } from '../services/weatherService';
import { fetchMaldivesData, fetchExchangeRates } from '../services/apiService';

interface ModalContent {
  title: string;
  subtitle: string;
  description: string;
  icon: React.ReactNode;
  tags: string[];
}

interface Props {
  lang: Language;
  theme: Theme;
}

const Dashboard: React.FC<Props> = ({ lang, theme }) => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [countryData, setCountryData] = useState<MaldivesCountryData | null>(null);
  const [rates, setRates] = useState<ExchangeRates | null>(null);
  const [modal, setModal] = useState<ModalContent | null>(null);
  const [toast, setToast] = useState<{ message: string; show: boolean }>({ message: '', show: false });
  const { user } = useAuth(); // NEW: Use auth hook for proper user data

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = TRIP_START_DATE.getTime() - now;
      if (distance < 0) return;
      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        mins: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        secs: Math.floor((distance % (1000 * 60)) / 1000)
      });
    }, 1000);

    fetchWeather().then(setWeather);
    fetchMaldivesData().then(setCountryData).catch(console.error);
    fetchExchangeRates().then(setRates).catch(console.error);

    return () => clearInterval(timer);
  }, []);


  const handleExploreInfo = () => {
    setToast({ message: lang === 'BS' ? '🚀 Ronjenje počinje! Istraži informacije ispod.' : '🚀 Journey started! Explore information below.', show: true });
    setTimeout(() => setToast({ message: '', show: false }), 3000);
    const el = document.getElementById('essential-info');
    if (el) window.scrollTo({ top: el.offsetTop - 100, behavior: 'smooth' });
  };

  const openQuickTip = (type: string) => {
    let content: ModalContent;
    if (type === 'culture') {
      content = {
        title: lang === 'BS' ? "Kultura i Zakoni" : "Culture & Laws",
        subtitle: lang === 'BS' ? "Bonton na lokalnim otocima" : "Local Island Etiquette",
        description: lang === 'BS'
          ? "Maldivi su muslimanska zemlja. Na naseljenim otocima poput Maafushija, alkohol je strogo zabranjen (osim na safari brodovima). Oblačenje treba biti pristojno izvan 'Bikini Beach' zona - ramena i koljena trebaju biti pokrivena. Javni iskazi nježnosti su nepoželjni. Poštujte vrijeme molitve kada su trgovine zatvorene."
          : "The Maldives is a Muslim country. On inhabited islands like Maafushi, alcohol is strictly prohibited (except on safari boats). Dress modestly outside 'Bikini Beach' zones - shoulders and knees should be covered. Public displays of affection are discouraged. Respect prayer times when shops are closed.",
        icon: <Scale className="w-12 h-12 text-[#ee9b00]" />,
        tags: ["Respect", "Local Laws", "Modesty"]
      };
    } else if (type === 'emergency') {
      content = {
        title: lang === 'BS' ? "Hitni Kontakti" : "Emergency Hub",
        subtitle: lang === 'BS' ? "Sigurnost na prvom mjestu" : "Safety First",
        description: lang === 'BS'
          ? "U slučaju nezgode pod vodom, odmah obavijestiti Dive Mastera. Maafushi ima medicinski centar i apoteku. Najbliža dekompresiona komora je na Bandos Islandu ili u Maleu (ADK Hospital). Broj policije je 119, hitna pomoć 102. Uvijek nosite DAN karticu sa sobom."
          : "In case of an underwater accident, notify the Dive Master immediately. Maafushi has a medical center and a pharmacy. The nearest decompression chamber is on Bandos Island or in Male (ADK Hospital). Police number is 119, ambulance 102. Always carry your DAN card.",
        icon: <HeartPulse className="w-12 h-12 text-red-500" />,
        tags: ["Medical", "DAN", "Police", "Safety"]
      };
    } else {
      content = {
        title: lang === 'BS' ? "Morski Život" : "Marine Life Guide",
        subtitle: lang === 'BS' ? "Šta očekivati pod vodom" : "What to spot underwater",
        description: lang === 'BS'
          ? "South Male Atoll je poznat po kanalskim zaronima gdje dominiraju sive grebenske ajkule, orlovi raže i napoleon ribe. Maafushi Caves nudi prelijepe meke koralje i makro život poput nudibranča. Na Shark Tanku očekujemo Tiger Sharks i Spinner Sharks. Nikada ne dirajte koralje ili životinje!"
          : "South Male Atoll is famous for channel dives dominated by grey reef sharks, eagle rays, and napoleon fish. Maafushi Caves offers beautiful soft corals and macro life like nudibranchs. At Shark Tank, we expect Tiger Sharks and Spinner Sharks. Never touch corals or animals!",
        icon: <Fish className="w-12 h-12 text-cyan-500" />,
        tags: ["Sharks", "Rays", "Corals", "Macro"]
      };
    }
    setModal(content);
  };

  const translations = {
    BS: {
      heroTitle: "ISTRAŽI MALDIVE",
      heroSubtitle: "RONILAČKE AVANTURE",
      heroDesc: "Dobrodošli na službeni portal KVS SCUBA Maldives 2026. Pratite naš itinerar, dive mape i najnovija ažuriranja u realnom vremenu.",
      startJourney: "Započni Putovanje",
      exploreInfo: "Istraži Informacije",
      scrollDown: "Pomakni dole",
      weatherTitle: "Maafushi Meteo",
      weatherDesc: "Podaci u realnom vremenu",
      expeditionStarts: "EKSPEDICIJA KREĆE ZA...",
      days: "Dana", hours: "Sati", mins: "Min", secs: "Sek",
      aboutMaldives: "O MALDIVIMA",
      culture: "Kultura & Zakoni",
      emergency: "Hitni Kontakti",
      marineLife: "Morski Život",
      officialData: "Zvanični Podaci",
      verified: "PROTOKOLI VERIFIKOVANI"
    },
    EN: {
      heroTitle: "EXPLORE MALDIVES",
      heroSubtitle: "DIVING ADVENTURES",
      heroDesc: "Welcome to the official portal of KVS SCUBA Maldives 2026. Track our itinerary, dive maps, and the latest updates in real-time.",
      startJourney: "Start Journey",
      exploreInfo: "Explore Information",
      scrollDown: "Scroll down",
      weatherTitle: "Maafushi Weather",
      weatherDesc: "Real-time Data",
      expeditionStarts: "EXPEDITION STARTS IN...",
      days: "Days", hours: "Hours", mins: "Mins", secs: "Secs",
      aboutMaldives: "ABOUT MALDIVES",
      culture: "Culture & Laws",
      emergency: "Emergency Hub",
      marineLife: "Marine Life",
      officialData: "Official Data",
      verified: "PROTOCOLS VERIFIED"
    }
  };

  const t = translations[lang];

  return (
    <div className={`animate-in fade-in duration-700 ${theme === 'dark' ? 'bg-[#001219]' : 'bg-[#f8fdff]'}`}>
      {/* Full Screen Hero Section */}
      <section
        className="section-full hero-parallax relative"
        style={{ backgroundImage: `url('https://images.unsplash.com/photo-1544552866-fef1d68c69b5?q=80&w=1920&auto=format&fit=crop')` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-black/60" />
        <div className="relative z-10 w-full mx-auto px-6 text-center text-white flex flex-col items-center justify-center fade-in">
          <div className="flex flex-col items-center">
            <div className="bg-[#0a9396]/40 backdrop-blur-md px-6 py-2 rounded-full border border-white/20 text-sm font-bold uppercase tracking-widest mb-6 flex items-center gap-2 shadow-xl">
              <ShieldCheck className="w-4 h-4 text-[#ee9b00]" /> Verified Expedition 2026
            </div>
            <h1 className="text-5xl md:text-8xl font-black tracking-tight leading-tight mb-4 drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)]">
              {t.heroTitle}<br /><span className="text-[#ee9b00]">{t.heroSubtitle}</span>
            </h1>
            <p className="text-xl md:text-2xl font-light text-gray-100 max-w-3xl mx-auto drop-shadow-md leading-relaxed">
              {t.heroDesc}
            </p>
          </div>

          <div className="my-8 flex flex-col items-center gap-2 animate-bounce cursor-pointer opacity-80" onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}>
            <span className="text-[10px] uppercase font-bold tracking-[0.3em] text-white">{t.scrollDown}</span>
            <ArrowDown className="w-6 h-6 text-white" />
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <button className="btn-primary px-10 py-5 text-sm tracking-[0.2em]" onClick={() => {
              setToast({ message: lang === 'BS' ? '🌊 Putovanje počinje! Skrouj da vidíš više.' : '🌊 Journey starts! Scroll to learn more.', show: true });
              setTimeout(() => setToast({ message: '', show: false }), 3000);
              window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
            }}>
              {t.startJourney}
            </button>
            <button className="btn-accent px-10 py-5 text-sm tracking-[0.2em]" onClick={handleExploreInfo}>
              {t.exploreInfo}
            </button>
          </div>
        </div>
      </section>

      {/* Quick Action Tiles Section - NEW */}
      <section className="py-12 px-6 mt-6 md:-mt-10 relative z-20">
        <div className="w-full mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { id: 'culture', icon: Scale, color: 'bg-amber-500', label: t.culture },
            { id: 'emergency', icon: HeartPulse, color: 'bg-red-500', label: t.emergency },
            { id: 'marine', icon: Fish, color: 'bg-cyan-500', label: t.marineLife }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => openQuickTip(item.id)}
              className={`p-8 rounded-[40px] flex items-center gap-6 shadow-2xl transition-all hover:scale-[1.02] active:scale-95 border ${theme === 'dark' ? 'bg-[#001a24] border-white/10 shadow-black/40' : 'bg-white border-cyan-50 shadow-cyan-900/5'}`}
            >
              <div className={`${item.color} p-4 rounded-3xl shadow-lg`}>
                <item.icon className="w-8 h-8 text-white" />
              </div>
              <div className="text-left">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Quick Guide</p>
                <h4 className={`text-xl font-black ${theme === 'dark' ? 'text-white' : 'text-[#001219]'}`}>{item.label}</h4>
              </div>
              <ChevronRight className="w-6 h-6 ml-auto text-gray-300" />
            </button>
          ))}
        </div>
      </section>

      {/* Weather and Countdown Section */}
      <section className={`py-24 px-6 relative overflow-hidden transition-colors duration-300 ${theme === 'dark' ? 'bg-[#001219]' : 'bg-white'}`}>
        <div className="w-full mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Weather Card */}
          <div className={`rounded-[40px] p-10 space-y-8 border transition-all duration-300 ${theme === 'dark' ? 'bg-[#001a24] border-white/10 shadow-2xl shadow-black/40' : 'bg-white border-cyan-50 shadow-xl shadow-cyan-900/5'}`}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-black">{t.weatherTitle}</h3>
                <p className="text-[#0a9396] font-bold text-sm uppercase tracking-widest">{t.weatherDesc} • {MaafushiData.atoll}</p>
              </div>
              <CloudSun className="w-12 h-12 text-[#ee9b00]" />
            </div>
            {weather ? (
              <div className="flex flex-col md:flex-row items-center gap-12">
                <div className="flex items-center gap-6">
                  <img src={`https://openweathermap.org/img/wn/${weather.current.icon}@2x.png`} className="w-24 h-24" />
                  <div>
                    <div className="text-7xl font-black tracking-tighter">{weather.current.temp}°C</div>
                    <p className="text-sm font-bold uppercase text-[#0a9396]">{weather.current.description}</p>
                  </div>
                </div>
                <div className="flex-1 flex justify-around w-full">
                  {weather.forecast.map((day, i) => (
                    <div key={i} className="text-center">
                      <p className="text-xs font-black text-gray-400 mb-2">{day.date}</p>
                      <p className="text-base font-black">{day.temp}°</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : <Loader2 className="animate-spin text-[#0a9396] mx-auto" />}
          </div>

          {/* Countdown Card */}
          <div className="space-y-8">
            <h2 className="text-4xl md:text-6xl font-black leading-tight tracking-tight">{t.expeditionStarts}</h2>
            <div className="grid grid-cols-4 gap-4">
              {[{ label: t.days, val: timeLeft.days }, { label: t.hours, val: timeLeft.hours }, { label: t.mins, val: timeLeft.mins }, { label: t.secs, val: timeLeft.secs }].map((item) => (
                <div key={item.label} className={`rounded-[32px] p-6 text-center border transition-all duration-300 ${theme === 'dark' ? 'bg-[#001a24] border-white/10' : 'bg-white border-cyan-50 shadow-sm'}`}>
                  <div className="text-5xl font-black tracking-tighter text-[#0a9396]">{item.val}</div>
                  <div className="text-xs uppercase font-black text-gray-400 mt-2">{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Country Data Section */}
      <section className="py-24 px-6 bg-[#001219]">
        <div className="w-full mx-auto flex flex-col md:flex-row gap-12 items-center">
          <div className="flex-1 space-y-6 text-white">
            <span className="text-[#ee9b00] font-black text-sm uppercase tracking-[0.4em]">{t.aboutMaldives}</span>
            <h2 className="text-4xl md:text-6xl font-black leading-tight">OFFICIAL DATA</h2>
            {rates && (
              <div className="flex gap-4">
                <div className="bg-emerald-500/10 p-6 rounded-3xl border border-emerald-500/20">
                  <p className="text-xs font-black text-emerald-500 uppercase mb-1">EUR / BAM</p>
                  <p className="text-2xl font-black">{rates.BAM.toFixed(2)} KM</p>
                </div>
                <div className="bg-cyan-500/10 p-6 rounded-3xl border border-cyan-500/20">
                  <p className="text-xs font-black text-cyan-500 uppercase mb-1">EUR / USD</p>
                  <p className="text-2xl font-black">${rates.USD.toFixed(2)}</p>
                </div>
              </div>
            )}
          </div>
          <div className="flex-1 w-full grid grid-cols-2 gap-4">
            {countryData && [
              { icon: Globe, label: 'Capital', val: countryData.capital },
              { icon: Coins, label: 'Currency', val: countryData.currency },
              { icon: Phone, label: 'Call Code', val: countryData.callingCode },
              { icon: ShieldCheck, label: 'Language', val: countryData.languages?.[0] || 'English' }
            ].map((item, i) => (
              <div key={i} className="bg-white/5 border border-white/10 p-6 rounded-[32px] space-y-2">
                <item.icon className="w-4 h-4 text-cyan-400" />
                <p className="text-sm font-black text-gray-400 uppercase">{item.label}</p>
                <p className="text-2xl font-black text-white">{item.val}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Essential Info Dashboard Section */}
      <section id="essential-info" className="py-24 px-6 bg-gradient-to-b from-transparent to-white/5 dark:to-white/0">
        <EssentialInfoDashboard />
      </section>


      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="w-full max-w-2xl rounded-[60px] bg-[#001219] text-white p-12 md:p-16 relative border border-white/10 shadow-2xl">
            <button onClick={() => setModal(null)} className="absolute top-8 right-8 p-3 bg-white/5 rounded-full hover:bg-white/10"><X className="w-6 h-6" /></button>
            <div className="flex flex-col gap-8">
              <div className="flex items-center gap-6">
                <div className="p-8 bg-white/5 rounded-[40px]">{modal.icon}</div>
                <div>
                  <span className="text-[#ee9b00] font-black text-sm uppercase tracking-widest">{modal.subtitle}</span>
                  <h3 className="text-4xl font-black mt-2">{modal.title}</h3>
                </div>
              </div>
              <p className="text-xl leading-relaxed text-gray-300">{modal.description}</p>
              <div className="flex flex-wrap gap-3">
                {modal.tags.map(tag => (
                  <span key={tag} className="px-4 py-2 bg-cyan-500/10 text-cyan-400 font-bold text-xs uppercase rounded-full border border-cyan-500/20">{tag}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast.show && (
        <div className={`fixed bottom-10 left-1/2 -translate-x-1/2 px-6 py-4 rounded-2xl shadow-2xl text-center font-bold animate-in slide-in-from-bottom-5 duration-300 z-50 ${theme === 'dark' ? 'bg-cyan-600 text-white' : 'bg-cyan-500 text-white'}`}>
          {toast.message}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
