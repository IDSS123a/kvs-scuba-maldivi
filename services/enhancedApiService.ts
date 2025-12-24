/**
 * Enhanced Free API Integration Services
 * Includes caching, error handling, and real-time rate limits
 */

import { ExchangeRates, MaldivesCountryData, OsmDiveSite } from '../types';

// Cache management
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour
const cacheStore: Record<string, { data: any; timestamp: number }> = {};

function getCache(key: string): any | null {
  const cached = cacheStore[key];
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log(`Cache hit: ${key}`);
    return cached.data;
  }
  return null;
}

function setCache(key: string, data: any): void {
  cacheStore[key] = { data, timestamp: Date.now() };
}

// =============================================================================
// FIXER.IO - Currency Exchange Rates
// =============================================================================

const FIXER_API_KEY = import.meta.env.VITE_FIXER_API_KEY || '';
const FIXER_CACHE_KEY = 'fixer_rates';

export interface ExchangeRateDetails extends ExchangeRates {
  timestamp: number;
  base: string;
}

/**
 * Fetch live EUR to BAM/USD rates from Fixer.io
 * Caches for 1 hour
 */
export async function fetchExchangeRates(symbols: string[] = ['USD', 'BAM']): Promise<ExchangeRates> {
  const cachedRates = getCache(FIXER_CACHE_KEY);
  if (cachedRates) return cachedRates;

  try {
    if (!FIXER_API_KEY) {
      throw new Error('Fixer API key not configured');
    }

    const response = await fetch(
      `https://data.fixer.io/api/latest?access_key=${FIXER_API_KEY}&symbols=${symbols.join(',')}`
    );

    if (!response.ok) {
      throw new Error(`Fixer API error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(`Fixer error: ${data.error?.type || 'Unknown error'}`);
    }

    const rates = {
      USD: data.rates.USD,
      BAM: data.rates.BAM,
      date: data.date,
    };

    setCache(FIXER_CACHE_KEY, rates);
    console.log('Fetched live exchange rates from Fixer.io:', rates);
    return rates;
  } catch (error) {
    console.warn('Failed to fetch live rates from Fixer.io, using fallback:', error);
    // Fallback to static rates (last known good values)
    const fallback = { USD: 1.08, BAM: 1.95583, date: new Date().toISOString() };
    setCache(FIXER_CACHE_KEY, fallback);
    return fallback;
  }
}

/**
 * Get exchange rate for a specific pair (e.g., EUR to BAM)
 */
export async function getExchangeRate(baseCurrency: string, targetCurrency: string): Promise<number> {
  const rates = await fetchExchangeRates([targetCurrency]);
  return rates[targetCurrency as keyof ExchangeRates] as number || 1;
}

/**
 * Convert amount from EUR to target currency
 */
export async function convertCurrency(amount: number, targetCurrency: string = 'BAM'): Promise<number> {
  const rate = await getExchangeRate('EUR', targetCurrency);
  return amount * rate;
}

// =============================================================================
// REST COUNTRIES - Country Information
// =============================================================================

const COUNTRIES_CACHE_KEY = 'maldives_data';

/**
 * Fetch detailed information about the Maldives
 * Caches for 1 hour
 */
export async function fetchMaldivesData(): Promise<MaldivesCountryData> {
  const cachedData = getCache(COUNTRIES_CACHE_KEY);
  if (cachedData) return cachedData;

  try {
    const response = await fetch('https://restcountries.com/v3.1/alpha/mdv');

    if (!response.ok) {
      throw new Error(`REST Countries API error: ${response.status}`);
    }

    const data = await response.json();
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error('Invalid response from REST Countries API');
    }

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
    console.log('Fetched Maldives data from REST Countries:', countryData);
    return countryData;
  } catch (error) {
    console.error('Failed to fetch Maldives data:', error);
    // Hardcoded fallback
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

// =============================================================================
// OVERPASS API - Dive Sites & POIs
// =============================================================================

const DIVE_SITES_CACHE_KEY = 'osm_dive_sites';
const MAAFUSHI_BBOX = '3.80,73.30,4.30,73.70'; // Bounding box around Maldives

/**
 * Fetch dive sites and points of interest from OpenStreetMap via Overpass API
 * Caches for 1 hour
 */
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

    if (!response.ok) {
      throw new Error(`Overpass API error: ${response.status}`);
    }

    const data = await response.json();

    if (!data?.elements || !Array.isArray(data.elements)) {
      throw new Error('Invalid Overpass API response');
    }

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
    console.log(`Fetched ${sites.length} dive sites/POIs from Overpass API`);
    return sites;
  } catch (error) {
    console.error('Failed to fetch dive sites from Overpass API:', error);
    // Return empty array instead of error - map will show no markers
    return [];
  }
}

/**
 * Fetch specific amenities (restaurants, shops, etc.) in Maafushi
 */
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

    if (!response.ok) {
      throw new Error(`Overpass API error: ${response.status}`);
    }

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
    console.error(`Failed to fetch ${amenityType} from Overpass API:`, error);
    return [];
  }
}

// =============================================================================
// OpenSeaMap Integration
// =============================================================================

/**
 * Get OpenSeaMap tile URLs for use with Leaflet
 * OpenSeaMap provides nautical data including:
 * - Buoys and navigation marks
 * - Harbors and ports
 * - Depth contours
 * - Wrecks and obstacles
 */
export const OPENSEAMAP_TILES = {
  // Base layer - nautical details
  seamark: 'https://tiles.openseamap.org/seamark/{z}/{x}/{y}.png',
  // Overlay with depth info
  depth: 'https://tiles.openseamap.org/depth/{z}/{x}/{y}.png',
};

/**
 * OpenSeaMap configuration for Leaflet
 */
export const OPENSEAMAP_ATTRIBUTION =
  '&copy; OpenSeaMap contributors | Map data &copy; OpenStreetMap contributors';

/**
 * Get Leaflet tile layer configuration for OpenSeaMap
 */
export function getOpenSeaMapConfig() {
  return {
    url: OPENSEAMAP_TILES.seamark,
    attribution: OPENSEAMAP_ATTRIBUTION,
    minZoom: 0,
    maxZoom: 18,
    opacity: 0.7,
  };
}

// =============================================================================
// Cache Management
// =============================================================================

/**
 * Clear all cached API data
 */
export function clearAllCache(): void {
  Object.keys(cacheStore).forEach((key) => {
    delete cacheStore[key];
  });
  console.log('Cleared all API caches');
}

/**
 * Get cache statistics
 */
export function getCacheStats(): Record<string, { age: number; size: string }> {
  const stats: Record<string, { age: number; size: string }> = {};
  Object.entries(cacheStore).forEach(([key, value]) => {
    const age = Math.round((Date.now() - value.timestamp) / 1000);
    const size = JSON.stringify(value.data).length;
    stats[key] = {
      age,
      size: `${(size / 1024).toFixed(2)}KB`,
    };
  });
  return stats;
}
