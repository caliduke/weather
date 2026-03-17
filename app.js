const locationBtn = document.getElementById('locationBtn');

// ... keep your existing searchBtn and keypress listeners ...

locationBtn.addEventListener('click', () => {
    if (navigator.geolocation) {
        display.innerHTML = `<p>Locating you...</p>`;
        navigator.geolocation.getCurrentPosition(position => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            fetchWeatherByCoords(lat, lon);
        }, () => {
            display.innerHTML = `<p style="color: red;">Location access denied.</p>`;
        });
    } else {
        display.innerHTML = `<p>Geolocation not supported by your browser.</p>`;
    }
});

async function fetchWeatherByCoords(lat, lon) {
    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
        );
        const data = await response.json();
        if (data.cod === 200) {
            renderWeather(data); // Call a helper function to show data
            localStorage.setItem('lastWeatherCity', data.name);
        }
    } catch (error) {
        display.innerHTML = `<p>Error fetching location weather.</p>`;
    }
}

// Helper function to keep code clean
function renderWeather(data) {
    display.innerHTML = `
        <div style="animation: fadeIn 0.5s;">
            <h2>${data.name}, ${data.sys.country}</h2>
            <img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png">
            <h3 style="font-size: 2.5rem; margin: 10px 0;">${Math.round(data.main.temp)}°C</h3>
            <p style="text-transform: capitalize; color: #666;">${data.weather[0].description}</p>
        </div>
    `;
}
