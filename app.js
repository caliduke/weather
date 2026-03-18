/**
 * DukeCast Weather PWA - Core Logic
 * Featuring: True Daily Min/Max & Vibrant Fluency Icons
 */

const API_KEY = '3fc61c1941973837cddf41c1468fd438';

// DOM Elements
const searchBtn = document.getElementById('searchBtn');
const locationBtn = document.getElementById('locationBtn');
const cityInput = document.getElementById('cityInput');
const display = document.getElementById('weatherDisplay');

// 1. VIBRANT ICON MAPPING
function getVibrantIcon(code) {
    const iconMap = {
        '01d': 'https://img.icons8.com/fluency/96/sun.png',
        '01n': 'https://img.icons8.com/fluency/96/full-moon.png',
        '02d': 'https://img.icons8.com/fluency/96/partly-cloudy-day.png',
        '02n': 'https://img.icons8.com/fluency/96/partly-cloudy-night.png',
        '03d': 'https://img.icons8.com/fluency/96/cloud.png',
        '03n': 'https://img.icons8.com/fluency/96/cloud.png',
        '04d': 'https://img.icons8.com/fluency/96/clouds.png',
        '04n': 'https://img.icons8.com/fluency/96/clouds.png',
        '09d': 'https://img.icons8.com/fluency/96/rain.png',
        '10d': 'https://img.icons8.com/fluency/96/weather.png',
        '11d': 'https://img.icons8.com/fluency/96/storm.png',
        '13d': 'https://img.icons8.com/fluency/96/snow.png',
        '50d': 'https://img.icons8.com/fluency/96/haze.png'
    };
    // Returns the vibrant icon or a high-res OpenWeather fallback
    return iconMap[code] || `https://openweathermap.org/img/wn/${code}@4x.png`;
}

// 2. INITIALIZATION
window.addEventListener('load', () => {
    const lastCity = localStorage.getItem('lastWeatherCity');
    if (lastCity) fetchWeather(lastCity);
});

// 3. EVENT LISTENERS
searchBtn?.addEventListener('click', () => {
    if (cityInput.value) handleSearch(cityInput.value);
});

cityInput?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && cityInput.value) handleSearch(cityInput.value);
});

locationBtn?.addEventListener('click', () => {
    if (navigator.geolocation) {
        display.innerHTML = `<p class="fade-in">Locating...</p>`;
        navigator.geolocation.getCurrentPosition(
            (pos) => fetchWeatherByCoords(pos.coords.latitude, pos.coords.longitude),
            () => display.innerHTML = `<p style="color:#ff4757;">GPS Denied.</p>`
        );
    }
});

function handleSearch(city) {
    const cleanCity = city.trim();
    fetchWeather(cleanCity);
}

// 4. API FETCHING
async function fetchWeather(city) {
    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${API_KEY}`;
    await executeFetch(url);
}

async function fetchWeatherByCoords(lat, lon) {
    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`;
    await executeFetch(url);
}

async function executeFetch(url) {
    display.innerHTML = `<p class="fade-in">Updating DukeCast...</p>`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        if (data.cod === "200") {
            renderUI(data);
            localStorage.setItem('lastWeatherCity', data.city.name);
            cityInput.value = "";
        } else {
            display.innerHTML = `<p style="color:#ff4757;">${data.message}</p>`;
        }
    } catch (e) {
        display.innerHTML = `<p>Check Connection.</p>`;
    }
}

// 5. RENDERING
function renderUI(data) {
    const current = data.list[0];
    const todayDate = current.dt_txt.split(' ')[0];
    const daily = {};

    data.list.forEach(item => {
        const date = item.dt_txt.split(' ')[0];
        if (!daily[date]) {
            daily[date] = {
                min: item.main.temp_min,
                max: item.main.temp_max,
                icon: item.weather[0].icon,
                label: new Date(item.dt * 1000).toLocaleDateString('en-US', { weekday: 'short' })
            };
        } else {
            if (item.main.temp_min < daily[date].min) daily[date].min = item.main.temp_min;
            if (item.main.temp_max > daily[date].max) daily[date].max = item.main.temp_max;
        }
    });

    const today = daily[todayDate];
    const forecast = Object.values(daily).slice(1, 6);

    let forecastHtml = '';
    forecast.forEach(d => {
        forecastHtml += `
            <div class="forecast-item">
                <p><strong>${d.label}</strong></p>
                <img src="${getVibrantIcon(d.icon)}" alt="icon">
                <p style="color:#ff4757; font-weight:600;">${Math.round(d.max)}°</p>
                <p style="color:#1e90ff; font-weight:600;">${Math.round(d.min)}°</p>
            </div>
        `;
    });

    display.innerHTML = `
        <div class="fade-in">
            <h2>${data.city.name}</h2>
            <img src="${getVibrantIcon(current.weather[0].icon)}" 
                 style="width:140px; filter: drop-shadow(0 10px 20px rgba(0,0,0,0.4));" 
                 alt="vibrant weather">
            
            <h3 style="font-size:5rem; font-weight:200; margin:10px 0;">${Math.round(current.main.temp)}°</h3>
            
            <div class="temp-range">
                <span style="color:#ff4757;">H: ${Math.round(today.max)}°</span>
                <span style="color:rgba(255,255,255,0.3);">|</span>
                <span style="color:#1e90ff;">L: ${Math.round(today.min)}°</span>
            </div>
            
            <p style="text-transform:capitalize; color:rgba(255,255,255,0.7); font-weight:600; margin-bottom:25px;">
                ${current.weather[0].description}
            </p>
            
            <div class="forecast-container">${forecastHtml}</div>
        </div>
    `;
}
