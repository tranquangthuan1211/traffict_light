require('dotenv').config();
var log4js = require('log4js');
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var mongoose = require('mongoose');
var cors = require('cors');

mongoose.connect('mongodb://127.0.0.1:27017/f8_education_dev', {useNewUrlParser: true, 
	useFindAndModify: false, useUnifiedTopology: true, useCreateIndex: true});

var log = log4js.getLogger('app');

var pageRouter = require('./routes/page.route');
var userRouter = require('./routes/user.route');
var vehicleRouter = require('./routes/vehicle.route');
var intersectionRouter = require('./routes/intersection.route');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(log4js.connectLogger(log4js.getLogger('http'), { level: 'auto' }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', pageRouter);
app.use('/user', userRouter);
app.use('/vehicle', cors(), vehicleRouter);
app.use('/intersection', cors(), intersectionRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
	next(createError(404));
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        log.error("Something went wrong:", err);
        res.status(err.status || 500);
        res.render('error/index.pug', {
            message: err.message,
            code: err.status
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    log.error("Something went wrong:", err);
    res.status(err.status || 500);
    res.render('error/index.pug', {
        message: err.message,
        code: err.status
    });
});

module.exports = app;