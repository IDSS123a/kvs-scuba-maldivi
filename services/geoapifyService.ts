/**
 * Geoapify API Service
 * Provides static map URLs, geocoding, and location-based services
 */

const GEOAPIFY_API_KEY = '3ada0be236ef49948f16238fed3ef782';
const GEOAPIFY_BASE_URL = 'https://api.geoapify.com';

// TypeScript interfaces
export interface GeocodeResult {
  lat: number;
  lon: number;
  address: string;
  country: string;
  state?: string;
  city?: string;
}

export interface ReverseGeocodeResult {
  address: string;
  city?: string;
  country: string;
  postcode?: string;
}

export interface MapOptions {
  lat: number;
  lon: number;
  zoom?: number;
  width?: number;
  height?: number;
  style?: 'osm-bright' | 'osm-bright-smooth' | 'dark' | 'klokantech-basic';
  marker?: {
    lat: number;
    lon: number;
    text?: string;
    color?: string;
  };
}

/**
 * Generates a static map URL for a given location
 * @param options - Map configuration options
 * @returns URL string for the static map image
 */
export function getStaticMapUrl(options: MapOptions): string {
  const {
    lat,
    lon,
    zoom = 13,
    width = 600,
    height = 400,
    style = 'osm-bright-smooth'
  } = options;

  let url = `${GEOAPIFY_BASE_URL}/staticmap?style=${style}&width=${width}&height=${height}&center=lonlat:${lon},${lat}&zoom=${zoom}`;

  if (options.marker) {
    const { marker } = options;
    url += `&marker=lonlat:${marker.lon},${marker.lat};type:awesome;`;
    if (marker.text) url += `text:${marker.text};`;
    if (marker.color) url += `color:${marker.color};`;
  }

  url += `&apiKey=${GEOAPIFY_API_KEY}`;

  return url;
}

/**
 * Generates a static map URL with multiple markers
 * @param centerLat - Center latitude
 * @param centerLon - Center longitude
 * @param markers - Array of marker objects
 * @param zoom - Zoom level
 * @returns URL string for the static map with markers
 */
export function getStaticMapWithMarkersUrl(
  centerLat: number,
  centerLon: number,
  markers: Array<{ lat: number; lon: number; text?: string; color?: string }>,
  zoom: number = 11
): string {
  const width = 800;
  const height = 600;
  const style = 'osm-bright-smooth';

  let url = `${GEOAPIFY_BASE_URL}/staticmap?style=${style}&width=${width}&height=${height}&center=lonlat:${centerLon},${centerLat}&zoom=${zoom}`;

  // Add all markers
  markers.forEach(marker => {
    url += `&marker=lonlat:${marker.lon},${marker.lat};type:awesome;`;
    if (marker.text) url += `text:${marker.text};`;
    if (marker.color) url += `color:${marker.color};`;
  });

  url += `&apiKey=${GEOAPIFY_API_KEY}`;

  return url;
}

/**
 * Geocodes an address to coordinates
 * @param address - Address or location name to geocode
 * @returns Promise<GeocodeResult | null> - Coordinates and details
 */
export async function geocodeAddress(address: string): Promise<GeocodeResult | null> {
  try {
    const url = `${GEOAPIFY_BASE_URL}/v1/geocode/search?text=${encodeURIComponent(address)}&limit=1&apiKey=${GEOAPIFY_API_KEY}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Geoapify API error: ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.features || data.features.length === 0) {
      return null;
    }

    const feature = data.features[0];
    const properties = feature.properties;
    const geometry = feature.geometry;

    return {
      lat: geometry.coordinates[1],
      lon: geometry.coordinates[0],
      address: properties.formatted || address,
      country: properties.country || '',
      state: properties.state,
      city: properties.city
    };
  } catch (error) {
    console.error('Error geocoding address:', error);
    return null;
  }
}

/**
 * Reverse geocodes coordinates to an address
 * @param lat - Latitude
 * @param lon - Longitude
 * @returns Promise<ReverseGeocodeResult | null> - Address details
 */
export async function reverseGeocodeCoordinates(
  lat: number,
  lon: number
): Promise<ReverseGeocodeResult | null> {
  try {
    const url = `${GEOAPIFY_BASE_URL}/v1/geocode/reverse?lat=${lat}&lon=${lon}&apiKey=${GEOAPIFY_API_KEY}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Geoapify API error: ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.features || data.features.length === 0) {
      return null;
    }

    const properties = data.features[0].properties;

    return {
      address: properties.formatted || '',
      city: properties.city,
      country: properties.country || '',
      postcode: properties.postcode
    };
  } catch (error) {
    console.error('Error reverse geocoding coordinates:', error);
    return null;
  }
}

/**
 * Calculates distance between two points using haversine formula
 * @param lat1 - First latitude
 * @param lon1 - First longitude
 * @param lat2 - Second latitude
 * @param lon2 - Second longitude
 * @returns Distance in kilometers
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
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

/**
 * Gets nearby locations based on distance
 * @param centerLat - Center latitude
 * @param centerLon - Center longitude
 * @param locations - Array of locations with lat/lon
 * @param radiusKm - Search radius in kilometers
 * @returns Filtered array of locations within radius
 */
export function getNearbyLocations<T extends { lat: number; lon: number }>(
  centerLat: number,
  centerLon: number,
  locations: T[],
  radiusKm: number = 50
): T[] {
  return locations.filter(location => {
    const distance = calculateDistance(centerLat, centerLon, location.lat, location.lon);
    return distance <= radiusKm;
  });
}
