const apiKey = 'e67216cd91c76ea11a1fdecff85eccc6';
const apiUrl = 'https://api.openweathermap.org/data/2.5/weather';

const locationInput = document.getElementById('locationInput');
const searchButton = document.getElementById('searchButton');
const locationElement = document.getElementById('location');
const temperatureElement = document.getElementById('temperature');
const descriptionElement = document.getElementById('description');
const additionalInfo = document.getElementById('additional-info');
const countryButtons = document.querySelectorAll('.country-btn');
const layerButtons = document.querySelectorAll('.layer-btn');

let map;
let currentLocation = null;
let currentLayer = 'temp';
let weatherLayers = {
    temperature: null,
    precipitation: null,
    wind: null
};

window.onload = function () {
    map = L.map('map-container').setView([51.505, -0.09], 10);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
}

function updateMap(weatherType) {
    // Αφαίρεση όλων των προηγούμενων στρώσεων
    for (let layer in weatherLayers) {
        if (weatherLayers[layer]) {
            map.removeLayer(weatherLayers[layer]);
            weatherLayers[layer] = null;  // Απαλοιφή του reference για να μην κρατάει παλιά στρώση
        }
    }

    const weatherLayer = L.tileLayer(`https://tile.openweathermap.org/map/${weatherType}_new/{z}/{x}/{y}.png?appid=${apiKey}`, {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openweathermap.org/copyright">OpenWeather</a>'
    });

    weatherLayer.on('tileload', () => {
        console.log(`Loaded tile for ${weatherType}`);
    });

    weatherLayer.on('tileerror', (error, tile) => {
        console.error(`Error loading tile for ${weatherType}:`, error, tile);
    });

    weatherLayer.addTo(map);
    weatherLayers[weatherType] = weatherLayer;
}

function fetchWeather(location) {
    const url = `${apiUrl}?q=${location}&appid=${apiKey}&units=metric`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            console.log('Weather data:', data);

            currentLocation = {
                lat: data.coord.lat,
                lon: data.coord.lon
            };

            const temp = Math.round(data.main.temp);
            locationElement.textContent = data.name;
            temperatureElement.textContent = `${temp}°C`;
            descriptionElement.textContent = data.weather[0].description;
            additionalInfo.innerHTML = `Humidity: ${data.main.humidity}%<br>Wind: ${data.wind.speed} m/s`;

            map.setView([data.coord.lat, data.coord.lon], 10);

            updateMap(currentLayer);
        })
        .catch(error => {
            console.error('Error fetching weather data:', error);
        });
}

searchButton.addEventListener('click', () => {
    const location = locationInput.value;
    if (location) {
        fetchWeather(location);
    }
});

countryButtons.forEach(button => {
    button.addEventListener('click', () => {
        const location = button.getAttribute('data-country');
        fetchWeather(location);
    });
});

layerButtons.forEach(button => {
    button.addEventListener('click', () => {
        currentLayer = button.getAttribute('data-layer');
        if (currentLocation) {
            updateMap(currentLayer);
        } else {
            console.log('No current location set');
        }
    });
});
