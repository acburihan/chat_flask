$(onLoad)

function onLoad () {
    $('#buttonMessage').on('click', newMessage);

    $('#buttonRefresh').on('click', onSuccess);
    function onSuccess() {
        $.get('/api/get_message/1', addMessage);
    }
}

function newMessage() {
    let typed_msg = $('#inputMessage').val(); //get the String value of the message
    //send the new message to the database
    $.ajax({
      type: "POST",
      url: '/api/send_message',
      data : {'group': 1, 'sender': 1, 'msg': typed_msg},
    });
    $('#inputMessage').val(""); //Clear the input
}

function addMessage(data) {
    $('#Messages').text("");
    for (let i=0 ; i<data.length ; i++) {
        $('#Messages').append("<div id=\"message"+ data[i]['id'] +"\" class=\"float-end\"><span class=\"time-right\">" + data[i]['date'] + " </span>" + data[i]['msg'] + "</div><br>");
    }
}
