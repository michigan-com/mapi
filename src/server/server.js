'use strict';

import mongoose from 'mongoose';
import debug from 'debug';
var logger = debug('app:status');

import { app, server, io } from './app';
import { connect, disconnect } from './db';

mongoose.connection.on('error', logger);

connect(process.env.MONGO_URI || 'localhost/mapi').then(startListening).catch(function(err) {
  throw err;
});

var port = normalizePort(process.env.NODE_PORT || '3000');
app.set('port', port);

server.on('close', function() {
  logger("Closed nodejs application ...");
  disconnect();
});

logger(`Environment: ${app.get('env')}`);

process.on('SIGTERM', () => {
  logger('Shutting down...')
  server.close(() => {
    process.exit(0);
  });
});

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
