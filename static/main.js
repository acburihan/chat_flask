$(onLoad)

function onLoad () {
    $(refresh);

    $('#buttonMessage').on('click', newMessage);

    $('#buttonRefresh').on('click', refresh);

    $('#list_groups').on("click","li", selectGroup);
}

function refresh() {
        $.get('/api/get_groups', showGroups);
        let group = $('#list_groups li.active').attr("data-id");
        $.get('/api/get_message/'+group, showMessage);
    }

function newMessage() {
    let typed_msg = $('#inputMessage').val(); //get the String value of the message
    let group = $('#list_groups li.active').attr("data-id"); //get the id of the group we're in
    //send the new message to the database
    $.ajax({
      type: "POST",
      url: '/api/send_message',
      data : {'group': group, 'msg': typed_msg},
    });
    $('#inputMessage').val(""); //Clear the input
}

function showMessage(data) {
    $('#Messages').text("");
    for (let i=0 ; i<data.length ; i++) {
        if (data[i]['sender'] === data[i]['current_user']) {
            $('#Messages').append("<div data-id='" + data[i]['id'] + "' class='float-end'>" + data[i]['msg'] + " <span>" + data[i]['date'] + " </span></div><br>");
        }
        else {
            $('#Messages').append("<div data-id='" + data[i]['id'] + "' class='float-start'><span>" + data[i]['date'] + " </span> " + data[i]['msg'] + "</div><br>");
        }
    }
}

function showGroups(data) {
    $('#list_groups').text("");
    for (let i=0 ; i<data.length ; i++) {
        $('#list_groups').append("<li class=\"list-group-item d-flex justify-content-between align-items-center\" data-id=\"" + data[i]['group_id'] + "\">" +data[i]['group_name'] + "</li>");
    }
}

function selectGroup() {
    $('#list_groups li').removeClass('active');
    $(this).addClass('active');
    let group = $(this).attr("data-id");
    $.get('/api/get_message/'+group, showMessage);
}
