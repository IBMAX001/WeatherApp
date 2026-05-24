/* ================================================================
   IBWAPP — script.js
   All interactive behaviour for the weather app landing page.
   Loaded at the bottom of index.html with <script src="script.js">
================================================================ */


/* ================================================================
   1. LIVE TIME DISPLAY
   Updates the hero time line every minute so it always shows
   the current day and time in WAT (West Africa Time).

   SWAP: Replace this function with a call to your weather API
   that returns live time, timezone, and current humidity.
================================================================ */
function updateTime() {
  const el = document.getElementById('live-time');
  if (!el) return; /* safety check — exits if element doesn't exist */

  const now  = new Date();
  const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

  const dayName = days[now.getDay()];
  const hours   = String(now.getHours()).padStart(2, '0');   /* zero-pad e.g. 09 */
  const minutes = String(now.getMinutes()).padStart(2, '0');

  /* Writes the formatted string into the #live-time element in the HTML */
  el.textContent = `${dayName} · ${hours}:${minutes} WAT · Humidity 74%`;
}

/* Run immediately on page load, then repeat every 60 seconds */
updateTime();
setInterval(updateTime, 60000);


/* ================================================================
   2. CLOUD PARALLAX ON SCROLL
   When the user scrolls down, each cloud layer shifts upward
   at a different rate — creating a sense of depth (near clouds
   move more than far clouds).
================================================================ */
const clouds = document.querySelectorAll('.cloud');

window.addEventListener('scroll', () => {
  const scrollY = window.scrollY;

  clouds.forEach((cloud, index) => {
    const speed = [0.08, 0.05, 0.03, 0.02][index] || 0.05;
    cloud.style.transform = `translateY(${scrollY * speed}px)`;
  });

}, { passive: true });


/* ================================================================
   3. SCROLL FADE-IN FOR CARDS
   Uses IntersectionObserver to detect when a card enters the
   viewport. When it does, it transitions from invisible + shifted
   down to fully visible + in place.
================================================================ */
const fadeObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity    = '1';
      entry.target.style.transform  = 'translateY(0)';
      fadeObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.weather-card, .weather-card-wide, .feature-card').forEach(card => {
  card.style.opacity   = '0';
  card.style.transform = 'translateY(18px)';
  card.style.transition = 'opacity 0.55s ease, transform 0.55s ease';
  fadeObserver.observe(card);
});


/* ================================================================
   4. CITY WEATHER SEARCH
   Fetches live weather for any city the user types.

   APIs used (both 100% free, no API key required):
   ├── Open-Meteo Geocoding  — converts city name → lat/lon
   └── Open-Meteo Forecast   — fetches current conditions for lat/lon

   FLOW:
     searchCity()
       → geocodeCity(name)     — GET geocoding API
       → fetchWeather(lat, lon) — GET forecast API
       → renderCityWeather()    — injects data into the DOM
================================================================ */

/* ── DOM REFERENCES ──
   Cached once here so we don't query the DOM on every search. */
const cityInput      = document.getElementById('city-input');
const citySearchBtn  = document.getElementById('city-search-btn');
const cityLoading    = document.getElementById('city-loading');
const cityError      = document.getElementById('city-error');
const cityErrorText  = document.getElementById('city-error-text');
const cityPanel      = document.getElementById('city-result-panel');


/* ── WEATHER CODE → CONDITION + EMOJI ──
   Open-Meteo returns a WMO weather code (an integer).
   This map converts it into a human-readable string and an emoji.
   Reference: https://open-meteo.com/en/docs#weathervariables
*/
const WEATHER_CODES = {
  0:  { label: 'Clear sky',           icon: '☀️' },
  1:  { label: 'Mainly clear',        icon: '🌤' },
  2:  { label: 'Partly cloudy',       icon: '⛅' },
  3:  { label: 'Overcast',            icon: '☁️' },
  45: { label: 'Foggy',               icon: '🌫' },
  48: { label: 'Depositing rime fog', icon: '🌫' },
  51: { label: 'Light drizzle',       icon: '🌦' },
  53: { label: 'Moderate drizzle',    icon: '🌦' },
  55: { label: 'Dense drizzle',       icon: '🌧' },
  61: { label: 'Slight rain',         icon: '🌧' },
  63: { label: 'Moderate rain',       icon: '🌧' },
  65: { label: 'Heavy rain',          icon: '🌧' },
  71: { label: 'Slight snow',         icon: '🌨' },
  73: { label: 'Moderate snow',       icon: '❄️' },
  75: { label: 'Heavy snow',          icon: '❄️' },
  77: { label: 'Snow grains',         icon: '🌨' },
  80: { label: 'Slight showers',      icon: '🌦' },
  81: { label: 'Moderate showers',    icon: '🌧' },
  82: { label: 'Violent showers',     icon: '⛈' },
  85: { label: 'Slight snow showers', icon: '🌨' },
  86: { label: 'Heavy snow showers',  icon: '❄️' },
  95: { label: 'Thunderstorm',        icon: '⛈' },
  96: { label: 'Thunderstorm w/ hail',icon: '⛈' },
  99: { label: 'Thunderstorm w/ hail',icon: '⛈' },
};

/* ── HUMIDITY DESCRIPTION ──
   Returns a human sentence describing the humidity level,
   matching the tone of the existing card descriptions on the page.
*/
function humidityDesc(pct) {
  if (pct >= 80) return 'Very humid. The air feels heavy and saturated.';
  if (pct >= 60) return 'Noticeably humid. Perspiration evaporates slowly.';
  if (pct >= 40) return 'Comfortable humidity. The air feels balanced.';
  if (pct >= 20) return 'Dry air. Skin and throat may feel the dryness.';
  return 'Very dry. Dehydration risk is elevated outdoors.';
}

/* ── WIND DESCRIPTION ──
   Converts km/h into a Beaufort-scale description.
*/
function windDesc(kmh) {
  if (kmh < 1)  return 'Calm — smoke rises vertically.';
  if (kmh < 6)  return 'Light air — smoke drifts gently.';
  if (kmh < 12) return 'Beaufort 2 — leaves rustle softly.';
  if (kmh < 20) return 'Beaufort 3 — leaves and twigs in motion.';
  if (kmh < 29) return 'Beaufort 4 — raises dust, small branches move.';
  if (kmh < 39) return 'Beaufort 5 — small trees begin to sway.';
  if (kmh < 50) return 'Beaufort 6 — large branches in motion.';
  if (kmh < 62) return 'Beaufort 7 — whole trees in motion.';
  return 'Strong winds — take care outdoors.';
}

/* ── PRESSURE DESCRIPTION ──
   Gives a brief human reading of barometric pressure.
*/
function pressureDesc(hpa) {
  if (hpa > 1022) return 'High pressure — fair, settled weather expected.';
  if (hpa > 1009) return 'Near standard pressure — stable conditions.';
  if (hpa > 995)  return 'Slightly low — changeable weather possible.';
  return 'Low pressure — unsettled, rain likely.';
}

/* ── CLOUD COVER DESCRIPTION ──
*/
function cloudDesc(pct) {
  if (pct >= 90) return 'Overcast skies — full cloud blanket.';
  if (pct >= 60) return 'Mostly cloudy — limited direct sun.';
  if (pct >= 30) return 'Partly cloudy — mix of sun and cloud.';
  if (pct >= 10) return 'Mainly clear — a few cloud patches.';
  return 'Clear skies — excellent visibility.';
}


/* ── SHOW / HIDE UI STATES ──
   Helper functions to toggle the loading, error, and result panel. */

function showLoading() {
  cityLoading.classList.add('visible');
  cityError.classList.remove('visible');
  cityPanel.classList.remove('visible');
  citySearchBtn.classList.add('loading');
  citySearchBtn.textContent = 'Searching…';
}

function hideLoading() {
  cityLoading.classList.remove('visible');
  citySearchBtn.classList.remove('loading');
  citySearchBtn.textContent = 'Search';
}

function showError(message) {
  cityErrorText.textContent = message;
  cityError.classList.add('visible');
  cityPanel.classList.remove('visible');
}

function showResults() {
  cityError.classList.remove('visible');
  cityPanel.classList.add('visible');
}


/* ── GEOCODE CITY ──
   Sends the city name to Open-Meteo's geocoding endpoint.
   Returns the first result's name, country, lat, and lon.
   Throws an error if the city isn't found.

   API docs: https://open-meteo.com/en/docs/geocoding-api
*/
async function geocodeCity(cityName) {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1&language=en&format=json`;

  const response = await fetch(url);

  /* Check the HTTP response was successful */
  if (!response.ok) {
    throw new Error(`Geocoding request failed (HTTP ${response.status})`);
  }

  const data = await response.json();

  /* Open-Meteo returns an empty or absent results array if city not found */
  if (!data.results || data.results.length === 0) {
    throw new Error(`City "${cityName}" not found. Try a different spelling or a nearby larger city.`);
  }

  const result = data.results[0];

  return {
    name:      result.name,
    country:   result.country || '',
    latitude:  result.latitude,
    longitude: result.longitude,
  };
}


/* ── FETCH WEATHER ──
   Requests current weather conditions from Open-Meteo's forecast API
   for a given latitude and longitude.
   Returns a flat object of the current weather values.

   API docs: https://open-meteo.com/en/docs
*/
async function fetchWeather(latitude, longitude) {
  const params = [
    `latitude=${latitude}`,
    `longitude=${longitude}`,
    'current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m,surface_pressure,cloud_cover,uv_index',
    'wind_speed_unit=kmh',
    'temperature_unit=celsius',
  ].join('&');

  const url = `https://api.open-meteo.com/v1/forecast?${params}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Weather request failed (HTTP ${response.status})`);
  }

  const data = await response.json();
  const c    = data.current; /* shorthand for the current conditions object */

  return {
    temp:       Math.round(c.temperature_2m),
    feelsLike:  Math.round(c.apparent_temperature),
    humidity:   Math.round(c.relative_humidity_2m),
    weatherCode:c.weather_code,
    wind:       Math.round(c.wind_speed_10m),
    pressure:   Math.round(c.surface_pressure),
    cloud:      Math.round(c.cloud_cover),
    uv:         Math.round(c.uv_index ?? 0),
  };
}


/* ── RENDER CITY WEATHER ──
   Takes the geocode result and weather data, formats all the values,
   and injects them into the result panel DOM elements.
*/
function renderCityWeather(geo, weather) {

  /* Look up the weather code — fall back to a generic label if unmapped */
  const cond = WEATHER_CODES[weather.weatherCode] || { label: 'Variable', icon: '🌡' };

  /* City name + country */
  document.getElementById('result-city-name').textContent =
    `${geo.name}, ${geo.country}`;

  /* Lat / lon to 4 decimal places */
  document.getElementById('result-coords').textContent =
    `${geo.latitude.toFixed(4)}° N, ${geo.longitude.toFixed(4)}° E`;

  /* Temperature */
  document.getElementById('result-temp').textContent = weather.temp;

  /* Feels like */
  document.getElementById('result-feels').textContent = weather.feelsLike;

  /* Weather condition + icon */
  document.getElementById('result-condition').textContent = cond.label;
  document.getElementById('result-icon').textContent      = cond.icon;

  /* Humidity */
  document.getElementById('result-humidity').innerHTML =
    `${weather.humidity}<sup>%</sup>`;
  document.getElementById('result-humidity-bar').style.width =
    `${weather.humidity}%`;
  document.getElementById('result-humidity-desc').textContent =
    humidityDesc(weather.humidity);

  /* Wind */
  document.getElementById('result-wind').innerHTML =
    `${weather.wind}<sup>km/h</sup>`;
  document.getElementById('result-wind-desc').textContent =
    windDesc(weather.wind);

  /* Pressure */
  document.getElementById('result-pressure').innerHTML =
    `${weather.pressure}<sup>hPa</sup>`;
  document.getElementById('result-pressure-desc').textContent =
    pressureDesc(weather.pressure);

  /* Cloud cover */
  document.getElementById('result-cloud').innerHTML =
    `${weather.cloud}<sup>%</sup>`;
  document.getElementById('result-cloud-bar').style.width =
    `${weather.cloud}%`;
  document.getElementById('result-cloud-desc').textContent =
    cloudDesc(weather.cloud);

  /* ── UPDATE HERO ──
     Syncs the full-viewport hero section to the searched city's data. */
  document.getElementById('hero-location').textContent  = `${geo.name}, ${geo.country}`;
  document.getElementById('hero-temp-val').textContent  = weather.temp;
  document.getElementById('hero-condition').textContent = cond.label;
  document.getElementById('hero-wind').textContent      = `${weather.wind} km/h`;
  document.getElementById('hero-pressure').textContent  = `${weather.pressure} hPa`;

  /* ── UPDATE LIVE CONDITIONS CARDS ──
     Row 1: Humidity, Wind, UV, Pressure */
  document.getElementById('main-humidity').innerHTML       = `${weather.humidity}<sup>%</sup>`;
  document.getElementById('main-humidity-bar').style.width = `${weather.humidity}%`;
  document.getElementById('main-wind').innerHTML           = `${weather.wind}<sup>km/h</sup>`;
  document.getElementById('main-uv').innerHTML             = `${weather.uv}<sup>/11</sup>`;
  document.getElementById('main-uv-bar').style.width       = `${Math.min(100, (weather.uv / 11) * 100).toFixed(1)}%`;
  document.getElementById('main-pressure').innerHTML       = `${weather.pressure}<sup>hPa</sup>`;

  /* Row 2: Wide temp card + cloud cover */
  document.getElementById('main-temp').textContent         = `${weather.temp}°`;
  document.getElementById('main-feels').textContent        = `${weather.feelsLike}°C`;
  document.getElementById('main-cloud').innerHTML          =
    `${weather.cloud}<sup style="font-size:0.42em;color:var(--text-muted);font-style:italic;">%</sup>`;
  document.getElementById('main-cloud-type').textContent   = cloudDesc(weather.cloud);

  /* Reposition the temp range marker.
     Normalised over a 0–50°C range — adjusts position without needing hi/lo data. */
  const markerPct = Math.min(100, Math.max(0, (weather.temp / 50) * 100));
  document.getElementById('main-temp-marker').style.left = `${markerPct}%`;

  /* ── UPDATE CLIMATE DIAL ──
     Centre value + all four orbit badges. */
  document.getElementById('dial-temp').textContent     = `${weather.temp}°`;
  document.getElementById('dial-humidity').textContent = `${weather.humidity}%`;
  document.getElementById('dial-uv').textContent       = `UV ${weather.uv}`;
  document.getElementById('dial-wind').textContent     = `${weather.wind} km/h`;
  document.getElementById('dial-rain').textContent     = `${weather.cloud}%`;

  /* Fade in the newly populated result panel */
  showResults();

  /* Scroll the result panel into view smoothly */
  setTimeout(() => {
    document.getElementById('city-result-panel').scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
    });
  }, 150);
}


/* ── MAIN SEARCH FUNCTION ──
   Orchestrates the full search: validate → geocode → fetch → render.
   Called by both the button click and the Enter keypress.
*/
async function searchCity() {
  const cityName = cityInput.value.trim();

  /* Don't do anything if the input is empty */
  if (!cityName) {
    cityInput.focus();
    return;
  }

  showLoading();

  try {
    /* Step 1: Convert city name to coordinates */
    const geo = await geocodeCity(cityName);

    /* Step 2: Fetch current weather for those coordinates */
    const weather = await fetchWeather(geo.latitude, geo.longitude);
    document.getElementById('city-spinner-overlay')?.classList.add('visible');

    hideLoading();

    /* Step 3: Inject data into the result panel */
    renderCityWeather(geo, weather);
    document.getElementById('city-spinner-overlay')?.classList.remove('visible');


  } catch (err) {
    /* Something went wrong — show the error message to the user */
    hideLoading();
    showError(err.message || 'Something went wrong. Please try again.');
    console.error('[IBWAPP city search]', err);
  }
}


/* ── EVENT LISTENERS ──
   Button click and Enter key both trigger the same search. */

citySearchBtn.addEventListener('click', searchCity);

cityInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') searchCity();
});
// On page load, ask browser for GPS coordinates
window.addEventListener('load', () => {
  if (!navigator.geolocation) return;
  navigator.geolocation.getCurrentPosition(async (pos) => {
    // Reverse-geocode using Open-Meteo's geocoding + a reverse-geocode service
    const { latitude, longitude } = pos.coords;
    // Fetch weather directly with coords (skip geocodeCity, go straight to fetchWeather)
    showLoading();
    try {
      // Get city name from coordinates using bigdatacloud free API (no key needed)
      const geoRes = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`);
      const geoData = await geoRes.json();
      const geo = {
        name: geoData.city || geoData.locality || 'Your Location',
        country: geoData.countryName || '',
        latitude,
        longitude
      };
      const weather = await fetchWeather(latitude, longitude);
      hideLoading();
      renderCityWeather(geo, weather);
    } catch (err) {
      hideLoading();
    }
  });
});