from database.database import db


group_junction_table = db.Table('UsersInGroups',
                                db.Column('user_id', db.Integer, db.ForeignKey('user.user_id')),
                                db.Column('group_id', db.Integer, db.ForeignKey('group.group_id')),
                                )


class User(db.Model):
    user_id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.Text)
    password = db.Column(db.Text)
    groups = db.relationship('Group', backref='user', cascade="all", secondary=group_junction_table)


class Group(db.Model):
    group_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.Text)
    users = db.relationship('User', backref='group', cascade="all", secondary=group_junction_table)


class Message(db.Model):
    msg_id = db.Column(db.Integer, primary_key=True)
    group = db.ForeignKey('group.group_id')
    sender = db.ForeignKey('user.user_id')
    msg = db.Column(db.Text)
    date = db.Column(db.DateTime)
