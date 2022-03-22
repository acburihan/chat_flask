import os
import sys

import flask
from flask import Flask, redirect, url_for

from database.database import db, init_database
from models import *
from datetime import datetime
from sqlalchemy import func

from werkzeug.utils import secure_filename

UPLOAD_FOLDER = '/image'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

app = flask.Flask(__name__)

app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///database/database.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.secret_key = 'super secret key'
app.config['SESSION_TYPE'] = 'filesystem'
os.makedirs(os.path.join(app.config['UPLOAD_FOLDER'], 'htmlfi'), exist_ok=True)

db.init_app(app)
with app.test_request_context():
    init_database()

# Global variables
current_user = 1
authenticated = False
total_data_ko = 0


@app.route('/')
def login():
    return flask.render_template("login.html")


@app.route('/signup')
def signup():
    return flask.render_template("signup.html")


@app.route('/main')
def main():
    global authenticated
    if authenticated:
        return flask.render_template("index.html.jinja2")
    else:
        return redirect('/')


@app.route('/group/<group_id>')
def group(group_id):
    return flask.render_template("group.html", group_id=group_id)


@app.route('/dashboard', methods=['GET', 'POST'])
def dashboard():
    sent = db.session.query(Message).filter(Message.sender_id == current_user).all()
    s_vol = 0
    for s in sent:
        s_vol += sys.getsizeof(s)

    received = db.session.query(Message).filter(Message.sender_id != current_user).all()
    r_vol = 0
    for r in received:
        r_vol += sys.getsizeof(r)

    images = db.session.query(Message).filter(Message.image != '').all()
    i_vol = 0
    for i in images:
        i_vol += sys.getsizeof(i)
    print(i_vol)

    return flask.render_template("dashboard.html.jinja2", sent=len(sent), sent_volume=s_vol, received=len(received), received_volume=r_vol, images=len(images), images_vol=i_vol)


@app.route('/api/login', methods=['GET', 'POST'])
def login_api():
    global current_user, authenticated

    request_data = flask.request.form
    email = request_data['email']
    password = request_data['password']

    user_same_mail = db.session.query(User).filter(User.email == email).first()
    current = db.session.query(User).filter(User.email == email).filter(User.password == password).first()
    if user_same_mail is None:
        result = flask.jsonify(success="mail")
    elif current is None:
        result = flask.jsonify(success="password")
    else:
        current_user = current.user_id
        authenticated = True
        result = flask.jsonify(success="authenticated")
    return result


@app.route('/api/signup', methods=['GET', 'POST'])
def signup_api():
    request_data = flask.request.form
    username = request_data['username']
    email = request_data['email']
    password = request_data['password']

    user_same_mail = db.session.query(User).filter(User.email == email).first()
    user_same_name = db.session.query(User).filter(User.username == username).first()

    if (user_same_mail is not None) and (user_same_name is not None):
        result = flask.jsonify(success="both")
    elif user_same_mail is not None:
        result = flask.jsonify(success="email")
    elif user_same_name is not None:
        result = flask.jsonify(success="username")
    elif len(password) < 2:
        result = flask.jsonify(success="password")
    else:
        new_user = User(username=username, email=email, password=password)
        db.session.add(new_user)
        db.session.commit()
        result = flask.jsonify(success="registered")
    return result


@app.route('/api/get_current_user')
def get_current_user():
    global current_user
    current = db.session.query(User).filter(User.user_id == current_user).first()

    return flask.jsonify({
                "name": current.username,
                "avatar": current.avatar
            })


@app.route("/api/send_message", methods=["POST"])
def send_message():
    global current_user
    request_data = flask.request.form
    group_id = request_data['group']
    sender_id = current_user
    msg = request_data['msg']
    group = db.session.query(Group).filter(Group.group_id == group_id).first()
    sender = db.session.query(User).filter(User.user_id == sender_id).first()

    new_message = Message(msg=msg, date=datetime.today())
    new_message.sender = sender
    new_message.group = group
    db.session.add(new_message)

    group_users = db.session.query(Group, User).join(Group.users).filter(Group.group_id == group_id).all()

    for user in group_users:
        user[1].unseen.append(new_message)

    db.session.commit()

    message = {
        "group": group_id,
        "sender": sender_id,
        "msg": msg,
    }

    return flask.jsonify(message)


def position(sender):
    global current_user
    if sender == current_user:
        return "right mb-4"
    else:
        return "left pb-4"


def short_date(long_date):
    today = datetime.today()
    if long_date.year != today.year:
        return long_date.date
    elif long_date.day != today.day:
        return long_date.strftime("%m/%d, à %H h")
    elif long_date.hour != today.hour:
        return long_date.strftime("%H:%M")
    elif long_date.minute != today.minute:
        return str(today.minute-long_date.minute) + " min"
    else:
        return str(today.second-long_date.second) + " sec"


@app.route('/api/get_all_group_message')
def get_all_group_message():
    messages = db.session.query(Message, User).join(Message.sender).all()

    result = []
    for message in messages:
        result.append(
            {
                "id": message[0].msg_id,
                "msg": message[0].msg,
                "sender": message[1].username,
                "sender_avatar": message[1].avatar,
                "group": message[0].group_id,
                "date": short_date(message[0].date),
                "image": message[0].image,
            }
        )

    return flask.jsonify(result)

@app.route('/api/get_all_message/<group_id>')
def get_all_message(group_id):
    global current_user
    messages = db.session.query(Message, User).join(Message.sender).filter(Message.group_id == group_id).all()

    result = []
    for message in messages:
        result.append(
            {
                "id": message[0].msg_id,
                "msg": message[0].msg,
                "sender": message[1].username,
                "sender_avatar": message[1].avatar,
                "position": position(message[0].sender_id),
                "date": short_date(message[0].date),
                "image": message[0].image,
            }
        )

    new_messages = db.session.query(Message, User).join(User.unseen).filter(Message.group_id == group_id,
                                                                            User.user_id == current_user).all()
    current = db.session.query(User).filter(User.user_id == current_user).first()
    for message in new_messages:
        current.unseen.remove(message[0])
    db.session.commit()

    return flask.jsonify(result)


@app.route('/api/get_new_message/<group_id>')
def get_new_messages(group_id):
    global current_user
    sender = db.aliased(User)
    user_now = db.aliased(User)
    new_messages = db.session.query(Message, user_now, sender)\
        .join(Message, user_now.unseen).join(sender, Message.sender)\
        .filter(Message.group_id == group_id, user_now.user_id == current_user).all()

    result = []
    for message in new_messages:
        result.append(
            {
                "id": message[0].msg_id,
                "msg": message[0].msg,
                "sender": message[2].username,
                "sender_avatar": message[2].avatar,
                "position": position(message[0].sender_id),
                "date": short_date(message[0].date),
                "image": message[0].image,
            }
        )
        message[1].unseen.remove(message[0])
    db.session.commit()

    return flask.jsonify(result)


@app.route('/api/get_groups')
def get_groups():
    groups = db.session.query(Group, User).join(Group.users).filter(User.user_id == current_user).all()

    return flask.jsonify([
        {
            "group_id": group[0].group_id,
            "group_name": group[0].name,
            "icon": group[0].icon,
        }
        for group in groups
    ])


@app.route('/api/get_notifications')
def get_notifications():
    global current_user
    messages = db.session.query(Message.group_id, User, func.count(User.user_id)).join(Message, User.unseen)\
        .filter(User.user_id == current_user).group_by(Message.group_id).all()
    return flask.jsonify([
        {
            "group_id": msg[0],
            "notifications": msg[2],
        }
        for msg in messages
    ])


@app.route("/api/delete_message", methods=["POST"])
def delete_message():
    request_data = flask.request.form
    msg_id = request_data['msg']

    message = db.session.query(Message).filter(Message.msg_id == msg_id).first()
    db.session.delete(message)
    db.session.commit()

    response = {
        "msg": msg_id,
    }

    return flask.jsonify(response)

@app.route("/api/delete_group", methods=["POST"])
def delete_group():
    global current_user
    request_data = flask.request.form
    group_id = request_data['group']
    sender_id = current_user

    group = db.session.query(Group).filter(Group.group_id == group_id).first()
    sender = db.session.query(User).filter(User.user_id == sender_id).first()

    group.users.remove(sender)
    db.session.commit()

    response = {
        "group": group_id,
        "sender": sender_id,
    }

    return flask.jsonify(response)


@app.route("/api/add_user", methods=["POST"])
def add_user():
    request_data = flask.request.form
    group_id = request_data['group']
    user_id = request_data['user']

    group = db.session.query(Group).filter(Group.group_id == group_id).first()
    user = db.session.query(User).filter(User.user_id == user_id).first()
    group.users.append(user)
    db.session.commit()

    response = {
        "group": group_id,
        "user": user_id,
    }

    return flask.jsonify(response)


@app.route("/api/delete_user", methods=["POST"])
def delete_user():
    request_data = flask.request.form
    group_id = request_data['group']
    user_id = request_data['user']

    group = db.session.query(Group).filter(Group.group_id == group_id).first()
    user = db.session.query(User).filter(User.user_id == user_id).first()
    group.users.remove(user)
    db.session.commit()

    response = {
        "group": group_id,
        "user": user_id,
    }

    return flask.jsonify(response)


@app.route('/api/get_users/<group_id>')
def get_users(group_id):
    global current_user
    users = db.session.query(User, Group).join(Group.users).filter(Group.group_id == group_id)\
                                                            .filter(User.user_id != current_user).all()
    return flask.jsonify([
        {
            "user_id": user[0].user_id,
            "username": user[0].username,
            "avatar": user[0].avatar,
        }
        for user in users
    ])


@app.route('/api/get_all_users')
def get_all_users():
    global current_user
    users = db.session.query(User).filter(User.user_id != current_user).all()
    return flask.jsonify([
        {
            "user_id": user.user_id,
            "username": user.username,
            "avatar": user.avatar,
        }
        for user in users
    ])


@app.route("/api/create_group", methods=["POST"])
def create_group():
    global current_user
    request_data = flask.request.form
    group_name = request_data['group_name']
    new_group = Group(name=group_name)
    db.session.add(new_group)

    user = db.session.query(User).filter(User.user_id == current_user).first()
    new_group.users.append(user)

    db.session.commit()
    message = {
        "group_id": new_group.group_id,
        "group_name": group_name,
    }

    return flask.jsonify(message)


def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


@app.route('/upload/<image_type>', methods=['POST'])
def upload_file(image_type):
    if flask.request.method == 'POST':
        # check if the post request has the file part
        if 'file' not in flask.request.files:
            flask.flash('No file part')
            return '', 204
        file = flask.request.files['file']
        # if user does not select file, browser also
        # submit an empty part without filename
        if file.filename == '':
            flask.flash('No selected file')
            return '', 204
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
            add_image(image_type, filename, flask.request.form['group'])
            return '', 204
        return '', 204


def add_image(image_type, filename, group_id):
    global current_user
    if image_type == "image":
        group = db.session.query(Group).filter(Group.group_id == group_id).first()
        sender = db.session.query(User).filter(User.user_id == current_user).first()

        new_message = Message(msg="", image=filename, date=datetime.today())
        new_message.sender = sender
        new_message.group = group
        db.session.add(new_message)

        group_users = db.session.query(Group, User).join(Group.users).filter(Group.group_id == group_id).all()

        for user in group_users:
            user[1].unseen.append(new_message)

        db.session.commit()
    elif image_type == "avatar":
        user = db.session.query(User).filter(User.user_id == current_user).first()
        user.avatar = filename
        db.session.commit()
    elif image_type == "icone":
        group = db.session.query(Group).filter(Group.group_id == group_id).first()
        group.icon = filename
        db.session.commit()
    else:
        return flask.render_template("index.html.jinja2")


def add_data_sent(data):
    global current_user, total_data_ko
    data = sys.getsizeof(data)
    total_data_ko += data
    user = db.session.query(User).filter(User.user_id == current_user).first()
    user.data_sent = user.data_sent + data


def add_data_received(result):
    global current_user, total_data_ko
    data = sys.getsizeof(result)
    total_data_ko += data
    user = db.session.query(User).filter(User.user_id == current_user).first()
    user.data_received = user.data_received + data


@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return flask.send_from_directory(app.config['UPLOAD_FOLDER'], filename)


if __name__ == '__main__':
    app.run()
