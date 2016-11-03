'use strict';

let mongoose = require('mongoose');
let Promise = require('bluebird');
mongoose.connect(process.env.MONGO_DB);
let db = mongoose.connection;
db.on('open', () =>console.log('Database connected'));
db.on('error', () =>console.log('Error: database was not reached.'));
mongoose.Promise = Promise;


var express = require('express');
var session = require('express-session');
var bootstrap = require('bootstrap');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var comparePassword = Promise.promisify(require('bcrypt').compare);

//Models
require('./models/users');

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//session
app.use(session({
  secret: 'silly me',
  resave: false,
  saveUninitialized: false
}));


//setup passport
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy((username, password, next) => {
  //looks up username by email
  let User = mongoose.model('User');
  User.findOne({email: username})
      .then(user =>{
        if(!user){
          //user not found
          next(new Error('User not found'));
        } else {
          //user found
          comparePassword(password, user.password)
            .then(result => {
              if(result){
                next(new Error('invalid username or password'))
              }
            })
              .catch(next);
        }
      })
      .catch(next);
}));

passport.serializeUser(function (user,done){
  done(null, user);
});

passport.deserializeUser(function (user,done){
  done(null, user);
});



// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
