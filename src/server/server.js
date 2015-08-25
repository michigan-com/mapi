'use strict';

import mongoose from 'mongoose';
import debug from 'debug';
var logger = debug('app:status');

import app from './app';
import { connect, disconnect } from './db';
import { db } from '../config';

mongoose.connection.on('error', logger);

connect(process.env.MAPI_DB || db).catch(function(err) {
  throw err;
});

var port = normalizePort(process.env.NODE_PORT || '3000');
app.set('port', port);

logger(`Environment: ${app.get('env')}`);
var server = app.listen(port, '0.0.0.0', function(err) {
  if (err) throw new Error(err);

  let host = this.address();
  logger(`Started on ${host.address}:${host.port}`);
});
export default server;

server.on('close', function() {
  logger("Closed nodejs application ...");
  disconnect();
});

function normalizePort(val) {
  var port = parseInt(val, 10);
  if (isNaN(port)) return val;
  if (port >= 0) return port;
  return false;
}

