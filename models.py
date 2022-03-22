from database.database import db


group_junction_table = db.Table('UsersInGroups',
                                db.Column('user_id', db.Integer, db.ForeignKey('user.user_id')),
                                db.Column('group_id', db.Integer, db.ForeignKey('group.group_id')),
                                db.PrimaryKeyConstraint('user_id', 'group_id')
                                )


message_junction_table = db.Table('MessageUnseenByUser',
                                  db.Column('user_id', db.Integer, db.ForeignKey('user.user_id')),
                                  db.Column('msg_id', db.Integer, db.ForeignKey('message.msg_id')),
                                  db.PrimaryKeyConstraint('user_id', 'msg_id')
                                  )


class User(db.Model):
    user_id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.Text)
    email = db.Column(db.Text)
    password = db.Column(db.Text)
    unseen = db.relationship('Message', backref='user', cascade="all", secondary=message_junction_table)
    data_sent = db.Column(db.Integer)
    data_received = db.Column(db.Integer)
    avatar = db.Column(db.Text)


class Group(db.Model):
    group_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.Text)
    users = db.relationship('User', backref='group', cascade="all", secondary=group_junction_table)
    icon = db.Column(db.Text)


class Message(db.Model):
    msg_id = db.Column(db.Integer, primary_key=True)
    group_id = db.Column(db.Integer, db.ForeignKey('group.group_id'))
    sender_id = db.Column(db.Integer, db.ForeignKey('user.user_id'))
    group = db.relationship('Group', backref="message", cascade="all")
    sender = db.relationship('User', backref="message", cascade="all")
    msg = db.Column(db.Text)
    date = db.Column(db.DateTime)
    image = db.Column(db.Text)
