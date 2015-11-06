'use strict';

import mongoose from 'mongoose';
import debug from 'debug';
var logger = debug('app:db');

export let ObjectId = mongoose.mongo.ObjectId;
export const safe = { w: 'majority' };

export let recipes = null;

var Schema = mongoose.Schema;

export let Recipe = mongoose.model('Recipe', new Schema({}), 'Recipe');
export let Article = mongoose.model('Article', new Schema({}), 'Article');
export let Toppages = mongoose.model('Toppages', new Schema({}), 'Toppages');
export let Quickstats = mongoose.model('Quickstats', new Schema({}), 'Quickstats');
export let Topgeo = mongoose.model('Topgeo', new Schema({}), 'Topgeo');
export let Referrers = mongoose.model('Referrers', new Schema({}), 'Referrers');
export let Recent = mongoose.model('Recent', new Schema({}), 'Recent');
export let TrafficSeries = mongoose.model('TrafficSeries', new Schema({}), 'TrafficSeries');

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
  recipes = Recipe.collection;
}

export function verifyUpdateResult(result, message404, message500) {
  if (result.result.ok !== 1) {
    console.error('Mongo update result (!ok): %j %s', result, require('util').inspect(result));
    let err = new Error(message500 || 'Update failed');
    err.status = 500;
    err.type = 'json';
    throw err;
  }
  if (result.matchedCount === 0) {
    console.error('Mongo update result (n=0): %j', result);
    let err = new Error(message404 || 'Not found');
    err.status = 404;
    err.type = 'json';
    throw err;
  }
  return result;
}
