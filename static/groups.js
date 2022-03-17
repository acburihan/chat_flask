$(onLoad)

function onLoad () {
    $("#list_groups").on("click", "button.suppr_group", deleteGroup);

    $('#buttonRefresh').on('click', onSuccess);
    function onSuccess() {
        $.get('/api/get_groups/1', showGroups);
        $.get('api/get_users/1', showGroupUsers);
        $.get('api/get_all_users', showUsers);
    }

    $('#SearchUser').on('keyup', filterUser)

    $('#listUsers').on("click", "li a", addUser);

    $('#list_users_in_group').on("click", "button.suppr_user", deleteUser);
}

function deleteGroup() {
    $.ajax({
      type: "POST",
      url: '/api/delete_group',
      data : {'group': 1, 'sender': 1},
    });
}

function showGroups(data) {
    $('#list_groups').text("");
    for (let i=0 ; i<data.length ; i++) {
        $('#list_groups').append("<li class=\"list-group-item d-flex justify-content-between align-items-center\" data-id=\"" + data[i]['group_id'] + "\">" +data[i]['group_name'] + " <button class='suppr_group' id=\"group_button " + data[i]['group_id'] + "\"> Supprimer </button></li>");
    }
}

function filterUser() {
  let filter = $("#SearchUser").val().toUpperCase();
  $('#listUsers li').show().filter(function() {
    return !($(this).text().toUpperCase().includes(filter));
  }).hide();
}

function addUser() {
    $.ajax({
      type: "POST",
      url: '/api/add_user',
      data : {'group': 1, 'user': 1},
    });
}

function deleteUser() {
    $.ajax({
      type: "POST",
      url: '/api/delete_user',
      data : {'group': 1, 'user': 1},
    });
}

function showGroupUsers(data) {
    $('#list_users_in_group').text("");
    for (let i=0 ; i<data.length ; i++) {
        $('#list_users_in_group').append("<li class='list-group-item d-flex justify-content-between align-items-center' data-id='" + data[i]['user_id'] + "' >" + data[i]['username'] + "<button class='suppr_user' >Supprimer</button></li>");
    }
}

function showUsers(data) {
    $('#listUsers').text("");
    for (let i=0 ; i<data.length ; i++) {
        $('#listUsers').append("<li class='list-group-item justify-content-between align-items-center' data-id='" + data[i]['user_id'] + "' >" + data[i]['username'] + "<a href='#'><span class='badge bg-primary rounded-pill float-end'>+</span></a> </li>");
    }
}