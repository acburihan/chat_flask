$(onLoad)

function onLoad () {
    $('#buttonMessage').on('click', newMessage);
}

function newMessage() {
    let msg = $('#inputMessage').val();
    //add message to the database
    console.log(msg);
    $('#inputMessage').val("");
}
