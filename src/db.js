'use strict';

import mongoose from 'mongoose';
import { db } from '../config';
import logger from './logger';

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
  logger.info(`[DATABASE] Connecting to: ${dbString}`);
  return new Promise(function(resolve, reject) {
    mongoose.connect(dbString, options, function(err) {
      if (err) reject(err);
      logger.info('[DATABASE] Connected to mongodb!');
      resolve(true);
    });
  });
}

function disconnect() {
  logger.info('[DATABASE] Disconnecting from mongodb ...');
  return new Promise(function(resolve, reject) {
    mongoose.disconnect(function(err) {
      if (err) reject(err);
      logger.info('[DATABASE] Disconnected from mongodb!');
      resolve(true);
    });
  });
}

var ArticleSchema = new Schema({
  photo: {
    caption: { type: String, default: null },
    credit: { type: String, default: null },
    full: {
      url: { type: String },
      width: { type: Number, default: null },
      height: { type: Number, default: null }
    },
    thumbnail: {
      url: { type: String, default: null },
      width: { type: Number, default: null },
      height: { type: Number, default: null }
    }
  },
  section: { type: String },
  subsection: { type: String },
  source: { type: String, trim: true },
  summary: { type: String },
  headline: { type: String },
  subheadline: { type: String, default: null },
  created_at: { type: Date, default: Date.now },
  url: { type: String },
  timestamp: { type: Date, default: null }
});

module.exports = {
  Article: mongoose.model('Article', ArticleSchema),
  connect,
  disconnect
};
