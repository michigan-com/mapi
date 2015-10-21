'use strict';

import mongoose from 'mongoose';
import debug from 'debug';
var logger = debug('app:status');

import { app, server, io } from './app';
import { connect, disconnect } from './db';
import { db } from '../config';

mongoose.connection.on('error', logger);

connect(process.env.MAPI_DB || db).then(startListening).catch(function(err) {
  throw err;
});

var port = normalizePort(process.env.NODE_PORT || '3000');
app.set('port', port);

server.on('close', function() {
  logger("Closed nodejs application ...");
  disconnect();
});

logger(`Environment: ${app.get('env')}`);

function startListening() {
  server.listen(port, '0.0.0.0', function(err) {
    if (err) throw new Error(err);

    let host = this.address();
    logger(`Started on ${host.address}:${host.port}`);
  });
}

function normalizePort(val) {
  var port = parseInt(val, 10);
  if (isNaN(port)) return val;
  if (port >= 0) return port;
  return false;
}

