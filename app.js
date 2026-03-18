const API_KEY = '3fc61c1941973837cddf41c1468fd438';

const searchBtn = document.getElementById('searchBtn');
const locationBtn = document.getElementById('locationBtn');
const cityInput = document.getElementById('cityInput');
const display = document.getElementById('weatherDisplay');

window.addEventListener('load', () => {
    const lastCity = localStorage.getItem('lastWeatherCity');
    if (lastCity) fetchWeather(lastCity);
});

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
                <img src="https://openweathermap.org/img/wn/${d.icon}.png">
                <p style="color:#ff4757;">${Math.round(d.max)}°</p>
                <p style="color:#1e90ff;">${Math.round(d.min)}°</p>
            </div>
        `;
    });

    display.innerHTML = `
        <div class="fade-in">
            <h2>${data.city.name}</h2>
            <img src="https://openweathermap.org/img/wn/${current.weather[0].icon}@4x.png" style="width:140px;">
            <h3>${Math.round(current.main.temp)}°</h3>
            <div class="temp-range">
                <span style="color:#ff4757;">H: ${Math.round(today.max)}°</span>
                <span style="color:#ccc;">|</span>
                <span style="color:#1e90ff;">L: ${Math.round(today.min)}°</span>
            </div>
            <p style="text-transform:capitalize; color:#747d8c; font-weight:600;">${current.weather[0].description}</p>
            <div class="forecast-container">${forecastHtml}</div>
        </div>
    `;
}
