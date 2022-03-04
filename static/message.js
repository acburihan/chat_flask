$(onLoad)

function onLoad () {
    $('#buttonMessage').on('click', newMessage);
}

function newMessage() {
    let msg = $('#inputMessage').val(); //get the String value of the message
    //add message to the database
    console.log(msg);
    $('#inputMessage').val(""); //Clear the input
}
