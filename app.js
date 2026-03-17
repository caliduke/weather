function renderFullWeather(data) {
    const current = data.list[0];
    
    // Group 3-hour forecasts by date to find daily Min/Max
    const dailyData = {};

    data.list.forEach(item => {
        const date = item.dt_txt.split(' ')[0]; // Get YYYY-MM-DD
        if (!dailyData[date]) {
            dailyData[date] = {
                min: item.main.temp_min,
                max: item.main.temp_max,
                icon: item.weather[0].icon,
                dayName: new Date(item.dt * 1000).toLocaleDateString('en-US', { weekday: 'short' })
            };
        } else {
            // Update the day's min and max if a more extreme value is found
            if (item.main.temp_min < dailyData[date].min) dailyData[date].min = item.main.temp_min;
            if (item.main.temp_max > dailyData[date].max) dailyData[date].max = item.main.temp_max;
        }
    });

    // Convert object to array and skip the first day (which is "today")
    const forecastArray = Object.values(dailyData).slice(1, 6);

    let forecastHtml = '';
    forecastArray.forEach(day => {
        forecastHtml += `
            <div class="forecast-item">
                <p style="font-weight: bold; margin-bottom: 2px;">${day.dayName}</p>
                <img src="https://openweathermap.org/img/wn/${day.icon}.png" alt="icon">
                <p style="color: #dc3545; margin: 2px 0;">${Math.round(day.max)}°</p>
                <p style="color: #007bff; margin: 2px 0;">${Math.round(day.min)}°</p>
            </div>
        `;
    });

    display.innerHTML = `
        <div class="fade-in">
            <h2 style="margin-bottom: 0;">${data.city.name}</h2>
            <p style="font-size: 0.8rem; color: #888; margin-top: 4px;">Current Weather</p>
            
            <img src="https://openweathermap.org/img/wn/${current.weather[0].icon}@2x.png">
            <h3 style="font-size: 3rem; margin: 5px 0;">${Math.round(current.main.temp)}°C</h3>
            <p style="text-transform: capitalize; font-weight: 500;">${current.weather[0].description}</p>
            
            <div style="margin-top: 10px; font-size: 0.9rem;">
                <span style="color: #dc3545;">H: ${Math.round(current.main.temp_max)}°</span> 
                <span style="margin: 0 5px;">/</span>
                <span style="color: #007bff;">L: ${Math.round(current.main.temp_min)}°</span>
            </div>

            <hr style="margin: 20px 0; border: 0; border-top: 1px solid #eee;">
            
            <p style="text-align: left; font-size: 0.9rem; font-weight: bold; margin-bottom: 10px;">5-Day Forecast</p>
            <div class="forecast-container">
                ${forecastHtml}
            </div>
        </div>
    `;
}
