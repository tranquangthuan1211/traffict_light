var intersectionEle = document.getElementById('intersectionName');

function findIntersection() {
    let intersectionName = intersectionEle.value;
    if (intersectionName === ' ' || intersectionName === '') {
        closeAllLists();
    } else {
        axios.get(window.location.origin + '/intersection/list/search', { params: { 
            name: intersectionName.toLowerCase()
        }})
        .then(renderName);
    }
}

function renderName(res) {
    let autocompleteEle = document.getElementById('autocomplete-box');
    closeAllLists();
    var a, b, i;

    a = document.createElement('div');
    a.classList.add('autocomplete-items');
    autocompleteEle.appendChild(a);

    for (let item of res.data) {
        b = document.createElement('div');
        b.innerHTML = item.intersectionName;
        b.innerHTML += "<input type='hidden' value='" + item.intersectionName +
        "'>";
        b.addEventListener('click', function(e) {
            intersectionEle.value = this.getElementsByTagName('input')[0].value;
            closeAllLists();

            document['searchUrl'].action = '/center/statistic/' + item._id
        });

        a.appendChild(b);
    }
}

function closeAllLists() {
    var x = document.getElementsByClassName("autocomplete-items");
    if (x[0] !== undefined) {
        x[0].remove();
    }
}