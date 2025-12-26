
export interface DiveSite {
    name: string;
    type: string;
    level: string;
    depth: string;
    visibility: string;
    highlights: string[];
    description: string;
    bestTime?: string;
}

export const DIVE_SITES: DiveSite[] = [
    {
        name: "Kandooma Thila",
        type: "Pinnacle, Drift Dive",
        level: "Intermediate to Advanced",
        depth: "12-40m",
        visibility: "30m",
        highlights: ["Barracudas", "Napoleon wrasse", "Grey reef sharks", "Eagle rays"],
        description: "Considered one of the best dive sites in North Male with overhangs and vibrant soft coral. Schools of fish and sharks between the thila and the ocean during incoming currents."
    },
    {
        name: "Cocoa Corner",
        type: "Channel",
        level: "Novice to Advanced",
        depth: "12-30m",
        visibility: "5-22m",
        highlights: ["Adult and Newborn Sharks", "Eagle rays", "Tuna", "Caves", "Overhangs"],
        description: "A 400 meter pinnacle with a steep drop-off. Best place to spot sharks cruising along the edge of the channel."
    },
    {
        name: "Guraidhoo (Corner/Channel)",
        type: "Reef / Channel",
        level: "Advanced (Experience in currents)",
        depth: "5-30m",
        visibility: "Up to 30m",
        highlights: ["Grey reef sharks", "Eagle rays", "Moray eels", "Washing machine currents"],
        description: "Impressive underwater landscape and strong currents. Consists of 2 channels and a central reef. Pelagic species are common."
    },
    {
        name: "Kuda Giri & Shipwreck",
        type: "Wreck",
        level: "Novice",
        depth: "15-30m",
        visibility: "5-15m",
        highlights: ["Lobsters", "Lion fish", "Frog fish", "Stone fish", "Glassfish"],
        description: "A charming little wreck embedded with colorful sponges and corals. Ideal for macro photography and night dives."
    },
    {
        name: "Dhigu Thila (Manta Point)",
        type: "Drift",
        level: "Novice to Intermediate",
        depth: "3-26m",
        visibility: "5-30m",
        highlights: ["Manta Rays", "Nurse sharks", "Napoleon wrasse", "Stringrays"],
        description: "Located in a channel, approximately 400m long. Mantas congregate here for feeding during outgoing currents."
    },
    {
        name: "Sexy Reef",
        type: "Reef",
        level: "Novice",
        depth: "Varies",
        visibility: "High",
        highlights: ["Overhangs", "Eels", "Schools of tuna", "Turtles"],
        description: "House reef of a pristine sandbank near Maafushi. Sandy slope descending into a coral garden."
    },
    {
        name: "Miyaru Faru (Shark Reef)",
        type: "Wall / Channel / Drift",
        level: "All levels",
        depth: "5-30m",
        visibility: "15-30m",
        highlights: ["Herds of sharks", "Napoleon wrasse", "Snappers", "Turtles"],
        description: "Place to dive among herds of friendly sharks. Abundant marine life."
    },
    {
        name: "Embudhoo Express",
        type: "Wall / Drift / Thila",
        level: "Intermediate to Advanced",
        depth: "5-30m",
        visibility: "15-30m",
        highlights: ["Hammerheads", "Manta rays", "Eagle rays", "Yellow fin tuna", "Grey sharks"],
        description: "A 2 kilometer marine protected area with strong currents. Simply spectacular array of marine life."
    },
    {
        name: "Vadhoo Caves",
        type: "Wall / Drift",
        level: "Intermediate to Advanced",
        depth: "Varies",
        visibility: "High",
        highlights: ["Soft corals", "Eagle rays", "Whitetip sharks", "Turtles"],
        description: "Caves nestled with soft corals on the northern coast of South Male Atoll. Requires impeccable buoyancy control."
    },
    {
        name: "Shark Tank (Hulhumale)",
        type: "Deep / Shark Dive",
        level: "Advanced Deep Divers only",
        depth: "20-40m",
        visibility: "Murky at times",
        highlights: ["Tiger Sharks", "Bull Sharks", "Great Hammerhead", "Guitarfish"],
        description: "Specialized dive site for 7+ species of sharks. High current and deep water. Proper behavior is mandatory."
    }
];

export const SEASONAL_INFO = {
    jan_feb: {
        season: "Peak Dry Season / Peak Visibility",
        visibility: "35-40 meters",
        conditions: "Calm seas, perfect for photographers",
        locations: "Western sides of atolls typical best for Mantas and Whale Sharks as they follow plankton concentrations.",
        marineLife: ["Reef sharks", "Turtles", "Occasional Manta rays"]
    }
};
