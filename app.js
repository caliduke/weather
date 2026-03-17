const API_KEY = '3fc61c1941973837cddf41c1468fd438';

// Elements
const searchBtn = document.getElementById('searchBtn');
const locationBtn = document.getElementById('locationBtn');
const cityInput = document.getElementById('cityInput');
const display = document.getElementById('weatherDisplay');

console.log("App loaded. Buttons found:", !!searchBtn, !!locationBtn);

// 1. Search by City
searchBtn.addEventListener('click', () => {
    console.log("Search button clicked for:", cityInput.value);
    if (cityInput.value) {
        fetchWeather(cityInput.value);
    }
});

// 2. Search by Enter Key
cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && cityInput.value) {
        fetchWeather(cityInput.value);
    }
});

// 3. Search by GPS
locationBtn.addEventListener('click', () => {
    console.log("Location button clicked");
    if (navigator.geolocation) {
        display.innerHTML = `<p>Locating...</p>`;
        navigator.geolocation.getCurrentPosition(
            (pos) => fetchWeatherByCoords(pos.coords.latitude, pos.coords.longitude),
            (err) => {
                console.error("GPS Error:", err);
                display.innerHTML = `<p>Location access denied.</p>`;
            }
        );
    }
});

async function fetchWeather(city) {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${API_KEY}`;
    await callApi(url);
}

async function fetchWeatherByCoords(lat, lon) {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`;
    await callApi(url);
}

async function callApi(url) {
    display.innerHTML = `<p>Loading...</p>`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        if (data.cod === 200) {
            display.innerHTML = `
                <h2>${data.name}</h2>
                <img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png">
                <h3>${Math.round(data.main.temp)}°C</h3>
                <p>${data.weather[0].description}</p>
            `;
            localStorage.setItem('lastWeatherCity', data.name);
        } else {
            display.innerHTML = `<p>Error: ${data.message}</p>`;
        }
    } catch (error) {
        console.error("API Fetch Error:", error);
        display.innerHTML = `<p>Connection error.</p>`;
    }
}
