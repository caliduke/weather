async function processFetch(url) {
    display.innerHTML = `<p>Loading...</p>`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.cod === 200) {
            // We use Math.round to keep the numbers clean
            const currentTemp = Math.round(data.main.temp);
            const minTemp = Math.round(data.main.temp_min);
            const maxTemp = Math.round(data.main.temp_max);

            display.innerHTML = `
                <div class="fade-in">
                    <h2>${data.name}</h2>
                    <img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" alt="weather icon">
                    
                    <h3 style="font-size: 3rem; margin: 5px 0;">${currentTemp}°C</h3>
                    
                    <div style="margin-bottom: 15px; font-weight: bold; color: #555;">
                        <span style="color: #007bff;">Low: ${minTemp}°C</span> 
                        <span style="margin: 0 10px;">|</span>
                        <span style="color: #dc3545;">High: ${maxTemp}°C</span>
                    </div>

                    <p style="text-transform: capitalize; color: #666;">${data.weather[0].description}</p>
                    <hr style="border: 0; border-top: 1px solid #eee; margin: 15px 0;">
                    
                    <div style="display: flex; justify-content: space-around; font-size: 0.9rem;">
                        <span>💧 Humidity: ${data.main.humidity}%</span>
                        <span>🌬️ Wind: ${data.wind.speed} m/s</span>
                    </div>
                </div>
            `;
            localStorage.setItem('lastWeatherCity', data.name);
            cityInput.value = "";
        } else {
            display.innerHTML = `<p style="color: red;">Error: ${data.message}</p>`;
        }
    } catch (e) {
        console.error("Fetch error:", e);
        display.innerHTML = `<p>Connection error. Check your API key or network.</p>`;
    }
}
