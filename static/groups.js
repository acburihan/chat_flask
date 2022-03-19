$(onLoad)

function onLoad () {
    $(refresh);

    $('#list_groups').on("click", "button.suppr_group", deleteGroup);

    $('#SearchUser').on("keyup", filterUser)

    $('#listUsers').on("click", "li a", addUser);

    $('#list_users_in_group').on("click", "button.suppr_user", deleteUser);

    $('#createGroup button').on("click", newGroup);

    $('#list_groups').on("click","li", selectGroup);
}

function refresh() {
        $.get('/api/get_groups', showGroups);
        $.get('api/get_all_users', showUsers);
    }

function deleteGroup() {
    $.ajax({
      type: "POST",
      url: '/api/delete_group',
      data : {'group': 1},
    });
}

function showGroups(data) {
    $('#list_groups').text("");
    for (let i=0 ; i<data.length ; i++) {
        $('#list_groups').append("<li class=\"list-group-item d-flex justify-content-between align-items-center\" data-id=\"" + data[i]['group_id'] + "\">" +data[i]['group_name'] + " <button class='suppr_group' disabled> Quitter </button></li>");
    }
}

function filterUser() {
  let filter = $("#SearchUser").val().toUpperCase();
  $('#listUsers li').show().filter(function() {
    return !($(this).text().toUpperCase().includes(filter));
  }).hide();
}

function addUser() {
    let user = $(this).attr("data-id")
    let group = $('#list_groups li.active').attr("data-id");
    $.ajax({
      type: "POST",
      url: '/api/add_user',
      data : {'group': group, 'user': user},
    });
}

function deleteUser() {
    let user = $(this).attr("data-id")
    let group = $('#list_groups li.active').attr("data-id");
    $.ajax({
      type: "POST",
      url: '/api/delete_user',
      data : {'group': group, 'user': user},
    });
}

function showGroupUsers(data) {
    $('#list_users_in_group').text("");
    for (let i=0 ; i<data.length ; i++) {
        $('#list_users_in_group').append("<li class='list-group-item d-flex justify-content-between align-items-center'>" + data[i]['username'] + "<button class='suppr_user' data-id='" + data[i]['user_id'] + "' > Retirer </button></li>");
    }
}

function showUsers(data) {
    $('#listUsers').text("");
    for (let i=0 ; i<data.length ; i++) {
        $('#listUsers').append("<li class='list-group-item justify-content-between align-items-center'>" + data[i]['username'] + "<a href='#' data-id='" + data[i]['user_id'] + "'><span class='badge bg-primary rounded-pill float-end'>+</span></a> </li>");
    }
}

function newGroup() {
    let group_name = $('#createGroup input').val();
    $.ajax({
      type: "POST",
      url: '/api/create_group',
      data : {'group_name': group_name},
    });
    $('#createGroup input').val("");
}

function selectGroup() {
    $('#list_groups li').removeClass('active');
    $('#list_groups li button').attr('disabled', true);
    $(this).addClass('active');
    $(this).children('button').attr('disabled', false);
    let group = $(this).attr("data-id");
    $.get('api/get_users/'+group, showGroupUsers);
}