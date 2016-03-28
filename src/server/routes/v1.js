'use strict';

import debug from 'debug';
var logger = debug('app:v1');

import { Router } from 'express';

import { Article, Toppages, Quickstats, Topgeo, Referrers, Recent, TrafficSeries, ReferrerHistory } from '../db';
import { Catch, v1NewsMongoFilter } from '../lib/index';
import * as recipes from './v1/recipes';

var router = Router();

router.get('/article/:id/', async function(req, res, next) {
  let article = await Article.findOne({
    article_id: parseInt(req.params.id)
  }).exec();

  if (!article) {
    let err = new Error(`Could not find article with id ${req.params.id}`);
    err.status = 404;
    err.type = 'json';
    return next(err);
  }

  res.json(article);
});

router.get('/history/', Catch(async function(req, res) {
  let starting = new Date()
  starting.setDate(starting.getDate() - (req.query.startingDaysAgo || 7));
  let referrers = await ReferrerHistory.find({created_at: {$gt: starting}}).batchSize(2016).sort({ created_at: -1 }).exec()
  console.log(referrers)
  res.json({ referrers })
}));

router.get('/snapshot/toppages/', getSnapshot(Toppages));
router.get('/snapshot/toppages/history', fetchHistoricalSnapshots(Toppages));
router.get('/snapshot/quickstats/', getSnapshot(Quickstats));
router.get('/snapshot/topgeo/', getSnapshot(Topgeo));
router.get('/snapshot/referrals/', getSnapshot(Referrers));
router.get('/snapshot/recent/', getSnapshot(Recent));
router.get('/snapshot/traffic-series/', getSnapshot(TrafficSeries));

/**
 * Fetch a Chartbeat Snapshot
 *
 * @param {Object} Collection - Mongo Collection representing a snapshot of
 *    return data from a Chartbeat API. E.g.: Toppages, Quickstats, Topgeo
 */
function getSnapshot(Collection) {
  return Catch(async function(req, res, next) {
    let snapshot = await Collection.findOne({}).sort({created_at: -1}).exec();

    if (!snapshot) {
      let err = new Error(`Snapshot not found`);
      err.status = 404;
      err.type = 'json';
      return next(err);
    }

    res.json(snapshot);
  });
}

/**
 * Fetch the most recent Chartbeat snapshots (up to a given limit).
 *
 * @param {Object} Collection - Mongo Collection representing a snapshot of
 *    return data from a Chartbeat API. E.g.: Toppages, Quickstats, Topgeo
 */
function fetchHistoricalSnapshots(Collection) {
  return Catch(async function(req, res, next) {
    let limit = ('limit' in req.query ? req.query.limit : 20)

    let snapshots = await Collection.find({}).sort({created_at: -1}).limit(limit).exec();

    res.json(snapshots);
  });
}

router.get('/news/', Catch(news));
router.get('/news/:site/', Catch(news));
router.get('/news/:site/:section/', Catch(news));

router.get('/recipes/', Catch(recipes.index));
router.get('/recipes.:format', Catch(recipes.index));
router.put('/recipes/:recipeId/marks/:mark/', Catch(recipes.mark));

async function news(req, res, next) {
  let DEFAULT_LIMIT = 100;

  let requestedSites = 'site' in req.params ? req.params.site.split(',') : [];
  let requestedSections = 'section' in req.params ? req.params.section.split(',') : [];
  let limit = 'limit' in req.query ? req.query.limit : DEFAULT_LIMIT;
  // TODO once we have the corresponding changes in the browser extension, uncomment the following line
  // to start filtering out non-photoed articles
  //let hasPhoto = 'hasPhoto' in req.query ? true : false;
  let hasPhoto = true;

  let mongoFilter = v1NewsMongoFilter(requestedSites, requestedSections, hasPhoto, next);
  if (!mongoFilter) return;

  let news;
  try {
    news = Article.find(mongoFilter);
    if (limit > 0) {
      news = news.limit(limit);
    }
    news = await news.sort({ timestamp: -1 }).exec();
  } catch(err) {
    var err = new Error(err);
    err.status = 500;
    err.type = 'json';
    return next(err);
  }

  res.json({ articles: news });
}

module.exports = router;
