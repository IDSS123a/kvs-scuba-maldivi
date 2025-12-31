
const API_URL = "https://api.exchangerate-api.com/v4/latest/MVR";
const CACHE_KEY = "kvs_exchange_rates";
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

export interface ExchangeRates {
    USD: number;
    BAM: number;
    timestamp: number;
}

const FALLBACK_RATES: ExchangeRates = {
    USD: 0.0649,
    BAM: 0.11, // Rough estimate: 1 MVR -> 0.065 USD -> 0.11 BAM
    timestamp: Date.now()
};

export const fetchExchangeRates = async (): Promise<ExchangeRates> => {
    try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
            const data: ExchangeRates = JSON.parse(cached);
            if (Date.now() - data.timestamp < CACHE_EXPIRY) {
                return data;
            }
        }

        const response = await fetch(API_URL);
        if (!response.ok) throw new Error("Failed to fetch rates");

        const json = await response.json();
        const rates: ExchangeRates = {
            USD: json.rates.USD,
            BAM: json.rates.BAM || (json.rates.USD * 1.73), // Fallback if BAM not in API
            timestamp: Date.now()
        };

        localStorage.setItem(CACHE_KEY, JSON.stringify(rates));
        return rates;
    } catch (error) {
        console.error("Exchange rate fetch error:", error);
        return FALLBACK_RATES;
    }
};

export const getCachedRates = (): ExchangeRates => {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
        return JSON.parse(cached);
    }
    return FALLBACK_RATES;
};
