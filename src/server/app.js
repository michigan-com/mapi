'use strict';

import path from 'path';
import http from 'http';
import mongoose from 'mongoose';
import Express from 'express';
import SocketIO from 'socket.io';
import debug from 'debug';

var logger = debug('app:app');

import { router, v1 } from './routes/index';
import { initSocketLoop } from './sockets';
import configureMiddleware from './middleware.js';
import publications from './publications';

var BASE_DIR = path.dirname(__dirname);

var app = Express();
var server = http.Server(app);
var io = SocketIO(server);

configureViewEngine(app);
configureRoutes(app, io);
configureMiddleware(app);

if (app.get('env') == 'development') {
  app.set('json spaces', 2);
  mongoose.set('debug', true);
}

function configureViewEngine(app) {
  app.set('views', path.join(BASE_DIR, 'views'));
  app.set('view engine', 'jade');
  if (app.get('env') == 'development') app.locals.pretty = true;
}

function configureRoutes(app, io) {
  /**
   * HACK -- Because michigan.com uses outlook for their @michigan.com email,
   * microsoft requests this file from all subdomains.
   * It is placed here so we don't see the HTTP requests in our logging
   */
  app.use('/autodiscover/autodiscover.xml', function (req, res, next) {
    res.send('');
  });

  app.use(function (req, res, next) {
    req.io = io;
    next();
  });

  app.use('/', router);
  app.use('/v1/', v1);

  io.on('connection', (socket) => {
    // sockets.newSocketConnection(socket);
    logger('new socket connection!');

    socket.on('register', (data) => {
      logger(`register: ${JSON.stringify(data)}`);
      const domains = data.domains || [];

      for (const domain of domains) {
        const hostname = domain.replace('.com', '');
        if (!(hostname in publications)) {
          logger(`hostname ${hostname} is not valid`);
        } else {
          logger(`Socket joining ${domain} room`);
          socket.join(domain);
        }
      }
    });

    socket.on('unregister', (data) => {
      const domains = data.domains || [];

      for (const domain of domains) {
        const hostname = domain.replace('.com', '');
        if (!(hostname in publications)) {
          logger(`hostname ${hostname} is not valid`);
        } else {
          socket.leave(domain);
        }
      }
    });
  });

  initSocketLoop(io);
}

module.exports = { app, server, io };
