'use strict';

import path from 'path';

import log4js from 'log4js';
import express from 'express.io';
import favicon from 'serve-favicon';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';

import mail from './mail';
import logger from './logger';
import routes from './routes/index';
import { log_level } from '../config';

var app = express();
app.http().io();

var app_env = app.get('env');
var BASE_DIR = path.dirname(__dirname);
var apiErrorCodes = [422];

if (app_env === 'production') {
  logger.setLevel('INFO');
}

app.set('views', path.join(BASE_DIR, 'views'));
app.set('view engine', 'jade');

app.use(favicon(path.join(BASE_DIR, '/public/favicon.ico')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(BASE_DIR, 'public')));

/**
 * HACK -- Because michigan.com uses outlook for their @michigan.com email,
 * microsoft requests this file from all subdomains.
 * It is placed here so we don't see the HTTP requests in our logging
 */
app.use('/autodiscover/autodiscover.xml', function(req, res, next) {
  res.send('');
});

app.use(log4js.connectLogger(logger));

app.use('/', routes.index);
app.use('/v1/', routes.v1);
routes.socket.articles(app);

app.use(function(err, req, res, next) {
  if (apiErrorCodes.indexOf(err.status) == -1) {
    logger.error(err);
    next(err);
  } else {
    res.status(err.status || 500);
    res.json({
      message: err.message,
      error: err
    });
  }
});

if (app_env === 'development' || app_env === 'testing') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

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

module.exports = app;

