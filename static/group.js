$(onLoad)

function onLoad () {
    $(refresh);

    $('#list_groups').on("click", "button", deleteGroup);

    $('#send_message').on("keyup", ':visible .SearchUser',filterUser)

    $('#SearchGroup').on("keyup", filterGroup);

    $('#listNotUsers').on("click", "li a", addUser);

    $('#listUsers').on("click", "button.suppr_user", deleteUser);

    $('#ActionGroup div button').on("click", newGroup);

    $('#list_groups').on("click", "img.clickable", function() {$('#form-popup').toggle()});
    $('#form-popup button').on('click', sendImage);
}

<<<<<<< HEAD
async function refresh() {
    await $.get('/api/get_current_user', showUserName);
    await $.get('/api/get_groups', showGroups);
    await $.get('/api/get_users/'+parseInt($('title').text().substring(7,$('title').text().length)), showGroupUsers);
    await $.get('/api/get_all_users', showUsers);
}

=======
function refresh() {
        $.get('/api/get_groups', showGroups);
        $.get('api/get_all_users', showUsers);
        $.get('/api/get_current_user', showUserName);
}


>>>>>>> 82bbe229e7bb4a73f5f80ce49e14e5669a39c0c1
function showUserName(data) {
    $('.navbar-brand').text(data['name']);
}

async function deleteGroup() {
    await $.ajax({
      type: "POST",
      url: '/api/delete_group',
      data : {'group': $("#list_groups div.active").attr("data-id")},
    });
    await $.get('/api/get_groups', showGroups);
    let groupe_restant = $("#list_groups").children().attr("data-id");
    if (groupe_restant.length > 0) {
        window.location.href = "/group/"+groupe_restant;
    }
}

function showGroups(data) {
    $('#list_groups').text("");
    $('#send_message').text("");
    for (let i=0 ; i<data.length ; i++) {
        $('#list_groups').append("<div class=\"list-group-item list-group-item-action " + active_id(data[i]['group_id']) + "\" data-id=\"" + data[i]['group_id'] + "\">" +
            "                            <button class=\"badge notif-color float-end\" " + disabled_id(data[i]['group_id']) + " style='z-index: 10'>Quitter</button>" +
            "                            <div class=\"align-items-start active\">" +
            showImage(data[i]["icon"],data[i]['group_id']) +
            "                                <a href=\"/group/" + data[i]['group_id'] + "\" class=\"list-group-item-action\" style='background-color: inherit'>" +
            data[i]['group_name'] +
            "                                </a>" +
            "                            </div>" +
            "                        </div>");
        $('#send_message').append("<div class=\"input-group\" data-id=\"" + data[i]['group_id'] + "\" style='display: "+display_id(data[i]['group_id'])+"'>" +
            "              <input type=\"text\" class=\"form-control SearchUser\" style='width:100%' placeholder=\"Recherchez un utilisateur\">" +
            "            </div>");
    }
}

function filterUser() {
    let filter = $(".SearchUser").val().toUpperCase();
    $('#listUsers li').show().filter(function() {
        return !($(this).contents().get(0).nodeValue.toUpperCase().includes(filter));
    }).hide();
    $('#listNotUsers li').show().filter(function() {
        return !($(this).contents().get(0).nodeValue.toUpperCase().includes(filter));
    }).hide();
}

function filterGroup() {
    let filter = $("#SearchGroup").val().toUpperCase();
    $('#list_groups div').show().filter(function() {
        return !($(this).text().toUpperCase().includes(filter));
    }).hide();
}

async function addUser() {
    let user = $(this).attr("data-id")
    let group = parseInt($('title').text().substring(7,$('title').text().length));
    await $.ajax({
      type: "POST",
      url: '/api/add_user',
      data : {'group': group, 'user': user},
    });
    await $.get('/api/get_users/'+group, showGroupUsers);
    await $.get('/api/get_all_users', showUsers);
}

async function deleteUser() {
    let user = $(this).attr("data-id")
    let group = parseInt($('title').text().substring(7,$('title').text().length));
    await $.ajax({
      type: "POST",
      url: '/api/delete_user',
      data : {'group': group, 'user': user},
    });
    await $.get('/api/get_users/'+group, showGroupUsers);
    await $.get('/api/get_all_users', showUsers);
}

function showGroupUsers(data) {
    $('#listUsers').text("");
    for (let i=0 ; i<data.length ; i++) {
        $('#listUsers').append("<li class='list-group-item justify-content-between align-items-center'>" + showImage(data[i]['avatar']) + "\t\t\t" + data[i]['username'] + "<button class='suppr_user float-end' data-id='" + data[i]['user_id'] + "' > Retirer </button></li>");
    }
}

function showUsers(data) {
    $('#listNotUsers').text("");
    for (let i=0 ; i<data.length ; i++) {
        $('#listNotUsers').append("<li class='list-group-item justify-content-between align-items-center'" + hidden_other(data[i]['user_id']) + ">" + showImage(data[i]['avatar']) + "\t\t\t" + data[i]['username'] + "<a href='#' data-id='" + data[i]['user_id'] + "'><span class='badge bg-primary rounded-pill float-end'>+</span></a> </li>");
    }
}

async function newGroup() {
    let group_name = $('#ActionGroup div input').val();
    await $.ajax({
      type: "POST",
      url: '/api/create_group',
      data : {'group_name': group_name},
    });
    $('#ActionGroup div input').val("");
    $.get('/api/get_groups', showGroups);
}

async function sendImage() {
    let group = parseInt($('title').text().substring(7,$('title').text().length));
    let form_data = new FormData();
    form_data.append('file', $('#form-popup input')[0].files[0]);
    form_data.append('group', group);
    await $.ajax({
        type: 'POST',
        url: '/upload/icone',
        data: form_data,
        contentType: false,
        cache: false,
        processData: false,
    });
    $('#form-popup input').val("");
    $('#form-popup').toggle();
    $.get('/api/get_groups', showGroups);
}

function showImage(filename, group_id=0) {
    if (filename === null) {
        return "<img src=\"../../static/image/icone_par_defaut.png\" class=\"rounded-circle mr-1 "+clickable_id(group_id)+"\" alt=\"icon\" width=\"40\" height=\"40\" style='z-index: 20'>"
    }
    else {
        return "<img  src=\"/uploads/" + filename + "\" class=\"rounded-circle mr-1 "+clickable_id(group_id)+"\" alt=\"icon\" width=\"40\" height=\"40\" style='z-index: 20'>"
    }
}

function active_id(group_id) {
    if (group_id === parseInt($('title').text().substring(7,$('title').text().length))) {
        return " active"
    }
    else {
        return ""
    }
}

function disabled_id(group_id) {
    if (group_id === parseInt($('title').text().substring(7,$('title').text().length))) {
        return ""
    }
    else {
        return "disabled='disabled'"
    }
}

function display_id(group_id) {
    if (group_id === parseInt($('title').text().substring(7,$('title').text().length))) {
        return "block"
    }
    else {
        return "none"
    }
}

function hidden_other(user_id) {
    let filtered = $('#listUsers').children().filter(function() {
    return !($(this).attr("data-id") === user_id.toString());});
    if (filtered.length === 1) {
        return " hidden"
    }
    else {
        return ""
    }
}

function clickable_id(group_id) {
    if (group_id === parseInt($('title').text().substring(7,$('title').text().length))) {
        return "clickable"
    }
    else {
        return ""
    }
}