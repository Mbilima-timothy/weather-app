const apiKey = 'aabb0fb46c115e871a1a45fccc0bebf0';
const baseUrl = 'https://api.openweathermap.org/data/2.5/weather';
const forecastUrl = 'https://api.openweathermap.org/data/2.5/forecast';
const suggestionsContainer = document.getElementById('citySuggestions');
const mainContainer = document.querySelector('.main-container');




async function getWeather(lat, lon) {
  try {
    
    const currentWeatherResponse = await fetch(`${baseUrl}?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`);
    if (!currentWeatherResponse.ok) {
      throw new Error('Failed to fetch current weather');
    }
    const currentWeatherData = await currentWeatherResponse.json();

    
    const forecastResponse = await fetch(`${forecastUrl}?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`);
    if (!forecastResponse.ok) {
      throw new Error('Failed to fetch weather forecast');
    }
    const forecastData = await forecastResponse.json();

    
    displayWeather(currentWeatherData, forecastData);
  } catch (error) {
    console.error('Error:', error);
    alert('Could not retrieve weather data.');
  }
}

async function getCitySuggestions() {
  const city = document.getElementById('cityInput').value;
  if (!city) {
    alert('Please enter a city name');
    return;
  }
  
  try {
    
    const geocodeResponse = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=5&appid=${apiKey}`);
    if (!geocodeResponse.ok) {
      throw new Error('City not found');
    }
    const citiesSuggestions = await geocodeResponse.json();

    
    displayCitySuggestions(citiesSuggestions);
  } catch (error) {
    console.error('Error fetching city suggestions:', error);
    alert('Could not retrieve city suggestions.');
  }
}

function displayCitySuggestions(cities) {
  suggestionsContainer.innerHTML = '';
  const search_text = document.createElement('h2');
  search_text.innerText = "Which One Do You Mean?";
  suggestionsContainer.appendChild(search_text);
  
  cities.forEach(city => {
    const cityButton = document.createElement('button');
    cityButton.className = "city";
    cityButton.innerText = `${city.name}, ${city.country}`;
    cityButton.onclick = () => {
      getWeather(city.lat, city.lon); 
    };
    suggestionsContainer.appendChild(cityButton);
  });
}


async function getCityWeather() {
  const city = document.getElementById('cityInput').value;
  if (!city) {
    alert('Please enter a city name');
    return;
  }
  
  try {
    
    const currentWeatherResponse = await fetch(`${baseUrl}?q=${city}&appid=${apiKey}&units=metric`);
    if (!currentWeatherResponse.ok) {
      throw new Error('City not found');
    }
    const currentWeatherData = await currentWeatherResponse.json();

    
    const forecastResponse = await fetch(`${forecastUrl}?q=${city}&appid=${apiKey}&units=metric`);
    if (!forecastResponse.ok) {
      throw new Error('City forecast not found');
    }
    const forecastData = await forecastResponse.json();

    
    displayWeather(currentWeatherData, forecastData);
  } catch (error) {
    console.error('Error fetching city weather data:', error);
    alert('Could not retrieve weather data for the city.');
  }
}

function getBackgroundClass(weatherCondition) {
  if (weatherCondition.includes('clear')) {
    return 'clear-sky';
  } else if (weatherCondition.includes('clouds')) {
    return 'cloudy';
  } else if (weatherCondition.includes('rain')) {
    return 'rainy';
  } else if (weatherCondition.includes('snow')) {
    return 'snowy';
  } else if (weatherCondition.includes('thunderstorm')) {
    return 'thunderstorm';
  } else {
    return 'default-weather';  
  }
}


function getUserLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(position => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
      getWeather(lat, lon);  
    }, error => {
      console.error('Error getting location', error);
      alert('Could not retrieve your location.');
    });
  } else {
    alert('Geolocation is not supported by this browser.');
  }
}

function displayWeather(currentData, forecastData) {
  suggestionsContainer.innerHTML = "";
  const weatherContainer = document.getElementById('weatherInfo');
  const todayWeatherContainer = document.createElement('div');
  todayWeatherContainer.classList.add('today-weather');
  
  
  const cityName = currentData.name;
  const temperature = currentData.main.temp;
  const weatherCondition = currentData.weather[0].description;
  const humidity = currentData.main.humidity;
  const windSpeed = currentData.wind.speed;
  const iconCode = currentData.weather[0].icon;
  const weatherIconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;

  const timezoneOffset = currentData.timezone; // Timezone offset in seconds
  const localTime = new Date((currentData.dt + timezoneOffset) * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  
  const backgroundClass = getBackgroundClass(weatherCondition);
  mainContainer.classList.add(backgroundClass); 
  
  
  todayWeatherContainer.innerHTML = `
    <h2>Weather in ${cityName} (Today)</h2>
    <div class="timeImage">
      <img src="${weatherIconUrl}" alt="${weatherCondition}" class="weather-icon">
      <p>${localTime}</p>
    </div>
    <p>Temperature ${temperature}°C</p>
    <p>Condition: ${weatherCondition}</p>
    <p>Humidity: ${humidity}%</p>
    <p>Wind Speed: ${windSpeed} m/s</p>
  `;

  
  let forecastHTML = '';
  const forecastList = forecastData.list;

  
  const todayDate = new Date().toISOString().split('T')[0];

  
  let count = 0;
  for (let i = 0; i < forecastList.length && count < 3; i++) {
    const forecastDate = forecastList[i].dt_txt.split(' ')[0]; 
    const forecastTime = new Date(forecastList[i].dt_txt).getHours();
    
    
    if (forecastDate !== todayDate && forecastTime === 12) {
      const dayTemp = forecastList[i].main.temp;
      const dayWeatherCondition = forecastList[i].weather[0].description;
      const dayIconCode = forecastList[i].weather[0].icon;
      const dayWeatherIconUrl = `https://openweathermap.org/img/wn/${dayIconCode}@2x.png`;
      const day = new Date(forecastList[i].dt_txt).toLocaleDateString(undefined, { weekday: 'long' });
      
      forecastHTML += `
        <div class="weather-card">
          <h3>${day}</h3>
          <img src="${dayWeatherIconUrl}" alt="${dayWeatherCondition}">
          <p>Temp: ${dayTemp}°C</p>
          <p>${dayWeatherCondition}</p>
        </div>
      `;
      count++;
    }
  }

  
  weatherContainer.innerHTML = '';
  weatherContainer.appendChild(todayWeatherContainer);
  weatherContainer.innerHTML += `<div class="forecast">${forecastHTML}</div>`;
}




// Addition
function getUserLocation() {
  if (navigator.geolocation) {
    console.log('Attempting to retrieve location...');
    navigator.geolocation.getCurrentPosition(
      position => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        console.log(`Location retrieved: Latitude ${lat}, Longitude ${lon}`);
        getWeather(lat, lon); // Call the function to fetch weather
      },
      error => {
        console.error('Error retrieving location:', error);
        alert('Could not retrieve your location. Please ensure location services are enabled.');
      },
      { timeout: 10000 } // Timeout to avoid long waits
    );
  } else {
    alert('Geolocation is not supported by this browser.');
  }
}
