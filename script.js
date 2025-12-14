//  Elements 
const overlay = document.getElementById("planetOverlay");
const closeBtn = document.getElementById("closeOverlay");

const nameEl = document.getElementById("ov-name");
const latinEl = document.getElementById("ov-latin");
const descEl = document.getElementById("ov-description");
const circEl = document.getElementById("ov-circumference");
const distEl = document.getElementById("ov-distance");
const maxTempEl = document.getElementById("ov-temp-max");
const minTempEl = document.getElementById("ov-temp-min");
const moonsEl = document.getElementById("ov-moons");

// Fetch count for the simulated error, every 5th fetch it throws an alert error in the getPlanetData function.
// let fetchCount = 0;




//The API key gets fetched from file server.json and is not hardcoded in the script, it gets dynamically loaded
async function getApiKey() {
    const res = await fetch(
        "https://4a6l0o1px9.execute-api.eu-north-1.amazonaws.com/key"
    );

    if (!res.ok) {
        throw new Error("Could not get the API key");
    }

    const data = await res.json();

    console.log("API Key fetched:", data.key);

    if (!data.key) {
        throw new Error("API key is missing");
    }

    return data.key;
}



//https://corsproxy.io/? was tested with the URL for the API, when the CORS error occured.
async function getPlanetData(planetName) {
// fetchCount++;

// Every 5th fetch, simulate an error and a alert box will appear for the user saying "Can't find the planet right now, try again later."
    // if (fetchCount % 5 === 0) {
    //     alert("Can't find the planet right now, try again later.");

    //     throw new Error("Simulated API error (every 5th fetch)");
    // } else {


    const apiKey = await getApiKey();
//fetching planet data from the API using /bodies endpoint. x-zocom needed for authentication with the API key.
    const response = await fetch(
        "https://4a6l0o1px9.execute-api.eu-north-1.amazonaws.com/bodies?errorcode=true",
        {
            headers: { "x-zocom": apiKey },
        }
    );
// Handling all errors like service unavailable (503). With 200 being the only successful response.
    if (response.status !== 200) {
        alert("Can't find the planet right now, try again later.");
        throw new Error("There is an issue with the API");
    }

    const json = await response.json();

    if (!json.bodies) {
        throw new Error("API response is missing bodies (planet data)");
    }

    return json.bodies.find(
        b => b.name.toLowerCase() === planetName.toLowerCase()
    );
    
}
//}


// Open overlay on planet click, the overlay is hidden by default so when a planet is clicked, it fetches the data and fills the overlay with the relevant information.
document.querySelectorAll(".planet").forEach(planet => {
    planet.addEventListener("click", async () => {
        const name = planet.dataset.planet;

        const data = await getPlanetData(name);

        if (!data) {
            console.error("Planet not found:", name);
            return;
        }

        //  Fill overlay with the fetched data including name, latin name, description, circumference, distance from the sun, max and min temperature, and moons.
        nameEl.textContent = data.name.toUpperCase();
        latinEl.textContent = data.latinName.toUpperCase();
        descEl.textContent = data.desc || "No description available in the API.";

        circEl.textContent = data.circumference
            ? data.circumference.toLocaleString("sv-SE") + " km"
            : "—";

        distEl.textContent = data.distance
            ? data.distance.toLocaleString("sv-SE") + " km"
            : "—";

        maxTempEl.textContent = data.temp?.day
            ? data.temp.day + "°C"
            : "—";

        minTempEl.textContent = data.temp?.night
            ? data.temp.night + "°C"
            : "—";

        moonsEl.textContent = data.moons?.length
            ? data.moons.join(", ")
            : "Inga";

        overlay.classList.remove("hidden");
    });
});

// Close overlay
closeBtn.addEventListener("click", () => {
    overlay.classList.add("hidden");
});

// close overlay by clicking outside it
overlay.addEventListener("click", e => {
    if (e.target === overlay) overlay.classList.add("hidden");
});




