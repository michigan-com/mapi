'use strict';

import path from 'path';
import express from 'express.io';

import routes from './routes/index';
import configureMiddleware from './middleware.js';

var BASE_DIR = path.dirname(__dirname);

var app = express();
app.http().io();
export default app;

configureViewEngine(app);
configureRoutes(app);
configureMiddleware(app);

function configureViewEngine(app) {
  app.set('views', path.join(BASE_DIR, 'views'));
  app.set('view engine', 'jade');
  if (app.get('env') == 'development') app.locals.pretty = true;
}

function configureRoutes(app) {
  /**
   * HACK -- Because michigan.com uses outlook for their @michigan.com email,
   * microsoft requests this file from all subdomains.
   * It is placed here so we don't see the HTTP requests in our logging
   */
  app.use('/autodiscover/autodiscover.xml', function(req, res, next) {
    res.send('');
  });

  app.use('/', routes.index);
  app.use('/v1/', routes.v1);
  routes.socket.articles(app);
  routes.socket.popular(app);
}

