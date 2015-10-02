'use strict';

import debug from 'debug';
var logger = debug('app:v1');

import { Router } from 'express';

import { Article } from '../db';
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

router.get('/news/', Catch(news));
router.get('/news/:site/', Catch(news));
router.get('/news/:site/:section/', Catch(news));
router.get('/recipes/', recipes.index);

async function news(req, res, next) {
  let DEFAULT_LIMIT = 100;

  let requestedSites = 'site' in req.params ? req.params.site.split(',') : [];
  let requestedSections = 'section' in req.params ? req.params.section.split(',') : [];
  let limit = 'limit' in req.query ? req.query.limit : DEFAULT_LIMIT;

  let mongoFilter = v1NewsMongoFilter(requestedSites, requestedSections, next);
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
