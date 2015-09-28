'use strict';

import debug from 'debug';
var logger = debug('app:v1');

import { Router } from 'express';

import { Article } from '../db';
import { Catch, StripHost, RemoveExtraSpace, Sites, Sections } from '../lib/index';
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
router.get('/recipes/', Catch(recipes.index));

async function news(req, res, next) {
  let DEFAULT_LIMIT = 100;
  let siteNames = [for (site of Sites) if (site) StripHost(site)];

  let requestedSites = 'site' in req.params ? req.params.site.split(',') : [];
  let requestedSections = 'section' in req.params ? req.params.section.split(',') : [];
  let limit = 'limit' in req.query ? req.query.limit : DEFAULT_LIMIT;

  let mongoFilter = {};

  RemoveExtraSpace(requestedSites);
  RemoveExtraSpace(requestedSections);

  // Parse the sites params
  let invalidSites = [];
  for (let i = 0; i < requestedSites.length; i++) {
    let site = requestedSites[i];
    if (siteNames.indexOf(site) == -1 && site != 'all') {
      invalidSites.push(site)
    }
  }

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
  for (let i = 0; i < requestedSections.length; i++) {
    let section = requestedSections[i];
    if (Sections.indexOf(section) == -1) {
      invalidSections.push(section);
    }
  }

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

