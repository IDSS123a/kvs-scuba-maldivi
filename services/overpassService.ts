/**
 * Overpass API Service
 * Fetches Points of Interest (POIs) from OpenStreetMap data
 * Used for pharmacies, hospitals, attractions, bureaux de change, etc.
 */

// TypeScript interfaces for Overpass API responses
export interface OverpassElement {
  type: 'node' | 'way' | 'relation';
  id: number;
  lat?: number;
  lon?: number;
  center?: {
    lat: number;
    lon: number;
  };
  tags?: Record<string, string>;
}

export interface OverpassResponse {
  elements: OverpassElement[];
}

export interface POI {
  id: number;
  lat: number;
  lon: number;
  name: string;
  type: string;
  category: 'pharmacy' | 'hospital' | 'attraction' | 'bureau_de_change' | 'restaurant' | 'accommodation';
  description?: string;
}

// Maldives bounding box
const MALDIVES_BBOX = {
  south: -0.9,
  west: 72.8,
  north: 7.2,
  east: 73.9
};

// Overpass API endpoint
const OVERPASS_API_URL = 'https://overpass-api.de/api/interpreter';

/**
 * Fetches Points of Interest (POIs) for Maldives
 * @param category - Type of POI to fetch: 'pharmacy', 'hospital', 'attraction', 'bureau_de_change'
 * @returns Promise<POI[]> - Array of POIs with coordinates and details
 */
export async function fetchPOIsForMaldivi(category: 'pharmacy' | 'hospital' | 'attraction' | 'bureau_de_change' | 'restaurant' | 'accommodation' = 'attraction'): Promise<POI[]> {
  try {
    // Build Overpass QL query based on category
    let query: string;

    switch (category) {
      case 'pharmacy':
        query = buildOverpassQuery('amenity', 'pharmacy');
        break;
      case 'hospital':
        query = buildOverpassQuery('amenity', 'hospital');
        break;
      case 'bureau_de_change':
        query = buildOverpassQuery('amenity', 'bureau_de_change');
        break;
      case 'restaurant':
        query = buildOverpassQuery('amenity', 'restaurant');
        break;
      case 'accommodation':
        query = buildOverpassQuery('tourism', 'guest_house|hotel|resort');
        break;
      case 'attraction':
      default:
        query = buildOverpassQuery('tourism', 'attraction');
        break;
    }

    const response = await fetch(OVERPASS_API_URL, {
      method: 'POST',
      body: query,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    if (!response.ok) {
      throw new Error(`Overpass API error: ${response.statusText}`);
    }

    const data: OverpassResponse = await response.json();
    
    // Transform Overpass elements to POI format
    const pois: POI[] = data.elements
      .filter(element => {
        const lat = element.lat !== undefined ? element.lat : element.center?.lat;
        const lon = element.lon !== undefined ? element.lon : element.center?.lon;
        return lat !== undefined && lon !== undefined;
      })
      .map(element => {
        const lat = element.lat !== undefined ? element.lat : element.center?.lat!;
        const lon = element.lon !== undefined ? element.lon : element.center?.lon!;
        const tags = element.tags || {};

        return {
          id: element.id,
          lat,
          lon,
          name: tags.name || tags['name:en'] || `${category} (${element.id})`,
          type: tags.type || category,
          category: category as any,
          description: tags.description || tags['description:en'] || ''
        };
      });

    return pois;
  } catch (error) {
    console.error('Error fetching POIs from Overpass API:', error);
    return [];
  }
}

/**
 * Builds an Overpass QL query string
 * @param key - OSM tag key (e.g., 'amenity', 'tourism')
 * @param value - OSM tag value (e.g., 'pharmacy', 'hospital')
 * @returns Overpass QL query string
 */
function buildOverpassQuery(key: string, value: string): string {
  const { south, west, north, east } = MALDIVES_BBOX;
  
  return `[out:json];
(
  node["${key}"="${value}"](${south},${west},${north},${east});
  way["${key}"="${value}"](${south},${west},${north},${east});
);
out center;`;
}

/**
 * Fetches dive-related POIs (dive centers, dive shops)
 * @returns Promise<POI[]> - Array of dive-related POIs
 */
export async function fetchDivePOIs(): Promise<POI[]> {
  try {
    const { south, west, north, east } = MALDIVES_BBOX;
    
    const query = `[out:json];
(
  node["shop"="diving"](${south},${west},${north},${east});
  way["shop"="diving"](${south},${west},${north},${east});
  node["amenity"="dive_centre"](${south},${west},${north},${east});
  way["amenity"="dive_centre"](${south},${west},${north},${east});
);
out center;`;

    const response = await fetch(OVERPASS_API_URL, {
      method: 'POST',
      body: query,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    if (!response.ok) {
      throw new Error(`Overpass API error: ${response.statusText}`);
    }

    const data: OverpassResponse = await response.json();

    const pois: POI[] = data.elements
      .filter(element => {
        const lat = element.lat !== undefined ? element.lat : element.center?.lat;
        const lon = element.lon !== undefined ? element.lon : element.center?.lon;
        return lat !== undefined && lon !== undefined;
      })
      .map(element => {
        const lat = element.lat !== undefined ? element.lat : element.center?.lat!;
        const lon = element.lon !== undefined ? element.lon : element.center?.lon!;
        const tags = element.tags || {};

        return {
          id: element.id,
          lat,
          lon,
          name: tags.name || tags['name:en'] || `Dive Center (${element.id})`,
          type: 'dive_centre',
          category: 'attraction' as const,
          description: tags.description || tags['operator'] || 'Diving facility'
        };
      });

    return pois;
  } catch (error) {
    console.error('Error fetching dive POIs from Overpass API:', error);
    return [];
  }
}

/**
 * Fetches reef locations (for dive site mapping)
 * @returns Promise<POI[]> - Array of reef locations
 */
export async function fetchReefLocations(): Promise<POI[]> {
  try {
    const { south, west, north, east } = MALDIVES_BBOX;

    const query = `[out:json];
(
  node["natural"="reef"](${south},${west},${north},${east});
  way["natural"="reef"](${south},${west},${north},${east});
);
out center;`;

    const response = await fetch(OVERPASS_API_URL, {
      method: 'POST',
      body: query,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    if (!response.ok) {
      throw new Error(`Overpass API error: ${response.statusText}`);
    }

    const data: OverpassResponse = await response.json();

    const pois: POI[] = data.elements
      .filter(element => {
        const lat = element.lat !== undefined ? element.lat : element.center?.lat;
        const lon = element.lon !== undefined ? element.lon : element.center?.lon;
        return lat !== undefined && lon !== undefined;
      })
      .map(element => {
        const lat = element.lat !== undefined ? element.lat : element.center?.lat!;
        const lon = element.lon !== undefined ? element.lon : element.center?.lon!;

        return {
          id: element.id,
          lat,
          lon,
          name: `Reef (${element.id})`,
          type: 'reef',
          category: 'attraction' as const,
          description: 'Reef diving location'
        };
      });

    return pois;
  } catch (error) {
    console.error('Error fetching reef locations from Overpass API:', error);
    return [];
  }
}

