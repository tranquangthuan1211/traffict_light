var renderAlert = document.getElementById('render-alert');

async function onBlock(id) {
    res = await axios.put(window.location.origin + '/user/blocked/' + id)
    onAlert(res);
    renderUnblockBtn(id)
}

async function onUnblock(id) {
    res = await axios.put(window.location.origin + '/user/unlocked/' + id)
    onAlert(res);
    renderBlockBtn(id)
}

async function onDelete(id) {
    res = await axios.delete(window.location.origin + '/user/' + id)
    onAlert(res);
    document.getElementById(id).parentElement.parentElement.remove();
}

function renderBlockBtn(id) {
    var blockBtn = document.getElementById(id);
    blockBtn.setAttribute('onclick', 'onBlock(this.id)');
    blockBtn.classList.remove('btn-unblock');
    blockBtn.classList.add('btn-block');
    blockBtn.innerHTML = '<i class="fas fa-ban"></i><span class="tool-tip">Block</span>'
}

function renderUnblockBtn(id) {
    var unblockBtn = document.getElementById(id);
    unblockBtn.setAttribute('onclick', 'onUnblock(this.id)');
    unblockBtn.classList.remove('btn-block');
    unblockBtn.classList.add('btn-unblock');
    unblockBtn.innerHTML = '<i class="far fa-circle"></i><span class="tool-tip">Unblock</span>'
}

function onAlert(res) {
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