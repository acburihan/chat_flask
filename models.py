from database.database import db


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.Text)
    password = db.Column(db.Text)


class Group(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.Text)
    channel = db.Column(db.Integer, db.ForeignKey('channel.id'))


group_junction_table = db.Table('UsersInGroups',
                                db.Column('user_id', db.Integer, db.ForeignKey('user.id')),
                                db.Column('group_id', db.Integer, db.ForeignKey('group.id')),
                                db.Column('joinDate', db.Text)
                                )


class Channel(db.Model):
    id = db.Column(db.Integer, primary_key=True)


channel_junction_table = db.Table('UsersChannel',
                                  db.Column('from_id', db.Integer, db.ForeignKey('user.id')),
                                  db.Column('to_id', db.Integer, db.ForeignKey('user.id')),
                                  db.Column('channel', db.Integer, db.ForeignKey('channel.id')),
                                  )


class Message(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    channel = db.Column(db.Integer)  # , db.ForeignKey('channel.id'))
    msg = db.Column(db.Text)
    date = db.Column(db.DateTime)
