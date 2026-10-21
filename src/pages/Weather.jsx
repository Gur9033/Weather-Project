import { useState, useEffect } from "react";

function Weather() {
    const [city, setCity] = useState("Madrid");
    const [searchQuery, setSearchQuery] = useState("");
    const [weatherData, setWeatherData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // API Key
    const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;

    const fetchWeather = async (cityName) => {
        setLoading(true);
        setError("");
        try {
            // 1. Live Weather API
            const currentRes = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${cityName}&units=metric&appid=${API_KEY}`);
            if (!currentRes.ok) {
                throw new Error("City not found");
            }
            const currentData = await currentRes.json();
            
            // 2. Forecast API
            const forecastRes = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&units=metric&appid=${API_KEY}`);
            const forecastData = await forecastRes.json();
            // Get latitude and longitude of searched city
            const { lat, lon } = currentData.coord;
            // Fetch next 24 hours forecast
            const hourlyRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,weather_code,precipitation_probability&forecast_days=2&timezone=auto`);
            if(!hourlyRes.ok) {
                throw new Error("Hourly forecast not available");
            }
            const hourlyData = await hourlyRes.json();

            const formattedData = {
                city: currentData.name,
                temp: Math.round(currentData.main.temp),
                /*chanceOfRain: forecastData.list[0].pop ? `${Math.round(forecastData.list[0].pop * 100)}%` : "0%",*/
                chanceOfRain:`${Math.round((forecastData.list[0].pop ?? 0) * 100)}%`,
                realFeel: `${Math.round(currentData.main.feels_like)}°`,
                wind: `${(currentData.wind.speed * 3.6).toFixed(1)} km/h`,
                uvIndex: "3",
                /*hourly: generateFixedHourlyForecast(forecastData.list),*/
                hourly: generateHourlyForecast(hourlyData),
                weekly: generate7DayForecast(forecastData.list),
            };
            setWeatherData(formattedData);
        } catch (err) {
            setError("City not found or invalid API Key!");
        } finally {
            setLoading(false);
        }
    };

    // Function to change emoji according to the weather
    const getWeatherEmoji = (condition) => {
        switch (condition.toLowerCase()) {
            case "clear": return "☀️";
            case "clouds": return "☁️";
            case "rain": return "🌧️";
            case "thunderstorm": return "⚡";
            case "snow": return "❄️";
            default: return "🌤️";
        }
    };

    // Today's Forecast
    const generateHourlyForecast = (data) => {
        const times = data.hourly.time;
        const now = Date.now();
        // Find the first available hour at or after current time
        const startIndex = times.findIndex((time) => new Date(time).getTime() >= now);
        if (startIndex === -1) {
            return [];
        }
        return times.slice(startIndex, startIndex + 24).map((time, index) => {
            const i = startIndex + index;
            return {
                time: new Date(time).toLocaleTimeString("en-US", {
                    hour: "numeric",
                    minute: "2-digit",
                }),
                icon: getOpenMeteoEmoji(data.hourly.weather_code[i]),
                temp: `${Math.round(data.hourly.temperature_2m[i])}°`,
                rainChance: data.hourly.precipitation_probability[i],
            };
        });
    };
    // Weather emoji based on Open-Meteo weather code
    const getOpenMeteoEmoji = (code) => {
        if (code === 0) return "☀️";
        if ([1, 2].includes(code)) return "🌤️";
        if (code === 3) return "☁️";
        if ([45, 48].includes(code)) return "🌫️";
        if ([51, 53, 55, 56, 57].includes(code)) return "🌦️";
        if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return "🌧️";
        if ([71, 73, 75, 77, 85, 86].includes(code)) return "❄️";
        if ([95, 96, 99].includes(code)) return "⛈️";
        return "🌤️";
    };
    // 7-Day Forecast
    const generate7DayForecast = (list) => {
        const dailyMap = {};
        
        list.forEach((item) => {
            const dateObj = new Date(item.dt * 1000);
            const dayKey = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
            if (!dailyMap[dayKey]) {
                dailyMap[dayKey] = {
                    icon: getWeatherEmoji(item.weather[0].main),
                    text: item.weather[0].main,
                    temps: []
                };
            }
            dailyMap[dayKey].temps.push(item.main.temp);
        });

        const resultDays = [];
        const today = new Date();
        for (let i = 0; i < 7; i++) {
            const nextDate = new Date();
            nextDate.setDate(today.getDate() + i);
            const dayKey = nextDate.toLocaleDateString('en-US', { weekday: 'short' });
            const dayLabel = i === 0 ? "Today" : dayKey;
            const dayData = dailyMap[dayKey] || {
                icon: "☀️",
                text: "Sunny",
                temps: [35, 22]
            };
            const maxTemp = Math.round(Math.max(...dayData.temps));
            const minTemp = Math.round(Math.min(...dayData.temps));
            resultDays.push({
                day: dayLabel,
                icon: dayData.icon,
                text: dayData.text,
                highLow: `${maxTemp}°/${minTemp}°`,
            });
        }
        return resultDays;
    };

    useEffect(() => {
        fetchWeather(city);
    }, []);

    const handleSearch = (e) => {
        if (e.key === "Enter" || e.type === "click") {
            if (searchQuery.trim() !== "") {
                setCity(searchQuery);
                fetchWeather(searchQuery);
                setSearchQuery("");
            }
        }
    };

    return (
        <div className="weather-page">
            {/* Search Header */}
            <div className="search-container">
                <input 
                    className="search-box" 
                    type="text" 
                    placeholder="Search for cities" 
                    value={searchQuery} 
                    onChange={(e) => setSearchQuery(e.target.value)} 
                    onKeyDown={handleSearch}
                />
                <button className="search-btn" onClick={handleSearch}>
                    Search
                </button>
            </div>

            {loading ? (
                <div className="loading">Loading weather data...</div>
            ) : error ? (
                <div className="error">{error}</div>
            ) : (
                weatherData && (
                    <div className="weather-layout">
                        {/* Left Side Section */}
                        <div className="left-side">
                            {/* Current Weather Banner */}
                            <div className="current-weather">
                                <div>
                                    <h1>{weatherData.city}</h1>
                                    <p>Chance of rain: {weatherData.chanceOfRain}</p>
                                    <h2>{weatherData.temp}°</h2>
                                </div>
                                <div className="sun">{weatherData.hourly[2]?.icon || "☀️"}</div>
                            </div>

                            {/* Today's Forecast Card */}
                            <div className="card">
                                <h4>TODAY'S FORECAST</h4>
                                <div className="hourly">
                                    {weatherData.hourly.map((item, index) => (
                                        <div key={index}>
                                            <span>{item.time}</span>
                                            <span>{item.icon}</span>
                                            <b>{item.temp}</b>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Air Conditions Card */}
                            <div className="card">
                                <div className="card-header">
                                    <h4>AIR CONDITIONS</h4>
                                    <button className="see-more-btn">See more</button>
                                </div>
                                <div className="conditions">
                                    <div>
                                        <span className="label">🌡️ Real Feel</span>
                                        <strong>{weatherData.realFeel}</strong>
                                    </div>
                                    <div>
                                        <span className="label">💨 Wind</span>
                                        <strong>{weatherData.wind}</strong>
                                    </div>
                                    <div>
                                        <span className="label">💧 Chance of rain</span>
                                        <strong>{weatherData.chanceOfRain}</strong>
                                    </div>
                                    <div>
                                        <span className="label">☀️ UV Index</span>
                                        <strong>{weatherData.uvIndex}</strong>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Side: 7-Day Forecast (Now properly nested inside .weather-layout) */}
                        <div className="card weekly">
                            <h4>7-DAY FORECAST</h4>
                            <div className="weekly-list">
                                {weatherData.weekly.map((dayData, index) => (
                                    <div className="day" key={index}>
                                        <span className="day-name">{dayData.day}</span>
                                        <span className="day-icon">{dayData.icon}</span>
                                        <b className="day-text">{dayData.text}</b>
                                        <strong className="day-temp">{dayData.highLow}</strong>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )
            )}
        </div>
    );
}

export default Weather;







