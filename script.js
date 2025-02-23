// Initialize the map
var map = L.map('map', {
    crs: L.CRS.Simple, // Simple coordinate system for custom maps
    minZoom: -1,
    maxZoom: 2
});

// Define map bounds (adjust to your image size, e.g., 1024x1024 pixels)
var bounds = [[0, 0], [1024, 1024]];
L.imageOverlay('map.png', bounds).addTo(map);
map.fitBounds(bounds);

// Set initial view to center of map
map.setView([512, 512], 0);

// Layer to store dynamic markers
var markersLayer = L.layerGroup().addTo(map);

// Variable to store clicked position
var clickedLatLng;

// Handle map click to show the form at click location
map.on('click', function(e) {
    clickedLatLng = e.latlng;
    var point = map.latLngToContainerPoint(clickedLatLng);
    var form = document.getElementById('poi-form');
    form.style.left = point.x + 'px';
    form.style.top = point.y + 'px';
    form.style.display = 'block';
});

// Function to create popup content with delete button
function createPopupContent(type, clickType, details, marker) {
    return `<b>Nade</b><br>${type}: ${details}<br>Click: ${clickType}<br><button onclick="deleteMarker(this.marker)">Delete</button>`
        .replace('this.marker', 'markersLayer.getLayer(' + markersLayer.getLayerId(marker) + ')');
}

// Function to delete a marker
function deleteMarker(marker) {
    markersLayer.removeLayer(marker);
}

// Function to submit POI and add draggable marker
function submitPOI() {
    var type = document.getElementById('poi-type').value;
    var clickType = document.getElementById('click-type').value;
    var details = document.getElementById('poi-details').value;
    
    if (details) {
        var marker = L.marker([clickedLatLng.lat, clickedLatLng.lng], {
            draggable: true
        }).addTo(markersLayer);
        
        marker.bindPopup(createPopupContent(type, clickType, details, marker)).openPopup();
        
        marker.on('dragend', function(e) {
            marker.openPopup();
        });
    }
    
    document.getElementById('poi-form').style.display = 'none';
    document.getElementById('poi-details').value = '';
}

// Function to cancel POI addition
function cancelPOI() {
    document.getElementById('poi-form').style.display = 'none';
    document.getElementById('poi-details').value = '';
}

// Optional: Remove marker on right-click
markersLayer.on('contextmenu', function(e) {
    markersLayer.removeLayer(e.layer);
});

// Preload example draggable markers with delete buttons
L.marker([700, 300], { draggable: true }).addTo(markersLayer)
    .bindPopup(createPopupContent("smoke", "LEFT CLICK", "Factory: Obscure enemy vision", this))
    .on('dragend', function(e) { this.openPopup(); });
L.marker([200, 800], { draggable: true }).addTo(markersLayer)
    .bindPopup(createPopupContent("flash", "RIGHT CLICK", "Rooftop: Blind enemies at exit", this))
    .on('dragend', function(e) { this.openPopup(); });
L.marker([500, 500], { draggable: true }).addTo(markersLayer)
    .bindPopup(createPopupContent("grenade", "L+R CLICK", "Alley: Clear sniper nest", this))
    .on('dragend', function(e) { this.openPopup(); });