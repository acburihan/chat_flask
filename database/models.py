from database.database import db


class TaskList(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.Text)
    tasks = db.relationship('Task', backref='tasks_list', lazy='dynamic')


class Task(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    label = db.Column(db.Text)
    isDone = db.Column(db.Boolean)
    task_list_id = db.Column(db.Integer, db.ForeignKey('task_list.id'))

