'use strict';

import debug from 'debug';
var logger = debug('app:v1');

import { Router } from 'express';

import { Article, Toppages, Quickstats, Topgeo } from '../db';
import { Catch, v1NewsMongoFilter } from '../lib/index';
import * as recipes from './v1/recipes';

var router = Router();

router.get('/article/:id/', Catch(async function(req, res, next) {
  let article = await Article.findOne({ article_id: parseInt(req.params.id) }).exec();

  if (!article) {
    var err = new Error(`Could not find article with id ${req.params.id}`);
    err.status = 404;
    err.type = 'json';
    return next(err);
  }

  res.json(article);
}));

router.get('/snapshot/toppages/', getSnapshot(Toppages));
router.get('/snapshot/quickstats/', getSnapshot(Quickstats));
router.get('/snapshot/topgeo/', getSnapshot(Topgeo));

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

router.get('/news/', Catch(news));
router.get('/news/:site/', Catch(news));
router.get('/news/:site/:section/', Catch(news));
router.get('/recipes/', Catch(recipes.index));

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
