'use strict';

import path from 'path';
import morgan from 'morgan';
import express from 'express';
import favicon from 'serve-favicon';
import bodyParser from 'body-parser';
import errorhandler from 'errorhandler';
import cookieParser from 'cookie-parser';

import mail from './mail';

var BASE_DIR = path.dirname(__dirname);
var apiErrorCodes = [422];

export default function configureMiddleware(app) {
  var env = app.get('env');
  app.use(function(err, req, res, next) {
    if (apiErrorCodes.indexOf(err.status) == -1) {
      next(err);
    } else {
      res.status(err.status || 500);
      res.json({
        message: err.message,
        error: err
      });
    }
  });

  if (env === 'development' || env === 'testing') {
    app.use(morgan('dev'));
    app.use(errorhandler());
  } else if (process.env.LOG_REQUEST) {
    app.use(morgan());
  }

  app.use(favicon(path.join(BASE_DIR, '/public/favicon.ico')));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(cookieParser());
  app.use(express.static(path.join(BASE_DIR, 'public')));

  app.use(function(err, req, res, next) {
    mail.mailOptions.text = `
    Status: ${err.status}
    -----
    Request: ${req.originalUrl}
    -----
    Error: ${err.message}
    -----
    Stacktrace: ${err.stack}`;

    mail.transporter.sendMail(mail.mailOptions, function(error, info) {
      if (error) logger.error(error);
      if (mail.type == 'stub') logger.info(info.response.toString());
    });
  });
}
