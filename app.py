from flask import Flask
import flask
from database.database import db, init_database

from database.models import Task, TaskList
from misc.forms import NewTaskForm

app = flask.Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///database/database.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["SECRET_KEY"] = "secret_key1234"

db.init_app(app)

@app.route('/')
def hello_world():  # put application's code here
    return flask.render_template("index.html.jinja2")


if __name__ == '__main__':
    app.run()
