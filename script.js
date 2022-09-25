async function getCoords(city, country) {
    const apiKey = "Uti1QZzS8oCle7b6lcEJbA==kmI0fD8cZxd6dD7E";
    const req = await fetch("https://api.api-ninjas.com/v1/city?name=" + encodeURIComponent(city) + (country ? "&country=" + encodeURIComponent(country) : ""), {
        headers: {
            "X-Api-Key": apiKey
        }
    });
    const data = await req.json();
    if (!(data[0] instanceof Object)) {
        throw new Error("Unable to find the location");
    }
    return data[0];
}
async function fetchWeather(lon, lat, units) {
    const degress = units === "fahrenheit" ? "fahrenheit" : "celsius";
    const apiKey = "17771154a47431786a9d1224babb4d59";
    const req = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&temperature_unit=${degress}&appid=${apiKey}`);
    return await req.json();
}
async function getWeather(city, country, units) {
    const cityData = await getCoords(city, country);
    const weatherData = await fetchWeather(cityData.longitude, cityData.latitude, units);
    return {
        city: cityData.name,
        country: countries[cityData.country],
        temp: weatherData.current_weather.temperature,
        value: weatherData.current_weather.temperature.toFixed(1) + "\xb0" + (units === "fahrenheit" ? "F" : "C"),
        //cityData: cityData,
        //weatherData: weatherData
    }
}

function updateOutput(degrees, city, country) {
    elements.output.temp.textContent = degrees;
    elements.output.city.textContent = city;
    elements.output.country.textContent = country;
}

function sealForm() {
    [elements.country, elements.city, elements.units, elements.btn].forEach(node => {
        node.setAttribute("disabled", "disabled");
    });
}
function unsealForm() {
    [elements.country, elements.city, elements.units, elements.btn].forEach(node => {
        node.removeAttribute("disabled");
    });
}

const elements = {
    section: document.querySelector("#weather"),
    city: document.querySelector("#city-selection"),
    country: document.querySelector("#country-selection"),
    units: document.querySelector("#degrees-selection"),
    btn: document.querySelector("#weather-button-get"),
    output: {
        temp: document.querySelector("#weather-output-temperature"),
        city: document.querySelector("#weather-output-city"),
        country: document.querySelector("#weather-output-country")
    }
};

let countries;

fetch("./countries.json").then(req => {
    return req.json();
}).then(data => {
    countries = data;

    const options = Object.assign({"": "(auto-detect)"}, data),
        frag = document.createDocumentFragment();
    for (let code in options) {
        let option = document.createElement("option");
        option.value = code;
        option.textContent = options[code];
        frag.appendChild(option);
    }
    elements.country.appendChild(frag);
    elements.section.classList.add("weather-ready");
    elements.btn.addEventListener("click", e => {
        sealForm();
        getWeather(elements.city.value, elements.country.value, elements.units.value).then(data => {
            console.log(data);
            updateOutput(data.value, data.city, data.country);
            unsealForm();
        }).catch(err => {
            console.error("failed to load resource:", err.message);
            updateOutput("", "", "");
            unsealForm();
            alert("Location not found");
        });        
    });
});


