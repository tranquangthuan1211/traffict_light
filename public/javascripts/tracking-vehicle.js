var features = [];
var popupArray = [];
var url = window.location.origin + '/vehicle/location';

var initialLocation = cookiesParser('initialLocation').split('%2C');
mapboxgl.accessToken = cookiesParser('mapToken');

var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v11',
    center: initialLocation,
    zoom: 13
});

map.on('load', async function() {
    var res = await axios.get(url);
    
    processLocationData(res.data);

    map.addSource('vehicles', {
        'type': 'geojson',
        'data': {
            'type': 'FeatureCollection',
            'features': features
        }
    });

    map.addLayer({
        'id': 'vehicle',
        'type': 'symbol',
        'source': 'vehicles',
        'layout': {
            'icon-image': 'car-15',
            'icon-size': 1.2
        },
    });

    window.setInterval(async function() {
        var res = await axios.get(url);

        for (var popup of popupArray) {
            popup.remove();
        }
        popupArray = [];
        processLocationData(res.data);
        
        map.getSource('vehicles').setData({
            'type': 'FeatureCollection',
            'features': features
        });

        features.forEach(function(feature) {
            var vehicleNumber = feature.properties.license_plate;

            var popup = new mapboxgl.Popup({ closeOnClick: false, closeButton: false })
            .setLngLat(feature.geometry.coordinates)
            .setText(vehicleNumber)
            .addTo(map);

            popupArray.push(popup);

            map.on('click', 'vehicle', function(e) {
                map.flyTo({
                    center: e.features[0].geometry.coordinates,
                    speed: 0.8,
                    zoom: 15
                })
            })
        })
    }, 5000)
})

function processLocationData(vehicles) {
    features = [];
    for (let vehicle of vehicles) {
        vehicle.location.properties.license_plate = vehicle.license_plate;
        delete vehicle.location._id;
        features.push(vehicle.location);
    }
}

function focusVehicle(license_plate) {
    for (var vehicle of features) {
        if (vehicle.properties.license_plate == license_plate) {
            map.flyTo({
                center: vehicle.geometry.coordinates,
                speed: 0.8
            })
            break;
        }
    }
}

/**
 * Cookies parser
 */

function cookiesParser(cookieName) {
    var cookieName = cookieName + "=";
    var cookiesArray = document.cookie.split('; ');
    for (var cookie of cookiesArray) {
        if (cookie.indexOf(cookieName) == 0) {
            return cookie.substring(cookieName.length, cookie.length);
        }
    }
    return "";
}