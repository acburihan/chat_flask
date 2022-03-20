$(onLoad)

function onLoad () {
    $(refresh);

    $('#send_message button').on('click', sendMessage);

    $('#buttonRefresh').on('click', refresh);

    $('#list_groups').on("click","a", selectGroup);

    $('#SearchGroup').on("keyup", filterGroup);

    setInterval(refreshMessage, 60000);

    setInterval(refreshNotification,60000);
}

function refresh() {
        $.get('/api/get_current_user', showUserName);
        $.get('/api/get_groups', showGroups);
    }

function showUserName(data) {
    $('.navbar-brand').text(data['name']);
}

async function sendMessage() {
    let typed_msg = $('#send_message input').val(); //get the String value of the message
    let group = $('#list_groups a.active').attr("data-id"); //get the id of the group we're in
    //send the new message to the database
    await $.ajax({
      type: "POST",
      url: '/api/send_message',
      data : {'group': group, 'msg': typed_msg},
    });
    $('#send_message input').val(""); //Clear the input
    $(refreshMessage); //Display the new message
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
    $('#Messages').scrollTop(9999999);
}

function showGroups(data) {
    $('#list_groups').text("");
    for (let i=0 ; i<data.length ; i++) {
        $('#list_groups').append("<a href=\"#\" class=\"list-group-item list-group-item-action border-0\" data-id=\"" + data[i]['group_id'] + "\">" +
            "                            <div class=\"badge notif-color float-end\">0</div>" +
            "                            <div class=\"d-flex align-items-start\">" +
            "                                <img src=\"https://bootdey.com/img/Content/avatar/avatar5.png\" class=\"rounded-circle mr-1\" alt=\"icon\" width=\"40\" height=\"40\">" +
            "                                <div class=\"flex-grow-1 ml-3\">" +
                                                data[i]['group_name'] +
            "                                </div>" +
            "                            </div>" +
            "                        </a>");
    }
    $(refreshNotification);
}

function selectGroup() {
    $('#list_groups a').removeClass('active');
    $(this).addClass('active');
    $('#list_groups a.active .badge').text(0); //Change the notifications because we have probably seen what were unseen messages
    $(showNewGroup);
}

async function showNewGroup() {
    let group_name = $('#list_groups a.active div.ml-3').text();
    $('#ActionGroup strong').text(group_name);
    //Clearing the messages of the old group and displaying all the messages of the new group
    let group = $('#list_groups a.active').attr("data-id");
    $('#Messages').text("");
    await $.get('/api/get_all_message/'+group, showMessage);
}

async function refreshMessage() {
    let group = $('#list_groups a.active').attr("data-id");
    await $.get('/api/get_new_message/'+group, showMessage);
    $('#Messages').scrollTop(9999999);
}

async function refreshNotification() {
    await $.get('/api/get_notifications', notification);
    $(sortGroup)
}

function notification(data) {
    $('#list_groups .badge').text(0);
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

function sortGroup() {
    let tr = $('#list_groups a').toArray().sort(compareGroup());
    $('#list_groups').append(tr);
}

function compareGroup() {
  return function(a, b) {
    var na = $(a).children('.badge').text()
    var nb = $(b).children('.badge').text()
    if (na < nb)
      return 1
    else if (na > nb)
      return -1
    else
      return 0
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