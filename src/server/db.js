'use strict';

import mongoose from 'mongoose';
import debug from 'debug';
var logger = debug('app:db');

import { db } from '../config';

if (typeof db === 'undefined') {
  throw new Error("`db` key in config.js is required to connect to mongodb, ex: db: 'mongodb://localhost:27017/db'");
}

var Schema = mongoose.Schema;

const defaults = {
  server: {
    socketOptions: { keepAlive: 1 }
  }
};

function connect(dbString=db, options=defaults) {
  logger(`Connecting to: ${dbString}`);
  return new Promise(function(resolve, reject) {
    mongoose.connect(dbString, options, function(err) {
      if (err) reject(err);
      logger('Connected to mongodb!');
      resolve(true);
    });
  });
}

function disconnect() {
  logger('Disconnecting from mongodb ...');
  return new Promise(function(resolve, reject) {
    mongoose.disconnect(function(err) {
      if (err) reject(err);
      logger('Disconnected from mongodb!');
      resolve(true);
    });
  });
}

module.exports = {
  Article: mongoose.model('Article', new Schema({}), 'Article'),
  connect,
  disconnect
};
