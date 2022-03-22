$(onLoad)

function onLoad () {
    $('#sign_upp').on('click', newUser);
}

async function newUser() {
    let username = $('#username').val();
    let email = $('#email').val();
    let password = $('#password').val();
    await $.ajax({
            type: "POST",
            url: '/api/signup',
            data : {'username': username, 'email': email, 'password': password},
            dataType:'json',
            error : function(xhr, textStatus, errorThrown) {
                alert('An error occurred!');
            },
            success:function(response){
                if(response['success']==="registered"){
                    window.location.href = "/";
                }
                else if(response['success']==="email") {
                    alert('Cette adresse e-mail a déjà un compte')
                }
                else if(response['success']==="username") {
                    alert("Ce nom d'ulisateur est déjà pris")
                }
                else if(response['success']==="both")  {
                    alert("Ce nom d'ulisateur et cet email sont déjà pris")
                }
                else if(response['success']==="password")  {
                    alert("Le mot de passe est trop court")
                }
            }
        });
}