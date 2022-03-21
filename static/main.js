$(onLoad)

function onLoad () {
    $(refresh);

    $('#send_message').on('click', ":visible button:submit", sendMessage);

    $('#list_groups').on("click", "a", selectGroup);

    $('#SearchGroup').on("keyup", filterGroup);

    $('#send_message').on('click', ":visible button.popup", function() {$('#form-popup').toggle()});

    $('#form-popup button').on('click', sendImage);

    $('#Messages').on('click', ".message-image", expandImage);
    $('#ModalImage span').on('click', function() {$('#ModalImage').hide()});
    $('#ModalImage button').on('click', function() {$(this).attr("disabled", true)});

    $('#search_message').on("click", function() {$('#search_message .list-search').show()});
    $('#search_message').mouseleave(async function() {$('#search_message .list-search').hide();
                                                      $('#search_message input').blur();
                                                      await new Promise(r => setTimeout(r, 500));
                                                      $('#Messages').children().removeClass("highlighted")});
    $('#search_message input').on("keyup", filterMessage);
    $('#search_message .list-search').on("click", "a", goToMessage);
    $('#search_image').on("click", function() {$(this).toggleClass("active");
                                               $('#search_message input').focus();
                                               $(filterMessage)})

    setInterval(refreshMessage, 6000000);

    setInterval(refreshNotification,6000000);
}
let timeout;
async function refresh() {
    var startTime = performance.now();
    await $.get('/api/get_current_user', showUserName);
    await $.get('/api/get_groups', showGroups);
    await $.get('api/get_all_group_message', addAllMessage);
    var endTime = performance.now();
    timeout = endTime-startTime + 30;
    }

function showUserName(data) {
    $('.navbar-brand').text(data['name']);
}

async function sendMessage() {
    let typed_msg = $('#send_message :visible textarea').val(); //get the String value of the message
    let group = $('#list_groups a.active').attr("data-id"); //get the id of the group we're in
    //send the new message to the database
    await $.ajax({
      type: "POST",
      url: '/api/send_message',
      data : {'group': group, 'msg': typed_msg},
    });
    $('#send_message :visible textarea').val(""); //Clear the input
    $(refreshMessage); //Display the new message
}

function addAllMessage(data) {
    data.reverse();
    for (let i=0 ; i<data.length ; i++) {
        $('#search_message .list-search').append("<a href=\"#\" class=\"list-group-item list-group-item-action\" data-id=\"" + data[i]['id'] + "\">" +
            "                                        <div class=\"d-flex align-items-start\" data-id=\"" + data[i]['group'] + "\">" +
            "                                          <div class=\"search-content\" data-id=\""+ data[i]['msg'] +"\">" +
                                                            "<div style='display: inline; font-size: .75em;'>" + data[i]['date'] + " </div>" +
                                                            "<div style='display: inline;'>" + data[i]["sender"] + " : </div>" +
                                                            "<div style='display: inline;'>" + data[i]['msg'].substring(0,8) + "</div>" + "<div class='image_div' data-id='"+ data[i]['image'] +"' style='display: inline;'>" + showImage(data[i]['image'], false, true) + "</div>" +
            "                                          </div>" +
            "                                       </div>" +
            "                                    </a>")
    }
}

function showMessage(data) {
    for (let i=0 ; i<data.length ; i++) {
        $('#Messages').append("<div class=\"chat-message-" + data[i]['position'] + "\" data-id=\"" + data[i]['id'] + "\">" +
            "                <div>" +
                               showImage(data[i]["sender_avatar"], true) +
            "                  <div class=\"text-muted small text-nowrap mt-2\">" + data[i]['date'] + "</div>" +
            "                </div>" +
            "                <div class=\"flex-shrink-1 bubble-color rounded py-2 px-3 m"+data[i]['position'].charAt(0)+"-3\">" +
            "                  <div class=\"font-weight-bold mb-1\">"+replaceNameByVous(data[i]['position'], data[i]['sender'])+"</div>" +
                                "<div style=\"white-space: pre-wrap;\">" + data[i]['msg'] + "</div>" + showImage(data[i]['image']) +
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
            showImage(data[i]["icon"], true) +
            "                                <div class=\"flex-grow-1 ml-3\">" +
            data[i]['group_name'] +
            "                                </div>" +
            "                            </div>" +
            "                        </a>");
        $('#send_message').append("<div class=\"input-group\" data-id=\"" + data[i]['group_id'] + "\" style='display: none'>" +
            "              <button type=\"button\" class=\"btn btn-primary popup\"><h8>↑</h8></button>" +
            "              <textarea type=\"text\" class=\"form-control\" placeholder=\"Écrivez un message...\"></textarea>" +
            "              <button type=\"submit\" class=\"btn btn-primary\">Envoyer</button>" +
            "            </div>");
    }
    $(refreshNotification);
}

function selectGroup() {
    $('#list_groups a').removeClass('active');
    $(this).addClass('active');

    $('#send_message .input-group').hide()
    let group = $(this).attr("data-id");
    $('#send_message [data-id='+group+']').show();

    $('#list_groups a.active .badge').text(0); //Change the notifications because we have probably seen what were unseen messages
    $(showNewGroup);
}

function showNewGroup() {
    let group_name = $('#list_groups a.active div.ml-3').text();
    $('#ActionGroup strong').text(group_name);
    //Clearing the messages of the old group and displaying all the messages of the new group
    let group = $('#list_groups a.active').attr("data-id");
    $('#Messages').text("");
    $.get('/api/get_all_message/'+group, showMessage);
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


async function sendImage() {
    let group = $('#list_groups a.active').attr("data-id");
    let form_data = new FormData();
    form_data.append('file', $('#form-popup input')[0].files[0]);
    form_data.append('group', group);
    await $.ajax({
        type: 'POST',
        url: '/upload/image',
        data: form_data,
        contentType: false,
        cache: false,
        processData: false,
    });
    $('#form-popup input').val("");
    $('#form-popup').toggle();
    $(refreshMessage);
}

function showImage(filename, icon=false, search =false) {
    if (icon) {
        if (filename === null) {
            return "<img src=\"../../static/image/icone_par_defaut.png\" class=\"rounded-circle mr-1\" alt=\"icon\" width=\"40\" height=\"40\">"
        }
        else {
            return "<img  src=\"/uploads/" + filename + "\" class=\"rounded-circle mr-1\" alt=\"icon\" width=\"40\" height=\"40\">"
        }
    }
    else {
        if (filename === null) {
            return ""
        }
        else if (search) {
            return "<img src=\"/uploads/"+filename+"\" class=\"img-rounded mr-1\" alt=\"image\" style=\"height: 7vh;\">"
        }
        else {
            return "<img src=\"/uploads/"+filename+"\" class=\"message-image img-rounded mr-1\" alt=\"image\" style=\"max-height: 40vh; max-width: 40vh\">"
        }
    }
}

function expandImage() {
    $('#ModalImage').show();
    let imageSource = $(this).attr("src");
    $('#ModalImage img').attr("src", imageSource);
    $('#ModalImage a').attr("href", imageSource).attr("download", imageSource.substring(imageSource.lastIndexOf('/')+1, imageSource.length));
    $('#ModalImage button').attr("disabled", false);
}


function filterGroup() {
  let filter = $("#SearchGroup").val().toUpperCase();
  $('#list_groups a').show().filter(function() {
    return !($(this).text().toUpperCase().includes(filter));
  }).hide();
}

function filterMessage() {
    let filter = $("#search_message input").val().toUpperCase();
    $('#search_message .list-search a').show().filter(function() {
        if ($('#search_image').hasClass("active")) {
            return ($(this).children().children('.search-content').children('.image_div').attr("data-id") === "null") || !($(this).children().children('.search-content').children('.image_div').attr("data-id").toUpperCase().includes(filter));
        }
        else {
            return ($(this).children().children('.search-content').attr("data-id") === "") || !($(this).children().children('.search-content').attr("data-id").toUpperCase().includes(filter));
        }
    }).hide();
}

async function goToMessage() {
    let message_id = $(this).attr("data-id");
    let group_of_message = $(this).children().attr("data-id");
    let active_group = $('#list_groups a.active').attr("data-id");
    if (active_group === group_of_message) {}
    else {
        selectGroup.apply($('#list_groups').children('[data-id="' + group_of_message + '"]')[0]);
        await new Promise(r => setTimeout(r, timeout));
    }
    let target_message = $('#Messages').children('[data-id="'+message_id+'"]')[0];
    $('#Messages').animate({scrollTop: target_message.offsetTop -20}, 1000);
    $('#Messages').children().removeClass("highlighted")
    $(target_message).addClass("highlighted");
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
    if (position === "right mb-4") {
        return "Vous"
    }
    else {
        return name
    }
}