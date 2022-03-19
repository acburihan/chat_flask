$(onLoad)

function onLoad () {
    $(refresh);

    $('#send_message button').on('click', newMessage);

    $('#buttonRefresh').on('click', refresh);

    $('#list_groups').on("click","a", selectGroup);

    $('#SearchGroup').on("keyup", filterGroup)
}

function refresh() {
        $.get('/api/get_current_user', showUserName);
        $.get('/api/get_groups', showGroups);
    }

function showUserName(data) {
    $('.navbar-brand').text(data['name']);
}

function newMessage() {
    let typed_msg = $('#send_message input').val(); //get the String value of the message
    let group = $('#list_groups a.active').attr("data-id"); //get the id of the group we're in
    //send the new message to the database
    $.ajax({
      type: "POST",
      url: '/api/send_message',
      data : {'group': group, 'msg': typed_msg},
    });
    $('#send_message input').val(""); //Clear the input
}

function showMessage(data) {
    for (let i=0 ; i<data.length ; i++) {
        $('#Messages').append("<div class=\"chat-message-" + data[i]['position'] + " pb-4\" data-id=\"" + data[i]['id'] + "\">" +
            "                <div>" +
            "                  <img src=\"https://bootdey.com/img/Content/avatar/avatar3.png\" class=\"rounded-circle mr-1\" alt=\"Sharon Lessman\" width=\"40\" height=\"40\">" +
            "                  <div class=\"text-muted small text-nowrap mt-2\">" + data[i]['date'] + "</div>" +
            "                </div>" +
            "                <div class=\"flex-shrink-1 bubble-color rounded py-2 px-3 ml-3\">" +
            "                  <div class=\"font-weight-bold mb-1\">"+replaceNameByVous(data[i]['position'], data[i]['sender'])+"</div>" +
                                data[i]['msg'] +
            "                </div>" +
            "              </div>");
    }
}

function showGroups(data) {
    $('#list_groups').text("");
    for (let i=0 ; i<data.length ; i++) {
        $('#list_groups').append("<a href=\"#\" class=\"list-group-item list-group-item-action border-0"+ activate0(i) +"\" data-id=\"" + data[i]['group_id'] + "\">" +
            "                            <div class=\"badge bg-success float-end\">0</div>" +
            "                            <div class=\"d-flex align-items-start\">" +
            "                                <img src=\"https://bootdey.com/img/Content/avatar/avatar5.png\" class=\"rounded-circle mr-1\" alt=\"icon\" width=\"40\" height=\"40\">" +
            "                                <div class=\"flex-grow-1 ml-3\">" +
                                                data[i]['group_name'] +
            "                                </div>" +
            "                            </div>" +
            "                        </a>");
    }
    $(showNewGroup);
}

function selectGroup() {
    $('#list_groups a').removeClass('active');
    $(this).addClass('active');
    $(showNewGroup);
}

function showNewGroup() {
    let group_name = $('#list_groups a.active div.ml-3').text();
    $('#ActionGroup strong').text(group_name);
    //Clearing the messages of the old group and displaying all the messages of the new group
    let group = $('#list_groups a.active').attr("data-id");
    $('#Messages').text("");
    $.get('/api/get_all_message/'+group, showMessage);
    //Change the notifications because we have probably seen what were unseen messages
    $.get('/api/get_notifications', notification);
}

function notification(data) {
    for (let i=0 ; i<data.length ; i++) {
        $('#list_groups [data-id='+data[i]["group_id"]+'] .badge').text(data[i]["notifications"]);
    }
}

function filterGroup() {
  let filter = $("#SearchGroup").val().toUpperCase();
  $('#list_groups a').show().filter(function() {
    return !($(this).text().toUpperCase().includes(filter));
  }).hide();
}

function activate0(i) {
    if (i===0) {
        return " active"
    }
    else {
        return ""
    }
}

function replaceNameByVous(position, name) {
    if (position === "right") {
        return "Vous"
    }
    else {
        return name
    }
}