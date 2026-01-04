/**
 * FEATURED DSA: HASH MAP for O(1) Search Autocomplete
 * --------------------------------------------------
 * This map stores pre-defined Islamabad safety nodes for instant lookup.
 */
const ISLAMABAD_NODES = {
    "Blue Area": { id: 1, lat: 33.7103, lng: 73.0571, safetyIndex: 95 },
    "F-6 Sector": { id: 2, lat: 33.7297, lng: 73.0746, safetyIndex: 90 },
    "G-9 Sector": { id: 3, lat: 33.6844, lng: 73.0479, safetyIndex: 85 },
    "E-9 Air University": { id: 4, lat: 33.7149, lng: 73.0235, safetyIndex: 98 },
    "Centaurus Mall": { id: 5, lat: 33.7077, lng: 73.0501, safetyIndex: 92 },
    "F-10 Markaz": { id: 6, lat: 33.6934, lng: 73.0102, safetyIndex: 88 },
    "Shakar Parian": { id: 7, lat: 33.6844, lng: 73.0751, safetyIndex: 94 },
    "I-8 Sector": { id: 8, lat: 33.6685, lng: 73.0751, safetyIndex: 82 }
};

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
            console.log("Find Route Clicked. Source:", selectedLocations.source, "Dest:", selectedLocations.destination);

            // Check if we need to resolve from our local HASH MAP first
            const sourceVal = document.getElementById('source').value.trim();
            const destVal = document.getElementById('destination').value.trim();

            if (!selectedLocations.source && ISLAMABAD_NODES[sourceVal]) {
                const node = ISLAMABAD_NODES[sourceVal];
                selectedLocations.source = {
                    id: node.id,
                    geometry: { location: new google.maps.LatLng(node.lat, node.lng) },
                    name: sourceVal
                };
                updatePin('source', selectedLocations.source);
            }

            if (!selectedLocations.destination && ISLAMABAD_NODES[destVal]) {
                const node = ISLAMABAD_NODES[destVal];
                selectedLocations.destination = {
                    id: node.id,
                    geometry: { location: new google.maps.LatLng(node.lat, node.lng) },
                    name: destVal
                };
                updatePin('destination', selectedLocations.destination);
            }

            if (selectedLocations.source && selectedLocations.destination) {
                calculateRoute();
            } else {
                alert("Please pick a location from the suggestions list or type a recognized Islamabad landmark (e.g., 'F-6 Sector').");
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

    // Back to Home Button (Stack DSA)
    const backBtn = document.getElementById('backToHome');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            navigationStack.push(window.location.href);
            console.log('Navigation Stack:', navigationStack.getStack());
            window.location.href = 'index.html';
        });
    }

}

/**
 * Stack DSA for Navigation History
 */
class NavigationStack {
    constructor() {
        this.stack = [];
        this.maxSize = 10; // Limit stack size
    }

    push(url) {
        if (this.stack.length >= this.maxSize) {
            this.stack.shift(); // Remove oldest entry
        }
        this.stack.push({
            url: url,
            timestamp: new Date().toISOString()
        });
        console.log(`[Stack PUSH] ${url}`);
    }

    pop() {
        if (this.isEmpty()) {
            console.log('[Stack] Empty - cannot pop');
            return null;
        }
        const item = this.stack.pop();
        console.log(`[Stack POP] ${item.url}`);
        return item;
    }

    peek() {
        if (this.isEmpty()) return null;
        return this.stack[this.stack.length - 1];
    }

    isEmpty() {
        return this.stack.length === 0;
    }

    getStack() {
        return this.stack;
    }

    size() {
        return this.stack.length;
    }
}

// Initialize Navigation Stack
const navigationStack = new NavigationStack();

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
/**
 * Fetch Authentic Hazards from the ITP Live Feed (Flask Backend)
 */
function updateDynamicHazards() {
    console.log("Fetching live hazards from ITP Feed...");

    const url = 'http://localhost:5000/api/hazards';

    fetch(url)
        .then(response => response.json())
        .then(result => {
            if (result.status === 'success') {
                console.log("[Hazards] Backend Source:", result.source);
                renderHazards(result.data);
            }
        })
        .catch(err => {
            console.error("[Hazards] Fetch error:", err);
            // Fallback to local simulation if backend is down
            updateLocalFallbackHazards();
        });
}

function updateLocalFallbackHazards() {
    const hazards = [
        { id: 101, lat: 33.7297, lon: 73.0746, type: "Protest", name: "F-6 Sector Protest", severity: 8 },
        { id: 102, lat: 33.7087, lon: 73.0397, type: "Road Work", name: "Srinagar Highway Maintenance", severity: 9 }
    ];
    renderHazards(hazards);
}

function renderHazards(hazards) {
    markers.hazards.forEach(m => m.setMap(null));
    markers.hazards = [];

    const list = document.getElementById('hazardsList');
    list.innerHTML = '';

    if (!hazards || hazards.length === 0) {
        list.innerHTML = '<p class="empty-msg">No active hazards detected.</p>';
        return;
    }

    hazards.forEach(h => {
        const marker = new google.maps.Marker({
            position: { lat: h.lat, lng: h.lon },
            map: map,
            icon: {
                path: google.maps.SymbolPath.CIRCLE,
                fillColor: h.severity > 7 ? '#ef4444' : '#f59e0b',
                fillOpacity: 0.6,
                scale: 10 + (h.severity * 2),
                strokeWeight: 2,
                strokeColor: '#fff'
            },
            title: `HAZARD: ${h.type} (${h.name})`
        });
        markers.hazards.push(marker);

        const item = document.createElement('div');
        item.className = 'info-item';
        item.innerHTML = `
            <div class="info-content">
                <div class="info-title">${h.type}</div>
                <div class="info-desc">${h.name}</div>
                ${h.source_link ? `<a href="${h.source_link}" target="_blank" class="source-link"><i class="fas fa-external-link-alt"></i> Source</a>` : ''}
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
            radius: 5000, // 5km
            type: typeMap[category]
        };

        placesService.nearbySearch(request, (results, status) => {
            completedRequests++;
            console.log(`Places Search Status for ${category}:`, status);

            if (status === google.maps.places.PlacesServiceStatus.OK) {
                console.log(`Found ${results.length} results for ${category}`);

                // Sort by distance to find top candidates manually first
                const sortedLocal = results.map(r => ({
                    ...r,
                    dist: google.maps.geometry.spherical.computeDistanceBetween(location, r.geometry.location)
                })).sort((a, b) => a.dist - b.dist);

                // Add category info to top 3 results
                const annotatedResults = sortedLocal.slice(0, 3).map(r => ({
                    ...r,
                    category: category,
                    icon: iconMap[category],
                    color: colorMap[category]
                }));

                // For each category, we pick the BEST one using C++ if possible
                // or just add them to the list if we want multiple
                allResults = allResults.concat(annotatedResults);
            }

            if (completedRequests === types.length) {
                // Now we have results for ALL selected categories.
                // We will send the whole batch to C++ to pick the "Mathematical Truth" for each category
                sendToCPPEngine(location, allResults, types);
            }
        });
    });
}

/**
 * NEW: Bridge to C++ Backend
 * Shows that our engine is doing the actual KD-Tree selection
 */
function sendToCPPEngine(center, candidates, activeCategories) {
    if (candidates.length === 0) {
        renderFacilities([]);
        return;
    }

    const lat = typeof center.lat === 'function' ? center.lat() : center.lat;
    const lon = typeof center.lng === 'function' ? center.lng() : center.lng;

    // We want to find the nearest for EACH category selected
    const finalOptimizedResults = [];
    let categoriesProcessed = 0;

    activeCategories.forEach(cat => {
        const catCandidates = candidates.filter(c => c.category === cat);
        if (catCandidates.length === 0) {
            categoriesProcessed++;
            if (categoriesProcessed === activeCategories.length) {
                renderFacilities(finalOptimizedResults);
            }
            return;
        }

        const payload = {
            lat: lat,
            lon: lon,
            candidates: catCandidates.map(c => ({
                name: c.name,
                lat: c.geometry.location.lat(),
                lon: c.geometry.location.lng()
            }))
        };

        console.log(`[C++ Bridge] Optimizing category: ${cat}`, payload);

        fetch('http://localhost:5000/api/dynamic_nearest', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        })
            .then(response => response.json())
            .then(result => {
                categoriesProcessed++;
                if (result.status === 'success') {
                    const winningCandidate = catCandidates.find(c => c.name === result.data.name);
                    if (winningCandidate) {
                        winningCandidate.isEngineVerified = true;
                        winningCandidate.engineType = result.engine;
                        finalOptimizedResults.push(winningCandidate);
                    }
                }

                if (categoriesProcessed === activeCategories.length) {
                    renderFacilities(finalOptimizedResults);
                }
            })
            .catch(err => {
                categoriesProcessed++;
                console.error("[C++ Bridge] Engine error:", err);
                // Fallback to the nearest one in this category
                finalOptimizedResults.push(catCandidates[0]);

                if (categoriesProcessed === activeCategories.length) {
                    renderFacilities(finalOptimizedResults);
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
        item.className = `info-item ${f.isEngineVerified ? 'verified-by-cpp' : ''}`;
        item.innerHTML = `
            <div class="info-icon" style="background: ${f.color}20; color: ${f.color}">
                <i class="fas ${f.icon}"></i>
            </div>
            <div class="info-content">
                <div class="info-title">${f.name} ${f.isEngineVerified ? '<span class="badge-cpp">C++ Optimized</span>' : ''}</div>
                <div class="info-desc">${f.category} • ${f.vicinity || 'Islamabad'}</div>
                ${f.isEngineVerified ? `<div class="info-tag"><i class="fas fa-microchip"></i> Calculated via KD-Tree Node</div>` : ''}
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
            try {
                directionsRenderer.setDirections(result);
                directionsRenderer.setRouteIndex(safestRoute.index);
                console.log("Renderer set with safest route");
            } catch (renderErr) {
                console.error("Error setting directions:", renderErr);
                // Fallback: Just show the first route
                directionsRenderer.setDirections(result);
            }

            displayRouteInfo(safestRoute);

            // NEW: Fetch Mathematical Truth from C++ Engine if it's a known route
            if (selectedLocations.source.id && selectedLocations.destination.id) {
                console.log("[C++ Bridge] Requesting Dijkstra Safety Evaluation...");
                fetch('http://localhost:5000/api/evaluate_route', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        start_node: selectedLocations.source.id,
                        end_node: selectedLocations.destination.id
                    })
                })
                    .then(res => res.json())
                    .then(result => {
                        if (result.status === 'success') {
                            console.log("[C++ Bridge] Safety Verified:", result.data.safety_score);
                            // Update UI with C++ Engine result
                            const scoreEl = document.getElementById('safetyScore');
                            scoreEl.innerText = Math.round(result.data.safety_score);
                            scoreEl.classList.add('engine-verified');

                            // Color coding based on C++ score
                            if (result.data.safety_score > 80) scoreEl.style.color = "#10b981";
                            else if (result.data.safety_score > 60) scoreEl.style.color = "#f59e0b";
                            else scoreEl.style.color = "#ef4444";
                        }
                    })
                    .catch(err => console.error("[C++ Bridge] Evaluation error:", err));
            }

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
                // HIGH IMPACT PENALTY: Critical hazards now drop the score significantly
                const impact = Math.max(15, hazardMarker.severity * 2);
                safetyScore -= impact;
                console.log(`[Safety Check] Hazard detected! Penalty: -${impact}`);
                break;
            }
        }
    });

    // Capped Efficiency Bonus (Prevents short routes from hiding hazards)
    const distanceBonus = Math.max(0, Math.min(5, (10000 - distance) / 2000));
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
