
export interface WeatherData {
    current: {
        temp: number;
        description: string;
        icon: string;
    };
    forecast: Array<{
        date: string;
        temp: number;
        description: string;
        icon: string;
    }>;
}

const LAT = 3.9446;
const LON = 73.4891;

function mapWmoToOwm(code: number): { description: string; icon: string } {
    if (code === 0) return { description: 'Vedro', icon: '01d' };
    if (code >= 1 && code <= 3) return { description: 'Pretežno sunčano', icon: '02d' };
    if (code === 45 || code === 48) return { description: 'Magla', icon: '50d' };
    if (code >= 51 && code <= 55) return { description: 'Sipa', icon: '09d' };
    if (code >= 61 && code <= 65) return { description: 'Kiša', icon: '10d' };
    if (code >= 71 && code <= 75) return { description: 'Snijeg', icon: '13d' };
    if (code >= 80 && code <= 82) return { description: 'Pljuskovi', icon: '09d' };
    if (code >= 95 && code <= 99) return { description: 'Grmljavina', icon: '11d' };
    return { description: 'Promjenljivo', icon: '03d' };
}

export async function fetchWeather(): Promise<WeatherData> {
    try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}&current_weather=true&daily=temperature_2m_max,weathercode&timezone=auto`;
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Weather fetch failed with status: ${response.status}`);
        const data = await response.json();

        const currentStatus = mapWmoToOwm(data.current_weather.weathercode);
        const current = {
            temp: Math.round(data.current_weather.temperature),
            description: currentStatus.description,
            icon: currentStatus.icon,
        };

        const forecast = data.daily.time.slice(1, 4).map((time: string, index: number) => {
            const dayCode = data.daily.weathercode[index + 1];
            const status = mapWmoToOwm(dayCode);
            return {
                date: new Date(time).toLocaleDateString('bs-BA', { weekday: 'short' }),
                temp: Math.round(data.daily.temperature_2m_max[index + 1]),
                description: status.description,
                icon: status.icon,
            };
        });

        return { current, forecast };
    } catch (error) {
        return {
            current: { temp: 29, description: 'Sunčano', icon: '01d' },
            forecast: [
                { date: 'Uto', temp: 30, description: 'Vedro', icon: '01d' },
                { date: 'Sri', temp: 28, description: 'Mjestimično oblačno', icon: '02d' },
                { date: 'Čet', temp: 29, description: 'Sunčano', icon: '01d' },
            ],
        };
    }
}
