const API_KEY = '3fc61c1941973837cddf41c1468fd438';
const searchBtn = document.getElementById('searchBtn');
const locationBtn = document.getElementById('locationBtn');
const cityInput = document.getElementById('cityInput');
const display = document.getElementById('weatherDisplay');

// Load last city on startup
window.addEventListener('load', () => {
    const lastCity = localStorage.getItem('lastWeatherCity');
    if (lastCity) fetchWeather(lastCity);
});

searchBtn.addEventListener('click', () => {
    if (cityInput.value) fetchWeather(cityInput.value);
});

locationBtn.addEventListener('click', () => {
    if (navigator.geolocation) {
        display.innerHTML = `<p>Locating...</p>`;
        navigator.geolocation.getCurrentPosition(
            (pos) => fetchWeatherByCoords(pos.coords.latitude, pos.coords.longitude),
            () => display.innerHTML = `<p>Location denied.</p>`
        );
    }
});

async function fetchWeather(city) {
    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${API_KEY}`;
    await callApi(url);
}

async function fetchWeatherByCoords(lat, lon) {
    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`;
    await callApi(url);
}

async function callApi(url) {
    display.innerHTML = `<p>Loading...</p>`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        if (data.cod === "200") {
            renderFullWeather(data);
            localStorage.setItem('lastWeatherCity', data.city.name);
        } else {
            display.innerHTML = `<p>Error: ${data.message}</p>`;
        }
    } catch (error) {
        display.innerHTML = `<p>Connection error.</p>`;
    }
}

function renderFullWeather(data) {
    const current = data.list[0];
    // Filter to get one forecast per day (the one closest to 12:00 PM)
    const dailyForecast = data.list.filter(item => item.dt_txt.includes("12:00:00"));

    let forecastHtml = '';
    dailyForecast.forEach(day => {
        const date = new Date(day.dt * 1000).toLocaleDateString('en-US', { weekday: 'short' });
        forecastHtml += `
            <div class="forecast-item">
                <p>${date}</p>
                <img src="https://openweathermap.org/img/wn/${day.weather[0].icon}.png">
                <p><strong>${Math.round(day.main.temp)}°C</strong></p>
            </div>
        `;
    });

    display.innerHTML = `
        <div class="fade-in">
            <h2>${data.city.name}</h2>
            <img src="https://openweathermap.org/img/wn/${current.weather[0].icon}@2x.png">
            <h3>${Math.round(current.main.temp)}°C</h3>
            <p>High: ${Math.round(current.main.temp_max)}°C | Low: ${Math.round(current.main.temp_min)}°C</p>
            <p style="text-transform: capitalize;">${current.weather[0].description}</p>
            
            <hr style="margin: 20px 0; border: 0; border-top: 1px solid #eee;">
            
            <div class="forecast-container">
                ${forecastHtml}
            </div>
        </div>
    `;
}
