
var map = L.map('map').setView([28.6139, 77.2090], 13);  // Centered on New Delhi, India

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

var marker = L.marker([28.6139, 77.2090]).addTo(map);
marker.bindPopup("<b>Welcome to New Delhi!</b><br>This is New Delhi's location.").openPopup();

function searchLocation() {
    var location = document.getElementById("search-input").value;

    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}`)
        .then(response => response.json())
        .then(data => {
            if (data && data.length > 0) {
                var lat = parseFloat(data[0].lat);
                var lon = parseFloat(data[0].lon);

                // Move the map to the searched location
                map.setView([lat, lon], 13);

                // Add a marker for the searched location
                var searchMarker = L.marker([lat, lon]).addTo(map);
                searchMarker.bindPopup(`<b>${location}</b><br>Coordinates: ${lat}, ${lon}`).openPopup();
            } else {
                alert("Location not found. Please try a different query.");
            }
        })
        .catch(error => console.error('Error fetching location:', error));
}


function calculateRoute() {
    var startLocation = document.getElementById("start-location").value;
    var endLocation = document.getElementById("end-location").value;

    
    if (!startLocation || !endLocation) {
        alert("Please provide both start and end locations.");
        return;
    }

    console.log("Fetching route for:", startLocation, "to", endLocation);

    
    Promise.all([
        fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(startLocation)}`).then(res => res.json()),
        fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(endLocation)}`).then(res => res.json())
    ]).then(locations => {
        console.log("Locations fetched:", locations);

        if (locations[0].length > 0 && locations[1].length > 0) {
            var startCoords = [parseFloat(locations[0][0].lat), parseFloat(locations[0][0].lon)];
            var endCoords = [parseFloat(locations[1][0].lat), parseFloat(locations[1][0].lon)];

            console.log("Start Coords: ", startCoords);
            console.log("End Coords: ", endCoords);

            
            if (window.routingControl) {
                map.removeControl(window.routingControl);
            }

            
            window.routingControl = L.Routing.control({
                waypoints: [
                    L.latLng(startCoords[0], startCoords[1]),
                    L.latLng(endCoords[0], endCoords[1])
                ],
                routeWhileDragging: true,
                geocoder: L.Control.Geocoder.nominatim(),
                showAlternatives: true,
                altLineOptions: {
                    styles: [
                        {color: 'black', opacity: 0.15, weight: 9},
                        {color: 'white', opacity: 0.8, weight: 6},
                        {color: 'blue', opacity: 0.5, weight: 2}
                    ]
                }
            }).addTo(map);
        } else {
            alert("One or both locations not found. Please try again.");
        }
    }).catch(error => {
        console.error('Error calculating route:', error);
        alert("Error occurred while calculating route. Please check the console for more details.");
    });
}
