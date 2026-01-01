
import { ExchangeRates, MaldivesCountryData, OsmDiveSite } from '../types';

const CACHE_DURATION = 1000 * 60 * 60;
const cacheStore: Record<string, { data: any; timestamp: number }> = {};

function getCache(key: string): any | null {
    const cached = cacheStore[key];
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        return cached.data;
    }
    return null;
}

function setCache(key: string, data: any): void {
    cacheStore[key] = { data, timestamp: Date.now() };
}

const FIXER_API_KEY = import.meta.env.VITE_FIXER_API_KEY || '';
const FIXER_CACHE_KEY = 'fixer_rates';

export interface ExchangeRateDetails extends ExchangeRates {
    timestamp: number;
    base: string;
}

export async function fetchExchangeRates(symbols: string[] = ['USD', 'BAM']): Promise<ExchangeRates> {
    const cachedRates = getCache(FIXER_CACHE_KEY);
    if (cachedRates) return cachedRates;

    try {
        if (!FIXER_API_KEY) throw new Error('Fixer API key not configured');
        const response = await fetch(`https://data.fixer.io/api/latest?access_key=${FIXER_API_KEY}&symbols=${symbols.join(',')}`);
        if (!response.ok) throw new Error(`Fixer API error: ${response.status}`);
        const data = await response.json();
        if (!data.success) throw new Error(`Fixer error: ${data.error?.type || 'Unknown error'}`);

        const rates = {
            USD: data.rates.USD,
            BAM: data.rates.BAM,
            date: data.date,
        };

        setCache(FIXER_CACHE_KEY, rates);
        return rates;
    } catch (error) {
        const fallback = { USD: 1.08, BAM: 1.95583, date: new Date().toISOString() };
        setCache(FIXER_CACHE_KEY, fallback);
        return fallback;
    }
}

export async function getExchangeRate(baseCurrency: string, targetCurrency: string): Promise<number> {
    const rates = await fetchExchangeRates([targetCurrency]);
    return (rates as any)[targetCurrency] || 1;
}

export async function convertCurrency(amount: number, targetCurrency: string = 'BAM'): Promise<number> {
    const rate = await getExchangeRate('EUR', targetCurrency);
    return amount * rate;
}

const COUNTRIES_CACHE_KEY = 'maldives_data';

export async function fetchMaldivesData(): Promise<MaldivesCountryData> {
    const cachedData = getCache(COUNTRIES_CACHE_KEY);
    if (cachedData) return cachedData;

    try {
        const response = await fetch('https://restcountries.com/v3.1/alpha/mdv');
        if (!response.ok) throw new Error(`REST Countries API error: ${response.status}`);
        const data = await response.json();
        if (!Array.isArray(data) || data.length === 0) throw new Error('Invalid response from REST Countries API');

        const country = data[0];
        const countryData: MaldivesCountryData = {
            capital: country.capital?.[0] || 'Malé',
            region: country.subregion || 'South Asia',
            currency: Object.keys(country.currencies || {})?.[0] || 'MVR',
            callingCode: `${country.idd?.root || ''}${country.idd?.suffixes?.[0] || '960'}`,
            languages: Object.values(country.languages || {}) as string[],
            population: country.population || 540542,
        };

        setCache(COUNTRIES_CACHE_KEY, countryData);
        return countryData;
    } catch (error) {
        const fallback: MaldivesCountryData = {
            capital: 'Malé',
            region: 'South Asia',
            currency: 'MVR',
            callingCode: '+960',
            languages: ['Dhivehi', 'English'],
            population: 540542,
        };
        setCache(COUNTRIES_CACHE_KEY, fallback);
        return fallback;
    }
}

const DIVE_SITES_CACHE_KEY = 'osm_dive_sites';
const MAAFUSHI_BBOX = '3.80,73.30,4.30,73.70';

export async function fetchDiveSitesFromOsm(): Promise<OsmDiveSite[]> {
    const cachedSites = getCache(DIVE_SITES_CACHE_KEY);
    if (cachedSites) return cachedSites;

    const query = `
    [out:json][timeout:30];
    (
      node["sport"="scuba_diving"](${MAAFUSHI_BBOX});
      node["leisure"="nature_reserve"](${MAAFUSHI_BBOX});
      node["tourism"="viewpoint"](${MAAFUSHI_BBOX});
      node["amenity"="restaurant"](${MAAFUSHI_BBOX});
      node["shop"="supermarket"](${MAAFUSHI_BBOX});
    );
    out body;
    >;
    out skel qt;
  `;

    try {
        const response = await fetch('https://overpass-api.de/api/interpreter', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `data=${encodeURIComponent(query)}`,
        });
        if (!response.ok) throw new Error(`Overpass API error: ${response.status}`);
        const data = await response.json();
        if (!data?.elements || !Array.isArray(data.elements)) throw new Error('Invalid Overpass API response');

        const sites: OsmDiveSite[] = data.elements
            .filter((e: any) => e.tags && e.lat && e.lon && (e.tags.name || e.tags.description))
            .map((e: any) => ({
                id: `osm_${e.id}`,
                lat: e.lat,
                lon: e.lon,
                name: e.tags.name || e.tags.description || 'Point of Interest',
                type: e.tags.sport || e.tags.leisure || e.tags.tourism || e.tags.amenity || 'POI',
                tags: e.tags,
            }));

        setCache(DIVE_SITES_CACHE_KEY, sites);
        return sites;
    } catch (error) {
        return [];
    }
}

export async function fetchAmenitiesInMaafushi(amenityType: string): Promise<OsmDiveSite[]> {
    const query = `
    [out:json][timeout:30];
    (
      node["amenity"="${amenityType}"](${MAAFUSHI_BBOX});
    );
    out body;
  `;

    try {
        const response = await fetch('https://overpass-api.de/api/interpreter', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `data=${encodeURIComponent(query)}`,
        });
        if (!response.ok) throw new Error(`Overpass API error: ${response.status}`);
        const data = await response.json();
        return (data.elements || [])
            .filter((e: any) => e.lat && e.lon)
            .map((e: any) => ({
                id: `osm_${e.id}`,
                lat: e.lat,
                lon: e.lon,
                name: e.tags.name || `${amenityType}`,
                type: amenityType,
                tags: e.tags,
            }));
    } catch (error) {
        return [];
    }
}

export const OPENSEAMAP_TILES = {
    seamark: 'https://tiles.openseamap.org/seamark/{z}/{x}/{y}.png',
    depth: 'https://tiles.openseamap.org/depth/{z}/{x}/{y}.png',
};

export const OPENSEAMAP_ATTRIBUTION = '&copy; OpenSeaMap contributors | Map data &copy; OpenStreetMap contributors';

export function getOpenSeaMapConfig() {
    return {
        url: OPENSEAMAP_TILES.seamark,
        attribution: OPENSEAMAP_ATTRIBUTION,
        minZoom: 0,
        maxZoom: 18,
        opacity: 0.7,
    };
}

export function clearAllCache(): void {
    Object.keys(cacheStore).forEach((key) => {
        delete cacheStore[key];
    });
}

export function getCacheStats(): Record<string, { age: number; size: string }> {
    const stats: Record<string, { age: number; size: string }> = {};
    Object.entries(cacheStore).forEach(([key, value]) => {
        const age = Math.round((Date.now() - value.timestamp) / 1000);
        const size = JSON.stringify(value.data).length;
        stats[key] = { age, size: `${(size / 1024).toFixed(2)}KB` };
    });
    return stats;
}
