import flask

app = flask.Flask(__name__)


@app.route('/')
def hello_world():  # put application's code here
    return flask.render_template("index.html.jinja2")


if __name__ == '__main__':
    app.run()
