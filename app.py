import flask
from database.database import db, init_database
from models import Message
from datetime import datetime
import json

app = flask.Flask(__name__)

app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///database/database.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db.init_app(app)
with app.test_request_context():
    init_database()


@app.route('/')
def hello_world():
    return flask.render_template("index.html.jinja2")


@app.route("/api/send_message", methods=["POST"])
def send_message():
    request_data = flask.request.form
    from_user = request_data['from_user']
    to_user = request_data['to_user']
    msg = request_data['msg']
    channel = request_data['channel']

    new_message = Message(channel=channel, msg=msg, date=datetime.today())
    new_message.from_user = from_user
    new_message.to_user = to_user
    db.session.add(new_message)
    db.session.commit()

    message = {
        "from_user": from_user,
        "to_user": to_user,
        "msg": msg,
        "channel": channel
    }

    return flask.jsonify(message)


@app.route('/api/get_message/<channel_id>')
def user_messages(channel_id):
    messages = db.session.query(Message).all() # .filter(Message.channel == channel_id).all()

    return flask.jsonify([
        {
            "id": message.id,
            "msg": message.msg,
            "date": message.date,
        }
        for message in messages
    ])


if __name__ == '__main__':
    app.run()
