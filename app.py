import os
from flask import Flask, render_template, url_for, request, session, redirect, flash, Markup
from flask_pymongo import PyMongo
import bcrypt

app = Flask(__name__)

app.config['MONGO_DBNAME'] = 'colour_game'
app.config['MONGO_URI'] = 'mongodb://dushyant7917:abc123@ds149207.mlab.com:49207/colour_game'
# app.config['MONGO_URI'] = 'mongodb://localhost:27017/colour_game'

mongo = PyMongo(app)


@app.route('/')
def index():
    if 'username' in session:
        return render_template('dashboard.html')

    return render_template('login.html')


@app.route("/logout", methods = ['POST'])
def logout():
    current_score = request.form['current_score']
    current_level = request.form['current_level']
    users = mongo.db.users
    users.update({'_id': session['username']}, {'$set': {'score': current_score, 'level': current_level}})
    session.clear()
    return redirect(url_for('index'))


@app.route('/login', methods = ['POST'])
def login():
    users = mongo.db.users
    login_user = users.find_one({'name': request.form['username']})
    if login_user is not None:
        if bcrypt.hashpw(request.form['pass'].encode('utf-8'), login_user['password'].encode('utf-8')) == login_user['password'].encode('utf-8'):
            session['username'] = request.form['username']
            session['score'] = login_user['score']
            session['level'] = login_user['level']


            return redirect(url_for('index'))

    message = Markup("Invalid username or password!")
    flash(message)
    return render_template('login.html')


@app.route('/register', methods = ['GET', 'POST'])
def register():
    if request.method == 'POST':
        users = mongo.db.users
        existing_user = users.find_one({'name': request.form['username']})


        if existing_user is None:
            hashpass = bcrypt.hashpw(request.form['pass'].encode('utf-8'), bcrypt.gensalt())
            users.insert({'_id': request.form['username'], 'name': request.form['username'], 'password': hashpass, 'score': 0, 'level': 1})
            message = Markup("Registration successfull. Please login to continue...")
            flash(message)
            return redirect(url_for('index'))


        message = Markup("This username is already registered!")
        flash(message)
        return render_template('register.html')

    return render_template('register.html')


if __name__ == '__main__':
    app.secret_key = 'dushyant7917'
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port)
