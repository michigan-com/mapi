'use strict';

import mongoose from 'mongoose';
import debug from 'debug';
var logger = debug('app:db');

export let ObjectId = mongoose.mongo.ObjectId;
export const safe = { w: 'majority' };

export let recipes = null;

var Schema = mongoose.Schema;

export let Recipe = mongoose.model('Recipe', new Schema({}), 'Recipe');
export let Article = mongoose.model('Article', new Schema({
  inserted_at: {
    type: Date,
    expires: '90d',
  },
  created_at: {
    type: Date,
    index: true,
  },
  article_id: {
    type: Number,
    index: true,
  },
}), 'Article');
export const Toppages = mongoose.model('Toppages', new Schema({}), 'Toppages');
export const Quickstats = mongoose.model('Quickstats', new Schema({}), 'Quickstats');
export const Topgeo = mongoose.model('Topgeo', new Schema({}), 'Topgeo');
export const Referrers = mongoose.model('Referrers', new Schema({}), 'Referrers');
export const Recent = mongoose.model('Recent', new Schema({}), 'Recent');
export const TrafficSeries = mongoose.model('TrafficSeries', new Schema({}), 'TrafficSeries');
export const ReferrerHistory = mongoose.model('ReferrerHistory', new Schema({}), 'ReferrerHistory');
export const BreakingNews = mongoose.model('BreakingNews', new Schema({}), 'BreakingNews');

export const TopPagesV3 = mongoose.model('TopPagesV3', new Schema({
  d: {
    type: String,
    index: true,
  },
  tm: {
    type: Date,
    index: true,
  },
}), 'TopPagesV3');
export const QuickStatsV3 = mongoose.model('QuickStatsV3', new Schema({
  d: {
    type: String,
    index: true,
  },
  tm: {
    type: Date,
    index: true,
  },
  v: {
    article: {
      type: Number,
      index: true,
    },
    recirc: {
      type: Number,
      index: true,
    },
    v: {
      type: Number,
      index: true,
    },
  },
}), 'QuickStatsV3');
export const TopGeoV3 = mongoose.model('TopGeoV3', new Schema({
  d: {
    type: String,
    index: true,
  },
  tm: {
    type: Date,
    index: true,
  },
}), 'TopGeoV3');
export const ReferrersV3 = mongoose.model('ReferrersV3', new Schema({
  d: {
    type: String,
    index: true,
  },
  tm: {
    type: Date,
    index: true,
  },
}), 'ReferrersV3');
export const RecentV3 = mongoose.model('RecentsV3', new Schema({
  d: {
    type: String,
    index: true,
  },
  tm: {
    type: Date,
    index: true,
  },
}), 'RecentsV3');
export const TrafficSeriesDailyV3 = mongoose.model('TrafficSeriesDailyV3', new Schema({
  d: {
    type: String,
    index: true,
  },
  tm: {
    type: Date,
    index: true,
  },
}), 'TrafficSeriesDailyV3');

export const PlatformStatsDaily = mongoose.model('PlatformStatsDaily', new Schema({}), 'PlatformStatsDaily');
export const AuthorDaily = mongoose.model('AuthorsV3', new Schema({}), 'AuthorsV3');
export const ArticlesV3 = mongoose.model('ArticlesV3', new Schema({
  aid: {
    type: String,
    index: true,
  },
  v: {
    v: {
      type: Number,
      index: true,
    },
    recirc: {
      type: Number,
      index: true,
    },
    engtm: {
      avg: {
        type: Number,
        index: true,
      },
    },
  },
}), 'ArticlesV3');
export const DomainTotals = mongoose.model('DomainTotalsV3', new Schema({}), 'DomainTotalsV3');
export const ReferrersDaily = mongoose.model('ReferrersDaily', new Schema({}), 'ReferrersDaily');

const defaults = {
  server: {
    socketOptions: { keepAlive: 1 },
  },
};

export function connect(dbString, options = defaults) {
  if (!dbString) throw new Error('dbString must be defined');

  logger(`Connecting to: ${dbString}`);
  return new Promise(function (resolve, reject) {
    mongoose.connect(dbString, options, function (err) {
      if (err) reject(err);
      logger('Connected to mongodb!');
      setupCollections();
      resolve(true);
    });
  });
}

export function disconnect() {
  logger('Disconnecting from mongodb ...');
  return new Promise(function (resolve, reject) {
    mongoose.disconnect(function (err) {
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
