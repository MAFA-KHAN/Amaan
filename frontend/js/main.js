/**
 * AMAAN - Main Application Logic
 * Google Places Autocomplete + DSA Engine
 */

let map;
let directionsService;
let directionsRenderer;
let sourceAutocomplete;
let destAutocomplete;
let markers = {
    hazards: [],
    facilities: [],
    source: null,
    destination: null
};

// Store selected locations
let selectedLocations = {
    source: null,
    destination: null
};

function initMap() {
    console.log("Initializing AMAAN Map...");

    // Initialize map centered on Islamabad
    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 33.6844, lng: 73.0479 },
        zoom: 12,
        styles: mapStyles,
        disableDefaultUI: true,
        zoomControl: true
    });

    directionsService = new google.maps.DirectionsService();
    directionsRenderer = new google.maps.DirectionsRenderer({
        map: map,
        suppressMarkers: true,
        polylineOptions: {
            strokeColor: "#10b981",
            strokeOpacity: 0.8,
            strokeWeight: 6
        }
    });

    console.log("Map initialized successfully");

    initGooglePlacesAutocomplete();
    initEvents();
    loadHazards();

    // Try to get user's current location
    getUserLocation();
}

/**
 * Initialize Google Places Autocomplete
 * Restricted to Islamabad, Pakistan
 */
function initGooglePlacesAutocomplete() {
    console.log("Setting up Google Places Autocomplete...");

    const sourceInput = document.getElementById('source');
    const destInput = document.getElementById('destination');

    // Islamabad bounds for autocomplete
    const islamabadBounds = new google.maps.LatLngBounds(
        new google.maps.LatLng(33.5, 72.9),  // Southwest
        new google.maps.LatLng(33.8, 73.2)   // Northeast
    );

    const options = {
        bounds: islamabadBounds,
        strictBounds: true,
        componentRestrictions: { country: 'pk' },
        fields: ['formatted_address', 'geometry', 'name']
    };

    // Source autocomplete
    sourceAutocomplete = new google.maps.places.Autocomplete(sourceInput, options);
    sourceAutocomplete.addListener('place_changed', () => {
        const place = sourceAutocomplete.getPlace();
        if (place.geometry) {
            selectedLocations.source = place;
            updatePin('source', place);
            console.log("Source selected:", place.name);
        }
    });

    // Destination autocomplete
    destAutocomplete = new google.maps.places.Autocomplete(destInput, options);
    destAutocomplete.addListener('place_changed', () => {
        const place = destAutocomplete.getPlace();
        if (place.geometry) {
            selectedLocations.destination = place;
            updatePin('destination', place);
            console.log("Destination selected:", place.name);
        }
    });

    console.log("Google Places Autocomplete ready (Islamabad only)");
}

/**
 * Get User's Current Location
 */
function getUserLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const userLat = position.coords.latitude;
                const userLng = position.coords.longitude;

                console.log(`User location: ${userLat}, ${userLng}`);

                // Check if user is in Islamabad area
                if (userLat >= 33.5 && userLat <= 33.8 && userLng >= 72.9 && userLng <= 73.2) {
                    const userLocation = {
                        geometry: {
                            location: new google.maps.LatLng(userLat, userLng)
                        },
                        name: "Your Location"
                    };

                    selectedLocations.source = userLocation;
                    updatePin('source', userLocation);
                    document.getElementById('source').value = "Your Current Location";
                    map.setCenter(new google.maps.LatLng(userLat, userLng));
                    map.setZoom(14);
                } else {
                    console.log("User is outside Islamabad");
                }
            },
            (error) => {
                console.log("Geolocation error:", error.message);
            }
        );
    }
}

/**
 * Update Pin on Map
 */
function updatePin(type, place) {
    if (!place || !place.geometry) return;

    const location = place.geometry.location;
    const lat = typeof location.lat === 'function' ? location.lat() : location.lat;
    const lng = typeof location.lng === 'function' ? location.lng() : location.lng;

    console.log(`Pinning ${type}: ${place.name} at (${lat}, ${lng})`);

    // Remove old marker
    if (markers[type]) {
        markers[type].setMap(null);
    }

    // Add new marker
    const iconColor = type === 'source' ? 'green' : 'red';
    markers[type] = new google.maps.Marker({
        position: { lat: lat, lng: lng },
        map: map,
        icon: `https://maps.google.com/mapfiles/ms/icons/${iconColor}-dot.png`,
        title: place.name,
        animation: google.maps.Animation.DROP
    });

    map.panTo({ lat: lat, lng: lng });
}

/**
 * Load Hazards (Standalone - No Backend)
 */
function loadHazards() {
    console.log("Loading hazards...");

    const hazards = [
        { id: 1, lat: 33.7103, lng: 73.0601, type: "Traffic Jam - Blue Area", severity: 8 },
        { id: 2, lat: 33.7299, lng: 73.0747, type: "Road Works - F-7", severity: 5 },
        { id: 3, lat: 33.6923, lng: 73.0238, type: "Construction - G-9", severity: 6 }
    ];

    renderHazards(hazards);
}

function renderHazards(hazards) {
    markers.hazards.forEach(m => m.setMap(null));
    markers.hazards = [];

    const list = document.getElementById('hazardsList');
    list.innerHTML = '';

    hazards.forEach(h => {
        const marker = new google.maps.Marker({
            position: { lat: h.lat, lng: h.lng },
            map: map,
            icon: {
                path: google.maps.SymbolPath.CIRCLE,
                fillColor: '#f59e0b',
                fillOpacity: 0.6,
                scale: 12,
                strokeWeight: 2,
                strokeColor: '#fff'
            },
            title: `HAZARD: ${h.type}`
        });
        markers.hazards.push(marker);

        const item = document.createElement('div');
        item.className = 'detail-item';
        item.innerHTML = `<span class="label">${h.type}</span><span class="value">Severity: ${h.severity}</span>`;
        list.appendChild(item);
    });

    console.log(`${hazards.length} hazards loaded`);
}

/**
 * Initialize Events
 */
function initEvents() {
    console.log("Setting up event listeners...");

    document.getElementById('toggleSidebar').addEventListener('click', () => {
        document.getElementById('sidebar').classList.toggle('closed');
    });

    document.getElementById('findRoute').addEventListener('click', () => {
        if (!selectedLocations.source || !selectedLocations.destination) {
            alert("Please select both source and destination locations from the suggestions.");
            return;
        }

        calculateRoute();
    });

    console.log("Event listeners ready");
}

/**
 * Calculate Route using Google Directions
 */
function calculateRoute() {
    console.log("Calculating route...");

    const origin = selectedLocations.source.geometry.location;
    const destination = selectedLocations.destination.geometry.location;

    directionsService.route({
        origin: origin,
        destination: destination,
        travelMode: 'DRIVING',
        provideRouteAlternatives: true
    }, (result, status) => {
        if (status === 'OK') {
            console.log("Route found successfully");

            // Get all route alternatives
            const routes = result.routes;
            console.log(`Found ${routes.length} route(s)`);

            // DSA: Evaluate each route and select safest
            const evaluatedRoutes = routes.map((route, index) => {
                return evaluateRouteSafety(route, index);
            });

            // Sort by safety score (highest first)
            evaluatedRoutes.sort((a, b) => b.safetyScore - a.safetyScore);

            const safestRoute = evaluatedRoutes[0];
            console.log(`Safest route: Route ${safestRoute.index} with score ${safestRoute.safetyScore}`);

            // Display the safest route
            directionsRenderer.setDirections(result);
            directionsRenderer.setRouteIndex(safestRoute.index);

            displayRouteInfo(safestRoute);
            findNearestFacility(origin);

        } else {
            console.error("Route calculation failed:", status);
            alert("Could not calculate route. Please try different locations.");
        }
    });
}

/**
 * DSA: Evaluate Route Safety
 * Uses proximity to hazards and route characteristics
 */
function evaluateRouteSafety(route, index) {
    const leg = route.legs[0];
    const distance = leg.distance.value; // meters
    const duration = leg.duration.value; // seconds

    // Base score
    let safetyScore = 100;

    // Penalty for each hazard near the route
    const routePath = route.overview_path;
    markers.hazards.forEach(hazardMarker => {
        const hazardPos = hazardMarker.getPosition();

        // Check if hazard is near any point on the route
        for (let i = 0; i < routePath.length; i += 10) { // Sample every 10th point
            const point = routePath[i];
            const distToHazard = google.maps.geometry.spherical.computeDistanceBetween(point, hazardPos);

            // If hazard is within 500m of route
            if (distToHazard < 500) {
                safetyScore -= 5; // Penalty
                break;
            }
        }
    });

    // Bonus for shorter routes (less exposure)
    const distanceBonus = Math.max(0, (10000 - distance) / 1000);
    safetyScore += distanceBonus;

    // Ensure score is between 0-100
    safetyScore = Math.max(0, Math.min(100, safetyScore));

    return {
        index: index,
        route: route,
        safetyScore: Math.round(safetyScore),
        distance: leg.distance.text,
        duration: leg.duration.text
    };
}

/**
 * Display Route Information
 */
function displayRouteInfo(routeInfo) {
    document.getElementById('safetyScore').innerText = routeInfo.safetyScore;
    document.getElementById('routeDistance').innerText = routeInfo.distance;
    document.getElementById('routeETA').innerText = routeInfo.duration;

    console.log(`Route Info - Score: ${routeInfo.safetyScore}, Distance: ${routeInfo.distance}, ETA: ${routeInfo.duration}`);
}

/**
 * Find Nearest Facility (KD-Tree Simulation)
 */
function findNearestFacility(origin) {
    console.log("Finding nearest facility...");

    const facilities = [
        { name: "PIMS Hospital", type: "Emergency", lat: 33.7051, lng: 73.0451 },
        { name: "Margalla Police Station", type: "Security", lat: 33.7199, lng: 73.0647 },
        { name: "G-9 Fire Station", type: "Fire", lat: 33.6823, lng: 73.0238 },
        { name: "Shifa International", type: "Emergency", lat: 33.6789, lng: 73.0765 }
    ];

    const originLat = typeof origin.lat === 'function' ? origin.lat() : origin.lat;
    const originLng = typeof origin.lng === 'function' ? origin.lng() : origin.lng;

    // KD-Tree simulation: find nearest facility
    let best = facilities[0];
    let minD = Infinity;

    facilities.forEach(f => {
        const d = Math.pow(originLat - f.lat, 2) + Math.pow(originLng - f.lng, 2);
        if (d < minD) {
            minD = d;
            best = f;
        }
    });

    console.log(`Nearest facility: ${best.name}`);
    renderFacilityMarker(best);
}

/**
 * Render Facility Marker
 */
function renderFacilityMarker(f) {
    markers.facilities.forEach(m => m.setMap(null));
    markers.facilities = [];

    const marker = new google.maps.Marker({
        position: { lat: f.lat, lng: f.lng },
        map: map,
        icon: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
        title: `FACILITY: ${f.name}`,
        animation: google.maps.Animation.BOUNCE
    });

    setTimeout(() => marker.setAnimation(null), 2000);
    markers.facilities.push(marker);

    const list = document.getElementById('facilitiesList');
    list.innerHTML = `
        <div class="detail-item">
            <span class="label">${f.type}</span>
            <span class="value">${f.name}</span>
        </div>
    `;

    console.log("Facility marker rendered");
}

/**
 * Dark Mode Map Styles
 */
const mapStyles = [
    { "elementType": "geometry", "stylers": [{ "color": "#212121" }] },
    { "elementType": "labels.icon", "stylers": [{ "visibility": "off" }] },
    { "elementType": "labels.text.fill", "stylers": [{ "color": "#757575" }] },
    { "elementType": "labels.text.stroke", "stylers": [{ "color": "#212121" }] },
    { "featureType": "administrative", "elementType": "geometry", "stylers": [{ "color": "#757575" }] },
    { "featureType": "road", "elementType": "geometry.fill", "stylers": [{ "color": "#2c2c2c" }] },
    { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#000000" }] }
];

// Initialize when page loads
window.onload = initMap;

console.log("AMAAN JavaScript loaded successfully");
