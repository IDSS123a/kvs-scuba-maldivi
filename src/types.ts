
export enum View {
    DASHBOARD = 'dashboard',
    ITINERARY = 'itinerary',
    PARTICIPANTS = 'participants',
    GALLERY = 'gallery',
    PREPARATION = 'preparation',
    ESSENTIAL_INFO = 'essential-info',
    GUIDES = 'guides',
    ADMIN = 'admin'
}

export type Theme = 'light' | 'dark';
export type Language = 'BS' | 'EN';

export interface EmergencyContact {
    name: string;
    relationship: string;
    phone: string;
}

export interface AuthUser {
    uid: string;
    email: string;
    displayName: string;
    photoURL?: string;
    role: 'user' | 'admin';
    user_metadata?: any;
}

export interface Diver {
    id: string;
    name: string;
    fullName?: string;
    address?: string;
    city?: string;
    country?: string;
    birthDate?: string;
    age?: number;
    email?: string;
    phone1?: string;
    phone2?: string;
    dives?: number;
    divesFromYear?: number;
    freedives?: number;
    freedivesFromYear?: number;
    masterId?: string;
    ssiPro?: string;
    ssiProId?: string; // Add specific field matching DB
    role: 'Adult' | 'Child' | 'Admin';
    photo: string;
    status: 'Confirmed' | 'Pending';
    roommate?: string;
    dietaryRestrictions?: string;
    emergencyContact?: EmergencyContact;
    isDiver?: boolean;
    isPro?: boolean;
    is_pro?: boolean;
    startYear?: number;
}

export interface DiveInfo {
    site: string;
    description: string;
    depthRange_m?: string;
    visibility_m?: string;
    difficulty?: string;
    marineLife?: string[];
    safetyNotes?: string;
    diveCenter?: string;
    sourceLinks?: string[];
}

export interface ItineraryItem {
    day: number;
    date: string;
    title: string;
    description: string;
    type: 'Flight' | 'Dive' | 'Transfer' | 'Excursion';
    location?: string;
    coords?: [number, number];
    dives?: DiveInfo[];
}

export interface PaymentStatus {
    diverId: string;
    name: string;
    total: number;
    paid: number;
}

// New API Interfaces
export interface ExchangeRates {
    USD: number;
    BAM: number;
    date: string;
}

export interface MaldivesCountryData {
    capital: string;
    region: string;
    currency: string;
    callingCode: string;
    languages: string[];
    population: number;
}

export interface OsmDiveSite {
    id: number;
    lat: number;
    lon: number;
    name: string;
    type: string;
    tags: Record<string, string>;
}
