// set global variables and DOM elements
var apiKey = "43df6994375e5f73cac2fff37be7d8b5";
var submitBtn = document.getElementById("submit");
var clearBtn = document.getElementById("clear");

var previousSearchesEl = document.getElementById("previousSearches");
var savedCities = JSON.parse(localStorage.getItem("cities")) || [];
var cityListItems = document.querySelectorAll(".list-group-item");
var currentConditionsEl = document.getElementById("current");
var forecastEl = document.getElementById("forecast");
var currentEl = document.getElementById("current");
var fiveDayCheck = document.getElementById("5-day");
var cityName="";

// function to display the date in the current weather conditions using moment.js
var displayDate = function() {
    var currentDay = document.createElement("h4");
    currentDay.textContent = moment().format("MMM Do YY");
    currentConditionsEl.prepend(currentDay);
};

// displays the current weather conditions based on API call
var displayConditions = function(data) {
    // weather icon from API call response data
    let iconCode = data.current.weather[0].icon;
    let iconUrl = "http://openweathermap.org/img/wn/" + iconCode + "@2x.png"; 
    let iconImage = document.createElement("img");
    iconImage.setAttribute("src", iconUrl);
    currentConditionsEl.appendChild(iconImage);
    // current temperature details from API call response data
    var currentTemp = document.createElement("p");
    currentTemp.innerHTML = "temperature: " + data.current.temp +" &#176F";
    currentConditionsEl.appendChild(currentTemp);
    // current humidity details from API call response data
    var currentHumidity = document.createElement("p");
    currentHumidity.textContent = "Humidity: " + data.current.humidity + "%";
    currentConditionsEl.appendChild(currentHumidity);
    // current windspeed details from API call response data
    var currentWindSpeed = document.createElement("p");
    currentWindSpeed.textContent = "Wind Speed: " + data.current.wind_speed + " MPH";
    currentConditionsEl.appendChild(currentWindSpeed);
    // current UV index details from API call response data
    var currentUV = document.createElement("p");
    var currentUVspan = document.createElement("span");
    currentUVspan.textContent = data.current.uvi;
    currentUV.textContent = "UV Index: ";
    currentConditionsEl.appendChild(currentUV);
    currentUV.appendChild(currentUVspan);
    // if statements for color coding UV index value
    if (currentUVspan.textContent < 3){
        currentUVspan.setAttribute("style", "background-color: green");
    } if (currentUVspan.textContent >= 3 && currentUVspan.textContent < 7) {
        currentUVspan.setAttribute("style", "background-color: yellow");
    } if (currentUVspan.textContent >= 7) {
        currentUVspan.setAttribute("style", "background-color: red");
    }
}

// displays the current 5-day forcast data using the data from API call
var get5Day = function(data){
    // set up div for 5day heading
    var fiveDay = document.createElement("div")
    fiveDay.setAttribute("class", "col-12");
    fiveDay.innerHTML = "<h3>5-Day Forecast</h3>";
    forecastEl.appendChild(fiveDay);
// loop that gets the data for each day in 5 day forecast and displays it in new div.
    for (i=0; i<5; i++) {
        var forecastDate = moment().add(i+1, 'days').format("dddd MMM Do");
        var forecastTemp = data.daily[i+1].temp.day;
        var forecastWind = data.daily[i+1].wind_speed;
        var forecastHumidity = data.daily[i+1].humidity;
        var iconCode = data.daily[i+1].weather[0].icon;
        var iconUrl = "http://openweathermap.org/img/wn/" + iconCode + "@2x.png";       
        var forecastDay = document.createElement("div")
        forecastDay.setAttribute("id", "day-"+[i+1], "class", "card col-sm-2");
        forecastDay.innerHTML = "<p>" + forecastDate + "</br> <img src=" + iconUrl + "></br>Temp: " + forecastTemp + " &#176F </br> Wind: " + forecastWind + " MPH </br> Humidity: " + forecastHumidity + " % </p>";
        forecastEl.appendChild(forecastDay);
    }
};

// displays the city name based on the first API call.
var displayCityName = function(data) {
    currentEl.innerHTML = "<h3>Current conditions for: </br>" + data.name + "</h3>";
};

// calls functions to display the current weather details.
var displayCityInfo = function(data) {
    displayConditions(data);
    displayDate();
};

// function to make API calls and pass response data to other functions. 
var getWeather = function(cityName) {
    // api call to get lat and long of city.
    var apiUrl1 = "https://api.openweathermap.org/data/2.5/weather?q=" + cityName + "&appid=" + apiKey;
    fetch(apiUrl1).then(function(response) {
        if(response.ok) {
            response.json().then(function(data) {
                console.log(data);
                displayCityName(data);
                // api call to get weather data based on lat and long coordinates.
                var apiUrl2 = "https://api.openweathermap.org/data/2.5/onecall?lat=" + data.coord.lat + "&lon=" + data.coord.lon + "&units=imperial&exclude=hourly,minutely&appid=" + apiKey;
                fetch(apiUrl2).then(function(response) {
                    if(response.ok){
                        response.json().then(function(data){
                            console.log(data);
                            displayCityInfo(data);
                            get5Day(data);
                        })
                    }
                })
            })
        }
        if (response.status === 400) {
            alert("bad request");
        }
    });
};

// event listener function, takes city name entered in search bar and passes to relevant functions.
var getCity = function () {
    // clear previous 5day forecast if there is one displayed
    if (forecastEl.hasChildNodes) {
        forecastEl.innerHTML = "";
    }
    cityName = document.querySelector("#city").value;
    // call save City to save city into local storage array
    createCityEl(cityName);
    saveCity(cityName);
    getWeather(cityName);
}

// creates and displays the previous city searches to the page
var createCityEl = function(city) {
    if(checkCityName(cityName)){
        var cityEl = document.createElement("li");
        cityEl.setAttribute("class", "list-group-item btn");
        cityEl.textContent = (city);
        previousSearchesEl.appendChild(cityEl);
    }
};

// var createCityFromList = function(target){
//     // createCityEl(city);
//     // getWeather(city);
//     console.log(target);
// }

// var addCityListLink = function(){
//     for(i=0; i<savedCities.length; i++){
//         savedCities[i].addEventListener("click", createCityFromList(savedCities[i]))
//     }
//     // cityListItems.addEventListener("click", createCityFromList);
// }

var checkCityName = function(cityName){
    if(savedCities.includes(cityName) === false){
        return true;
    } else {
        return false;
    }
};

// saves searched city names into localStorage
var saveCity = function(cityName){
    // set searched city into savedCities array
    if(checkCityName(cityName)){
        savedCities.push(cityName);
        console.log(savedCities);
        // check if search city has already been saved, if not, save it.
        localStorage.setItem('cities', JSON.stringify(savedCities));
    }
};

// loads any cities saved in localStorage
var loadCities = function() {
    // search local storage for "cities" and break if nothing is saved.
    var savedCities = JSON.parse(localStorage.getItem("cities")) || [];
    console.log(savedCities);
    if (!savedCities) {
        savedCities = [];
    };
    // loop through saved cities array
    for (i=0; i<savedCities.length; i++) {
        // pass each city into the createCityEl function
        createCityEl(savedCities[i]);
    }            
};

var clearCities = function(event){
    localStorage.clear();
    savedCities = [];
    previousSearchesEl.innerHTML = "";
    cityName = document.querySelector("#city");
    cityName.value = "";
}

// calls load cities function on page load.
loadCities();
// addCityListLink();
// event listener for search button
submitBtn.addEventListener("click", getCity);
// event listener for clear button
clearBtn.addEventListener("click", clearCities);