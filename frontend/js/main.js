/**
 * AMAAN - Main Application Logic
 * Google Places Autocomplete + DSA Engine
 */

let map;
let directionsService;
let directionsRenderer;
let placesService;
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
        zoom: 13,
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

    placesService = new google.maps.places.PlacesService(map);

    console.log("Map initialized successfully");

    initGooglePlacesAutocomplete();
    initEvents();

    // Initial load
    updateDynamicHazards();

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
            updateFacilitiesByFilters();
            updateDynamicHazards();
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
            updateDynamicHazards();
        }
    });

    console.log("Google Places Autocomplete ready (Islamabad only)");
}

/**
 * Initialize Event Listeners
 */
function initEvents() {
    console.log("Initializing UI Event Listeners...");

    // Find Route Button
    const findRouteBtn = document.getElementById('findRoute');
    if (findRouteBtn) {
        findRouteBtn.addEventListener('click', () => {
            if (selectedLocations.source && selectedLocations.destination) {
                calculateRoute();
            } else {
                alert("Please select both a starting point and a destination.");
            }
        });
    }

    // Sidebar Toggle
    const toggleBtn = document.getElementById('toggleSidebar');
    const sidebar = document.getElementById('sidebar');
    if (toggleBtn && sidebar) {
        toggleBtn.addEventListener('click', () => {
            sidebar.classList.toggle('closed');
            // Toggle icon direction
            const icon = toggleBtn.querySelector('i');
            if (sidebar.classList.contains('closed')) {
                icon.classList.replace('fa-chevron-left', 'fa-chevron-right');
            } else {
                icon.classList.replace('fa-chevron-right', 'fa-chevron-left');
            }
        });
    }

    // Filter Listeners
    document.querySelectorAll('.filter-item input').forEach(input => {
        input.addEventListener('change', () => {
            console.log(`Filter changed: ${input.getAttribute('data-type')}`);
            updateFacilitiesByFilters();
        });
    });

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

                    updateFacilitiesByFilters();
                    updateDynamicHazards();
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
 * Generate Authentic Dynamic Hazards
 */
function updateDynamicHazards() {
    console.log("Updating dynamic hazards...");

    // Simulate dynamic hazards based on sectors
    const sectors = ["Blue Area", "F-6", "F-7", "G-9", "I-8", "E-11", "Centaurus Area"];
    const hazardTypes = [
        { type: "Traffic Congestion", desc: "Heavy flow reported near main intersection", baseSeverity: 7 },
        { type: "Road Construction", desc: "Expansion work in progress, use alternative lanes", baseSeverity: 5 },
        { type: "Emergency Incident", desc: "Response vehicles on site, expect delays", baseSeverity: 9 },
        { type: "Protest Activity", desc: "Movement restricted in central zones", baseSeverity: 8 },
        { type: "Water Logging", desc: "Localized flooding after heavy rain", baseSeverity: 6 }
    ];

    const hazards = [];
    const count = 3 + Math.floor(Math.random() * 3); // 3-5 random hazards

    for (let i = 0; i < count; i++) {
        const sector = sectors[Math.floor(Math.random() * sectors.length)];
        const hType = hazardTypes[Math.floor(Math.random() * hazardTypes.length)];

        // Random locations within Islamabad bounds for demo
        const lat = 33.68 + (Math.random() - 0.5) * 0.1;
        const lng = 73.04 + (Math.random() - 0.5) * 0.1;

        hazards.push({
            id: Date.now() + i,
            lat: lat,
            lng: lng,
            type: `${hType.type} - ${sector}`,
            description: hType.desc,
            severity: hType.baseSeverity + (Math.floor(Math.random() * 3) - 1)
        });
    }

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
                fillColor: h.severity > 7 ? '#ef4444' : '#f59e0b',
                fillOpacity: 0.6,
                scale: 10 + (h.severity * 2),
                strokeWeight: 2,
                strokeColor: '#fff'
            },
            title: `HAZARD: ${h.type} (${h.description})`
        });
        markers.hazards.push(marker);

        const item = document.createElement('div');
        item.className = 'info-item';
        item.innerHTML = `
            <div class="info-content">
                <div class="info-title">${h.type}</div>
                <div class="info-desc">${h.description}</div>
            </div>
            <div class="info-badge severity-${h.severity > 7 ? 'high' : 'medium'}">${h.severity}</div>
        `;
        list.appendChild(item);
    });

    console.log(`${hazards.length} dynamic hazards rendered`);
}

/**
 * Filter facilities based on checkboxes
 */
function updateFacilitiesByFilters() {
    if (!selectedLocations.source) return;

    const center = selectedLocations.source.geometry.location;
    const activeFilters = Array.from(document.querySelectorAll('.filter-item input:checked'))
        .map(input => input.getAttribute('data-type'));

    fetchNearbyFacilities(center, activeFilters);
}

/**
 * Fetch Nearby Facilities using Google Places Service
 */
function fetchNearbyFacilities(location, types) {
    console.log("Fetching real nearby facilities for types:", types);

    // Type mapping: Filter Tag -> Google Place Type
    const typeMap = {
        'Emergency': 'hospital',
        'Security': 'police',
        'Fire': 'fire_station',
        'Food': 'restaurant'
    };

    // Icon mapping
    const iconMap = {
        'Emergency': 'fa-hospital',
        'Security': 'fa-shield-halved',
        'Fire': 'fa-fire-extinguisher',
        'Food': 'fa-utensils'
    };

    // Color mapping
    const colorMap = {
        'Emergency': '#ef4444',
        'Security': '#3b82f6',
        'Fire': '#f97316',
        'Food': '#f59e0b'
    };

    // Clear old markers
    markers.facilities.forEach(m => m.setMap(null));
    markers.facilities = [];
    const list = document.getElementById('facilitiesList');
    list.innerHTML = '';

    if (types.length === 0) {
        list.innerHTML = '<p class="empty-msg">No filters selected.</p>';
        return;
    }

    let allResults = [];
    let completedRequests = 0;

    types.forEach(category => {
        const request = {
            location: location,
            radius: 3000, // 3km
            type: typeMap[category] // Pass string, not array
        };

        placesService.nearbySearch(request, (results, status) => {
            completedRequests++;
            console.log(`Places Search Status for ${category}:`, status);

            if (status === google.maps.places.PlacesServiceStatus.OK) {
                console.log(`Found ${results.length} results for ${category}`);
                // Add category info to results
                const annotatedResults = results.slice(0, 3).map(r => ({
                    ...r,
                    category: category,
                    icon: iconMap[category],
                    color: colorMap[category]
                }));
                allResults = allResults.concat(annotatedResults);
            } else if (status === google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
                console.warn(`No results for ${category} in this area.`);
            } else {
                console.error(`Places Service failed for ${category}:`, status);
            }

            if (completedRequests === types.length) {
                renderFacilities(allResults);
            }
        });
    });
}

function renderFacilities(facilities) {
    const list = document.getElementById('facilitiesList');

    if (facilities.length === 0) {
        list.innerHTML = '<p class="empty-msg">No facilities found in this area.</p>';
        return;
    }

    facilities.forEach(f => {
        const marker = new google.maps.Marker({
            position: f.geometry.location,
            map: map,
            title: f.name,
            icon: {
                path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
                scale: 5,
                fillColor: f.color,
                fillOpacity: 1,
                strokeWeight: 2,
                strokeColor: '#fff',
                rotation: 0
            },
            animation: google.maps.Animation.DROP
        });

        markers.facilities.push(marker);

        const item = document.createElement('div');
        item.className = 'info-item';
        item.innerHTML = `
            <div class="info-icon" style="background: ${f.color}20; color: ${f.color}">
                <i class="fas ${f.icon}"></i>
            </div>
            <div class="info-content">
                <div class="info-title">${f.name}</div>
                <div class="info-desc">${f.category} • ${f.vicinity || 'Islamabad'}</div>
            </div>
        `;
        list.appendChild(item);
    });

    console.log(`${facilities.length} real facilities rendered`);
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

            // Re-update based on current source location (nearest facilities)
            updateFacilitiesByFilters();

            // Update hazards to show proximity to new route
            updateDynamicHazards();

        } else {
            console.error("Route calculation failed:", status);
            alert("Could not calculate route. Please try different locations.");
        }
    });
}

/**
 * DSA: Evaluate Route Safety
 */
function evaluateRouteSafety(route, index) {
    const leg = route.legs[0];
    const distance = leg.distance.value; // meters

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
                safetyScore -= 8; // Penalty
                break;
            }
        }
    });

    // Bonus for shorter routes
    const distanceBonus = Math.max(0, (10000 - distance) / 1000);
    safetyScore += distanceBonus;

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
    const scoreEl = document.getElementById('safetyScore');
    scoreEl.innerText = routeInfo.safetyScore;
    document.getElementById('routeDistance').innerText = routeInfo.distance;
    document.getElementById('routeETA').innerText = routeInfo.duration;

    // Premium Color Coding
    if (routeInfo.safetyScore > 80) scoreEl.style.color = "#10b981";
    else if (routeInfo.safetyScore > 60) scoreEl.style.color = "#f59e0b";
    else scoreEl.style.color = "#ef4444";
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
