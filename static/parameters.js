$(onLoad)

function onLoad () {
    $(refresh);
}

function refresh() {
    $.get('/api/get_current_user', showUserName);
}

function showUserName(data) {
    $('.navbar-brand').text(data['name']);
}