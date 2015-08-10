'use strict';

import mongoose from 'mongoose';

import app from './app';
import logger from './logger';
import news from './get/news';
import { connect, disconnect } from './db';
import { db } from '../config';

mongoose.connection.on('error', logger.error);

connect(process.env.MAPI_DB || db).then(function() {
  //news.scheduleTask(app);
}).catch(function(err) {
  throw new Error(err);
});

var port = normalizePort(process.env.PORT || '3000');
app.set('port', port);

logger.info(`[SERVER] Environment: ${app.get('env')}`);
var server = app.listen(port, '0.0.0.0', function(err) {
  if (err) throw new Error(err);

  let host = this.address();
  logger.info(`[SERVER] Started on ${host.address}:${host.port}`);
});

server.on('close', function() {
  logger.info("[SERVER] Closed nodejs application ...");
  disconnect();
});

process.on('SIGTERM', function () {
  server.close();
});

function normalizePort(val) {
  var port = parseInt(val, 10);
  if (isNaN(port)) return val;
  if (port >= 0) return port;
  return false;
}

module.exports = server;
