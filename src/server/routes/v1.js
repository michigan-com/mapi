'use strict';

import debug from 'debug';
var logger = debug('app:v1');

import { Router } from 'express';
import _each from 'lodash/collection/forEach';

import { Article } from '../db';
import getAsync from '../lib/promise';
import { stripHost, removeExtraSpace } from '../lib/parse';
import { sites, sections } from '../lib/constant';
import * as recipes from './v1/recipes';

var router = Router();

router.get('/article/:id/', function(req, res, next) {
  return (async function(req, res, next) {
    let article;
    try {
      article = await Article.findOne({ article_id: parseInt(req.params.id) }).exec();
    } catch(err) {
      next(err);
    }

    if (!article) {
      var err = new Error(`Could not find article with id ${req.params.id}`);
      err.status = 404;
      err.type = 'json';
      next(err);
      return;
    }

    res.json(article);
  })(req, res, next).catch(function(err) {
    next(err);
  });
});

router.get('/news/', handleNews);
router.get('/news/:site/', handleNews);
router.get('/news/:site/:section/', handleNews);
router.get('/recipes/', recipes.index);

function handleNews(req, res, next) {
  return news(req, res, next).catch(function(err) {
    next(err);
  });
}

async function news(req, res, next) {
  let DEFAULT_LIMIT = 100;
  let siteNames = [for (site of sites) if (site) stripHost(site)];

  let requestedSites = 'site' in req.params ? req.params.site.split(',') : [];
  let requestedSections = 'section' in req.params ? req.params.section.split(',') : [];
  let limit = 'limit' in req.query ? req.query.limit : DEFAULT_LIMIT;

  let mongoFilter = {};

  removeExtraSpace(requestedSites);
  removeExtraSpace(requestedSections);

  // Parse the sites params
  let invalidSites = [];
  _each(requestedSites, (site) => {
    if (siteNames.indexOf(site) == -1 && site != 'all') {
      invalidSites.push(site)
    }
  });

  if (invalidSites.length) {
    // unprocessable, throw correct response code
    let sites = invalidSites.join(', ');
    var err = new Error(`Invalid query argument, site '${sites}' not allowed`);
    err.status = 422;
    err.type = 'json';
    return next(err);
  }

  if (requestedSites.length && requestedSites.indexOf('all') == -1) {
    mongoFilter['source'] = { $in: requestedSites };
  }

  // Parse the section params
  let invalidSections = [];
  _each(requestedSections, (section) => {
    if (sections.indexOf(section) == -1) {
      invalidSections.push(section);
    }
  });

  if (invalidSections.length) {
    // unprocessable, throw correct response code
    let sections = invalidSections.join(', ');
    var err = new Error(`Invalid query argument, section '${sections}' not allowed`);
    err.status = 422;
    err.type = 'json';
    return next(err);
  }

  if (requestedSections.length) {
    mongoFilter['section'] = { $in: requestedSections };
  }

  let news;
  try {
    news = Article.find(mongoFilter);
    if (limit > 0) {
      news = news.limit(limit);
    }
    news = await news.exec();
  } catch(err) {
    var err = new Error(err);
    err.status = 500;
    err.type = 'json';
  }

  res.json({ articles: news });
}

module.exports = router;

