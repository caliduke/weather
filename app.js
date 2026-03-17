/**
 * SkyCast Weather PWA - Core Logic
 * Integrated with OpenWeather Forecast API
 */

const API_KEY = '3fc61c1941973837cddf41c1468fd438';

// DOM Elements
const searchBtn = document.getElementById('searchBtn');
const locationBtn = document.getElementById('locationBtn');
const cityInput = document.getElementById('cityInput');
const display = document.getElementById('weatherDisplay');

// 1. INITIALIZATION: Load last searched city or default
window.addEventListener('load', () => {
    const lastCity = localStorage.getItem('lastWeatherCity');
    if (lastCity) {
        fetchWeather(lastCity);
    }
});

// 2. EVENT LISTENERS
searchBtn?.addEventListener('click', () => {
    if (cityInput.value) {
        const city = cityInput.value.trim();
        fetchWeather(city);
        localStorage.setItem('lastWeatherCity', city);
    }
});

cityInput?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && cityInput.value) {
        const city = cityInput.value.trim();
        fetchWeather(city);
        localStorage.setItem('lastWeatherCity', city);
    }
});

locationBtn?.addEventListener('click', () => {
    if (navigator.geolocation) {
        display.innerHTML = `<p class="fade-in">Accessing GPS...</p>`;
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                fetchWeatherByCoords(pos.coords.latitude, pos.coords.longitude);
            },
            (err) => {
                console.error("Geolocation Error:", err);
                display.innerHTML = `<p style="color:#ff4757;">Location access denied.</p>`;
            }
        );
    } else {
        display.innerHTML = `<p>Geolocation not supported by browser.</p>`;
    }
});

// 3. DATA FETCHING
async function fetchWeather(city) {
    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${API_KEY}`;
    await callWeatherAPI(url);
}

async function fetchWeatherByCoords(lat, lon) {
    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`;
    await callWeatherAPI(url);
}

async function callWeatherAPI(url) {
    display.innerHTML = `<p class="fade-in">Fetching weather...</p>`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.cod === "200") {
            renderWeatherUI(data);
            localStorage.setItem('lastWeatherCity', data.city.name);
            cityInput.value = ""; // Clear input on success
        } else {
            display.innerHTML = `<p style="color:#ff4757;">Error: ${data.message}</p>`;
        }
    } catch (error) {
        console.error("Fetch Error:", error);
        display.innerHTML = `<p style="color:#ff4757;">Connection failed. Check your API key.</p>`;
    }
}

// 4. UI RENDERING
function renderWeatherUI(data) {
    const current = data.list[0];
    
    // Grouping the 3-hour forecast chunks into daily Min/Max
    const dailyForecasts = {};
    data.list.forEach(item => {
        const date = item.dt_txt.split(' ')[0]; // YYYY-MM-DD
        if (!dailyForecasts[date]) {
            dailyForecasts[date] = {
                min: item.main.temp_min,
                max: item.main.temp_max,
                icon: item.weather[0].icon,
                dayLabel: new Date(item.dt * 1000).toLocaleDateString('en-US', { weekday: 'short' })
            };
        } else {
            if (item.main.temp_min < dailyForecasts[date].min) dailyForecasts[date].min = item.main.temp_min;
            if (item.main.temp_max > dailyForecasts[date].max) dailyForecasts[date].max = item.main.temp_max;
        }
    });

    // Extract next 5 days (skipping today's record)
    const forecastArray = Object.values(dailyForecasts).slice(1, 6);

    let forecastHtml = '';
    forecastArray.forEach(d => {
        forecastHtml += `
            <div class="forecast-item">
                <p style="font-weight: 700; color: #2f3542;">${d.dayLabel}</p>
                <img src="https://openweathermap.org/img/wn/${d.icon}.png" alt="icon">
                <p style="color: #ff4757; font-weight: 600;">${Math.round(d.max)}°</p>
                <p style="color: #1e90ff; font-weight: 600;">${Math.round(d.min)}°</p>
            </div>
        `;
    });

    display.innerHTML = `
        <div class="fade-in">
            <h2 style="color: #2f3542;">${data.city.name}</h2>
            <img src="https://openweathermap.org/img/wn/${current.weather[0].icon}@4x.png" 
                 style="width: 140px; margin: -10px 0;" alt="weather">
            
            <h3 style="font-size: 4.5rem; margin: 0; font-weight: 300; letter-spacing: -2px;">
                ${Math.round(current.main.temp)}°
            </h3>
            
            <div class="temp-range">
                <span style="color: #ff4757;">H: ${Math.round(current.main.temp_max)}°</span>
                <span style="color: #ccc; font-weight: 100;">|</span>
                <span style="color: #1e90ff;">L: ${Math.round(current.main.temp_min)}°</span>
            </div>
            
            <p style="text-transform: capitalize; color: #747d8c; font-weight: 600; margin-bottom: 20px;">
                ${current.weather[0].description}
            </p>
            
            <div class="forecast-container">
                ${forecastHtml}
            </div>
        </div>
    `;
}
