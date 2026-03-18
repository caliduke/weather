const API_KEY = '3fc61c1941973837cddf41c1468fd438';
let currentWeatherData = null; // Store data to re-render when toggling
let isFahrenheit = localStorage.getItem('unit') === 'F';

const display = document.getElementById('weatherDisplay');
const unitSwitch = document.getElementById('unitSwitch');

// 1. Toggle Logic
unitSwitch?.addEventListener('click', () => {
    isFahrenheit = !isFahrenheit;
    localStorage.setItem('unit', isFahrenheit ? 'F' : 'C');
    updateToggleUI();
    if (currentWeatherData) renderUI(currentWeatherData);
});

function updateToggleUI() {
    unitSwitch.classList.toggle('fahrenheit', isFahrenheit);
    document.getElementById('cUnit').classList.toggle('active', !isFahrenheit);
    document.getElementById('fUnit').classList.toggle('active', isFahrenheit);
}

// 2. Conversion Helper
function formatTemp(celsius) {
    if (!isFahrenheit) return Math.round(celsius);
    return Math.round((celsius * 9/5) + 32);
}

// 3. Updated renderUI
function renderUI(data) {
    currentWeatherData = data; // Save for toggling
    updateToggleUI();
    
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
    const unitLabel = isFahrenheit ? '°F' : '°C';

    let forecastHtml = '';
    Object.values(daily).slice(1, 6).forEach(d => {
        forecastHtml += `
            <div class="forecast-item">
                <p><strong>${d.label}</strong></p>
                <img src="${getVibrantIcon(d.icon)}" alt="icon">
                <p style="color:#ff4757;">${formatTemp(d.max)}°</p>
                <p style="color:#1e90ff;">${formatTemp(d.min)}°</p>
            </div>
        `;
    });

    display.innerHTML = `
        <div class="fade-in">
            <h2>${data.city.name}</h2>
            <img src="${getVibrantIcon(current.weather[0].icon)}" style="width:140px; filter: drop-shadow(0 10px 20px rgba(0,0,0,0.4));">
            <h3 style="font-size:5rem; font-weight:200; margin:10px 0;">${formatTemp(current.main.temp)}${unitLabel}</h3>
            <div class="temp-range">
                <span style="color:#ff4757;">H: ${formatTemp(today.max)}°</span>
                <span style="color:rgba(255,255,255,0.3);">|</span>
                <span style="color:#1e90ff;">L: ${formatTemp(today.min)}°</span>
            </div>
            <p style="text-transform:capitalize; color:rgba(255,255,255,0.7); font-weight:600; margin-bottom:25px;">${current.weather[0].description}</p>
            <div class="forecast-container">${forecastHtml}</div>
        </div>
    `;
}

// ... Keep existing fetchWeather, executeFetch, and getVibrantIcon functions ...
