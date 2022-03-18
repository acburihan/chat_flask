import flask
from database.database import db, init_database
from models import *
from datetime import datetime

app = flask.Flask(__name__)

app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///database/database.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db.init_app(app)
with app.test_request_context():
    init_database()

# The id of the user that is connected
current_user = 1


@app.route('/')
def hello_world():
    return flask.render_template("index.html.jinja2")


@app.route('/groups')
def group_page():
    return flask.render_template("groups.html")


@app.route("/api/send_message", methods=["POST"])
def send_message():
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
    db.session.commit()

    message = {
        "group": group_id,
        "sender": sender_id,
        "msg": msg,
    }

    return flask.jsonify(message)


@app.route('/api/get_message/<group_id>')
def get_messages(group_id):
    messages = db.session.query(Message).filter(Message.group_id == group_id).all()
    return flask.jsonify([
        {
            "id": message.msg_id,
            "msg": message.msg,
            "sender": message.sender_id,
            "current_user": current_user,
            "date": message.date,
        }
        for message in messages
    ])


@app.route('/api/get_groups')
def get_groups():

    # new_user = User(username="User0", password="0000")
    # db.session.add(new_user)
    # new_user2 = User(username="User1", password="1111")
    # db.session.add(new_user2)
    # db.session.commit()
    user_id = current_user

    groups = db.session.query(Group, User).join(Group.users).filter(User.user_id == user_id).all()

    return flask.jsonify([
        {
            "group_id": group[0].group_id,
            "group_name": group[0].name,
        }
        for group in groups
    ])


@app.route("/api/delete_group", methods=["POST"])
def delete_group():
    request_data = flask.request.form
    group_id = request_data['group']
    sender_id = current_user

    group = db.session.query(Group).filter(Group.group_id == group_id).first()
    sender = db.session.query(User).filter(User.user_id == sender_id).first()
    # db.session.no_autoflush()
    group.users.remove(sender)
    # sender.groups.remove(group)
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
    users = db.session.query(User, Group).join(Group.users).filter(Group.group_id == group_id).all()
    return flask.jsonify([
        {
            "user_id": user[0].user_id,
            "username": user[0].username,
        }
        for user in users
    ])


@app.route('/api/get_all_users')
def get_all_users():
    users = db.session.query(User).all()
    return flask.jsonify([
        {
            "user_id": user.user_id,
            "username": user.username,
        }
        for user in users
    ])


@app.route("/api/create_group", methods=["POST"])
def create_group():
    request_data = flask.request.form
    group_name = request_data['group_name']
    new_group = Group(name=group_name)
    db.session.add(new_group)

    user = db.session.query(User).filter(User.user_id == current_user).first()
    new_group.users.append(user)

    db.session.commit()
    print(new_group)
    message = {
        "group_id": new_group.group_id,
        "group_name": group_name,
    }

    return flask.jsonify(message)


if __name__ == '__main__':
    app.run()
