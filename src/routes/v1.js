'use strict';

import { Router } from 'express';
import _each from 'lodash/collection/forEach';

import { Article } from '../db';
import logger from  '../logger';
import getAsync from '../lib/promise';
import { stripHost, removeExtraSpace } from '../lib/parse';
import { sites, sections } from '../lib/constant';

var router = Router();

router.get('/news/', handleNews);
router.get('/news/:site/', handleNews);
router.get('/news/:site/:section/', handleNews);

function handleNews(req, res, next) {
  return news(req, res, next).catch(function(err) {
    //logger.error(err);
    next(err);
  });
}

async function news(req, res, next) {
  let siteNames = [for (site of sites) if (site) stripHost(site)];

  let requestedSites = 'site' in req.params ? req.params.site.split(',') : [];
  let requestedSections = 'section' in req.params ? req.params.section.split(',') : [];
  let limit = 'limit' in req.query ? req.query.limit : 0;

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
  }

  res.json({ articles: news });
}

module.exports = router;

