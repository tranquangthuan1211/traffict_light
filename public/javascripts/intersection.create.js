var infoStreets = document.getElementById('info-street');
var numStreet = document.getElementById('num-street');
var formItemArray = document.getElementsByClassName('i-form-item');
var renderAlert = document.getElementById('render-alert');

var intersectionNameDOM = document.getElementsByName('intersectionName');
var timeDeltaDOM = document.getElementsByName('delta');
var streetNamesDOM = document.getElementsByName('streetNames')
var locationsDOM = document.getElementsByName('locations');
var bearingsDOM = document.getElementsByName('bearings');
var timeRedsDOM = document.getElementsByName('timeReds');
var timeYellowsDOM = document.getElementsByName('timeYellows');
var timeGreensDOM = document.getElementsByName('timeGreens');

var formData = {
    streetNames: streetNamesDOM,
    locations: locationsDOM,
    bearings: bearingsDOM,
    timeReds: timeRedsDOM,
    timeYellows: timeYellowsDOM,
    timeGreens: timeGreensDOM,
}

var btnCreate = document.getElementById('btn-create');

var formStreet = '<div class="i-form-item">'
                +    '<div class="input-box i-box">'
                +        '<span class="icon">'
                +            '<i class="fas fa-road"></i>'
                +        '</span>'
                +        '<input type="text" name="streetNames" placeholder="Tên đường" required>'
                +     '</div>'
                +     '<div class="input-box i-box">'
                +         '<span class="icon" style="color: #6eeb83;">'
                +             '<i class="fas fa-map-marker-alt"></i>'
                +         '</span>'
                +         '<input type="text" name="locations" placeholder="Tọa độ" required>'
                +     '</div>'
                +     '<div class="input-box i-box">'
                +         '<span class="icon" style="color: #6cd4ff;">'
                +             '<i class="fas fa-angle-left"></i>'
                +         '</span>'
                +         '<input type="number" name="bearings" placeholder="Góc" onchange="sortFormStreet()" required>'
                +     '</div>'
                +     '<div class="input-container">'
                +         '<div class="input-box i-box">'
                +             '<span class="icon" style="color: #FF1B1C;">'
                +                 '<i class="fas fa-clock"></i>'
                +             '</span>'
                +             '<input type="number" name="timeReds" required>'
                +         '</div>'
                +         '<div class="input-box i-box">'
                +             '<span class="icon" style="color: #e8aa14;">'
                +                 '<i class="fas fa-clock"></i>'
                +             '</span>'
                +             '<input type="number" name="timeYellows" required>'
                +         '</div>'
                +         '<div class="input-box i-box">'
                +             '<span class="icon" style="color: #00c88b;">'
                +                 '<i class="fas fa-clock"></i>'
                +             '</span>'
                +             '<input type="number" name="timeGreens" required>'
                +         '</div>'
                +     '</div>'
                + '</div>'

function renderFormStreet() {
    infoStreets.style.display = '-webkit-inline-box';
    infoStreets.innerHTML = '';
    for (let i = 0; i < numStreet.value; i++) {
        infoStreets.innerHTML += formStreet;
    }
}

function sortFormStreet() {
    for (var i = 0; i < numStreet.value-1; i++) {
        var min = i;
        for (var j = i+1; j < numStreet.value; j++) {
            if (parseInt(bearingsDOM[j].value) < parseInt(bearingsDOM[min].value))
                min = j;
        }
        if (min != i) {
            infoStreets.insertBefore(formItemArray[min], formItemArray[i]);
        }
    }
}

btnCreate.addEventListener('click', postData)

function postData() {
    var intersectionName = intersectionNameDOM[0].value;
    var delta = timeDeltaDOM[0].value;
    var streetNames = []
    var locations = []
    var bearings = []
    var timeReds = []
    var timeYellows = []
    var timeGreens = []

    for (var i = 0; i < numStreet.value; i++) {
        streetNames.push(streetNamesDOM[i].value);
        locations.push(locationsDOM[i].value);
        bearings.push(bearingsDOM[i].value);
        timeReds.push(timeRedsDOM[i].value);
        timeYellows.push(timeYellowsDOM[i].value);
        timeGreens.push(timeGreensDOM[i].value);
    }

    axios({
        method: 'post',
        url: window.location.origin + '/intersection',
        data: {
            intersectionName: intersectionName,
            delta: delta,
            streetNames: streetNames,
            locations: locations,
            bearings: bearings,
            timeReds: timeReds,
            timeYellows: timeYellows,
            timeGreens: timeGreens
        }
    })
    .then(function(res) {
        if (res.data.status == 'success') {
            setTimeout(function() {
                renderAlert.classList.remove('alert', 'alert-success');
                renderAlert.innerHTML = '';
            }, 4800)
            renderAlert.classList.add('alert', 'alert-success');
            renderAlert.innerHTML = res.data.message;
            removeAll()
        }
        else if (res.data.status == 'error') {
            setTimeout(function() {
                renderAlert.classList.remove('alert', 'alert-error');
                renderAlert.innerHTML = '';
            }, 4800)
            renderAlert.classList.add('alert', 'alert-error');
            renderAlert.innerHTML = res.data.message;
        }
    })
}

function removeAll() {
    for (var item in formData) {
        for (var i = 0; i < numStreet.value; i++) {
            formData[item][i].value = ''
        }
    }
}