import os

from flask import Flask, render_template, request, redirect, url_for
from flask_socketio import SocketIO, emit

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)

users = []
channels = ["General"]
user_channels = {} 
messages = {}

@app.route("/")
def index():
    return render_template('index.html', channels=channels)

@socketio.on("login")
def login(username):
    
    if username in users:
        emit("alert", f"usuario {username} ya existe!")
    else:
        users.append(username)
        emit("login", username)

@socketio.on("create channel")
def createchannel(channelname):
    if channelname in channels:
        emit("alert", f"Canal {channelname} ya existe!")
    else:
        channels.append(channelname)
        emit("channel created", channelname, broadcast=True)

@socketio.on("join channel")
def joinchannel(channelname, username):
    
    if username not in user_channels.keys():
        user_channels[username]=[]   
    
    if channelname not in user_channels[username]:
        user_channels[username].append(channelname)

    emit("channel joined", {'channelname':channelname, 'messages': messages})



@socketio.on("send message")
def sendmessage(channelname, username, message, date, time):

    if channelname not in messages.keys():
        messages[channelname]=[]
    
    data = (username, date, time, message)
    messages[channelname].append(data)

    emit("receive message", {'channelname':channelname, 'data':data}, broadcast=True)

#@socketio.on("delete message")
#def deletemessage(channelname, username, message, date, time):


