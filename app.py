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


@app.route('/')
def hello_world():
    return flask.render_template("index.html.jinja2")


@app.route('/groups')
def group_page():
    return flask.render_template("groups.html")


@app.route("/api/send_message", methods=["POST"])
def send_message():
    request_data = flask.request.form
    group = request_data['group']
    sender = request_data['sender']
    msg = request_data['msg']

    new_message = Message(msg=msg, date=datetime.today())
    new_message.sender = sender
    new_message.group = group
    db.session.add(new_message)
    db.session.commit()

    message = {
        "group": group,
        "sender": sender,
        "msg": msg,
    }

    return flask.jsonify(message)


@app.route('/api/get_message/<group_id>')
def user_messages(group_id):
    messages = db.session.query(Message).filter_by(group=group_id).all()

    return flask.jsonify([
        {
            "id": message.id,
            "msg": message.msg,
            "sender": message.sender,
            "date": message.date,
        }
        for message in messages
    ])


@app.route('/api/get_groups/<user_id>')
def get_groups(user_id):

    # new_user = User(username="User0", password="0000")
    # db.session.add(new_user)
    # new_user2 = User(username="User1", password="1111")
    # db.session.add(new_user2)
    #
    # new_group = Group(name="Group1")
    # db.session.add(new_group)
    #
    # new_group.users.append(new_user)
    # new_group.users.append(new_user2)
    #
    # # new_user.groups.append(new_group)
    # # new_user2.groups.append(new_group)
    #
    # db.session.commit()

    groups = db.session.query(Group, group_junction_table).filter(user_id == user_id).all()
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
    sender_id = request_data['sender']

    group = db.session.query(Group).filter_by(group_id=group_id).first()
    sender = db.session.query(User).filter_by(user_id=sender_id).first()
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

    group = db.session.query(Group).filter_by(group_id=group_id).first()
    user = db.session.query(User).filter_by(user_id=user_id).first()
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

    group = db.session.query(Group).filter_by(group_id=group_id).first()
    user = db.session.query(User).filter_by(user_id=user_id).first()
    group.users.remove(user)
    db.session.commit()

    response = {
        "group": group_id,
        "user": user_id,
    }

    return flask.jsonify(response)


@app.route('/api/get_users/<group_id>')
def get_users(group_id):
    users = db.session.query(User, group_junction_table).filter(group_id == group_id).all()
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

if __name__ == '__main__':
    app.run()
