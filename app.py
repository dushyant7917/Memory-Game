from flask import Flask, render_template, url_for, request, session, redirect, flash, Markup
from flask.ext.pymongo import PyMongo
import bcrypt

app = Flask(__name__)

app.config['MONGO_DBNAME'] = 'colour_game'
app.config['MONGO_URI'] = 'mongodb://localhost:27017/colour_game'

mongo = PyMongo(app)


@app.route('/')
def index():
    if 'username' in session:
        return render_template('dashboard.html')

    return render_template('index.html')


@app.route("/logout", methods = ['POST'])
def logout():
    print "86878"
    current_score = request.form['current_score']
    current_level = request.form['current_level']
    print "57578"
    users = mongo.db.users
    print current_score + current_level
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
    return render_template('wrong_login.html')


@app.route('/register', methods = ['GET', 'POST'])
def register():
    if request.method == 'POST':
        users = mongo.db.users
        existing_user = users.find_one({'name': request.form['username']})


        if existing_user is None:
            hashpass = bcrypt.hashpw(request.form['pass'].encode('utf-8'), bcrypt.gensalt())
            users.insert({ '_id': request.form['username'], 'name': request.form['username'], 'password': hashpass, 'score': 0, 'level': 1})

            return redirect(url_for('index'))


        message = Markup("This username is already registered!")
        flash(message)
        return render_template('wrong_register.html')

    return render_template('register.html')


if __name__ == '__main__':
    app.secret_key = 'dushyant7917'
    app.run(debug=True)
