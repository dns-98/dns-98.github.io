// Initialize the map
var map = L.map('map', {
    crs: L.CRS.Simple,
    minZoom: -1,
    maxZoom: 2
});

// Definice všech map
const mapsData = [
    { name: "Dust II", file: "de_dust2.png", bounds: [[0, 0], [1024, 1024]], defaultView: [512, 512], defaultZoom: 0 },
    { name: "Inferno", file: "de_inferno.png", bounds: [[0, 0], [1024, 1024]], defaultView: [512, 512], defaultZoom: 0 },
    { name: "Mirage", file: "de_mirage.png", bounds: [[0, 0], [1024, 1024]], defaultView: [512, 512], defaultZoom: 0 },
    { name: "Ancient", file: "de_ancient.png", bounds: [[0, 0], [1024, 1024]], defaultView: [512, 512], defaultZoom: 0 },
    { name: "Nuke", file: "de_nuke.png", bounds: [[0, 0], [1024, 1024]], defaultView: [512, 512], defaultZoom: 0 },
    { name: "Overpass", file: "de_overpass.png", bounds: [[0, 0], [1024, 1024]], defaultView: [512, 512], defaultZoom: 0 },
    { name: "Cache", file: "de_cache.png", bounds: [[0, 0], [1024, 1024]], defaultView: [512, 512], defaultZoom: 0 }
];

let currentMap = mapsData[0]; // Nastavíme výchozí mapu na první v seznamu
let imageOverlay; // Proměnná pro ukládání reference na imageOverlay
let isAddMarkerMode = false; // Nová proměnná pro sledování režimu přidávání markerů

// Layer to store markers
var markersLayer = L.layerGroup().addTo(map);
var clickedLatLng;

// Funkce pro změnu mapy (zůstává stejná)
function changeMap() {
    const selector = document.getElementById('map-selector');
    const selectedMapName = selector.value;
    currentMap = mapsData.find(map => map.name === selectedMapName);

    // Odebereme všechny existující markery z mapy
    markersLayer.clearLayers();

    // Odebereme stávající obrázek mapy, pokud existuje
    if (imageOverlay) {
        map.removeLayer(imageOverlay);
    }

    // Přidáme nový obrázek mapy
    imageOverlay = L.imageOverlay(currentMap.file, currentMap.bounds).addTo(map);
    map.fitBounds(currentMap.bounds);

    // Nastavíme výchozí pohled pro novou mapu
    map.setView(currentMap.defaultView, currentMap.defaultZoom);

    // Načteme markery pro nově vybranou mapu
    loadMarkers();

    // Vypneme režim přidávání markerů po změně mapy
    if (isAddMarkerMode) {
        toggleAddMarkerMode();
    }
}

// Funkce pro přepínání režimu přidávání markerů
function toggleAddMarkerMode() {
    isAddMarkerMode = !isAddMarkerMode; // Přepne true na false a naopak
    const addButton = document.getElementById('add-marker-btn');
    if (isAddMarkerMode) {
        addButton.textContent = 'Režim přidání: AKTIVNÍ';
        addButton.style.backgroundColor = '#4CAF50'; // Zelená barva pro aktivní
        addButton.style.color = 'white';
        map.getContainer().style.cursor = 'crosshair'; // Změní kurzor na kříž
    } else {
        addButton.textContent = 'Přidat Marker';
        addButton.style.backgroundColor = ''; // Vrátí původní barvu
        addButton.style.color = '';
        map.getContainer().style.cursor = ''; // Vrátí výchozí kurzor
        document.getElementById('poi-form').style.display = 'none'; // Skryje formulář, pokud je zobrazen
    }
}

// Load saved markers from localStorage (zůstává stejná)
function loadMarkers() {
    var savedMarkers = JSON.parse(localStorage.getItem(`markers_${currentMap.name}`)) || [];
    savedMarkers.forEach(({ lat, lng, title, type, jumpType, throwType, details }) => {
        addMarker(lat, lng, title, type, jumpType, throwType, details, false);
    });
}

// Save markers to localStorage (zůstává stejná)
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
    localStorage.setItem(`markers_${currentMap.name}`, JSON.stringify(markers));
}

// Function to create a marker (zůstává stejná)
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

// Handle map click - UPRAVENO
map.on('click', function(e) {
    if (isAddMarkerMode) { // Zobrazit formulář pouze, když je režim aktivní
        clickedLatLng = e.latlng;
        var form = document.getElementById('poi-form');
        var point = map.latLngToContainerPoint(clickedLatLng);
        form.style.left = point.x + 'px';
        form.style.top = point.y + 'px';
        form.style.display = 'block';
    }
});

// Submit POI and add marker - UPRAVENO
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

    // Vypneme režim přidávání markerů po přidání markeru
    toggleAddMarkerMode();
}

// Cancel POI addition - UPRAVENO
function cancelPOI() {
    document.getElementById('poi-form').style.display = 'none';
    document.getElementById('poi-title').value = '';
    document.getElementById('poi-details').value = '';

    // Vypneme režim přidávání markerů po zrušení
    toggleAddMarkerMode();
}

// Update marker title (zůstává stejná)
function updateTitle(id, newTitle) {
    markersLayer.eachLayer(marker => {
        if (marker._leaflet_id === id) {
            marker.options.title = newTitle;
        }
    });
    saveMarkers();
}

// Delete marker (zůstává stejná)
function deleteMarker(id) {
    markersLayer.eachLayer(marker => {
        if (marker._leaflet_id === id) {
            markersLayer.removeLayer(marker);
        }
    });
    saveMarkers();
}

// DOMContentLoaded Listener - Upravený
document.addEventListener("DOMContentLoaded", function() {
    // Vyplníme rozbalovací seznam mapami
    const mapSelector = document.getElementById('map-selector');
    mapsData.forEach(map => {
        const option = document.createElement('option');
        option.value = map.name;
        option.textContent = map.name;
        mapSelector.appendChild(option);
    });

    // Inicializace formuláře pro POI
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

    // Načteme výchozí mapu a její markery při startu
    changeMap(); // Zavoláme changeMap k inicializaci první mapy a načtení jejích markerů
});