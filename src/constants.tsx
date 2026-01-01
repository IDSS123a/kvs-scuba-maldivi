
import { Diver, ItineraryItem, PaymentStatus } from './types';
import { Plane, Waves, Ship, MapPin, Coffee, Info } from 'lucide-react';
import React from 'react';

export const TRIP_START_DATE = new Date('2026-01-05T15:30:00');
export const TRIP_END_DATE = new Date('2026-01-16T19:20:00');

// Cene iz konverzacije (Viber PDF)
// Agenciji: 925 EUR, Adnanu: 915 EUR. Ukupno: 1840 EUR.
export const PRICE_AGENCY_EUR = 925;
export const PRICE_CASH_EUR = 915;
export const TOTAL_ADULT_EUR = PRICE_AGENCY_EUR + PRICE_CASH_EUR; // 1840 EUR
export const CHILD_HOTEL_SURCHARGE_EUR = 150; // 15 EUR x 10 nights

export const ITINERARY: ItineraryItem[] = [
    {
        day: 1,
        date: 'Jan 5',
        title: 'Polazak i Dolazak',
        description: 'Let SJJ-IST (15:30), presjedanje na IST-MLE. Dolazak na Maafushi, smještaj i briefing u dive centru.',
        type: 'Flight',
        location: 'Maafushi',
        dives: [
            {
                site: 'Maafushi Lagoon',
                description: 'Shore dive, plitko, idealno za početnike.',
                depthRange_m: '2–3',
                visibility_m: '15–25',
                difficulty: 'početnički',
                marineLife: ['blacktip sharks', 'stingrays', 'eagle rays'],
                safetyNotes: 'Pratiti instruktora, koristiti sigurnosnu opremu.',
                diveCenter: 'Maafushi Dive Center',
                sourceLinks: ['https://www.maafushi.mv/scuba-diving/']
            }
        ]
    },
    {
        day: 2,
        date: 'Jan 6',
        title: 'Maafushi Caves Explore',
        description: 'Spektakularne podvodne špilje i noćni dive opcija.',
        type: 'Dive',
        location: 'Maafushi Caves',
        dives: [
            {
                site: 'Maafushi Caves',
                description: 'Spektakularne podvodne špilje, eagle rays, reef ajkule, morske kornjače.',
                depthRange_m: 'do ~30',
                visibility_m: '15–30',
                difficulty: 'srednji – napredni',
                marineLife: ['eagle rays', 'reef sharks', 'napoleon fish', 'nudibranchs'],
                safetyNotes: 'Drift dive moguće, pratiti struje i instruktora.',
                diveCenter: 'Maafushi Scuba',
                sourceLinks: ['https://maafushi.com/diving/', 'https://maldives-magazine.com/diving/maafushi.htm']
            },
            {
                site: 'Maafushi Lagoon (Night)',
                description: 'Noćni dive, plitko, moguće vidjeti mantis shrimps, eels, nocturnal marine life.',
                depthRange_m: '2–3',
                visibility_m: '15–20',
                difficulty: 'početnički – srednji',
                diveCenter: 'Maafushi Dive Center'
            }
        ]
    },
    {
        day: 3,
        date: 'Jan 7',
        title: 'Guraidhoo & Pelagic Life',
        description: 'Impresivni podvodni pejzaž i jake struje. 2 kanala i centralni greben (Medhu Faru).',
        type: 'Dive',
        location: 'Guraidhoo Channel',
        dives: [
            {
                site: 'Guraidhoo Corner',
                description: 'Poznat po "washing machines" strujama. Grey reef sharks, eagle rays, moray eels.',
                depthRange_m: '5–30',
                visibility_m: 'do 30',
                difficulty: 'napredni (iskustvo u strujama)',
                marineLife: ['grey reef sharks', 'eagle rays', 'moray eels', 'parrotfish'],
                diveCenter: 'Maafushi Scuba'
            }
        ]
    },
    {
        day: 4,
        date: 'Jan 8',
        title: 'Cocoa Corner & Shipwreck',
        description: 'Pinnacle dive sa strmim drop-off-om i istraživanje olupine.',
        type: 'Dive',
        location: 'South Male Atoll',
        dives: [
            {
                site: 'Cocoa Corner',
                description: '400m pinnacle sa pećinama i overhangovima. Najbolje mjesto za vidjeti ajkule (odrasle i bebe).',
                depthRange_m: '12–30',
                visibility_m: '5–22',
                difficulty: 'srednji – napredni',
                diveCenter: 'Maafushi Scuba',
                marineLife: ['sharks', 'tuna', 'barracudas', 'eagle rays']
            },
            {
                site: 'Kuda Giri Wreck',
                description: 'Šarmantna olupina ugrađena u koralje. Stanovnici su jastozi, frog fish i lion fish.',
                depthRange_m: '15–30',
                visibility_m: '5–15',
                difficulty: 'početnički',
                diveCenter: 'Maafushi Dive Center'
            }
        ]
    },
    {
        day: 5,
        date: 'Jan 9',
        title: 'Embudhoo Express',
        description: '2 kilometra marin zaštićenog područja. Jaka struja i spektakularan pejzaž.',
        type: 'Dive',
        location: 'Vaavu Atoll (Passage)',
        dives: [
            {
                site: 'Embudhoo Express',
                description: 'Čisti adrenalin. Grey sharks, hammerheads, manta rays i yellow fin tuna.',
                depthRange_m: '5–30',
                visibility_m: '15–30',
                difficulty: 'intermediate to advanced',
                marineLife: ['grey sharks', 'hammerheads', 'manta rays', 'eagle rays', 'tuna'],
                diveCenter: 'Maafushi Scuba'
            }
        ]
    },
    {
        day: 6,
        date: 'Jan 10',
        title: 'Whale Shark & Manta Quest',
        description: 'Cjelodnevni izlet u South Ari Atoll u potrazi za kit ajkulama i mantama. Snorkeling opcija.',
        type: 'Excursion',
        location: 'South Ari Atoll'
    },
    {
        day: 7,
        date: 'Jan 11',
        title: 'Vadhoo Caves & Drift',
        description: 'Istraživanje pećina na sjevernoj obali South Male Atola. Zahtijeva preciznu plovnost.',
        type: 'Dive',
        location: 'Vadhoo Channel',
        dives: [
            {
                site: 'Vadhoo Caves',
                description: 'Pećine prekrivene mekim koraljima. Eagle rays i kornjače u plavetnilu.',
                depthRange_m: 'varijabilno',
                visibility_m: 'visoka',
                difficulty: 'srednji – napredni',
                marineLife: ['eagle rays', 'whitetip sharks', 'turtles', 'tuna'],
                safetyNotes: 'Impeccable buoyancy control required.'
            }
        ]
    },
    {
        day: 8,
        date: 'Jan 12',
        title: 'Hidden Gems Exploration',
        description: 'Istraživanje manje poznatih lokacija. Veća vjerovatnoća za specijalne vrste.',
        type: 'Dive',
        location: 'Vaavu Atoll'
    },
    {
        day: 9,
        date: 'Jan 13',
        title: 'Shark Tank - Hammerhead Quest',
        description: 'Poseban (skupi) zaron kod Hulhumale gdje se često vide tigrske i čekičaste ajkule. Doplata: 150-200€.',
        type: 'Dive',
        location: 'Hulhumale - Shark Tank',
        dives: [
            {
                site: 'Shark Tank',
                description: 'Poznata lokacija za tigrske ajkule i čekičaste ajkule (hammerheads). Duboki ronjenja, struje.',
                depthRange_m: '20–40',
                visibility_m: '15–30',
                difficulty: 'napredni',
                marineLife: ['tiger sharks', 'hammerhead sharks', 'grey reef sharks', 'trevally'],
                safetyNotes: 'Samo za iskusne ronioce. Pratite instruktora. Spojena boja može biti opasna.',
                diveCenter: 'Specialized Operator'
            }
        ]
    },
    {
        day: 10,
        date: 'Jan 14',
        title: 'Final Dives & Celebration',
        description: 'Zadnja 3 zarona u paketu na omiljenim lokacijama. Večernja oproštajna kafa i proslave.',
        type: 'Dive',
        location: 'Maafushi'
    },
    {
        day: 11,
        date: 'Jan 15',
        title: 'Male City Tour',
        description: 'No-fly day. Izlet u Male: pijaca (Local Market), Maldives National Mosque, soveniri, shopping na local boutique-ima.',
        type: 'Excursion',
        location: 'Male City'
    },
    {
        day: 12,
        date: 'Jan 16',
        title: 'Povratak Kući',
        description: 'Transfer na aerodrom. Let MLE-IST (09:15), čekanje, zatim IST-SJJ (19:30). Dolazak u Sarajevo oko 21:30.',
        type: 'Flight',
        location: 'Sarajevo'
    }
];

export const getIcon = (type: ItineraryItem['type']): React.ReactNode => {
    switch (type) {
        case 'Flight': return <Plane className="w-5 h-5 text-blue-300" />;
        case 'Dive': return <Waves className="w-5 h-5 text-cyan-400" />;
        case 'Transfer': return <Ship className="w-5 h-5 text-emerald-400" />;
        case 'Excursion': return <MapPin className="w-5 h-5 text-amber-400" />;
        default: return null;
    }
};
