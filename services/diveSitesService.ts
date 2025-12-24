/**
 * Dive Sites Service
 * Fetches dive site data from DiveNumber API with hardcoded fallback
 */

const DIVENUMBER_API_KEY = '1b963527fe228ebea8e82ca12807af71';
const DIVENUMBER_BASE_URL = 'https://divenumber.com/api';

// TypeScript interfaces
export interface DiveSite {
  id: string;
  name: string;
  lat: number;
  lon: number;
  depth?: {
    min: number;
    max: number;
  };
  difficulty?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  visibility?: {
    min: number;
    max: number;
  };
  currentStrength?: 'none' | 'mild' | 'moderate' | 'strong';
  season?: string;
  marineLife?: string[];
  description?: string;
  typicalSpecies?: string[];
}

export interface DiveSiteDetails extends DiveSite {
  waterTemperature?: number;
  bestMonth?: string;
  worstMonth?: string;
  reviews?: number;
  rating?: number;
  source?: 'divenumber' | 'overpass' | 'local';
}

// Local dive sites database (fallback and enrichment)
const LOCAL_DIVE_SITES: DiveSiteDetails[] = [
  {
    id: 'maafushi-caves',
    name: 'Maafushi Caves',
    lat: 4.1928,
    lon: 73.4083,
    depth: { min: 15, max: 40 },
    difficulty: 'intermediate',
    visibility: { min: 20, max: 40 },
    currentStrength: 'moderate',
    season: 'November to April',
    waterTemperature: 27,
    bestMonth: 'January',
    marineLife: ['sharks', 'rays', 'groupers', 'snappers'],
    description: 'Deep caves and overhangs with excellent macro life. Perfect for photography.',
    source: 'local'
  },
  {
    id: 'guraidhoo-corner',
    name: 'Guraidhoo Corner',
    lat: 4.2333,
    lon: 73.5167,
    depth: { min: 5, max: 30 },
    difficulty: 'beginner',
    visibility: { min: 15, max: 30 },
    currentStrength: 'strong',
    season: 'October to April',
    waterTemperature: 27,
    bestMonth: 'March',
    marineLife: ['pelagic fish', 'sharks', 'barracuda'],
    description: 'Famous reef corner with strong currents. Great for drift diving.',
    source: 'local'
  },
  {
    id: 'south-ari-atoll',
    name: 'South Ari Atoll',
    lat: 3.8667,
    lon: 72.7667,
    depth: { min: 8, max: 35 },
    difficulty: 'intermediate',
    visibility: { min: 25, max: 50 },
    currentStrength: 'mild',
    season: 'October to April',
    waterTemperature: 28,
    bestMonth: 'February',
    marineLife: ['whale sharks', 'manta rays', 'reef fish'],
    description: 'Pristine atolls with abundant marine life and excellent visibility.',
    source: 'local'
  },
  {
    id: 'banana-reef',
    name: 'Banana Reef',
    lat: 4.1745,
    lon: 73.5123,
    depth: { min: 3, max: 25 },
    difficulty: 'beginner',
    visibility: { min: 10, max: 25 },
    currentStrength: 'mild',
    season: 'Year-round',
    waterTemperature: 26,
    bestMonth: 'March',
    marineLife: ['coral', 'small fish', 'sea turtles'],
    description: 'Shallow coral reef excellent for beginners and snorkeling.',
    source: 'local'
  },
  {
    id: 'shark-tank',
    name: 'Shark Tank',
    lat: 4.0333,
    lon: 73.5667,
    depth: { min: 20, max: 40 },
    difficulty: 'advanced',
    visibility: { min: 20, max: 45 },
    currentStrength: 'strong',
    season: 'October to April',
    waterTemperature: 27,
    bestMonth: 'February',
    marineLife: ['sharks', 'rays', 'large pelagics'],
    description: 'Named for the abundance of reef sharks. Suitable for experienced divers.',
    source: 'local'
  },
  {
    id: 'kuda-giri-wreck',
    name: 'Kuda Giri Wreck',
    lat: 3.9833,
    lon: 72.8333,
    depth: { min: 12, max: 35 },
    difficulty: 'advanced',
    visibility: { min: 15, max: 40 },
    currentStrength: 'moderate',
    season: 'October to April',
    waterTemperature: 27,
    bestMonth: 'February',
    marineLife: ['wreck fish', 'groupers', 'rays'],
    description: 'Sunken vessel with rich marine growth. Excellent for wreck diving.',
    source: 'local'
  }
];

/**
 * Attempts to fetch dive sites from DiveNumber API
 * Falls back to local database if API fails
 * @returns Promise<DiveSiteDetails[]> - Array of dive sites
 */
export async function fetchDiveSites(): Promise<DiveSiteDetails[]> {
  try {
    // Try DiveNumber API first
    const diveSites = await fetchFromDiveNumberAPI();
    if (diveSites.length > 0) {
      return diveSites;
    }
  } catch (error) {
    console.warn('DiveNumber API failed, using fallback:', error);
  }

  // Fallback: Use local database enriched with Overpass reef data
  return getLocalDiveSites();
}

/**
 * Attempts to fetch from DiveNumber API
 * @returns Promise<DiveSiteDetails[]>
 */
async function fetchFromDiveNumberAPI(): Promise<DiveSiteDetails[]> {
  try {
    // Try getting dive sites - DiveNumber API endpoint
    const url = `${DIVENUMBER_BASE_URL}/dive-sites?key=${DIVENUMBER_API_KEY}&location=maldives`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`DiveNumber API error: ${response.statusText}`);
    }

    const data = await response.json();

    // Transform DiveNumber response to DiveSiteDetails
    if (Array.isArray(data)) {
      return data.map(site => ({
        id: site.id || `divenumber-${site.name?.toLowerCase().replace(/\s+/g, '-')}`,
        name: site.name || 'Unknown Dive Site',
        lat: site.latitude || site.lat || 0,
        lon: site.longitude || site.lon || 0,
        depth: site.depth,
        difficulty: site.difficulty,
        visibility: site.visibility,
        description: site.description,
        waterTemperature: site.temperature,
        source: 'divenumber'
      }));
    }

    return [];
  } catch (error) {
    console.error('Error fetching from DiveNumber API:', error);
    return [];
  }
}

/**
 * Gets local dive sites with enriched data
 * @returns Promise<DiveSiteDetails[]>
 */
export async function getLocalDiveSites(): Promise<DiveSiteDetails[]> {
  try {
    // Try to enrich with reef data from Overpass
    // For now, just return local dive sites
    return LOCAL_DIVE_SITES;
  } catch (error) {
    console.warn('Error enriching dive sites with Overpass data:', error);
    return LOCAL_DIVE_SITES;
  }
}

/**
 * Gets a specific dive site by ID
 * @param siteId - Dive site ID
 * @returns Promise<DiveSiteDetails | null>
 */
export async function getDiveSiteById(siteId: string): Promise<DiveSiteDetails | null> {
  const allSites = await fetchDiveSites();
  return allSites.find(site => site.id === siteId) || null;
}

/**
 * Finds nearby dive sites based on coordinates
 * @param lat - Center latitude
 * @param lon - Center longitude
 * @param radiusKm - Search radius in kilometers
 * @returns Promise<DiveSiteDetails[]>
 */
export async function findNearbyDiveSites(
  lat: number,
  lon: number,
  radiusKm: number = 50
): Promise<DiveSiteDetails[]> {
  const allSites = await fetchDiveSites();

  return allSites.filter(site => {
    const distance = calculateDistance(lat, lon, site.lat, site.lon);
    return distance <= radiusKm;
  });
}

/**
 * Gets dive sites filtered by difficulty level
 * @param difficulty - Difficulty level
 * @returns Promise<DiveSiteDetails[]>
 */
export async function getDiveSitesByDifficulty(
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert'
): Promise<DiveSiteDetails[]> {
  const allSites = await fetchDiveSites();
  return allSites.filter(site => site.difficulty === difficulty);
}

/**
 * Gets dive sites that are in season
 * @param month - Month number (1-12)
 * @returns Promise<DiveSiteDetails[]>
 */
export async function getDiveSitesBySeason(month: number): Promise<DiveSiteDetails[]> {
  const allSites = await fetchDiveSites();
  const isHighSeason = month >= 10 || month <= 4; // October to April

  // Filter sites that are good for this season
  return allSites.filter(site => {
    if (!site.season) return true;
    const season = site.season.toLowerCase();
    return (
      season.includes('year-round') ||
      (isHighSeason && (season.includes('october') || season.includes('april'))) ||
      (!isHighSeason && season.includes('summer'))
    );
  });
}

/**
 * Calculates distance between two coordinates using haversine formula
 * @param lat1 - First latitude
 * @param lon1 - First longitude
 * @param lat2 - Second latitude
 * @param lon2 - Second longitude
 * @returns Distance in kilometers
 */
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
