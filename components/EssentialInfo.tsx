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

const EssentialInfo: React.FC = () => {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [rates, setRates] = useState<ExchangeRates | null>(null);
  const [maldivesData, setMaldivesData] = useState<any>(null);
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [pharmacies, setPharmacies] = useState<any[]>([]);
  const [exchangeBureaus, setExchangeBureaus] = useState<any[]>([]);
  const [prayerTimes, setPrayerTimes] = useState<any>(null);
  const [maldivesTime, setMaldivesTime] = useState<string>('');
  const [loading, setLoading] = useState(true);

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

        // Update Maldives time
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
    { id: 'money', title: 'Novac & Razmjena', icon: <DollarSign className="w-6 h-6" />, color: 'from-emerald-400 to-green-500' },
    { id: 'health', title: 'Zdravstvo', icon: <Heart className="w-6 h-6" />, color: 'from-red-400 to-pink-500' },
    { id: 'transport', title: 'Transport', icon: <Plane className="w-6 h-6" />, color: 'from-blue-400 to-cyan-500' },
    { id: 'country', title: 'O Maldivima', icon: <Globe className="w-6 h-6" />, color: 'from-orange-400 to-amber-500' },
    { id: 'prayer', title: 'Vjerski Vremena', icon: <Moon className="w-6 h-6" />, color: 'from-indigo-400 to-purple-500' }
  ];

  const toggleSection = (id: string) => {
    setExpandedSection(expandedSection === id ? null : id);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-cyan-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-500 font-bold">Učitavanje ključnih informacija...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 pt-20 px-6 bg-gradient-to-br from-[#f8fdff] to-[#f0f9fa]">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <section className="text-center space-y-4 mb-12">
          <span className="text-[#ee9b00] font-black text-xs uppercase tracking-[0.4em]">Važne Informacije</span>
          <h1 className="text-5xl md:text-6xl font-black text-[#001219] tracking-tight">KLJUČNE<br/><span className="text-[#0a9396]">INFORMACIJE</span></h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">Sve što trebate znati prije i tijekom ekspedicije</p>
        </section>

        {/* Current Time in Maldives */}
        <div className="bg-gradient-to-r from-[#005f73] to-[#0a9396] text-white rounded-3xl p-8 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <p className="text-white/80 text-sm font-bold uppercase tracking-wider">Trenutno Vrijeme na Maldivima</p>
              <p className="text-5xl font-black">{maldivesTime}</p>
              <p className="text-white/60 text-xs">UTC+5:00 (Male, Maldives)</p>
            </div>
            <Clock className="w-24 h-24 text-white/20" />
          </div>
        </div>

        {/* Accordion Sections */}
        <div className="space-y-4">
          {sections.map((section) => (
            <div key={section.id} className="rounded-3xl border border-white/30 overflow-hidden bg-white/50 backdrop-blur shadow-sm hover:shadow-md transition-shadow">
              {/* Header */}
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full flex items-center justify-between p-6 group hover:bg-white/40 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-2xl bg-gradient-to-br ${section.color} text-white`}>
                    {section.icon}
                  </div>
                  <div className="text-left">
                    <h3 className="text-xl font-black text-[#001219]">{section.title}</h3>
                  </div>
                </div>
                <ChevronDown 
                  className={`w-6 h-6 text-gray-400 transition-transform duration-300 ${
                    expandedSection === section.id ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* Content */}
              {expandedSection === section.id && (
                <div className="border-t border-white/30 px-6 py-6 space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
                  {/* MONEY SECTION */}
                  {section.id === 'money' && rates && (
                    <div className="space-y-6">
                      {/* Exchange Rates */}
                      <div className="bg-emerald-50 rounded-2xl p-6 border border-emerald-100">
                        <h4 className="font-black text-[#001219] mb-4 flex items-center gap-2">
                          <DollarSign className="w-5 h-5 text-emerald-600" />
                          Trenutni Tečaj
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="bg-white p-4 rounded-xl border border-emerald-100">
                            <p className="text-xs font-bold text-gray-500 uppercase mb-2">EUR → BAM</p>
                            <p className="text-3xl font-black text-emerald-600">{rates.BAM.toFixed(4)}</p>
                          </div>
                          <div className="bg-white p-4 rounded-xl border border-emerald-100">
                            <p className="text-xs font-bold text-gray-500 uppercase mb-2">EUR → USD</p>
                            <p className="text-3xl font-black text-emerald-600">{rates.USD.toFixed(4)}</p>
                          </div>
                          <div className="bg-white p-4 rounded-xl border border-emerald-100">
                            <p className="text-xs font-bold text-gray-500 uppercase mb-2">Ažurirano</p>
                            <p className="text-sm font-bold text-gray-600">{new Date(rates.date).toLocaleDateString('bs-BA')}</p>
                          </div>
                        </div>
                      </div>

                      {/* Exchange Bureaus */}
                      <div>
                        <h4 className="font-black text-[#001219] mb-4 flex items-center gap-2">
                          <MapPin className="w-5 h-5 text-[#0a9396]" />
                          Mjenjačnice ({exchangeBureaus.length})
                        </h4>
                        {exchangeBureaus.length > 0 ? (
                          <div className="space-y-2">
                            {exchangeBureaus.slice(0, 3).map((bureau) => (
                              <div key={bureau.id} className="bg-white p-4 rounded-xl border border-gray-100">
                                <p className="font-bold text-[#001219]">{bureau.name}</p>
                                {bureau.phone && <p className="text-xs text-gray-600">{bureau.phone}</p>}
                                {bureau.openingHours && <p className="text-xs text-gray-500">{bureau.openingHours}</p>}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-500 text-sm">Nema pronađenih mjenjačnica u bliskoj blizini</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* HEALTH SECTION */}
                  {section.id === 'health' && (
                    <div className="space-y-6">
                      {/* Emergency Numbers */}
                      <div className="bg-red-50 rounded-2xl p-6 border border-red-100">
                        <h4 className="font-black text-[#001219] mb-4 flex items-center gap-2">
                          <AlertCircle className="w-5 h-5 text-red-600" />
                          Hitne Službe
                        </h4>
                        <div className="space-y-3">
                          <div className="bg-white p-4 rounded-xl border border-red-100 flex items-center justify-between">
                            <div>
                              <p className="font-bold text-[#001219]">Hitna Pomoć</p>
                              <p className="text-xs text-gray-600">Ambulansa i hitna pomoć</p>
                            </div>
                            <p className="text-2xl font-black text-red-600">999</p>
                          </div>
                          <div className="bg-white p-4 rounded-xl border border-red-100 flex items-center justify-between">
                            <div>
                              <p className="font-bold text-[#001219]">Vatrogasci</p>
                              <p className="text-xs text-gray-600">Hitna služba</p>
                            </div>
                            <p className="text-2xl font-black text-red-600">998</p>
                          </div>
                        </div>
                      </div>

                      {/* Hospitals */}
                      <div>
                        <h4 className="font-black text-[#001219] mb-4 flex items-center gap-2">
                          <Heart className="w-5 h-5 text-pink-600" />
                          Bolnice ({hospitals.length})
                        </h4>
                        {hospitals.length > 0 ? (
                          <div className="space-y-2">
                            {hospitals.slice(0, 3).map((hospital) => (
                              <div key={hospital.id} className="bg-white p-4 rounded-xl border border-gray-100">
                                <p className="font-bold text-[#001219]">{hospital.name}</p>
                                {hospital.phone && <p className="text-xs text-gray-600">{hospital.phone}</p>}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-500 text-sm">Indira Gandhi Memorial Hospital (Male) - Glavni healthcare centar</p>
                        )}
                      </div>

                      {/* Pharmacies */}
                      <div>
                        <h4 className="font-black text-[#001219] mb-4 flex items-center gap-2">
                          <MapPin className="w-5 h-5 text-purple-600" />
                          Apoteke ({pharmacies.length})
                        </h4>
                        {pharmacies.length > 0 ? (
                          <div className="space-y-2">
                            {pharmacies.slice(0, 3).map((pharmacy) => (
                              <div key={pharmacy.id} className="bg-white p-4 rounded-xl border border-gray-100">
                                <p className="font-bold text-[#001219]">{pharmacy.name}</p>
                                {pharmacy.phone && <p className="text-xs text-gray-600">{pharmacy.phone}</p>}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-500 text-sm">Dostupne u svim trgovinskim centrima i hotelima</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* TRANSPORT SECTION */}
                  {section.id === 'transport' && (
                    <div className="space-y-4">
                      <div className="bg-white p-6 rounded-2xl border border-gray-100 space-y-4">
                        <div>
                          <p className="font-black text-[#001219] mb-2">Međunarodni Aerodrom</p>
                          <p className="text-sm text-gray-600">Ibrahim Nasir International Airport (MLE)</p>
                          <p className="text-xs text-gray-500 mt-1">Udaljenost od Male: ~4.5 km</p>
                        </div>
                        <div className="border-t border-gray-100 pt-4">
                          <p className="font-black text-[#001219] mb-2">Transfer do Maafushija</p>
                          <ul className="text-sm text-gray-600 space-y-1">
                            <li>• Speed Boat: 15-20 minuta (skupo)</li>
                            <li>• Public Ferry: 30-45 minuta (jeftino)</li>
                            <li>• Speedboat sahotelom: Organizovano</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* COUNTRY INFO SECTION */}
                  {section.id === 'country' && maldivesData && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white p-6 rounded-2xl border border-gray-100">
                          <p className="text-xs font-bold text-gray-500 uppercase mb-2">Glavni Grad</p>
                          <p className="text-2xl font-black text-[#001219]">{maldivesData.capital}</p>
                        </div>
                        <div className="bg-white p-6 rounded-2xl border border-gray-100">
                          <p className="text-xs font-bold text-gray-500 uppercase mb-2">Populacija</p>
                          <p className="text-2xl font-black text-[#001219]">{(maldivesData.population / 1000).toFixed(0)}K</p>
                        </div>
                        <div className="bg-white p-6 rounded-2xl border border-gray-100">
                          <p className="text-xs font-bold text-gray-500 uppercase mb-2">Jezik</p>
                          <p className="text-2xl font-black text-[#001219]">Dhivehi</p>
                        </div>
                        <div className="bg-white p-6 rounded-2xl border border-gray-100">
                          <p className="text-xs font-bold text-gray-500 uppercase mb-2">Valuta</p>
                          <p className="text-2xl font-black text-[#001219]">MVR</p>
                        </div>
                      </div>
                      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6">
                        <h5 className="font-black text-[#001219] mb-3">Važne Kulturne Napomene</h5>
                        <ul className="text-sm text-gray-700 space-y-2">
                          <li>✓ Izlazite jako odjeveni (plave/kratke hlače za muškarce nisu prihvaćene van plaža)</li>
                          <li>✓ Ne pijte alkohol javno (kuće strave sa alkoholom su na resortima)</li>
                          <li>✓ Poštujte vremena molitve - većina trgovina se zatvara</li>
                          <li>✓ Desna ruka za hranu i pozdrave (lijeva je nepoželjna)</li>
                          <li>✓ Nema javnog prikaza afeksije između osoba istoga spola</li>
                        </ul>
                      </div>
                    </div>
                  )}

                  {/* PRAYER TIMES SECTION */}
                  {section.id === 'prayer' && prayerTimes && (
                    <div className="space-y-4">
                      <div className="bg-indigo-50 rounded-2xl p-6 border border-indigo-100">
                        <h4 className="font-black text-[#001219] mb-4 flex items-center gap-2">
                          <Moon className="w-5 h-5 text-indigo-600" />
                          Vremena Molitve
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {prayerTimes && [
                            { name: 'Fajr', time: prayerTimes.Fajr, icon: Sun },
                            { name: 'Dhuhr', time: prayerTimes.Dhuhr, icon: Sun },
                            { name: 'Asr', time: prayerTimes.Asr, icon: Sun },
                            { name: 'Maghrib', time: prayerTimes.Maghrib, icon: Sun },
                            { name: 'Isha', time: prayerTimes.Isha, icon: Moon }
                          ].map((prayer) => (
                            <div key={prayer.name} className="bg-white p-4 rounded-xl border border-indigo-100">
                              <p className="text-xs font-bold text-indigo-600 uppercase mb-1">{prayer.name}</p>
                              <p className="text-xl font-black text-[#001219]">{prayer.time}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="bg-amber-50 border border-amber-100 rounded-2xl p-6">
                        <p className="text-sm text-gray-700">
                          <strong>Napomena:</strong> Većina javnih usluga se zatvara tijekom vremena molitve (posebno Dhuhr i Asr). Planujte aktivnosti u skladu s tim vremenima.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Warnings Section */}
        <div className="bg-amber-50 border border-amber-200 rounded-3xl p-8 space-y-4">
          <h3 className="font-black text-[#001219] text-xl flex items-center gap-2">
            <AlertCircle className="w-6 h-6 text-amber-600" />
            Važne Napomene
          </h3>
          <ul className="text-sm text-gray-700 space-y-2">
            <li>• Novcane institucije: USD novčanice moraju biti nakon 2013</li>
            <li>• Mobilna mreža: Kupi e-SIM na terenu (Airalo, Yassim)</li>
            <li>• Zdravstveno osiguranje: Preporučujemo međunarodno osiguranje za ronjenje</li>
            <li>• Temperatura vode: 26-28°C - nosite neoprenske odijele</li>
            <li>• Sunce: SPF 50+ je obavezna - UV je vrlo jak</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default EssentialInfo;
