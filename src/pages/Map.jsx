import { useState, useEffect } from "react";
import {MapContainer,TileLayer,Marker,Popup,useMap} from "react-leaflet";
import "leaflet/dist/leaflet.css";
const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;
function ChangeMapView({ position }) 
{
    const map = useMap();
    useEffect(() => {
        map.flyTo(position, 10);
    }, [position, map]);
    return null;
}
function Map() 
{
    const [city, setCity] = useState("Ludhiana");
    const [search, setSearch] = useState("");
    const [position, setPosition] = useState([30.901, 75.8573]);
    const [weather, setWeather] = useState(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const fetchWeather = async (cityName) => {
        setLoading(true);
        setError("");
        try 
        {
            const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(cityName)}&units=metric&appid=${API_KEY}`);
            if (!response.ok) 
            {
                throw new Error("City not found or API request failed");
            }
            const data = await response.json();
            setCity(data.name);
            setPosition([data.coord.lat, data.coord.lon]);

            setWeather({
                temp: Math.round(data.main.temp),
                description: data.weather[0].description,
                humidity: data.main.humidity,
                wind: (data.wind.speed * 3.6).toFixed(1)
            });
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWeather("Ludhiana");
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        if (search.trim()) {
            fetchWeather(search.trim());
            setSearch("");
        }
    };

    return (
        <div className="sections map-page">
            <h2>Weather Map</h2>
            <p>Explore the map and check live weather by city.</p>
            <form className="map-search" onSubmit={handleSearch}>
                <input type="text" placeholder="Enter city name..." value={search} onChange={(e) => setSearch(e.target.value)}/>
                <button type="submit" disabled={loading}>
                    {loading ? "Loading..." : "Search"}
                </button>
            </form>
            {error && <p className="map-error">{error}</p>}
            {weather && (
                <div className="map-weather-card">
                    <h3>{city}</h3>
                    <h2>{weather.temp}°C</h2>
                    <p>{weather.description}</p>
                    <p>Humidity: {weather.humidity}%</p>
                    <p>Wind: {weather.wind} km/h</p>
                </div>
            )}

            <div className="weather-map">
                <MapContainer center={position} zoom={10} scrollWheelZoom={true} style={{ height: "100%", width: "100%" }}>
                    <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>
                    <ChangeMapView position={position} />
                    <Marker position={position}>
                        <Popup>
                            <strong>{city}</strong>
                            {weather && (
                                <p>
                                    {weather.temp}°C, {weather.description}
                                </p>
                            )}
                        </Popup>
                    </Marker>
                </MapContainer>
            </div>
        </div>
    );
}
export default Map;
