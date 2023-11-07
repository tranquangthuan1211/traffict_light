var renderInteract = document.getElementById('render-interact');
var renderControl = document.getElementById('render-control');
var renderAlert = document.getElementById('render-alert');

var intersectionNameHTML = document.getElementById('intersection-name');
var trafficDensityEle = document.getElementById('traffic-density-state');
var updateTime = document.getElementById('updateTime');
var delta = document.getElementById('delta');

var modeBtn = document.getElementById('mode-control');
var flexibleTime = document.getElementById('flexible-time');
var fixedTime = document.getElementById('fixed-time');
var manual = document.getElementById('manual');
var emergency = document.getElementById('emergency');

var topStreet = document.getElementById('top-street');
var rightStreet = document.getElementById('right-street');
var bottomStreet = document.getElementById('bottom-street');
var leftStreet = document.getElementById('left-street');

var topStreetTime = document.getElementById('top-street-time');
var rightStreetTime = document.getElementById('right-street-time');
var bottomStreetTime = document.getElementById('bottom-street-time');
var leftStreetTime = document.getElementById('left-street-time');

var topStreetLight = document.getElementById('top-street-light');
var rightStreetLight = document.getElementById('right-street-light');
var bottomStreetLight = document.getElementById('bottom-street-light');
var leftStreetLight = document.getElementById('left-street-light');

var northStreet = document.getElementById('north-street');
var westStreet = document.getElementById('west-street');

var btnChange = document.getElementById('btn-change');
var btnUpdate = document.getElementById('btn-update');

const stateLightSocket = io(window.location.origin + '/socket/state-light');
const controlLightSocket = io(window.location.origin + '/socket/control-light');
const camSocket = io(window.location.origin + '/socket/camera');

axios.defaults.baseURL = window.location.origin;
// axios.defaults.headers.common['Authorization'] = ;

var idIntersection;

var initialLocation = cookiesParser('initialLocation').split('%2C');
mapboxgl.accessToken = cookiesParser('mapToken');

var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v11',
    center: initialLocation,
    zoom: 12
});

axios.get('/intersection')
.then(renderIntersectionsOnMap)

function renderIntersectionsOnMap(res) {
    var intersectionsData = res.data;

    for (var intersectionData of intersectionsData) {
        var el = document.createElement('div');
        el.className = 'intersection';
        el.addEventListener('click', getInfoIntersection);
        el.id = intersectionData._id;
        el.coordinates = intersectionData.location.coordinates;

        new mapboxgl.Marker(el)
        .setLngLat(intersectionData.location.coordinates)
        .addTo(map);
    }
}

// getInfoIntersection();

function getInfoIntersection(event) {
    // @params: event --------^

    /**
     * Fly to intersection has been clicked
     */

    var coordinates = event.currentTarget.coordinates;
    map.flyTo({
        center: coordinates,
        speed: 0.8,
        zoom: 17
    })
    
    /**
     * Unsubscribe intersection was clicked before and subscribe new intersection
     */
    
    unsubscribeIntersection();
    idIntersection = event.currentTarget.id;
    // DEBUG
    // idIntersection = '5ec4a21420768c3fcd9b1665';
    subscribeIntersection();
    
    /**
     * Get and render information of intersection
     */

    axios.get('/intersection/' + idIntersection)
    .then(renderInfoIntersection)
}

function unsubscribeIntersection() {
    stateLightSocket.emit('leave-room', idIntersection);
    controlLightSocket.emit('leave-room', idIntersection);
    camSocket.emit('leave-room', idIntersection);
}

function subscribeIntersection() {
    stateLightSocket.emit('room', idIntersection);
    controlLightSocket.emit('room', idIntersection);
    camSocket.emit('room', idIntersection);

    stateLightSocket.on('[center]-time-light', renderTimeLight);
    stateLightSocket.on('[center]-light-state', renderStateLight);
    camSocket.on('[center]-west-street', renderCameraAtWestStreet);
    camSocket.on('[center]-north-street', renderCameraAtNorthStreet);
}

function renderInfoIntersection(res) {
    var intersectionName = res.data.intersectionName;
    var trafficDensity = res.data.trafficDensity;
    var modeControl = res.data.modeControl;
    var deltaTime = res.data.delta;
    var streetInfo = res.data.trafficLights;
    var streetArray = [rightStreet, bottomStreet, leftStreet, topStreet];

    renderInteract.style.display = 'flex';

    for (var index in streetInfo) {
        streetArray[index].innerHTML = streetInfo[index].streetName;
    }

    northStreet.innerHTML = streetInfo[3].streetName;
    westStreet.innerHTML = streetInfo[2].streetName;

    intersectionNameHTML.innerHTML = intersectionName;
    delta.value = deltaTime;

    updateTrafficDensity(trafficDensity);

    if (modeControl === 'automatic-flexible-time') {
        flexibleTime.classList.add('btn-active');
        automaticFlexibleTime()
    }
    else if (modeControl === 'automatic-fixed-time') {
        fixedTime.classList.add('btn-active');
        automaticFixedTime(streetInfo);
    }
    else if (modeControl === 'manual') {
        manual.classList.add('btn-active');
        manualControl();
    }
    else if (modeControl === 'emergency') {
        emergency.classList.add('btn-active');
    }
    else;

    flexibleTime.addEventListener('click', flexibleTimeExtra);
    manual.addEventListener('click', manualControlExtra);
    fixedTime.addEventListener('click', fixedTimeExtra);
}

function flexibleTimeExtra() {
    controlLightSocket.emit('[center]-change-mode', { mode: 'automatic-flexible-time' });
    automaticFlexibleTime()
};

function manualControlExtra() {
    controlLightSocket.emit('[center]-change-mode', { mode: 'manual' });
    manualControl()
};

async function fixedTimeExtra() {
    controlLightSocket.emit('[center]-change-mode', { mode: 'automatic-fixed-time' });
    var res = await axios.get('/intersection/' + idIntersection);
    automaticFixedTime(res.data.trafficLights);
}

function updateTrafficDensity(trafficDensity) {
    var trafficDensityClass = trafficDensityEle.classList;

    if (trafficDensity.state === 'very-low') {
        trafficDensityEle.innerHTML = 'Rất thấp';
        trafficDensityClass.remove(trafficDensityClass.item(1));
        trafficDensityClass.add('vl-badge');
    }
    else if (trafficDensity.state === 'low') {
        trafficDensityEle.innerHTML = 'Thấp';
        trafficDensityClass.remove(trafficDensityClass.item(1));
        trafficDensityClass.add('l-badge');
    }
    else if (trafficDensity.state === 'medium') {
        trafficDensityEle.innerHTML = 'Trung bình';
        trafficDensityClass.remove(trafficDensityClass.item(1));
        trafficDensityClass.add('m-badge');
    }
    else if (trafficDensity.state === 'high') {
        trafficDensityEle.innerHTML = 'Cao';
        trafficDensityClass.remove(trafficDensityClass.item(1));
        trafficDensityClass.add('h-badge');
    }
    else if (trafficDensity.state === 'very-high') {
        trafficDensityEle.innerHTML = 'Rất cao';
        trafficDensityClass.remove(trafficDensityClass.item(1));
        trafficDensityClass.add('vh-badge');
    }

    updateTime.innerHTML = trafficDensity.date;
}

function automaticFlexibleTime() {
    var btnActive = document.getElementsByClassName('btn-active');
    btnActive[0].classList.remove('btn-active');
    flexibleTime.classList.add('btn-active');

    renderControl.innerHTML = '';
}

function automaticFixedTime(streetInfo) {
    var btnActive = document.getElementsByClassName('btn-active');
    btnActive[0].classList.remove('btn-active');
    fixedTime.classList.add('btn-active');

    var btnUpdateHTML = '<button id="btn-update" class="btn-change btn-update">' +
                            '<i class="fas fa-sync-alt"></i>Cập nhật dữ liệu' +
                        '</button>';
    var trafficLightHTML = '';

    for (var trafficLight of streetInfo) {
        trafficLightHTML += '<div class="config-item">' +
                                '<div class="config-title">' +
                                    '<span>Đường</span>' +
                                    '<span> ' + trafficLight.streetName + '</span>' +
                                '</div>' +
                                '<div class="input-container">' +
                                    '<div class="input-box i-box">' +
                                       ' <span class="icon" style="color: #FF1B1C;">' +
                                            '<i class="fas fa-clock"></i>' +
                                        '</span>' +
                                        '<input type="number" name="timeReds" value="' + trafficLight.timeRed + '" required>' +
                                    '</div>' +
                                    '<div class="input-box i-box">' +
                                        '<span class="icon" style="color: #e8aa14;">' +
                                            '<i class="fas fa-clock"></i>' +
                                        '</span>' +
                                        '<input type="number" name="timeYellows" value="' + trafficLight.timeYellow + '" required>' +
                                    '</div>' + 
                                    '<div class="input-box i-box">' +
                                        '<span class="icon" style="color: #00c88b;">' +
                                            '<i class="fas fa-clock"></i>' +
                                        '</span>' +
                                        '<input type="number" name="timeGreens" value="' + trafficLight.timeGreen + '" required>' + 
                                    '</div>' +
                                '</div>' +
                            '</div>';
    }

    renderControl.innerHTML = trafficLightHTML + btnUpdateHTML;

    var btnUpdate = document.getElementById('btn-update');
    btnUpdate.addEventListener('click', updateData);
    btnUpdate.streetInfo = streetInfo;
}

function manualControl() {
    var btnActive = document.getElementsByClassName('btn-active');
    btnActive[0].classList.remove('btn-active');
    manual.classList.add('btn-active');

    var manualControlHTML = '<div class="control-item">' +
                                '<label for="btn-change">Thay đổi trạng thái</label>' +
                                '<button id="btn-change" class="btn-change">' +
                                    '<i class="fas fa-sync-alt"></i>Thay đổi' +
                                '</button>' +
                            '</div>'

    renderControl.innerHTML = manualControlHTML;
    var btnChange = document.getElementById('btn-change');
    btnChange.addEventListener('click', function() {
        controlLightSocket.emit('[center]-change-light', 'change-light');
    });
}

function renderTimeLight(timeLight) {
    var timeLightArray = [rightStreetTime, bottomStreetTime, leftStreetTime, topStreetTime];
    for (var i in timeLight) {
        timeLightArray[i].innerHTML = timeLight[i]
    }
}

function renderStateLight(stateLight) {
    var timeLightArray = [rightStreetTime, bottomStreetTime, leftStreetTime, topStreetTime];
    var colorLightArray = [rightStreetLight, bottomStreetLight, leftStreetLight, topStreetLight];

    for (var i in stateLight) {
        resetColor(timeLightArray[i], colorLightArray[i]);
        if (stateLight[i] == 'red') {
            timeLightArray[i].classList.add('red-number');            
            colorLightArray[i].children[0].classList.add('red-light');
        }
        else if (stateLight[i] == 'yellow') {
            timeLightArray[i].classList.add('yellow-number');
            colorLightArray[i].children[1].classList.add('yellow-light');
        }
        else if (stateLight[i] == 'green') {
            timeLightArray[i].classList.add('green-number');
            colorLightArray[i].children[2].classList.add('green-light')
        }
    }
}

function resetColor(timeLightArray ,colorLightArray) {
    timeLightArray.classList.remove('red-number', 'yellow-number', 'green-number');

    colorLightArray.children[0].classList.remove('red-light');
    colorLightArray.children[1].classList.remove('yellow-light');
    colorLightArray.children[2].classList.remove('green-light');
}

async function updateData(event) {
    var timeReds = []
    var timeYellows = []
    var timeGreens = []

    for (let index = 0; index < event.currentTarget.streetInfo.length; index++) {
        timeReds.push(document.getElementsByName('timeReds')[index].value);
        timeYellows.push(document.getElementsByName('timeYellows')[index].value);
        timeGreens.push(document.getElementsByName('timeGreens')[index].value);
    }

    var res = await axios.put('/intersection/' + idIntersection, {
        delta: delta.value,
        timeReds: timeReds,
        timeYellows: timeYellows,
        timeGreens: timeGreens
    });
    
    if (res.data.status == 'success') {
        setTimeout(function() {
            renderAlert.classList.remove('alert', 'alert-success');
            renderAlert.innerHTML = '';
        }, 4800)
        renderAlert.classList.add('alert', 'alert-success');
        renderAlert.innerHTML = res.data.message;

    }
    else if (res.data.status == 'error') {
        setTimeout(function() {
            renderAlert.classList.remove('alert', 'alert-error');
            renderAlert.innerHTML = '';
        }, 4800)
        renderAlert.classList.add('alert', 'alert-error');
        renderAlert.innerHTML = res.data.message;
    }
}

function renderCameraAtNorthStreet(base64Image) {
    parser = new JpegDecoder();
    parser.parse(convertDataURIToUint8(base64Image));
    width = parser.width;
    height = parser.height;
    numComponents = parser.numComponents;
    decoded = parser.getData(width, height);

    var canvas = document.getElementById('north-cam');
    canvas.width = width;
    canvas.height = height;
    var ctx = canvas.getContext('2d');
    var imageData = ctx.createImageData(width, height);
    var imageBytes = imageData.data;
    for (var i = 0, j = 0, ii = width * height * 4; i < ii; ) {
      imageBytes[i++] = decoded[j++];
      imageBytes[i++] = numComponents === 3 ? decoded[j++] : decoded[j - 1];
      imageBytes[i++] = numComponents === 3 ? decoded[j++] : decoded[j - 1];
      imageBytes[i++] = 255;
    }
    ctx.putImageData(imageData, 0, 0);
}

function renderCameraAtWestStreet(base64Image) {
    parser = new JpegDecoder();
    parser.parse(convertDataURIToUint8(base64Image));
    width = parser.width;
    height = parser.height;
    numComponents = parser.numComponents;
    decoded = parser.getData(width, height);

    var canvas = document.getElementById('west-cam');
    canvas.width = width;
    canvas.height = height;
    var ctx = canvas.getContext('2d');
    var imageData = ctx.createImageData(width, height);
    var imageBytes = imageData.data;
    for (var i = 0, j = 0, ii = width * height * 4; i < ii; ) {
      imageBytes[i++] = decoded[j++];
      imageBytes[i++] = numComponents === 3 ? decoded[j++] : decoded[j - 1];
      imageBytes[i++] = numComponents === 3 ? decoded[j++] : decoded[j - 1];
      imageBytes[i++] = 255;
    }
    ctx.putImageData(imageData, 0, 0);
}

function convertDataURIToUint8(dataURI) {
    // Validate input data
    if(!dataURI) return;

    var raw = window.atob(dataURI);
    var rawLength = raw.length;
    var array = new Uint8Array(new ArrayBuffer(rawLength));

    for(i = 0; i < rawLength; i++) {
        array[i] = raw.charCodeAt(i);
    }

    // Return a array binary data
    return array;
}

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