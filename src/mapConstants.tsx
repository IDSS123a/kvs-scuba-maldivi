
export interface POICoordinates {
    lat: number;
    lng: number;
}

export interface StrategicPOI {
    id: string;
    name: string;
    type: string;
    coordinates: POICoordinates;
    description?: string;
    depth_range_m?: string;
    website?: string;
    services?: string[];
    cuisine?: string[];
    offerings?: string[];
    iata?: string;
    verified: boolean;
    data_source?: string;
    source_url?: string;
}

export interface POICategory {
    category_id: string;
    display_name: string;
    icon: string;
    items: StrategicPOI[];
}

export const STRATEGIC_MAP_CONFIG = {
    initial_center: { lat: 3.9423, lng: 73.4907 },
    default_zoom: 11,
    poi_zoom: 14,
    coordinate_system: "WGS84"
};

export const STRATEGIC_POIS: POICategory[] = [
    {
        category_id: "landmarks",
        display_name: "Beaches & Landmarks",
        icon: "🏝️",
        items: [
            {
                id: "maafushi_center",
                name: "Maafushi Island Center",
                type: "core",
                coordinates: { lat: 3.94230, lng: 73.49074 },
                verified: true,
                data_source: "OSM + Google Maps"
            },
            {
                id: "bikini_beach",
                name: "Bikini Beach Maafushi",
                type: "beach",
                coordinates: { lat: 3.94445, lng: 73.48983 },
                verified: true,
                data_source: "OSM + Tourism listings"
            }
        ]
    },
    {
        category_id: "dive_sites",
        display_name: "Dive Sites",
        icon: "🤿",
        items: [
            {
                id: "ds_001",
                name: "Kandooma Thila",
                type: "thila_dive",
                coordinates: { lat: 3.90083, lng: 73.47056 },
                description: "Top dive site with grey reef sharks, eagle rays, tuna and soft corals.",
                verified: true,
                source_url: "https://www.maafushi.mv/scuba-diving/"
            },
            {
                id: "ds_002",
                name: "Cocoa Corner",
                type: "corner_dive",
                coordinates: { lat: 3.89333, lng: 73.46611 },
                description: "Long reef with barracuda, tuna and grey reef sharks.",
                verified: true,
                source_url: "https://www.maafushi.mv/scuba-diving/"
            },
            {
                id: "ds_003",
                name: "Embudhu Kandu",
                type: "channel_dive",
                coordinates: { lat: 3.90000, lng: 73.48333 },
                description: "Channel dive with nurse sharks, rays and napoleon wrasse.",
                verified: true,
                source_url: "https://www.maafushi.mv/scuba-diving/"
            },
            {
                id: "ds_004",
                name: "Miyaru Faru",
                type: "reef_shark_reef",
                coordinates: { lat: 3.96333, lng: 73.50333 },
                description: "Shark reef with strong aggregation of reef sharks and rays.",
                verified: true,
                source_url: "https://www.maafushi.mv/scuba-diving/"
            },
            {
                id: "ds_005",
                name: "Guraidhoo Corner",
                type: "corner_dive",
                coordinates: { lat: 3.89972, lng: 73.46639 },
                description: "Reef wall and corner dive with schooling fish and sharks.",
                verified: true,
                source_url: "https://www.maafushiscuba.com/divesites/"
            },
            {
                id: "ds_006",
                name: "Kuda Giri Wreck",
                type: "wreck_dive",
                coordinates: { lat: 3.93278, lng: 73.47639 },
                description: "Small wreck and coral pinnacle, good for intermediate divers.",
                verified: true,
                source_url: "https://www.maafushi.mv/scuba-diving/"
            },
            {
                id: "ds_007",
                name: "Dhigu Thila / Maafushi Caves",
                type: "cave_dive",
                coordinates: { lat: 3.94111, lng: 73.50500 },
                description: "Caves and overhangs with morays, reef sharks and macro life.",
                verified: true,
                source_url: "https://www.maafushiscuba.com/divesites/"
            }
        ]
    },
    {
        category_id: "dive_centers",
        display_name: "Dive Centers",
        icon: "🌊",
        items: [
            {
                id: "dc_001",
                name: "Maafushi Dive & Water Sports (PADI 5★)",
                type: "dive_center",
                coordinates: { lat: 3.94241, lng: 73.49075 },
                website: "https://maafushi.com/diving/",
                verified: true
            },
            {
                id: "dc_002",
                name: "Maafushi Scuba & Freediving",
                type: "dive_center",
                coordinates: { lat: 3.94200, lng: 73.49019 },
                website: "https://www.maafushiscuba.com",
                verified: true
            },
            {
                id: "dc_003",
                name: "ECO Dive Club (SSI)",
                type: "dive_center",
                coordinates: { lat: 3.94292, lng: 73.48983 },
                website: "https://www.eco-diveclub.com",
                verified: true
            }
        ]
    },
    {
        category_id: "medical_services",
        display_name: "Medical Services",
        icon: "🚑",
        items: [
            {
                id: "med_001",
                name: "Maafushi Health Centre",
                type: "clinic",
                coordinates: { lat: 3.94306, lng: 73.48833 },
                services: ["basic_care", "emergency"],
                verified: true,
                source_url: "https://health.gov.mv"
            },
            {
                id: "med_002",
                name: "Maafushi Pharmacy / Mazi Chemist",
                type: "pharmacy",
                coordinates: { lat: 3.94278, lng: 73.48972 },
                services: ["medications"],
                verified: true,
                source_url: "https://health.gov.mv"
            },
            {
                id: "med_003",
                name: "Indira Gandhi Memorial Hospital (Male)",
                type: "hospital",
                coordinates: { lat: 4.17528, lng: 73.50972 },
                services: ["emergency", "surgery", "hyperbaric_referral"],
                verified: true,
                source_url: "https://igmh.gov.mv"
            }
        ]
    },
    {
        category_id: "restaurants_cafes",
        display_name: "Restaurants & Cafés",
        icon: "🍽️",
        items: [
            {
                id: "caviar_restaurant",
                name: "Caviar Café & Restaurant",
                type: "restaurant",
                coordinates: { lat: 3.94329, lng: 73.48971 },
                verified: true,
                data_source: "Google Maps + OSM"
            },
            {
                id: "arena_beach_restaurant",
                name: "Arena Beach Restaurant",
                type: "restaurant",
                coordinates: { lat: 3.94412, lng: 73.48982 },
                verified: true,
                data_source: "Hotel Arena listings"
            },
            {
                id: "stingray_cafe",
                name: "Stingray Café",
                type: "cafe",
                coordinates: { lat: 3.94153, lng: 73.48867 },
                verified: true,
                data_source: "Google Maps"
            },
            {
                id: "tandoori_taste",
                name: "Tandoori Taste Maafushi",
                type: "restaurant",
                coordinates: { lat: 3.94218, lng: 73.48939 },
                verified: true,
                data_source: "Google Maps"
            },
            {
                id: "peppermint_lounge",
                name: "Peppermint Lounge",
                type: "restaurant_lounge",
                coordinates: { lat: 3.94203, lng: 73.48921 },
                verified: true,
                data_source: "Google Maps"
            },
            {
                id: "res_001",
                name: "Sunrise Beach Restaurant",
                type: "restaurant",
                coordinates: { lat: 3.94310, lng: 73.49020 },
                description: "Popular buffet and dinner spot on Maafushi beach.",
                verified: true,
                source_url: "https://www.kayak.com/Maafushi.303229.guide"
            },
            {
                id: "res_002",
                name: "Hiyala Mariyaad Café",
                type: "cafe",
                coordinates: { lat: 3.94180, lng: 73.49100 },
                description: "Local Indian cuisine and popular tourist café.",
                verified: true,
                source_url: "https://www.reddit.com/r/maldives/comments/12ahxy3"
            },
            {
                id: "res_003",
                name: "Harbour Café",
                type: "cafe",
                coordinates: { lat: 3.94200, lng: 73.49150 },
                description: "Casual café with local and quick meals.",
                verified: true,
                source_url: "https://www.reddit.com/r/maldives/comments/12ahxy3"
            },
            {
                id: "res_004",
                name: "Mr Octopus Restaurant",
                type: "restaurant",
                coordinates: { lat: 3.94280, lng: 73.48980 },
                description: "Seafood restaurant favored by travelers.",
                verified: true,
                source_url: "https://www.reddit.com/r/maldives/comments/12ahxy3"
            }
        ]
    },
    {
        category_id: "shops_markets",
        display_name: "Shops & Markets",
        icon: "🛍️",
        items: [
            {
                id: "shiny_souvenirs",
                name: "Shiny Souvenirs",
                type: "gift_shop",
                coordinates: { lat: 3.94209, lng: 73.48976 },
                verified: true,
                data_source: "Google Maps + Instagram Business"
            },
            {
                id: "island_gift",
                name: "Island Gift Maafushi",
                type: "gift_shop",
                coordinates: { lat: 3.94202, lng: 73.48966 },
                verified: true,
                data_source: "Google Maps"
            },
            {
                id: "arena_supermart",
                name: "Arena Supermart",
                type: "grocery",
                coordinates: { lat: 3.94251, lng: 73.49001 },
                verified: true,
                data_source: "OSM + Google Maps"
            },
            {
                id: "elite_mart",
                name: "Elite Mart",
                type: "convenience_store",
                coordinates: { lat: 3.94197, lng: 73.48986 },
                verified: true,
                data_source: "Google Maps"
            },
            {
                id: "milano_mart",
                name: "Milano Mart Maafushi",
                type: "supermarket",
                coordinates: { lat: 3.94162, lng: 73.48991 },
                verified: true,
                data_source: "Google Maps"
            },
            {
                id: "shop_001",
                name: "Land Pro Supermarket",
                type: "supermarket",
                coordinates: { lat: 3.94300, lng: 73.48970 },
                verified: true,
                source_url: "https://www.kayak.com/Maafushi.303229.guide"
            },
            {
                id: "shop_002",
                name: "Maafushi Supermarket",
                type: "supermarket",
                coordinates: { lat: 3.94310, lng: 73.48950 },
                verified: true,
                source_url: "https://www.kayak.com/Maafushi.303229.guide"
            },
            {
                id: "shop_003",
                name: "Monstera Fashion Boutique",
                type: "clothing_shop",
                coordinates: { lat: 3.94320, lng: 73.49000 },
                description: "Souvenir, fashion and beachwear shop.",
                verified: true,
                source_url: "https://maafushi.com/shops-and-markets/"
            }
        ]
    },
    {
        category_id: "finance",
        display_name: "Bank & ATM",
        icon: "💱",
        items: [
            {
                id: "bml_branch",
                name: "Bank of Maldives – Maafushi Branch",
                type: "bank",
                coordinates: { lat: 3.94242, lng: 73.48992 },
                verified: true,
                data_source: "Bank of Maldives Locator"
            },
            {
                id: "bml_atm",
                name: "Bank of Maldives ATM",
                type: "atm",
                coordinates: { lat: 3.94247, lng: 73.48995 },
                verified: true,
                data_source: "Bank of Maldives Locator"
            },
            {
                id: "fin_001",
                name: "Bank of Maldives ATM – Maafushi",
                type: "atm",
                coordinates: { lat: 3.94330, lng: 73.49040 },
                verified: true,
                source_url: "https://www.kayak.com/Maafushi.303229.guide"
            },
            {
                id: "fin_002",
                name: "Habib Bank / HSBC / Bank of Ceylon ATMs – Male",
                type: "atm_cluster",
                coordinates: { lat: 4.17500, lng: 73.50900 },
                description: "Multiple ATMs and exchange services available in Malé.",
                verified: true,
                source_url: "https://maldives-magazine.com/budget/maafushi.htm"
            }
        ]
    },
    {
        category_id: "transport",
        display_name: "Transport Nodes",
        icon: "🚤",
        items: [
            {
                id: "tra_001",
                name: "Maafushi Jetty",
                type: "harbor",
                coordinates: { lat: 3.94300, lng: 73.49210 },
                verified: true
            },
            {
                id: "tra_002",
                name: "Velana International Airport",
                type: "airport",
                coordinates: { lat: 4.19180, lng: 73.52910 },
                iata: "MLE",
                verified: true
            },
            {
                id: "tra_003",
                name: "Floating Bar (Alcohol Zone)",
                type: "boat_bar",
                coordinates: { lat: 3.93900, lng: 73.48500 },
                description: "Offshore licensed alcohol venue.",
                verified: true,
                source_url: "https://www.maafushi.com"
            }
        ]
    }
];
