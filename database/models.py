from database import db


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.Text)
    password = db.Column(db.Text)


class Message(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user1 = db.Column(db.text, db.foreignKey('user.id'))
    user2 = db.Column(db.text, db.foreignKey('user.id'))
    msg = db.Column(db.text)
    date = db.Column(db.DateTime)


class Group(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.Text)


junction_table = db.Table('UsersInGroups',
                          db.Column('user_id', db.Integer, db.ForeignKey('user.id')),
                          db.Column('group_id', db.Integer, db.ForeignKey('group.id')),
                          db.Column('joinDate', db.Text)
                          )

