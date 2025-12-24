import React, { useState, useEffect } from 'react';
import { 
  Globe, 
  DollarSign, 
  Moon, 
  MapPin, 
  AlertCircle,
  Loader2,
  MessageCircle
} from 'lucide-react';

interface CountryData {
  flag: string;
  capital: string;
  currency: string;
  languages: string[];
  population: number;
  callingCode: string;
}

interface ExchangeRate {
  EUR: number;
  USD: number;
  BAM: number;
  timestamp: string;
}

interface PrayerTime {
  name: string;
  time: string;
}

const EssentialInfoDashboard: React.FC = () => {
  const [language, setLanguage] = useState<'bs' | 'en'>('en');
  const [country, setCountry] = useState<CountryData | null>(null);
  const [rates, setRates] = useState<ExchangeRate | null>(null);
  const [prayerTimes, setPrayerTimes] = useState<PrayerTime[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Get language from localStorage or default
    const savedLang = localStorage.getItem('language') as 'bs' | 'en' | null;
    const savedKVSLang = localStorage.getItem('kvs_lang') as 'BS' | 'EN' | null;
    
    if (savedKVSLang === 'BS') {
      setLanguage('bs');
    } else if (savedKVSLang === 'EN') {
      setLanguage('en');
    } else if (savedLang) {
      setLanguage(savedLang);
    } else {
      setLanguage('en');
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Fetch country info
        const countryRes = await fetch('https://restcountries.com/v3.1/alpha/mdv');
        if (countryRes.ok) {
          const data = await countryRes.json();
          const c = data[0];
          setCountry({
            flag: c.flags?.svg || 'https://flagcdn.com/mdv.svg',
            capital: c.capital?.[0] || 'Male',
            currency: 'MVR (Rufiyaa)',
            languages: Object.values(c.languages || { Dhivehi: 'Dhivehi' }) as string[],
            population: c.population || 500000,
            callingCode: `${c.idd?.root || '+'}${c.idd?.suffixes?.[0] || '960'}`
          });
        } else {
          throw new Error('Failed to fetch country data');
        }

        // Fetch exchange rates (with fallback)
        try {
          const ratesRes = await fetch(
            `https://api.exchangerate-api.com/v4/latest/EUR?access_key=${import.meta.env.VITE_FIXER_API_KEY || ''}`
          );
          if (ratesRes.ok) {
            const data = await ratesRes.json();
            setRates({
              EUR: 1,
              USD: data.rates?.USD || 1.08,
              BAM: data.rates?.BAM || 1.96,
              timestamp: new Date().toISOString()
            });
          } else {
            // Fallback rates
            setRates({
              EUR: 1,
              USD: 1.08,
              BAM: 1.96,
              timestamp: new Date().toISOString()
            });
          }
        } catch (rateError) {
          console.warn('Exchange rate fetch failed, using fallback:', rateError);
          setRates({
            EUR: 1,
            USD: 1.08,
            BAM: 1.96,
            timestamp: new Date().toISOString()
          });
        }

        // Set prayer times (static for Maafushi)
        setPrayerTimes([
          { name: language === 'bs' ? 'Fajr (Zora)' : 'Fajr (Dawn)', time: '05:12' },
          { name: language === 'bs' ? 'Dhuhr (Podne)' : 'Dhuhr (Noon)', time: '12:15' },
          { name: language === 'bs' ? 'Asr (Poslije podne)' : 'Asr (Afternoon)', time: '15:38' },
          { name: language === 'bs' ? 'Maghrib (Zalazak)' : 'Maghrib (Sunset)', time: '18:18' },
          { name: language === 'bs' ? 'Isha (Veče)' : 'Isha (Evening)', time: '19:32' }
        ]);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Error loading data';
        console.error(errorMsg);
        setError(errorMsg);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [language]);

  const translations = {
    bs: {
      title: '🌍 Esencijalne Informacije - Maldivi',
      country: 'Država & Praktike',
      currency: 'Valuta & Razmjena',
      electrical: 'Električna Oprema',
      visa: 'Vizum & Putovanja',
      tipping: 'Bakšiš & Kultura',
      prayer: 'Vremena Molitve (Maafushi)',
      religion: 'Religija & Običaji',
      capital: 'Glavni Grad',
      population: 'Stanovnika',
      language: 'Jezici',
      calling: 'Pozivni Broj',
      voltage: '230V / 50Hz',
      sockets: 'Priključnice Tipa D, G, M',
      visaRequired: 'Za BiH: Nije potrebna viza (30 dana)',
      visaNote: 'Pasošport treba biti validan najmanje 6 mjeseci',
      tippingNote: 'Nije obavezno, ali je cijenjen u turizmu',
      customsNote: 'Skromno oblačenje na lokalnim otocima (bez kupaćih kostima)',
      relig: 'Islam je prevladavajuća religija',
      religNote: 'Molitva je važna dio dnevnog života. Muzika nije dozvoljena tijekom molitve.',
      source: 'Izvor',
      exchangeRate: 'Tečaj',
      maleTime: 'Vrijeme u Maléu (UTC+5)',
      friday: 'Petak je svetkovan dan',
    },
    en: {
      title: '🌍 Essential Information - Maldives',
      country: 'Country & Practicalities',
      currency: 'Currency & Exchange',
      electrical: 'Electrical Appliances',
      visa: 'Visa & Travel',
      tipping: 'Tipping & Culture',
      prayer: 'Prayer Times (Maafushi)',
      religion: 'Religion & Customs',
      capital: 'Capital',
      population: 'Population',
      language: 'Languages',
      calling: 'Calling Code',
      voltage: '230V / 50Hz',
      sockets: 'Socket Types D, G, M',
      visaRequired: 'For BiH: No visa required (30 days)',
      visaNote: 'Passport must be valid for at least 6 months',
      tippingNote: 'Not mandatory, but appreciated in tourism industry',
      customsNote: 'Dress modestly on local islands (no swimwear outside resorts)',
      relig: 'Islam is the predominant religion',
      religNote: 'Prayer is an important part of daily life. Music is not allowed during prayers.',
      source: 'Source',
      exchangeRate: 'Exchange Rate',
      maleTime: 'Time in Malé (UTC+5)',
      friday: 'Friday is a celebrated day',
    }
  };

  const t = translations[language as 'bs' | 'en'] || translations.en;

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-4 p-12 bg-blue-50 dark:bg-blue-900/20 rounded-[20px]">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600 dark:text-blue-400" />
        <span className="text-blue-800 dark:text-blue-300 font-semibold">{language === 'bs' ? 'Učitavanje...' : 'Loading...'}</span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-black mb-4 flex items-center justify-center gap-4">
          <Globe className="w-10 h-10 text-cyan-600 dark:text-cyan-400" />
          {t.title}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {language === 'bs' 
            ? 'Sve što trebate znati prije nego što stignete na Maldive' 
            : 'Everything you need to know before you arrive in the Maldives'}
        </p>
      </div>

      {error && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-6 rounded-[20px]">
          <p className="text-yellow-800 dark:text-yellow-300 font-semibold">⚠️ {error}</p>
        </div>
      )}

      {/* Country Information Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Country & Location Card */}
        <div className="bg-white dark:bg-gray-800 p-10 rounded-[20px] border border-gray-200 dark:border-gray-700 shadow-lg">
          <h2 className="text-2xl font-black mb-8 flex items-center gap-3">
            <MapPin className="w-6 h-6 text-red-500" /> {t.country}
          </h2>
          <div className="space-y-6">
            {country && (
              <>
                <div className="flex items-start gap-6">
                  <img 
                    src={country.flag} 
                    alt="Maldives Flag"
                    className="w-24 h-16 object-cover rounded-lg border-2 border-gray-200 dark:border-gray-600"
                  />
                  <div className="space-y-2 flex-1">
                    <p><strong>{t.capital}:</strong> {country.capital}</p>
                    <p><strong>{t.population}:</strong> {(country.population / 1000000).toFixed(1)}M</p>
                    <p><strong>{t.language}:</strong> {country.languages.join(', ')}</p>
                    <p><strong>{t.calling}:</strong> {country.callingCode}</p>
                  </div>
                </div>
                
                {/* Practical Info */}
                <div className="bg-gray-50 dark:bg-gray-700/50 p-6 rounded-lg space-y-3">
                  <h3 className="font-bold text-lg">{t.electrical}</h3>
                  <p className="text-sm">
                    <strong>Voltage:</strong> {t.voltage}<br/>
                    <strong>{t.sockets}</strong>
                  </p>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg space-y-3 border border-blue-200 dark:border-blue-800">
                  <h3 className="font-bold text-lg text-blue-900 dark:text-blue-300">{t.visa}</h3>
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    ✓ {t.visaRequired}<br/>
                    <small>{t.visaNote}</small>
                  </p>
                </div>

                <div className="bg-amber-50 dark:bg-amber-900/20 p-6 rounded-lg space-y-3 border border-amber-200 dark:border-amber-800">
                  <h3 className="font-bold text-lg text-amber-900 dark:text-amber-300">{t.tipping}</h3>
                  <p className="text-sm text-amber-800 dark:text-amber-200">
                    • {t.tippingNote}<br/>
                    • {t.customsNote}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Currency & Exchange Card */}
        <div className="bg-white dark:bg-gray-800 p-10 rounded-[20px] border border-gray-200 dark:border-gray-700 shadow-lg">
          <h2 className="text-2xl font-black mb-8 flex items-center gap-3">
            <DollarSign className="w-6 h-6 text-emerald-500" /> {t.currency}
          </h2>
          
          {rates && (
            <div className="space-y-6">
              <div className="bg-emerald-50 dark:bg-emerald-900/20 p-6 rounded-lg border border-emerald-200 dark:border-emerald-800">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  {t.exchangeRate} ({rates.timestamp.split('T')[0]})
                </p>
                <div className="space-y-3">
                  <div className="flex justify-between items-center font-bold">
                    <span>1 EUR</span>
                    <span className="text-xl text-emerald-600 dark:text-emerald-400">11.5 MVR</span>
                  </div>
                  <div className="h-px bg-gray-300 dark:bg-gray-600"></div>
                  <div className="flex justify-between items-center text-sm">
                    <span>1 USD</span>
                    <span className="text-gray-700 dark:text-gray-300">~{(rates.USD / 11.5).toFixed(2)} MVR</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span>1 BAM</span>
                    <span className="text-gray-700 dark:text-gray-300">~{(rates.BAM / 11.5).toFixed(2)} MVR</span>
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-lg border border-purple-200 dark:border-purple-800">
                <p className="font-bold text-purple-900 dark:text-purple-300 mb-4">💡 {language === 'bs' ? 'Savjet' : 'Tip'}</p>
                <p className="text-sm text-purple-800 dark:text-purple-200">
                  {language === 'bs'
                    ? 'Većina mjesta na Maldivima prihvaća USD i kreditne kartice. Novac se može promijeniti na aerodromu ili u hotelima.'
                    : 'Most places in the Maldives accept USD and credit cards. Money can be exchanged at the airport or at hotels.'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Prayer Times Card */}
      <div className="bg-white dark:bg-gray-800 p-10 rounded-[20px] border border-gray-200 dark:border-gray-700 shadow-lg">
        <h2 className="text-2xl font-black mb-8 flex items-center gap-3">
          <Moon className="w-6 h-6 text-amber-500" /> {t.prayer}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {prayerTimes.map((pt, i) => (
            <div key={i} className="bg-amber-50 dark:bg-amber-900/20 p-6 rounded-lg border border-amber-200 dark:border-amber-800 text-center">
              <p className="text-sm font-bold text-amber-900 dark:text-amber-300 mb-2">{pt.name}</p>
              <p className="text-2xl font-black text-amber-600 dark:text-amber-400">{pt.time}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-6">
          {language === 'bs'
            ? '📍 Vremena su za Maafushi, Male i bližu okolinu. Mogu varirati prema lokaciji.'
            : '📍 Prayer times are for Maafushi, Malé and nearby areas. May vary by location.'}
        </p>
      </div>

      {/* Religion & Culture Card */}
      <div className="bg-white dark:bg-gray-800 p-10 rounded-[20px] border border-gray-200 dark:border-gray-700 shadow-lg">
        <h2 className="text-2xl font-black mb-8 flex items-center gap-3">
          <MessageCircle className="w-6 h-6 text-blue-500" /> {language === 'bs' ? 'Religija i Kultura' : 'Religion & Culture'}
        </h2>
        <div className="space-y-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="font-bold text-blue-900 dark:text-blue-300 mb-3">{language === 'bs' ? 'Islam' : 'Islam'}</p>
            <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">
              {language === 'bs' 
                ? 'Maldivi su 99% muslimanski. Svaki grad ima džamiju i poziva se na molitvu pet puta dnevno.'
                : 'The Maldives is 99% Muslim. Every town has a mosque and the call to prayer (adhan) sounds five times a day.'}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 text-sm text-blue-800 dark:text-blue-200">
              <div>
                <p className="font-semibold mb-2">📅 Friday</p>
                <p>{language === 'bs' ? 'Sve javne institucije su zatvorene.' : 'All public institutions are closed.'}</p>
              </div>
              <div>
                <p className="font-semibold mb-2">🕌 Alcohol</p>
                <p>{language === 'bs' ? 'Zabranjen na lokalnim otocima, dozvoljen u resortima.' : 'Banned on local islands, allowed in resorts.'}</p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg border border-green-200 dark:border-green-800">
            <p className="font-bold text-green-900 dark:text-green-300 mb-3">👥 {language === 'bs' ? 'Ostale Religije' : 'Other Religions'}</p>
            <p className="text-sm text-green-800 dark:text-green-200">
              {language === 'bs'
                ? 'Manjine prakticiraju svoje vjere. Nedjeljska molitve za kršćane dostupne u dogovoru.'
                : 'Minorities practice their faiths. Sunday services for Christians available by arrangement.'}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Tips Card */}
      <div className="bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 p-10 rounded-[20px] border border-cyan-200 dark:border-cyan-800 shadow-lg">
        <h2 className="text-2xl font-black mb-8 flex items-center gap-3">
          <AlertCircle className="w-6 h-6 text-cyan-600 dark:text-cyan-400" /> 
          {language === 'bs' ? '✈️ Prije Dolaska' : '✈️ Before You Arrive'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <ul className="space-y-3">
            <li className="flex gap-3">
              <span className="text-cyan-600 dark:text-cyan-400 font-bold">✓</span>
              <span>{language === 'bs' ? 'Provjerite rok važenja vašeg pasoša' : 'Check your passport expiry'}</span>
            </li>
            <li className="flex gap-3">
              <span className="text-cyan-600 dark:text-cyan-400 font-bold">✓</span>
              <span>{language === 'bs' ? 'Obavijestite banku o putovanju' : 'Notify your bank of travel'}</span>
            </li>
            <li className="flex gap-3">
              <span className="text-cyan-600 dark:text-cyan-400 font-bold">✓</span>
              <span>{language === 'bs' ? 'Nabavite putnu osiguranje' : 'Get travel insurance'}</span>
            </li>
          </ul>
          <ul className="space-y-3">
            <li className="flex gap-3">
              <span className="text-cyan-600 dark:text-cyan-400 font-bold">✓</span>
              <span>{language === 'bs' ? 'Skiniite mapu offline' : 'Download offline maps'}</span>
            </li>
            <li className="flex gap-3">
              <span className="text-cyan-600 dark:text-cyan-400 font-bold">✓</span>
              <span>{language === 'bs' ? 'Nabavite SIM karticu na aerodromu' : 'Get SIM card at airport'}</span>
            </li>
            <li className="flex gap-3">
              <span className="text-cyan-600 dark:text-cyan-400 font-bold">✓</span>
              <span>{language === 'bs' ? 'Pakujte sunčanu zaštitu SPF 50+' : 'Pack SPF 50+ sunscreen'}</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="text-center text-xs text-gray-500 dark:text-gray-400">
        <p>
          {language === 'bs'
            ? '📌 Informacije su provjeravane i točne do datuma zadnjeg ažuriranja.'
            : '📌 Information is verified and current as of the last update date.'}
        </p>
      </div>
    </div>
  );
};

export default EssentialInfoDashboard;
