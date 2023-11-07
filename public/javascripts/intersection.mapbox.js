var lineTool = document.getElementById('line-tool');
var deleteTool = document.getElementById('delete-tool');

var initialLocation = cookiesParser('initialLocation').split('%2C');
mapboxgl.accessToken = cookiesParser('mapToken');

var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v11',
    center: initialLocation,
    zoom: 13
});

var lineToolIsActive = false;

var markerArray = [];

var geojson = {
    'type': 'FeatureCollection',
    'features': []
};
     
var linestring = {
    'type': 'Feature',
    'geometry': {
        'type': 'LineString',
        'coordinates': []
    }   
};

map.on('load' , function() {
    map.addSource('geojson', {
        'type': 'geojson',
        'data': geojson
    });

    map.addLayer({
        id: 'point-draw',
        type: 'circle',
        source: 'geojson',
        paint: {
            'circle-radius': 5,
            'circle-color': '#000'
        },
        filter: ['in', '$type', 'Point']
    });

    map.addLayer({
        id: 'line-draw',
        type: 'line',
        source: 'geojson',
        layout: {
            'line-cap': 'round',
            'line-join': 'round'
        },
        paint: {
            'line-color': '#000',
            'line-width': 2.5
        },
        filter: ['in', '$type', 'LineString']
    });
})

function onAdd(e) {
    var point = {
        'type': 'Feature',
        'geometry': {
            'type': 'Point',
            'coordinates': [e.lngLat.lng, e.lngLat.lat]
        },
        'properties': {
            'id': String(new Date().getTime())
        }
    };
    geojson.features.push(point);
    if (geojson.features.length > 1) {
        linestring.geometry.coordinates = geojson.features.map(function(point) {
            return point.geometry.coordinates;
        });
        geojson.features.push(linestring);
    }
    map.getSource('geojson').setData(geojson);
    
    if (geojson.features.length > 2) {
        getDirection();
        lineToolIsActive = false;
        offLineTool();
    }
}

function getDirection() {
    var directionsLocation = linestring.geometry.coordinates[0].join() + ';' 
                            + linestring.geometry.coordinates[1].join();
    var directionURL = 'https://api.mapbox.com/directions/v5/mapbox/driving/'
                        + directionsLocation
                        + '?steps=true'
                        + '&access_token=' + mapboxgl.accessToken;
    axios({
        method: 'get',
        url: directionURL,
    })
    .then(showLocation)
}

function showLocation(res) {
    var steps = res.data.routes[0].legs[0].steps
    for (var step of steps) {
        for (var intersection of step.intersections) {
            var popupContent = '';
            var popupInfos = {
                'Location': intersection.location, 
                'Bearings': intersection.bearings, 
                'In': intersection.in, 
                'Out': intersection.out
            };

            for (var popupInfo in popupInfos) {
                popupContent += '<strong>' + popupInfo + '</strong>' 
                                + '<p>' + popupInfos[popupInfo] + '</p>'
            };

            var popup = new mapboxgl.Popup({ offset: 25 }).setHTML(popupContent);
            var el = document.createElement('div');
            el.className = 'street-location';
            var marker = new mapboxgl.Marker(el)
            .setLngLat(intersection.location)
            .setPopup(popup)
            .addTo(map);
            markerArray.push(marker);
        }
    }
    geojson.features = [];
    map.getSource('geojson').setData(geojson);
}

function onLineTool() {
    lineTool.classList.add('btn-active')
    map.getCanvas().style.cursor = 'crosshair';
    map.on('click', onAdd);
}

function offLineTool() {
    lineTool.classList.remove('btn-active');
    map.getCanvas().style.cursor = '';
    map.off('click', onAdd);
}

lineTool.addEventListener('click', function() {
    if (lineToolIsActive) {
        lineToolIsActive = false;
        offLineTool()
    }
    else {
        lineToolIsActive = true;
        onLineTool()
    }
});

deleteTool.addEventListener('click', function() {
    for (var marker of markerArray) {
        marker.remove();
    }
})

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