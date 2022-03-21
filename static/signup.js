$(onLoad)

function onLoad () {
    $('#sign_upp').on('click', newUser);
}

async function newUser() {
    console.log("hey");
    let username = $('#username').val();
    let email = $('#email').val();
    let password = $('#password').val();
    await $.ajax({
      type: "POST",
      url: '/api/signup',
      data : {'username': username, 'email': email, 'password': password},
    });
    $('#username').val("");
    $('#email').val("");
    $('#password').val("");
    console.log(username, email, password);
}