$(onLoad)

function onLoad () {
    $('#loginn').on('click', verifyUser);
}

async function verifyUser() {
    let email = $('#email').val();
    let password = $('#password').val();
    await $.ajax({
            type: "POST",
            url: '/api/login',
            data : {'email': email, 'password': password},
            dataType:'json',
            error : function(xhr, textStatus, errorThrown) {
                alert('An error occurred!');
            },
            success:function(response){
                if(response['success']==="authenticated"){
                    window.location.href = "/main";
                   }
                else if(response['success']==="mail"){
                    alert("Identifiant incorrect")
                }
                else if(response['success']==="password"){
                    alert("Mot de passe incorrect")
                }
            }
        });
}