import '../styles/style.less';
import '../images/pressure.svg';
import '../images/clearly-night.svg';
import '../images/clearly.svg';
import '../images/cloudiness.svg';
import '../images/drizzle.svg';
import '../images/fog.svg';
import '../images/freezing-rain.svg';
import '../images/humidity.svg';
import '../images/light-rain-night.svg';
import '../images/light-rain.svg';
import '../images/light-spotty-night.svg';
import '../images/little-spotty.svg';
import '../images/precipitation.svg';
import '../images/rain.svg';
import '../images/snow.svg';
import '../images/sunrise.svg';
import '../images/sunset.svg';
import '../images/temperature.svg';
import '../images/thunderstorm.svg';
import '../images/wind.svg';
import '../images/windy.svg';

const toggle = document.querySelector('.weather__degrees-toggle');
const indicator = toggle.querySelector('.weather__degrees-indicator');
const celsius = toggle.querySelector('.celsius');
const fahrenheit = toggle.querySelector('.fahrenheit');

let isCelsius = true;
let latitude = null;
let longitude = null;
let city = null;

toggle.addEventListener('click', () => {
    isCelsius = !isCelsius;

    indicator.style.transform = isCelsius ? 'translateX(0)' : 'translateX(50px)';

    if (isCelsius) {
        celsius.classList.add('active');
        fahrenheit.classList.remove('active');
    } else {
        fahrenheit.classList.add('active');
        celsius.classList.remove('active');
    }

    localStorage.setItem('isCelsius', isCelsius);
    if (city) {
        fetchData(null, null, city);
    } else if (latitude && longitude) {
        fetchData(latitude, longitude);
    }
});

const storedIsCelsius = localStorage.getItem('isCelsius');
if (storedIsCelsius !== null) {
    isCelsius = JSON.parse(storedIsCelsius);
    indicator.style.transform = isCelsius ? 'translateX(0)' : 'translateX(50px)';
    if (isCelsius) {
        celsius.classList.add('active');
        fahrenheit.classList.remove('active');
    } else {
        fahrenheit.classList.add('active');
        celsius.classList.remove('active');
    }
}


const weatherGeolocationIcon = document.querySelector('.weather__geolocation-name');
const searchInput = document.querySelector('.weather__search-input');
const apiKey = process.env.API_KEY;
console.log('API_KEY:', process.env.API_KEY);

function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition);
    } else {
        weatherGeolocationIcon.textContent = 'Geolocation is not supported by this browser.';
    }
}

function showPosition(position) {
    latitude = position.coords.latitude;
    longitude = position.coords.longitude;
    fetchData(latitude, longitude);
}

function searchCity() {
    city = searchInput.value.trim();
    if (!city) {
        return;
    }
    fetchData(null, null, city);
}

function fetchData(latitude, longitude, city) {
    let apiUrl;
    if (latitude && longitude) {
        apiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=${isCelsius ? 'metric' : 'imperial'}`;
    } else if (city) {
        apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=${isCelsius ? 'metric' : 'imperial'}`;
    } else {
        console.error('Error: Invalid parameters.');
        return;
    }
    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            if (data.cod !== 200) {
                console.error('Error:', data.message);
                return;
            }
            const {description, id} = data.weather[0];
            const {temp, feels_like, humidity, pressure} = data.main;
            const tempUnit = isCelsius ? '°C' : '°F';
            const visibility = data.visibility / 1000;
            const {speed, deg, gust} = data.wind;
            updateWindDirection(deg);
            const windDirection = getWindDirection(deg);

            let rain = data.rain ? data.rain['1h'] : 0;
            const {sunrise, sunset} = data.sys;
            const sunriseTime = new Date(sunrise * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
            const sunsetTime = new Date(sunset * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });

            const dayOfWeek = new Date().toLocaleString('en-US', { weekday: 'long' });
            const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
            const dayOfWeekElement = document.querySelector('.weather__day-week');
            const timeElement = document.querySelector('.weather__time');
            const degressElement = document.querySelector('.weather__degress-item');
            const navigationNameElement = document.querySelector('.weather__navigation-name');
            const locationNameElement = document.querySelector('.weather__geolocation-name');
            const weatherPart = document.querySelector('.weather__icon-item');
            const weatherIcon = weatherPart.querySelector('img');
            const tempElement = document.querySelector('.weather__temp-indicator');
            const humidityElement = document.querySelector('.weather__humidity-indicator');
            const precipitationElement = document.querySelector('.weather__rain-indicator');
            const pressureElement = document.querySelector('.weather__pressure-indicator');
            const visibilityElement = document.querySelector('.weather__visibility-indicator');
            const windElement = document.querySelector('.weather__wind-indicator');
            const gustElement = document.querySelector('.weather__gust-indicator');
            const sunriseElement = document.querySelector('.weather__sunrise-time');
            const sunsetElement = document.querySelector('.weather__sunset-time');
            const descriptionElement = document.querySelector('.weather__description-today');
            const windDirectionElement = document.querySelector('.weather__wind-value');

            dayOfWeekElement.textContent = dayOfWeek;
            timeElement.textContent = time;
            degressElement.textContent = `${Math.round(temp)} ${tempUnit}`;
            navigationNameElement.textContent = `${data.name}, ${data.sys.country}`;
            locationNameElement.textContent = `${data.name}, ${data.sys.country}`;
            tempElement.textContent = `${Math.round(feels_like)} ${tempUnit}`;
            humidityElement.textContent = `${humidity} %`;
            precipitationElement.textContent = `${Math.round(rain)} mm`;
            pressureElement.textContent = `${pressure} hpa`;
            visibilityElement.textContent = `${Math.round(visibility)} km`;
            windElement.textContent = Math.round(speed);
            gustElement.textContent = Math.round(gust);
            sunriseElement.textContent = sunriseTime;
            sunsetElement.textContent = sunsetTime;
            descriptionElement.textContent = description;
            windDirectionElement.textContent = windDirection;
            
            function isTimeInRange(current, start, end) {
                if (start > end) {
                    return current >= start || current <= end;
                } else {
                    return current >= start && current <= end;
                }
            }

            if (id >= 200 && id <= 232) {
                weatherIcon.src = 'images/thunderstorm.svg';
            } else if (id >= 300 && id <= 321) {
                weatherIcon.src = 'images/drizzle.svg';
            } else if (id >= 500 && id <= 504 && isTimeInRange(time, sunsetTime, sunriseTime)) {
                weatherIcon.src = 'images/light-rain-night.svg';
            } else if (id >= 500 && id <= 504) {
                weatherIcon.src = 'images/light-rain.svg';
            } else if (id >= 520 && id <= 531) {
                weatherIcon.src = 'images/rain.svg';
            } else if (id === 511 || (id >= 613 && id <= 622)) {
                weatherIcon.src = 'images/freezing-rain.svg';
            } else if (id >= 600 && id <= 612) {
                weatherIcon.src = 'images/snow.svg';
            } else if (id >= 701 && id <= 762) {
                weatherIcon.src = 'images/fog.svg';
            } else if (id >= 771 && id <= 781) {
                weatherIcon.src = 'images/wind.svg';
            } else if (id === 800 && isTimeInRange(time, sunsetTime, sunriseTime)) {
                weatherIcon.src = 'images/clearly-night.svg';
            } else if (id === 800) {
                weatherIcon.src = 'images/clearly.svg';
            } else if (id === 801 && isTimeInRange(time, sunsetTime, sunriseTime)) {
                weatherIcon.src = 'images/light-spotty-night.svg';
            } else if (id === 801) {
                weatherIcon.src = 'images/little-spotty.svg';
            } else if (id >= 802 && id <= 804) {
                weatherIcon.src = 'images/cloudiness.svg';
            }

            fetchForecastData(latitude, longitude, city);
        })
        .catch(error => {
            console.error('Error:', error);
            weatherGeolocationIcon.textContent = 'Unable to determine location.';
        });
}

function fetchForecastData(latitude, longitude, city) {
    let forecastApiUrl;
    if (latitude && longitude) {
        forecastApiUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=${isCelsius ? 'metric' : 'imperial'}`;
    } else if (city) {
        forecastApiUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=${isCelsius ? 'metric' : 'imperial'}`;
    } else {
        console.error('Error: Invalid parameters.');
        return;
    }

    fetch(forecastApiUrl)
        .then(response => response.json())
        .then(data => {
            if (data.cod != 200) {
                console.error('Error:', data.message);
                return;
            }

            const forecastList = data.list;
            const tempUnit = isCelsius ? '°C' : '°F';
            const forecastCards = document.querySelectorAll('.weather__forecast-card');

            const selectedForecastList = [forecastList[6], forecastList[14], forecastList[22], forecastList[30], forecastList[38]];

            selectedForecastList.forEach((forecast, index) => {
                const forecastCard = forecastCards[index];
                const forecastDate = new Date(forecast.dt_txt).toLocaleDateString([], { day: '2-digit', month: '2-digit' });
                const forecastDayOfWeek = new Date(forecast.dt_txt).toLocaleString('en-US', { weekday: 'long' });
                const forecastDegrees = Math.floor(forecast.main.temp);
                const forecastIcon = forecast.weather[0].id;
                let iconPath;

                if (forecastIcon >= 200 && forecastIcon <= 232) {
                    iconPath = 'images/thunderstorm.svg';
                } else if (forecastIcon >= 300 && forecastIcon <= 321) {
                    iconPath = 'images/drizzle.svg';
                } else if (forecastIcon >= 500 && forecastIcon <= 504) {
                    iconPath = 'images/light-rain.svg';
                } else if (forecastIcon >= 520 && forecastIcon <= 531) {
                    iconPath = 'images/rain.svg';
                } else if (forecastIcon === 511 || (forecastIcon >= 613 && forecastIcon <= 622)) {
                    iconPath = 'images/freezing-rain.svg';
                } else if (forecastIcon >= 600 && forecastIcon <= 612) {
                    iconPath = 'images/snow.svg';
                } else if (forecastIcon >= 701 && forecastIcon <= 762) {
                    iconPath = 'images/fog.svg';
                } else if (forecastIcon >= 771 && forecastIcon <= 781) {
                    iconPath = 'images/wind.svg';
                } else if (forecastIcon === 800) {
                    iconPath = 'images/clearly.svg';
                } else if (forecastIcon === 801) {
                    iconPath = 'images/little-spotty.svg';
                } else if (forecastIcon >= 802 && forecastIcon <= 804) {
                    iconPath = 'images/cloudiness.svg';
                }

                forecastCard.querySelector('.weather__date').textContent = forecastDate;
                forecastCard.querySelector('.weather__week').textContent = forecastDayOfWeek;
                forecastCard.querySelector('.weather__degress').textContent = `${forecastDegrees} ${tempUnit}`;
                forecastCard.querySelector('.weather__icon img').src = iconPath;
            });
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

searchInput.addEventListener('keyup', event => {
    if (event.key === 'Enter') {
        searchCity();
    }
});

getLocation();


const weatherInput = document.querySelector('.weather__search-input');
const weatherCloseBtn = document.querySelector('.weather__close-btn');

weatherInput.addEventListener('focus', () => {
    weatherCloseBtn.classList.add('active');
});

weatherInput.addEventListener('focusout', () => {
    weatherCloseBtn.classList.remove('active');
    weatherInput.value = '';
});


document.addEventListener('DOMContentLoaded', function() {
    const carousel = document.querySelector('.weather__forecast-cards');
    const cards = document.querySelectorAll('.weather__forecast-card');
    const leftArrow = document.querySelector('.weather__arrow-left');
    const rightArrow = document.querySelector('.weather__arrow-right');
    const cardWidth = 250;
    let isMoving = false;
    let translateX = 0;
    let maxTranslateX = 0;
    let minTranslateX = -(cards.length - 1) * cardWidth;

    carousel.style.transform = `translateX(${translateX}px)`;

    function checkRightScroll() {
        if (translateX <= minTranslateX) {
            rightArrow.classList.add('disabled');
        } else {
            rightArrow.classList.remove('disabled');
        }
    }

    function checkLeftScroll() {
        if (translateX >= maxTranslateX) {
            leftArrow.classList.add('disabled');
        } else {
            leftArrow.classList.remove('disabled');
        }
    }

    leftArrow.addEventListener('click', () => {
        if (!isMoving &&!leftArrow.classList.contains('disabled')) {
            isMoving = true;
            translateX += cardWidth;
            carousel.style.transform = `translateX(${translateX}px)`;
            if (translateX > maxTranslateX) {
                translateX = maxTranslateX;
                carousel.style.transform = `translateX(${translateX}px)`;
            }
            checkLeftScroll();
            checkRightScroll();
            setTimeout(() => {
                isMoving = false;
            }, 300);
        }
    });

    rightArrow.addEventListener('click', () => {
        if (!isMoving &&!rightArrow.classList.contains('disabled')) {
            isMoving = true;
            translateX -= cardWidth;
            carousel.style.transform = `translateX(${translateX}px)`;
            if (translateX < minTranslateX) {
                translateX = minTranslateX;
                carousel.style.transform = `translateX(${translateX}px)`;
            }
            checkLeftScroll();
            checkRightScroll();
            setTimeout(() => {
                isMoving = false;
            }, 300);
        }
    });

    checkLeftScroll();
    checkRightScroll();
})


function getWindDirection(deg) {
    const directions = [
      'North (N)', 'Northeast (NE)', 'East (E)', 'Southeast (SE)', 'South (S)', 'Southwest (SW)', 'West (W)', 'Northwest', 'North (N)'
    ];
    const index = Math.floor((deg % 360) / 45);
    return directions[index];
}

function updateWindDirection(degrees) {
    const needle = document.querySelector('.weather__compass-needle');
    needle.style.transform = `translate(-50%, -50%) rotate(${degrees}deg)`;
}


document.addEventListener("DOMContentLoaded", () => {
    const themeSwitch = document.querySelector('.weather__checkbox');
    const currentTheme = localStorage.getItem("theme");

    if (currentTheme === "light") {
        document.body.classList.add("lightstyle");
        themeSwitch.checked = true;
    }

    themeSwitch.addEventListener("change", () => {
        if (themeSwitch.checked) {
            document.body.classList.add("lightstyle");
            localStorage.setItem("theme", "light");
        } else {
            document.body.classList.remove("lightstyle");
            localStorage.setItem("theme", "dark");
        }
        updateIcons();
    });

    function updateIcons() {
        const sunIcon = document.querySelector('.weather__sun');
        const moonIcon = document.querySelector('.weather__moon');

        if (themeSwitch.checked) {
            sunIcon.style.visibility = 'visible';
            moonIcon.style.visibility = 'hidden';   
        } else {
            sunIcon.style.visibility = 'hidden';
            moonIcon.style.visibility = 'visible';  
        }
    }

    updateIcons();
});