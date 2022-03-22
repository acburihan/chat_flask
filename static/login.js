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
                if(response['success']){
                    window.location.href = "/main";
                   }
            }
        });
}