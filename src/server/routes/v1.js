'use strict';

import debug from 'debug';
var logger = debug('app:v1');

import { Router } from 'express';

import { Article, Toppages, Quickstats, Topgeo, Referrers, Recent, TrafficSeries,
  ReferrerHistory, BreakingNews } from '../db';
import * as db from '../db';
import { Catch, v1NewsMongoFilter } from '../lib/index';
import * as recipes from './v1/recipes';
import * as analytics from './v1/analytics';

var router = Router();

router.get('/article/:id/', async function(req, res, next) {
  let article = await Article.findOne({
    article_id: parseInt(req.params.id),
  }).exec();

  if (!article) {
    let err = new Error(`Could not find article with id ${req.params.id}`);
    err.status = 404;
    err.type = 'json';
    return next(err);
  }

  res.json(article);
});

router.get('/articles/:idList/', async function(req, res) {
  const articleIds = req.params.idList.split(',');

  const articleDocs = await Article.find({
    article_id: {
      $in: articleIds,
    },
  });

  const articles = articleDocs.reduce((p, c) => {
    p[parseInt(c.article_id, 10)] = c;
    return p;
  }, {});

  res.json({
    articles,
  });
});

router.get('/article/', Catch(fetchAricles))
router.get('/articles/', Catch(fetchAricles))

async function fetchAricles(req, res, next) {
  // endpoint for frequency count in dashboard, for now
  // also for the browser extension
  
  let filter = {}

  let domains = []
  if (req.query.domains) {
    domains = req.query.domains.split(',')
  }
  if (domains.length > 0) {
    filter['domain'] = { $in: domains }
  }

  let fromDate = parseQueryDate(req.query.fromDate)
  if (fromDate) {
    filter['created_at'] = { $gt: fromDate }
  }

  if (req.query.photo == '1') {
    filter['photo'] = { $ne: {} }
  }

  // see lib/constant.js for valid sections
  if (req.query.sections) {
    let sections = req.query.sections.split(',')
    filter['section'] = { $in: sections }
  }

  let select = {body: -1, summary: -1}
  if (req.query.select) {
    let clauses = req.query.select.split(',')
    for (let clause of clauses) {
      let included = 1
      if (clause[0] == '-') {
        included = -1
        clause = clause.substr(1)
      }
      select[clause] = included
    }
  }
  
  let limit = 1000
  if (req.query.limit) {
    limit = parseInt(req.query.limit, 10)
    if (isNaN(limit)) {
      throw httpError(400, 'invalid limit')
    }
  }

  let articles = await Article.find(filter)
                              .select(select)
                              .limit(limit)
                              .sort('-timestamp')
                              .exec();
  res.json({ articles });
}

function parseQueryDate(queryValue) {
  if (queryValue == null) {
    return null
  }

  let timestamp = parseInt(queryValue, 10)
  if (isNaN(timestamp)) {
    timestamp = Date.parse(queryValue)
    if (isNaN(timestamp)) {
      throw httpError(400, `Invalid date`)
    }
    return new Date(queryValue);
  } else {
    if (timestamp < 10000000000 /* 1970-04-26 */) {
      timestamp *= 1000   // must be in seconds
    }
    return new Date(timestamp)
  }
}

function httpError(status, message) {
  var err = new Error(`Invalid date`)
  err.status = 400
  err.type = 'json'
  return err
}

router.get('/history/', Catch(async function(req, res) {
  let starting = new Date();
  if (req.query.fromSecondsAgo) starting.setSeconds(- req.query.fromSecondsAgo);
  else starting.setDate(starting.getDate() - (Date.parse(req.query.startingFrom) || req.query.startingDaysAgo || 7));
  let referrers = await ReferrerHistory.find({ created_at: { $gt: starting } }).batchSize(2016).sort({ created_at: -1 }).exec();
  res.json({ referrers });
}));

router.get('/snapshot/toppages/', getSnapshot(Toppages));
router.get('/snapshot/toppages/history', fetchHistoricalSnapshots(Toppages));
router.get('/snapshot/quickstats/', getSnapshot(Quickstats));
router.get('/snapshot/topgeo/', getSnapshot(Topgeo));
router.get('/snapshot/referrals/', getSnapshot(Referrers));
router.get('/snapshot/recent/', getSnapshot(Recent));
router.get('/snapshot/traffic-series/', getSnapshot(TrafficSeries));

router.get('/breaking-news', getSnapshot(BreakingNews));

router.get('/stats/domains/', Catch(analytics.loadDomainStats.expressRoute));
router.get('/stats/articles/', Catch(analytics.loadArticleStats.expressRoute));
router.get('/stats/authors/', Catch(analytics.loadAuthorStats.expressRoute));
router.get('/stats/referrers/', Catch(analytics.loadReferrers.expressRoute));

router.get('/totals/domains/', Catch(analytics.loadDomainTotals.expressRoute));
// router.get('/totals/articles/', Catch(analytics.loadArticleTotals.expressRoute));
// router.get('/totals/authors/', Catch(analytics.loadAuthorTotals.expressRoute));

/**
 * Fetch a Chartbeat Snapshot
 *
 * @param {Object} Collection - Mongo Collection representing a snapshot of
 *    return data from a Chartbeat API. E.g.: Toppages, Quickstats, Topgeo
 */
function getSnapshot(Collection) {
  return Catch(async function(req, res, next) {
    let snapshot = await Collection.findOne({}).sort({ created_at: -1 }).exec();

    if (!snapshot) {
      let err = new Error('Snapshot not found');
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
    let limit = ('limit' in req.query ? req.query.limit : 20);

    let snapshots = await Collection.find({}).sort({ created_at: -1 }).limit(limit).exec();

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
  let fromDate = parseQueryDate(req.query.fromDate)
  // TODO once we have the corresponding changes in the browser extension, uncomment the following line
  // to start filtering out non-photoed articles
  // let hasPhoto = 'hasPhoto' in req.query ? true : false;
  let hasPhoto = true;

  let mongoFilter = v1NewsMongoFilter(requestedSites, requestedSections, hasPhoto, next);
  if (!mongoFilter) return;

  if (fromDate) {
    mongoFilter.created_at = { $gt: fromDate }
  }

  let news;
  try {
    news = Article.find(mongoFilter).select('-body -summary');
    if (limit > 0) {
      news = news.limit(limit);
    }
    news = await news.sort({ timestamp: -1 }).exec();
  } catch (err) {
    var err = new Error(err);
    err.status = 500;
    err.type = 'json';
    return next(err);
  }

  res.json({ articles: news });
}

module.exports = router;
