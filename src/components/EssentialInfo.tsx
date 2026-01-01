
import React, { useState, useEffect } from 'react';
import {
    DollarSign,
    Heart,
    Plane,
    Globe,
    Clock,
    MapPin,
    Phone,
    AlertCircle,
    ChevronDown,
    Loader2,
    Moon,
    Sun,
    Coffee,
    Flag
} from 'lucide-react';
import {
    fetchExchangeRates,
    fetchMaldivesData,
    fetchHospitals,
    fetchPharmacies,
    fetchExchangeBureaus,
    getPrayerTimes,
    getMaldivesTime
} from '../services/apiService';
import { ExchangeRates } from '../types';

interface Section {
    id: string;
    title: string;
    icon: React.ReactNode;
    color: string;
}

interface EssentialInfoProps {
    lang?: 'BS' | 'EN';
    theme?: 'light' | 'dark';
}

const EssentialInfo: React.FC<EssentialInfoProps> = ({ lang = 'BS', theme = 'light' }) => {
    const [expandedSection, setExpandedSection] = useState<string | null>(null);
    const [rates, setRates] = useState<ExchangeRates | null>(null);
    const [maldivesData, setMaldivesData] = useState<any>(null);
    const [hospitals, setHospitals] = useState<any[]>([]);
    const [pharmacies, setPharmacies] = useState<any[]>([]);
    const [exchangeBureaus, setExchangeBureaus] = useState<any[]>([]);
    const [prayerTimes, setPrayerTimes] = useState<any>(null);
    const [maldivesTime, setMaldivesTime] = useState<string>('');
    const [loading, setLoading] = useState(true);

    const t = {
        loading: lang === 'BS' ? 'Učitavanje ključnih informacija...' : 'Loading essential info...',
        importantInfo: lang === 'BS' ? 'Važne Informacije' : 'Important Information',
        keyInfo: lang === 'BS' ? 'KLJUČNE' : 'ESSENTIAL',
        infoSub: lang === 'BS' ? 'INFORMACIJE' : 'INFO',
        subtitle: lang === 'BS' ? 'Sve što trebate znati prije i tijekom ekspedicije' : 'Everything you need to know before and during the expedition',
        currentTime: lang === 'BS' ? 'Trenutno Vrijeme na Maldivima' : 'Current Time in Maldives',
        money: lang === 'BS' ? 'Novac & Razmjena' : 'Money & Exchange',
        health: lang === 'BS' ? 'Zdravstvo' : 'Health',
        transport: lang === 'BS' ? 'Transport' : 'Transport',
        country: lang === 'BS' ? 'O Maldivima' : 'About Maldives',
        prayer: lang === 'BS' ? 'Vjerska Vremena' : 'Prayer Times',
        exchangeRate: lang === 'BS' ? 'Trenutni Tečaj' : 'Current Rates',
        updated: lang === 'BS' ? 'Ažurirano' : 'Updated',
        emergency: lang === 'BS' ? 'Hitne Službe' : 'Emergency Services',
        ambulance: lang === 'BS' ? 'Hitna Pomoć' : 'Ambulance',
        fire: lang === 'BS' ? 'Vatrogasci' : 'Fire Dept',
        hospitalsLabel: lang === 'BS' ? 'Bolnice' : 'Hospitals',
        pharmaciesLabel: lang === 'BS' ? 'Apoteke' : 'Pharmacies',
        notes: lang === 'BS' ? 'Važne Napomene' : 'Important Notes'
    };

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const [ratesData, countryData, hospitalsData, pharmaciesData, exchangeData, prayersData] = await Promise.all([
                    fetchExchangeRates(),
                    fetchMaldivesData().catch(() => null),
                    fetchHospitals().catch(() => []),
                    fetchPharmacies().catch(() => []),
                    fetchExchangeBureaus().catch(() => []),
                    getPrayerTimes().catch(() => null)
                ]);

                setRates(ratesData);
                setMaldivesData(countryData);
                setHospitals(hospitalsData);
                setPharmacies(pharmaciesData);
                setExchangeBureaus(exchangeData);
                setPrayerTimes(prayersData);

                const now = getMaldivesTime();
                setMaldivesTime(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }));
            } catch (error) {
                console.error('Error loading essential info:', error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
        const timer = setInterval(() => {
            const now = getMaldivesTime();
            setMaldivesTime(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }));
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const sections: Section[] = [
        { id: 'money', title: t.money, icon: <DollarSign className="w-6 h-6" />, color: 'from-emerald-400 to-green-500' },
        { id: 'health', title: t.health, icon: <Heart className="w-6 h-6" />, color: 'from-red-400 to-pink-500' },
        { id: 'transport', title: t.transport, icon: <Plane className="w-6 h-6" />, color: 'from-blue-400 to-cyan-500' },
        { id: 'country', title: t.country, icon: <Globe className="w-6 h-6" />, color: 'from-orange-400 to-amber-500' },
        { id: 'prayer', title: t.prayer, icon: <Moon className="w-6 h-6" />, color: 'from-indigo-400 to-purple-500' }
    ];

    const toggleSection = (id: string) => {
        setExpandedSection(expandedSection === id ? null : id);
    };

    if (loading) {
        return (
            <div className={`min-h-screen flex items-center justify-center ${theme === 'dark' ? 'bg-[#001219]' : 'bg-[#f8fdff]'}`}>
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-[#0a9396] animate-spin mx-auto mb-4" />
                    <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} font-black uppercase tracking-widest text-[10px]`}>{t.loading}</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen pb-24 pt-20 px-6 transition-colors duration-300 ${theme === 'dark'
            ? 'bg-[#001219] text-white'
            : 'bg-[#f8fdff] text-[#001219]'
            }`}>
            <div className="max-w-4xl mx-auto space-y-12">
                <section className="text-center space-y-4">
                    <span className="text-[#ee9b00] font-black text-[10px] uppercase tracking-[0.5em] block">{t.importantInfo}</span>
                    <h1 className="text-6xl md:text-7xl font-black tracking-tight leading-none uppercase">
                        {t.keyInfo}<br />
                        <span className="text-[#0a9396]">{t.infoSub}</span>
                    </h1>
                    <p className={`text-lg opacity-60 font-medium max-w-xl mx-auto ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        {t.subtitle}
                    </p>
                </section>

                <div className="bg-gradient-to-br from-[#005f73] to-[#0a9396] text-white rounded-[40px] p-10 shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-700" />
                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                        <div className="space-y-4 text-center md:text-left">
                            <p className="text-cyan-100/80 text-[10px] font-black uppercase tracking-[0.3em]">{t.currentTime}</p>
                            <p className="text-7xl font-black tracking-tighter tabular-nums">{maldivesTime}</p>
                            <div className="flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full w-fit mx-auto md:mx-0 border border-white/10">
                                <Globe size={12} className="text-cyan-300" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-cyan-200">UTC+5:00 (Male)</span>
                            </div>
                        </div>
                        <Clock className="w-32 h-32 md:w-40 md:h-40 text-white/10 animate-pulse" />
                    </div>
                </div>

                <div className="space-y-4">
                    {sections.map((section) => (
                        <div
                            key={section.id}
                            className={`rounded-[32px] border transition-all duration-300 overflow-hidden ${theme === 'dark'
                                ? 'bg-white/5 border-white/10 hover:bg-white/[0.07]'
                                : 'bg-white border-cyan-50 shadow-xl shadow-cyan-900/5 hover:shadow-cyan-900/10'
                                }`}
                        >
                            <button
                                onClick={() => toggleSection(section.id)}
                                className="w-full flex items-center justify-between p-8 group"
                            >
                                <div className="flex items-center gap-6">
                                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${section.color} text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                                        {section.icon}
                                    </div>
                                    <div className="text-left">
                                        <h3 className="text-xl font-black uppercase tracking-tight">{section.title}</h3>
                                    </div>
                                </div>
                                <div className={`p-2 rounded-full border transition-all duration-300 ${expandedSection === section.id
                                    ? 'rotate-180 bg-cyan-600 border-cyan-500 text-white'
                                    : theme === 'dark' ? 'border-white/10 text-gray-400' : 'border-cyan-50 text-gray-400'
                                    }`}>
                                    <ChevronDown size={20} />
                                </div>
                            </button>

                            {expandedSection === section.id && (
                                <div className={`px-8 pb-8 space-y-8 animate-in fade-in slide-in-from-top-4 duration-500 ${theme === 'dark' ? 'border-t border-white/5' : 'border-t border-cyan-50'
                                    }`}>
                                    {section.id === 'money' && rates && (
                                        <div className="space-y-10 pt-8">
                                            <div className={`p-8 rounded-[32px] border ${theme === 'dark' ? 'bg-emerald-500/5 border-emerald-500/10' : 'bg-emerald-50 border-emerald-100'
                                                }`}>
                                                <h4 className="flex items-center gap-3 text-xs font-black uppercase tracking-[0.2em] text-emerald-600 mb-8">
                                                    <DollarSign size={16} /> {t.exchangeRate}
                                                </h4>
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                    {[
                                                        { label: 'EUR → BAM', value: rates.BAM.toFixed(4) },
                                                        { label: 'EUR → USD', value: rates.USD.toFixed(4) }
                                                    ].map((item, i) => (
                                                        <div key={i} className={`p-6 rounded-2xl border ${theme === 'dark' ? 'bg-white/5 border-white/5' : 'bg-white border-emerald-100'
                                                            }`}>
                                                            <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-2">{item.label}</p>
                                                            <p className="text-3xl font-black tabular-nums">{item.value}</p>
                                                        </div>
                                                    ))}
                                                    <div className={`p-6 rounded-2xl border flex flex-col justify-center ${theme === 'dark' ? 'bg-white/5 border-white/5' : 'bg-white border-emerald-100'
                                                        }`}>
                                                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">{t.updated}</p>
                                                        <p className="text-sm font-bold opacity-70">{new Date(rates.date).toLocaleDateString(lang === 'BS' ? 'bs-BA' : 'en-US')}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <h4 className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] opacity-40">
                                                    <MapPin size={14} /> Local Bureaus
                                                </h4>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {exchangeBureaus.slice(0, 4).map((b) => (
                                                        <div key={b.id} className={`p-6 rounded-3xl border ${theme === 'dark' ? 'bg-white/5 border-white/5' : 'bg-gray-50 border-gray-100'
                                                            }`}>
                                                            <p className="font-black text-sm uppercase mb-1">{b.name}</p>
                                                            <p className="text-xs opacity-60 font-medium">{b.phone || 'Contact at arrival'}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {section.id === 'health' && (
                                        <div className="space-y-10 pt-8">
                                            <div className={`p-8 rounded-[32px] border ${theme === 'dark' ? 'bg-red-500/5 border-red-500/10' : 'bg-red-50 border-red-100'
                                                }`}>
                                                <h4 className="flex items-center gap-3 text-xs font-black uppercase tracking-[0.2em] text-red-600 mb-8">
                                                    <AlertCircle size={16} /> {t.emergency}
                                                </h4>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {[
                                                        { label: t.ambulance, sub: 'Immediate response', num: '999' },
                                                        { label: t.fire, sub: 'Fire & Rescue', num: '998' }
                                                    ].map((item, i) => (
                                                        <div key={i} className={`p-6 rounded-2xl border flex items-center justify-between ${theme === 'dark' ? 'bg-white/5 border-white/5' : 'bg-white border-red-100'
                                                            }`}>
                                                            <div>
                                                                <p className="font-black text-sm uppercase">{item.label}</p>
                                                                <p className="text-[10px] opacity-40 font-bold uppercase tracking-widest">{item.sub}</p>
                                                            </div>
                                                            <p className="text-4xl font-black text-red-600 tracking-tighter">{item.num}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                <div>
                                                    <h4 className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mb-4">
                                                        <Heart size={14} /> {t.hospitalsLabel}
                                                    </h4>
                                                    <div className="space-y-2">
                                                        {hospitals.slice(0, 3).map((h) => (
                                                            <div key={h.id} className={`p-5 rounded-2xl border ${theme === 'dark' ? 'bg-white/5 border-white/5' : 'bg-gray-50 border-gray-100'}`}>
                                                                <p className="font-black text-xs uppercase">{h.name}</p>
                                                            </div>
                                                        ))}
                                                        <p className="text-[10px] opacity-50 px-2 leading-relaxed">
                                                            * Indira Gandhi Memorial Hospital (Male) is the main facility.
                                                        </p>
                                                    </div>
                                                </div>
                                                <div>
                                                    <h4 className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mb-4">
                                                        <MapPin size={14} /> {t.pharmaciesLabel}
                                                    </h4>
                                                    <div className="space-y-2">
                                                        {pharmacies.slice(0, 3).map((p) => (
                                                            <div key={p.id} className={`p-5 rounded-2xl border ${theme === 'dark' ? 'bg-white/5 border-white/5' : 'bg-gray-50 border-gray-100'}`}>
                                                                <p className="font-black text-xs uppercase">{p.name}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {section.id === 'transport' && (
                                        <div className="space-y-6 pt-8">
                                            <div className={`p-8 rounded-[32px] border ${theme === 'dark' ? 'bg-blue-500/5 border-white/5' : 'bg-white border-cyan-50'
                                                }`}>
                                                <div className="space-y-6">
                                                    <div>
                                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-500 mb-2">Main Hub</p>
                                                        <p className="text-2xl font-black">Velana International (MLE)</p>
                                                        <div className="flex items-center gap-2 mt-2 opacity-50">
                                                            <MapPin size={12} />
                                                            <span className="text-xs font-bold uppercase">4.5km From capital Male</span>
                                                        </div>
                                                    </div>
                                                    <div className="h-px bg-cyan-500/10" />
                                                    <div>
                                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-500 mb-4">Maafushi Island Transfer</p>
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                            {[
                                                                { m: 'Speed Boat', t: '15-20 min', d: 'Express service' },
                                                                { m: 'Local Ferry', t: '45-60 min', d: 'Budget option' }
                                                            ].map((mode, i) => (
                                                                <div key={i} className={`p-5 rounded-2xl border ${theme === 'dark' ? 'bg-white/5 border-white/5' : 'bg-cyan-50 border-cyan-100'}`}>
                                                                    <p className="font-black text-sm uppercase">{mode.m}</p>
                                                                    <p className="text-xs font-bold opacity-60">{mode.t} • {mode.d}</p>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {section.id === 'country' && maldivesData && (
                                        <div className="space-y-8 pt-8">
                                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                                {[
                                                    { l: 'Capital', v: maldivesData.capital },
                                                    { l: 'Pop', v: (maldivesData.population / 1000).toFixed(0) + 'K' },
                                                    { l: 'Lang', v: 'Dhivehi' },
                                                    { l: 'Currency', v: 'MVR' }
                                                ].map((stat, i) => (
                                                    <div key={i} className={`p-6 rounded-[32px] text-center border ${theme === 'dark' ? 'bg-white/5 border-white/5' : 'bg-white border-gray-100'}`}>
                                                        <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1">{stat.l}</p>
                                                        <p className="text-xl font-black">{stat.v}</p>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className={`p-8 rounded-[40px] border ${theme === 'dark' ? 'bg-[#001a24] border-white/5 outline outline-1 outline-blue-500/10' : 'bg-blue-50 border-blue-100'
                                                }`}>
                                                <h4 className="flex items-center gap-3 text-xs font-black uppercase tracking-[0.2em] text-blue-600 mb-6">
                                                    Cultural Etiquette
                                                </h4>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-bold opacity-80 leading-relaxed">
                                                    <div className="space-y-4">
                                                        <p className="flex items-start gap-4">
                                                            <span className="text-blue-500 text-lg">👕</span>
                                                            <span>{lang === 'BS' ? 'Haljite se skromno van rizorta.' : 'Dress modestly outside of resorts.'}</span>
                                                        </p>
                                                        <p className="flex items-start gap-4">
                                                            <span className="text-blue-500 text-lg">🚱</span>
                                                            <span>{lang === 'BS' ? 'Nema alkohola na lokalnim otocima.' : 'No alcohol on local islands.'}</span>
                                                        </p>
                                                    </div>
                                                    <div className="space-y-4">
                                                        <p className="flex items-start gap-4">
                                                            <span className="text-blue-500 text-lg">🤝</span>
                                                            <span>{lang === 'BS' ? 'Koristite desnu ruku za pozdravljanje.' : 'Use your right hand for greetings.'}</span>
                                                        </p>
                                                        <p className="flex items-start gap-4">
                                                            <span className="text-blue-500 text-lg">⏳</span>
                                                            <span>{lang === 'BS' ? 'Poštujte pauze za molitvu.' : 'Respect the prayer breaks.'}</span>
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {section.id === 'prayer' && prayerTimes && (
                                        <div className="space-y-8 pt-8">
                                            <div className={`p-8 rounded-[40px] border ${theme === 'dark' ? 'bg-indigo-500/5 border-indigo-500/10' : 'bg-indigo-50 border-indigo-100'
                                                }`}>
                                                <h4 className="flex items-center gap-3 text-xs font-black uppercase tracking-[0.2em] text-indigo-600 mb-8">
                                                    {t.prayer}
                                                </h4>
                                                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                                    {[
                                                        { name: 'Fajr', time: prayerTimes.Fajr },
                                                        { name: 'Dhuhr', time: prayerTimes.Dhuhr },
                                                        { name: 'Asr', time: prayerTimes.Asr },
                                                        { name: 'Maghrib', time: prayerTimes.Maghrib },
                                                        { name: 'Isha', time: prayerTimes.Isha }
                                                    ].map((p) => (
                                                        <div key={p.name} className={`p-6 rounded-2xl text-center border ${theme === 'dark' ? 'bg-white/5 border-white/5' : 'bg-white border-indigo-100'
                                                            }`}>
                                                            <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-1">{p.name}</p>
                                                            <p className="text-lg font-black">{p.time}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                <div className={`p-10 rounded-[40px] border relative overflow-hidden ${theme === 'dark' ? 'bg-amber-500/5 border-amber-500/10' : 'bg-amber-50 border-amber-200'
                    }`}>
                    <div className="relative z-10 space-y-8">
                        <h3 className="font-black text-xl uppercase tracking-widest flex items-center gap-4 text-amber-600">
                            <AlertCircle size={28} /> {t.notes}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {[
                                { i: '💵', t: 'Currency', d: 'USD bills must be post-2013' },
                                { i: '📶', t: 'Connectivity', d: 'Get Ooredoo or Dhiraagu SIM' },
                                { i: '🏥', t: 'Safety', d: 'Dive insurance is mandatory' },
                                { i: '☀️', t: 'Sun', d: 'SPF 50+ / Reef-safe required' }
                            ].map((note, i) => (
                                <div key={i} className="flex items-start gap-4">
                                    <span className="text-2xl mt-1">{note.i}</span>
                                    <div>
                                        <p className="font-black text-xs uppercase tracking-widest opacity-80">{note.t}</p>
                                        <p className="text-sm font-medium opacity-60 leading-relaxed">{note.d}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EssentialInfo;
