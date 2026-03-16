const API_KEY = '3fc61c1941973837cddf41c1468fd438';
const searchBtn = document.getElementById('searchBtn');
const cityInput = document.getElementById('cityInput');
const display = document.getElementById('weatherDisplay');

// 1. Check Local Storage on page load
window.addEventListener('load', () => {
    const lastCity = localStorage.getItem('lastWeatherCity');
    if (lastCity) {
        fetchWeather(lastCity);
    }
});

cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const city = cityInput.value;
        if (city) {
            fetchWeather(city);
            localStorage.setItem('lastWeatherCity', city); // Save to storage
        }
    }
});

searchBtn.addEventListener('click', () => {
    const city = cityInput.value;
    if (city) {
        fetchWeather(city);
        localStorage.setItem('lastWeatherCity', city); // Save to storage
    }
});

async function fetchWeather(city) {
    display.innerHTML = `<p>Loading...</p>`;
    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${API_KEY}`
        );
        const data = await response.json();
        
        if (data.cod === 200) {
            display.innerHTML = `
                <div style="animation: fadeIn 0.5s;">
                    <h2>${data.name}, ${data.sys.country}</h2>
                    <img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" alt="weather icon">
                    <h3 style="font-size: 2.5rem; margin: 10px 0;">${Math.round(data.main.temp)}°C</h3>
                    <p style="text-transform: capitalize; color: #666;">${data.weather[0].description}</p>
                    <div style="display: flex; justify-content: space-around; margin-top: 15px; font-size: 0.9rem;">
                        <span>💧 Humidity: ${data.main.humidity}%</span>
                        <span>🌬️ Wind: ${data.wind.speed} m/s</span>
                    </div>
                </div>
            `;
            // Clear input after success
            cityInput.value = "";
        } else {
            display.innerHTML = `<p style="color: red;">City "${city}" not found.</p>`;
        }
    } catch (error) {
        display.innerHTML = `<p>Network error. Check your connection.</p>`;
    }
}
