var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var booksRouter = require('./routes/books');

var app = express();


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', booksRouter);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error();
  err.status = 404;
  err.message = 'Page Not Found';
  console.log(`404 error has occurred. (${err.status} - ${err.message})`);
  res.render('page-not-found', {err});
});

// error handler
app.use((err, req, res, next) => {
  //Throws Page Not Found error for 404 errors and generic error for all other errors.
  if (err.status === 404) {
    err.message = err.message || 'Page Not Found!';
    console.log(`404 error has occurred. (${err.status} - ${err.message})`);
    res.status(err.status).render('page-not-found', {err});
  } else {
    console.log(err)
    err.message = err.message || 'Oops, something went wrong!';
    err.status = err.status || 500;
    console.log(`An error has occurred. (${err.status} - ${err.message})`);
    res.status(err.status).render('error', {err});
    }
});

module.exports = app;
