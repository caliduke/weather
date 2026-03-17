/**
 * SkyCast Weather PWA - Final Version
 * Logic: Grouping 3-hour forecasts into true daily Min/Max
 */

const API_KEY = '3fc61c1941973837cddf41c1468fd438';

const searchBtn = document.getElementById('searchBtn');
const locationBtn = document.getElementById('locationBtn');
const cityInput = document.getElementById('cityInput');
const display = document.getElementById('weatherDisplay');

// 1. Initial Load from LocalStorage
window.addEventListener('load', () => {
    const lastCity = localStorage.getItem('lastWeatherCity');
    if (lastCity) fetchWeather(lastCity);
});

// 2. Button Listeners
searchBtn?.addEventListener('click', () => {
    if (cityInput.value) handleNewCity(cityInput.value);
});

cityInput?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && cityInput.value) handleNewCity(cityInput.value);
});

locationBtn?.addEventListener('click', () => {
    if (navigator.geolocation) {
        display.innerHTML = `<p class="fade-in">Finding your location...</p>`;
        navigator.geolocation.getCurrentPosition(
            (pos) => fetchWeatherByCoords(pos.coords.latitude, pos.coords.longitude),
            () => display.innerHTML = `<p style="color:#ff4757;">GPS access denied.</p>`
        );
    }
});

function handleNewCity(city) {
    const cleanCity = city.trim();
    fetchWeather(cleanCity);
    localStorage.setItem('lastWeatherCity', cleanCity);
}

// 3. API Fetching
async function fetchWeather(city) {
    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${API_KEY}`;
    await executeFetch(url);
}

async function fetchWeatherByCoords(lat, lon) {
    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`;
    await executeFetch(url);
}

async function executeFetch(url) {
    display.innerHTML = `<p class="fade-in">Updating...</p>`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        if (data.cod === "200") {
            renderWeatherUI(data);
            localStorage.setItem('lastWeatherCity', data.city.name);
            cityInput.value = "";
        } else {
            display.innerHTML = `<p style="color:#ff4757;">City not found.</p>`;
        }
    } catch (e) {
        display.innerHTML = `<p>Network error.</p>`;
    }
}

// 4. Grouping & Rendering Logic
function renderWeatherUI(data) {
    const currentSnapshot = data.list[0];
    const todayDate = currentSnapshot.dt_txt.split(' ')[0];
    
    // Group all forecast chunks by date to find true Min/Max for every day
    const dailyAggregates = {};

    data.list.forEach(item => {
        const date = item.dt_txt.split(' ')[0];
        if (!dailyAggregates[date]) {
            dailyAggregates[date] = {
                min: item.main.temp_min,
                max: item.main.temp_max,
                icon: item.weather[0].icon,
                label: new Date(item.dt * 1000).toLocaleDateString('en-US', { weekday: 'short' })
            };
        } else {
            if (item.main.temp_min < dailyAggregates[date].min) dailyAggregates[date].min = item.main.temp_min;
            if (item.main.temp_max > dailyAggregates[date].max) dailyAggregates[date].max = item.main.temp_max;
        }
    });

    // Extract Today's true extremes
    const todayStats = dailyAggregates[todayDate];
    
    // Extract Next 5 Days (Forecast)
    const forecastArray = Object.values(dailyAggregates).slice(1, 6);

    let forecastHtml = '';
    forecastArray.forEach(d => {
        forecastHtml += `
            <div class="forecast-item">
                <p style="font-weight:700; color:#2f3542; margin-bottom:4px;">${d.label}</p>
                <img src="https://openweathermap.org/img/wn/${d.icon}.png" alt="icon">
                <p style="color:#ff4757; font-weight:600; margin:0;">${Math.round(d.max)}°</p>
                <p style="color:#1e90ff; font-weight:600; margin:0;">${Math.round(d.min)}°</p>
            </div>
        `;
    });

    display.innerHTML = `
        <div class="fade-in">
            <h2 style="color:#2f3542; margin-bottom:0;">${data.city.name}</h2>
            <img src="https://openweathermap.org/img/wn/${currentSnapshot.weather[0].icon}@4x.png" 
                 style="width:140px; margin:-10px 0;" alt="current icon">
            
            <h3 style="font-size:4.5rem; margin:0; font-weight:300; letter-spacing:-2px;">
                ${Math.round(currentSnapshot.main.temp)}°
            </h3>
            
            <div class="temp-range">
                <span style="color:#ff4757;">H: ${Math.round(todayStats.max)}°</span>
                <span style="color:#ccc; font-weight:100; margin:0 10px;">|</span>
                <span style="color:#1e90ff;">L: ${Math.round(todayStats.min)}°</span>
            </div>
            
            <p style="text-transform:capitalize; color:#747d8c; font-weight:600; margin: 15px 0 25px;">
                ${currentSnapshot.weather[0].description}
            </p>
            
            <div class="forecast-container">
                ${forecastHtml}
            </div>
        </div>
    `;
}
