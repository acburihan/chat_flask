import flask
from database.database import db, init_database

app = flask.Flask(__name__)

app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///database/database.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db.init_app(app)
with app.test_request_context():
    init_database()


@app.route('/')
def hello_world():
    return flask.render_template("index.html.jinja2")


# To listen to a change in the database
# listen(models.Message, "after_create", load())

if __name__ == '__main__':
    app.run()
