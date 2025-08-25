document.addEventListener("DOMContentLoaded", function() {
  const weatherEl = document.getElementById("weather");
  if (!weatherEl) {
    console.error('Element with id="weather" not found.');
    return;
  }

  const apiKey = "7c2b65572f4043c8b82201831252103";
  const city = "Alpharetta"; // e.g.
  // Construct URL with city name, turning off Air Quality Index if not needed
  const apiUrl = `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${city}&aqi=no`;

  fetch(apiUrl)
    .then(response => {
      if (!response.ok) {
        throw new Error(`Weather API request failed: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      const locationName = data.location.name;
      const region = data.location.region;
      const country = data.location.country;
      const tempF = data.current.temp_f;      // Fahrenheit
      const conditionText = data.current.condition.text;
      const iconUrl = `https:${data.current.condition.icon}`; // e.g. "//cdn.weatherapi.com/weather/64x64/day/116.png"

      weatherEl.innerHTML = `
        <h3>Weather</h3>
        <p><strong>Location:</strong> ${locationName}, ${region}, ${country}</p>
        <p><strong>Temperature:</strong> ${tempF}°F</p>
        <p><strong>Condition:</strong> ${conditionText}</p>
        <img src="${iconUrl}" alt="Weather Icon">
      `;
    })
    .catch(error => {
      console.error("Error fetching weather:", error);
      weatherEl.innerHTML = "<p>Error loading weather data.</p>";
    });
});
