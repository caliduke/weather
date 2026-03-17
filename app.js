const API_KEY = '3fc61c1941973837cddf41c1468fd438';

const searchBtn = document.getElementById('searchBtn');
const locationBtn = document.getElementById('locationBtn');
const cityInput = document.getElementById('cityInput');
const display = document.getElementById('weatherDisplay');

// 1. Initial Load
window.addEventListener('load', () => {
    const lastCity = localStorage.getItem('lastWeatherCity');
    if (lastCity) fetchWeather(lastCity);
});

// 2. Button Listeners
searchBtn?.addEventListener('click', () => {
    if (cityInput.value) fetchWeather(cityInput.value);
});

cityInput?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && cityInput.value) fetchWeather(cityInput.value);
});

locationBtn?.addEventListener('click', () => {
    if (navigator.geolocation) {
        display.innerHTML = `<p>Locating...</p>`;
        navigator.geolocation.getCurrentPosition(
            (pos) => fetchWeatherByCoords(pos.coords.latitude, pos.coords.longitude),
            (err) => {
                console.error(err);
                display.innerHTML = `<p>Location access denied.</p>`;
            }
        );
    }
});

// 3. API Fetching logic
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
            renderWeather(data);
            localStorage.setItem('lastWeatherCity', data.city.name);
        } else {
            display.innerHTML = `<p style="color:red;">Error: ${data.message}</p>`;
        }
    } catch (error) {
        display.innerHTML = `<p>Connection error. Check API key.</p>`;
    }
}

// 4. Rendering logic
function renderWeather(data) {
    const current = data.list[0];
    
    // Grouping for Daily Min/Max
    const dailyData = {};
    data.list.forEach(item => {
        const date = item.dt_txt.split(' ')[0];
        if (!dailyData[date]) {
            dailyData[date] = {
                min: item.main.temp_min,
                max: item.main.temp_max,
                icon: item.weather[0].icon,
                day: new Date(item.dt * 1000).toLocaleDateString('en-US', { weekday: 'short' })
            };
        } else {
            if (item.main.temp_min < dailyData[date].min) dailyData[date].min = item.main.temp_min;
            if (item.main.temp_max > dailyData[date].max) dailyData[date].max = item.main.temp_max;
        }
    });

    const forecast = Object.values(dailyData).slice(1, 6);
    let forecastHtml = '';
    forecast.forEach(d => {
        forecastHtml += `
            <div class="forecast-item">
                <p><strong>${d.day}</strong></p>
                <img src="https://openweathermap.org/img/wn/${d.icon}.png">
                <p style="color:#dc3545">${Math.round(d.max)}°</p>
                <p style="color:#007bff">${Math.round(d.min)}°</p>
            </div>
        `;
    });

    display.innerHTML = `
        <div class="fade-in">
            <h2>${data.city.name}</h2>
            <img src="https://openweathermap.org/img/wn/${current.weather[0].icon}@2x.png">
            <h3>${Math.round(current.main.temp)}°C</h3>
            <p>High: ${Math.round(current.main.temp_max)}° / Low: ${Math.round(current.main.temp_min)}°</p>
            <hr>
            <div class="forecast-container">${forecastHtml}</div>
        </div>
    `;
}
