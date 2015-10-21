'use strict';

import mongoose from 'mongoose';
import debug from 'debug';
var logger = debug('app:db');

import { db } from '../config';

export let mdb = {};
export let ObjectId = mongoose.mongo.ObjectId;


if (typeof db === 'undefined') {
  throw new Error("`db` key in config.js is required to connect to mongodb, ex: db: 'mongodb://localhost:27017/db'");
}

var Schema = mongoose.Schema;

export let Recipe = mongoose.model('Recipe', new Schema({}), 'Recipe');
export let Article = mongoose.model('Article', new Schema({}), 'Article');
export let Toppages = mongoose.model('Toppages', new Schema({}), 'Toppages');
export let Quickstats = mongoose.model('Quickstats', new Schema({}), 'Quickstats');
export let Topgeo = mongoose.model('Topgeo', new Schema({}), 'Topgeo');
export let Referrers = mongoose.model('Referrers', new Schema({}), 'Referrers');


const defaults = {
  server: {
    socketOptions: { keepAlive: 1 }
  }
};

export function connect(dbString, options=defaults) {
  if (!dbString) throw new Error('dbString must be defined');

  logger(`Connecting to: ${dbString}`);
  return new Promise(function(resolve, reject) {
    mongoose.connect(dbString, options, function(err) {
      if (err) reject(err);
      logger('Connected to mongodb!');
      setupCollections();
      resolve(true);
    });
  });
}

export function disconnect() {
  logger('Disconnecting from mongodb ...');
  return new Promise(function(resolve, reject) {
    mongoose.disconnect(function(err) {
      if (err) reject(err);
      logger('Disconnected from mongodb!');
      resolve(true);
    });
  });
}

function setupCollections() {
  mdb.recipes = Recipe.collection;
}
