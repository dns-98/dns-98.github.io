// Initialize the map
var map = L.map('map', {
    crs: L.CRS.Simple,
    minZoom: -1,
    maxZoom: 2
});

// Define map bounds
var bounds = [[0, 0], [1024, 1024]];
L.imageOverlay('map.png', bounds).addTo(map);
map.fitBounds(bounds);

// Set initial view
map.setView([512, 512], 0);

// Layer to store markers
var markersLayer = L.layerGroup().addTo(map);
var clickedLatLng;

// Load saved markers from localStorage
function loadMarkers() {
    var savedMarkers = JSON.parse(localStorage.getItem('markers')) || [];
    savedMarkers.forEach(({ lat, lng, title, type, jumpType, throwType, details }) => {
        addMarker(lat, lng, title, type, jumpType, throwType, details, false);
    });
}

// Save markers to localStorage
function saveMarkers() {
    var markers = [];
    markersLayer.eachLayer(marker => {
        markers.push({
            lat: marker.getLatLng().lat,
            lng: marker.getLatLng().lng,
            title: marker.options.title,
            type: marker.options.type,
            jumpType: marker.options.jumpType,
            throwType: marker.options.throwType,
            details: marker.options.details
        });
    });
    localStorage.setItem('markers', JSON.stringify(markers));
}

// Function to create a marker
function addMarker(lat, lng, title, type, jumpType, throwType, details, save = true) {
    var marker = L.marker([lat, lng], {
        draggable: true,
        title, type, jumpType, throwType, details
    }).addTo(markersLayer);
    
    var popupContent = `<b contenteditable="true" onblur="updateTitle(${marker._leaflet_id}, this.innerText)">${title || 'Untitled'}</b><br><b>NADE:</b> ${type}<br><b>TECHNIQUE:</b> ${throwType}+${jumpType}<br>${details || 'No details'}<br>
        <button onclick="deleteMarker(${marker._leaflet_id})">Delete</button>`;
    
    marker.bindPopup(popupContent).openPopup();
    
    marker.on('dragend', saveMarkers);
    
    if (save) saveMarkers();
}

// Handle map click
map.on('click', function(e) {
    clickedLatLng = e.latlng;
    var form = document.getElementById('poi-form');
    var point = map.latLngToContainerPoint(clickedLatLng);
    form.style.left = point.x + 'px';
    form.style.top = point.y + 'px';
    form.style.display = 'block';
});

// Submit POI and add marker
function submitPOI() {
    var title = document.getElementById('poi-title').value;
    var type = document.getElementById('poi-type').value;
    var jumpType = document.getElementById('jump-type').value;
    var throwType = document.getElementById('throw-type').value;
    var details = document.getElementById('poi-details').value;
    
    addMarker(clickedLatLng.lat, clickedLatLng.lng, title, type, jumpType, throwType, details);
    
    document.getElementById('poi-form').style.display = 'none';
    document.getElementById('poi-title').value = '';
    document.getElementById('poi-details').value = '';
}

// Cancel POI addition
function cancelPOI() {
    document.getElementById('poi-form').style.display = 'none';
    document.getElementById('poi-title').value = '';
    document.getElementById('poi-details').value = '';
}

// Update marker title
function updateTitle(id, newTitle) {
    markersLayer.eachLayer(marker => {
        if (marker._leaflet_id === id) {
            marker.options.title = newTitle;
        }
    });
    saveMarkers();
}

// Delete marker
function deleteMarker(id) {
    markersLayer.eachLayer(marker => {
        if (marker._leaflet_id === id) {
            markersLayer.removeLayer(marker);
        }
    });
    saveMarkers();
}

// Load existing markers on startup
loadMarkers();

// Add input field for title in form
document.addEventListener("DOMContentLoaded", function() {
    var form = document.getElementById('poi-form');
    form.innerHTML = `
        <label for="poi-title">Title:</label>
        <input type="text" id="poi-title" placeholder="Enter title"><br>
        <label for="poi-type">Type:</label>
        <select id="poi-type">
            <option value="SMOKE">SMOKE</option>
            <option value="FLASH">FLASH</option>
            <option value="MOLOTOV">MOLOTOV</option>
            <option value="GRENADE">GRENADE</option>
        </select><br>
        <label for="jump-type">Jump Type:</label>
        <select id="jump-type">
            <option value="JUMPTHROW">JUMPTHROW</option>
            <option value="NORMAL THROW">NORMAL THROW</option>
        </select><br>
        <label for="throw-type">Throw Type:</label>
        <select id="throw-type">
            <option value="LEFT CLICK">LEFT CLICK</option>
            <option value="RIGHT CLICK">RIGHT CLICK</option>
            <option value="L+R CLICK">L+R CLICK</option>
        </select><br>
        <label for="poi-details">Details:</label>
        <textarea id="poi-details"></textarea><br>
        <button onclick="submitPOI()">Add</button>
        <button onclick="cancelPOI()">Cancel</button>
    `;
});
