//Interactive menu
var menu = document.getElementById('menu-container');
var menuIcon = document.getElementById('menu-icon');
var menuBox = document.getElementById('menu-box')

//Cookies
var idVehicle = cookiesParser('vehicleId');
var vehicleType = cookiesParser('vehicleType');
var initialLocation = cookiesParser('initialLocation').split('%2C');
mapboxgl.accessToken = cookiesParser('mapToken');

var preDist = 0;
var isEmitted = false;
var isNewIntersection = true;
var isGot = false;

var idIntersections = [];
var locIntersections = [];
var indexOfStreets = [];
var isFinished = false;

var res = {};

const stateVehicle = {
    passed : 0,
    approaching : 1,
};

const emergencyPath = io(window.location.origin + '/socket/emergency');

/**
 * Fake locations
 */

var locationArray = [[106.652945, 10.771198],
                    [106.653684, 10.771100],
                    [106.654414, 10.770969],
                    [106.655170, 10.770778],
                    [106.655903, 10.770687],
                    [106.656645, 10.770580],
                    [106.657400, 10.770458],
                    [106.657925, 10.770389],
                    [106.657925, 10.770389],
                    [106.657925, 10.770389],
                    [106.657925, 10.770389],
                    [106.658172, 10.770501],
                    [106.658746, 10.770941],
                    [106.659310, 10.771445],
                    [106.659928, 10.771913]]

var i = 0;

menu.addEventListener('click', function() {
    menuIcon.classList.toggle('menu-icon-active');
    menuBox.classList.toggle('menu-box-active');
});

var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v11',
    center: initialLocation,
    zoom: 13
});

var directions = new MapboxDirections({
    accessToken: mapboxgl.accessToken,
    profile: 'mapbox/driving',
    controls: {
        profileSwitcher: false,
    },
    unit: 'metric',
    placeholderOrigin: 'Điểm đi',
    placeholderDestination: 'Điểm đến',
    language: 'vi',
})
map.addControl(directions, 'top-left');

/** 
 * This function will run when the vehicle get a navigation 
 */

async function extraFunction(steps) {
    var data = [];
    for (var step of steps) {
        for (var intersection of step.intersections) {
            data.push({
                location: intersection.location,
                bearing: intersection.bearings[intersection.in]
            });
        }
    }

    let resMatchingInter = await axios.put(window.location.origin + '/vehicle/journey', data);

    for (var trafficLight of resMatchingInter.data) {
        idIntersections.push(trafficLight.intersectionId);
        locIntersections.push(trafficLight.location.coordinates);
        indexOfStreets.push(trafficLight.index);
    }

    var testLoop = setInterval(function() {
        axios({
            method: 'put',
            url: window.location.origin + '/vehicle/location/' + idVehicle,
            data: {
                coordinates: locationArray[i]
            }
        })
        console.log('Location: ', locationArray[0]);
    
        if (!isFinished) {
            let dist = distanceCalculation(locIntersections[0][0], locIntersections[0][1],
                locationArray[0][0], locationArray[0][1]);
        
            console.log('Distance: ', dist);
            console.log('Intersection: ', idIntersections[0]);
            console.log('Array intersection: ', idIntersections);
            
            if (isNewIntersection) {
                preDist = dist;
                isNewIntersection = false;
            };
        
            if (preDist >= dist) {
                if (!isEmitted) {
                    prepareApproaching(dist);
                }
            }
            else {
                console.log('Passed is running');
                emitData(stateVehicle.passed);
                isNewIntersection = true;
                isEmitted = false;
                isGot = false;
                
                if (idIntersections.length > 1) {
                    idIntersections.shift();
                    locIntersections.shift();
                    indexOfStreets.shift();
                }
                else {
                    console.log('Finished');
                    isFinished = true;
                }
            };
        
            preDist = dist;
        }
    
        if (locationArray.length > 1) {
            locationArray.shift();
        }
        else {
            clearInterval(testLoop);
        }
    }, 5000);
}

/** 
 * Repeat again with every 5 seconds 
 */

async function prepareApproaching(distance) {
    if (distance <= 0.5) {

        if (!isGot) {
            res = await axios.get(window.location.origin + '/intersection/api/traffic-density/' + idIntersections[0]);
            isGot = true;
            console.log('Got');
        }

        if (res.data.length == undefined && distance <= 0.5) {
            emitData(stateVehicle.approaching);
            isEmitted = true;
        }
        else if (res.data.trafficDensity.state == 'very-low' && distance <= 0.25) {
            emitData(stateVehicle.approaching);
            isEmitted = true;
        }
        else if (res.data.trafficDensity.state == 'low' && distance <= 0.3) {
            emitData(stateVehicle.approaching);
            isEmitted = true;
        }
        else if (res.data.trafficDensity.state == 'medium' && distance <= 0.35) {
            emitData(stateVehicle.approaching);
            isEmitted = true;
        }
        else if (res.data.trafficDensity.state == 'high' && distance <= 0.4) {
            emitData(stateVehicle.approaching);
            isEmitted = true;
        }
        else if (res.data.trafficDensity.state == 'very-high' && distance <= 0.45) {
            emitData(stateVehicle.approaching);
            isEmitted = true;
        }        
    };
};

function emitData(state) {
    emergencyPath.emit('[vehicle]-emergency', {
        idIntersection: idIntersections[0],
        vehicleId: idVehicle,
        vehicleType: vehicleType,
        state: state,
        indexOfStreet: indexOfStreets[0],
    });

    console.log('Emitted')
};

/** 
 * Calculate the distance between vehicle and intersection equipped smart traffic light system 
 */

function distanceCalculation(lon1, lat1, lon2, lat2) {
    var dLat = deg2rad((lat2 - lat1)/2);
    var dLon = deg2rad((lon2 - lon1)/2);
    var a = Math.sin(dLat) * Math.sin(dLat) + 
            Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
            Math.sin(dLon) * Math.sin(dLon)
    
    return 2 * 6371 * Math.asin(Math.sqrt(a));
};

function deg2rad(deg) {
    return deg * (Math.PI/180)
};

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
};

/** 
 * Get the geolocation of vehicle in realtime 
 */

function getGeoLocation() {
    var options = {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 5000
    };
    navigator.geolocation.getCurrentPosition(emitLocation, onGeoError, options);
};

function emitLocation(position) {
    RTLocation = [ position.coords.longitude, position.coords.latitude ];
};

function onGeoError(error) {
    if (error.code === error.PERMISSION_DENIED) {
        detailError = "User denied the request for Geolocation.";
    }
    else if (error.code === error.POSITION_UNAVAILABLE) {
        detailError = "Location information is unavailable.";
    }
    else if (error.code === error.TIMEOUT) {
        detailError = "The request to get user location timed out."
    }
    else if (error.code === error.UNKNOWN_ERROR) {
        detailError = "An unknown error occurred."
    }
};