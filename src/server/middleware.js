'use strict';

import path from 'path';
import morgan from 'morgan';
import express from 'express';
import favicon from 'serve-favicon';
import bodyParser from 'body-parser';
import errorhandler from 'errorhandler';
import cookieParser from 'cookie-parser';
import debug from 'debug';

var errLogger = debug('app:error');

import mail from './mail';

var BASE_DIR = path.dirname(__dirname);

export default function configureMiddleware(app) {
  var env = app.get('env');

  if (env === 'development' || env === 'testing') {
    app.use(morgan('dev'));
    // app.use(errorhandler());
  } else if (process.env.LOG_REQUEST) {
    app.use(morgan('combined'));
  }

  app.use(favicon(path.join(BASE_DIR, '/public/favicon.ico')));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(cookieParser());
  app.use(express.static(path.join(BASE_DIR, 'public')));
  errLogger('configuring middleware');

  // Define error handlers last as per http://expressjs.com/guide/error-handling.html
  app.use(function(err, req, res, next) {

    if (err.type != 'json') {
      next(err);
      return;
    }

    res.status(err.status || 500);
    res.json({
      message: err.message,
      error: err
    });

    next();
  });

  app.use(function(err, req, res, next) {
    errLogger('Error email middleware');
    mail.mailOptions.text = `
    Status: ${err.status}
    -----
    Request: ${req.originalUrl}
    -----
    Error: ${err.message}
    -----
    Stacktrace: ${err.stack}`;

    mail.transporter.sendMail(mail.mailOptions, function(error, info) {
      if (error) errLogger.error(error);
      if (mail.type == 'stub') errLogger.info(info.response.toString());
    });
  });
}
