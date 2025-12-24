
// Simulated integration of:
// - jawish/maldives-geo (GeoJSON islands)
// - wisam87/mv-directory (Island & Atoll lookup)
// - WovenCoast/mv-prayertimes (Maafushi ID 102)

export interface AtollInfo {
  code: string;
  name: string;
  islandsCount: number;
  description: string;
}

export interface IslandInfo {
  id: number;
  name: string;
  atoll: string;
  type: 'Inhabited' | 'Resort' | 'Uninhabited';
}

export interface PrayerTimes {
  fajr: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
}

export const MaafushiData: IslandInfo = {
  id: 102,
  name: 'Maafushi',
  atoll: 'Kaafu (K)',
  type: 'Inhabited'
};

export const KaafuAtoll: AtollInfo = {
  code: 'K',
  name: 'South Malé Atoll',
  islandsCount: 30,
  description: 'Glavni turistički atol, poznat po vrhunskim ronilačkim lokacijama i kanalima.'
};

export async function getPrayerTimes(islandId: number): Promise<PrayerTimes> {
  // Simulate mv-prayertimes logic
  return {
    fajr: '05:12',
    dhuhr: '12:15',
    asr: '15:38',
    maghrib: '18:18',
    isha: '19:32'
  };
}

export async function getAtollInfo(atollCode: string): Promise<AtollInfo> {
  return KaafuAtoll;
}
