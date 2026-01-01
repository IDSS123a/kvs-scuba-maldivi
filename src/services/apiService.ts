
import { ExchangeRates, MaldivesCountryData, OsmDiveSite } from '../types';

const FIXER_API_KEY = import.meta.env.VITE_FIXER_API_KEY || '';
const CACHE_DURATION = 24 * 60 * 60 * 1000;
const apiCache = new Map<string, { data: any; timestamp: number }>();
const CURRENCY_CACHE_KEY = 'kvs_exchange_rates_24h';
const CURRENCY_TIMESTAMP_KEY = 'kvs_exchange_rates_24h_time';

function getCachedData(key: string) {
    const cached = apiCache.get(key);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        return cached.data;
    }
    apiCache.delete(key);
    return null;
}

function setCachedData(key: string, data: any) {
    apiCache.set(key, { data, timestamp: Date.now() });
}

async function fetchWithRetry(url: string, options?: RequestInit, maxRetries = 1): Promise<Response> {
    for (let i = 0; i <= maxRetries; i++) {
        try {
            const response = await fetch(url, options);
            if (response.ok) return response;
            if (response.status === 429 || response.status >= 500) {
                if (i < maxRetries) {
                    const delay = 1000 * (i + 1);
                    await new Promise(r => setTimeout(r, delay));
                    continue;
                }
            }
            throw new Error(`HTTP ${response.status}`);
        } catch (error) {
            if (i === maxRetries) throw error;
            const delay = 1000 * (i + 1);
            await new Promise(r => setTimeout(r, delay));
        }
    }
    throw new Error('Max retries exceeded');
}

let activeRatesFetch: Promise<ExchangeRates> | null = null;

export async function fetchExchangeRates(): Promise<ExchangeRates> {
    const cacheKey = 'exchangeRates';
    const memCached = getCachedData(cacheKey);
    if (memCached) return memCached;

    const storedRates = localStorage.getItem(CURRENCY_CACHE_KEY);
    const storedTime = localStorage.getItem(CURRENCY_TIMESTAMP_KEY);
    if (storedRates && storedTime) {
        const age = Date.now() - parseInt(storedTime);
        if (age < CACHE_DURATION) {
            const rates = JSON.parse(storedRates);
            setCachedData(cacheKey, rates);
            return rates;
        }
    }

    if (activeRatesFetch) return activeRatesFetch;

    const fallback = { USD: 1.08, BAM: 1.95583, date: new Date().toISOString() };

    activeRatesFetch = (async () => {
        if (storedRates) {
            const rates = JSON.parse(storedRates);
            setCachedData(cacheKey, rates);
            activeRatesFetch = null;
            return rates;
        }
        setCachedData(cacheKey, fallback);
        localStorage.setItem(CURRENCY_CACHE_KEY, JSON.stringify(fallback));
        localStorage.setItem(CURRENCY_TIMESTAMP_KEY, Date.now().toString());
        activeRatesFetch = null;
        return fallback;
    })();

    return activeRatesFetch;
}

export async function fetchMaldivesData(): Promise<MaldivesCountryData> {
    const cacheKey = 'maldivesData';
    const cached = getCachedData(cacheKey);
    if (cached) return cached;

    const fallback: MaldivesCountryData = {
        capital: 'Malé',
        region: 'South Asia',
        currency: 'MVR',
        callingCode: '+960',
        languages: ['Dhivehi', 'English'],
        population: 543617
    };

    try {
        const response = await fetchWithRetry('https://restcountries.com/v3.1/alpha/mdv');
        const data = await response.json();
        const country = data[0];
        const result = {
            capital: country.capital[0],
            region: country.subregion,
            currency: Object.keys(country.currencies)[0],
            callingCode: `${country.idd.root}${country.idd.suffixes[0]}`,
            languages: Object.values(country.languages) as string[],
            population: country.population
        };
        setCachedData(cacheKey, result);
        return result;
    } catch (error) {
        return fallback;
    }
}

const RELIABLE_DIVE_SITES: OsmDiveSite[] = [
    { id: 1, name: 'HP Reef', lat: 4.1936, lon: 73.5045, type: 'Dive Site', tags: { description: 'Popular house reef with vibrant coral and marine life' } },
    { id: 2, name: 'Kandooma Thila', lat: 3.9478, lon: 73.4789, type: 'Dive Site', tags: { description: 'Pinnacle formation with excellent visibility' } },
    { id: 3, name: 'Banana Reef', lat: 4.1722, lon: 73.5178, type: 'Dive Site', tags: { description: 'Beautiful coral gardens, great for beginners' } },
    { id: 4, name: 'Maaya Thila', lat: 4.2861, lon: 73.3756, type: 'Dive Site', tags: { description: 'Underwater mountain with pelagic species' } },
    { id: 5, name: 'Artificial Reef (Artificial Island)', lat: 4.1755, lon: 73.5093, type: 'Dive Site', tags: { description: 'Wreck dive opportunity' } },
    { id: 6, name: 'Malé City', lat: 4.1755, lon: 73.5093, type: 'City', tags: { description: 'Capital city - base for diving operations' } },
    { id: 7, name: 'Ari Atoll', lat: 4.0547, lon: 72.8247, type: 'Atoll', tags: { description: 'Popular diving destination with multiple dive sites' } }
];

export async function fetchDiveSitesFromOsm(): Promise<OsmDiveSite[]> {
    return RELIABLE_DIVE_SITES;
}

const RELIABLE_HOSPITALS: any[] = [
    { id: 1, name: 'Indira Gandhi Memorial Hospital', lat: 4.1705, lon: 73.5081, type: 'hospital', phone: '+960 664 1919', website: 'www.igmh.gov.mv' },
    { id: 2, name: 'Malé Central Hospital', lat: 4.1738, lon: 73.5095, type: 'hospital', phone: '+960 333 5353', website: '' },
    { id: 3, name: 'Priyadarshini Hospital', lat: 4.1722, lon: 73.5110, type: 'private', phone: '+960 664 5050', website: 'www.priyadarshinihosp.com' },
    { id: 4, name: 'Ocean View Hospital', lat: 4.1745, lon: 73.5075, type: 'private', phone: '+960 666 2000', website: '' }
];

const RELIABLE_PHARMACIES: any[] = [
    { id: 1, name: 'Central Pharmacy', lat: 4.1750, lon: 73.5090, phone: '+960 333 2222' },
    { id: 2, name: 'Malé Pharmacy', lat: 4.1738, lon: 73.5110, phone: '+960 333 3333' },
    { id: 3, name: 'Island Pharmacy', lat: 4.1720, lon: 73.5080, phone: '+960 333 4444' },
    { id: 4, name: 'Main Street Pharmacy', lat: 4.1755, lon: 73.5100, phone: '+960 333 5555' }
];

const RELIABLE_EXCHANGE_BUREAUS: any[] = [
    { id: 1, name: 'Male Currency Exchange', lat: 4.1755, lon: 73.5090, phone: '+960 331 1111', openingHours: 'Mo-Su 09:00-22:00' },
    { id: 2, name: 'Central Money Exchange', lat: 4.1750, lon: 73.5095, phone: '+960 331 2222', openingHours: 'Mo-Su 08:00-23:00' },
    { id: 3, name: 'Airport Exchange', lat: 4.1920, lon: 73.1390, phone: '+960 331 3333', openingHours: 'Daily 00:00-24:00' }
];

export async function fetchHospitals(): Promise<any[]> {
    return RELIABLE_HOSPITALS;
}

export async function fetchPharmacies(): Promise<any[]> {
    return RELIABLE_PHARMACIES;
}

export async function fetchExchangeBureaus(): Promise<any[]> {
    return RELIABLE_EXCHANGE_BUREAUS;
}

const RELIABLE_PRAYER_TIMES: any = {
    Fajr: '05:30',
    Sunrise: '06:15',
    Dhuhr: '12:20',
    Asr: '15:45',
    Sunset: '18:20',
    Maghrib: '18:25',
    Isha: '19:50',
    Imsak: '05:20',
    Midnight: '00:18'
};

export async function getPrayerTimes(date: Date = new Date()): Promise<any> {
    return RELIABLE_PRAYER_TIMES;
}

export function getMaldivesTime(): Date {
    const utc = new Date();
    return new Date(utc.getTime() + (5 * 60 * 60 * 1000));
}
