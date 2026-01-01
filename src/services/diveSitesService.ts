
const DIVENUMBER_API_KEY = import.meta.env.VITE_DIVENUMBER_API_KEY || '';
const DIVENUMBER_BASE_URL = 'https://divenumber.com/api';

export interface DiveSite {
  id: string;
  name: string;
  lat: number;
  lon: number;
  depth?: { min: number; max: number };
  difficulty?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  visibility?: { min: number; max: number };
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

export async function fetchDiveSites(): Promise<DiveSiteDetails[]> {
  return getLocalDiveSites();
}

export async function getLocalDiveSites(): Promise<DiveSiteDetails[]> {
  return LOCAL_DIVE_SITES;
}

export async function getDiveSiteById(siteId: string): Promise<DiveSiteDetails | null> {
  const allSites = await fetchDiveSites();
  return allSites.find(site => site.id === siteId) || null;
}

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

export async function getDiveSitesByDifficulty(
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert'
): Promise<DiveSiteDetails[]> {
  const allSites = await fetchDiveSites();
  return allSites.filter(site => site.difficulty === difficulty);
}

export async function getDiveSitesBySeason(month: number): Promise<DiveSiteDetails[]> {
  const allSites = await fetchDiveSites();
  const isHighSeason = month >= 10 || month <= 4;
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
