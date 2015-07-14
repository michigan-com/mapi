'use strict';

import { Router } from 'express';
import _each from 'lodash/collection/forEach';

import { Article } from '../db';
import logger from  '../logger';
import getAsync from '../lib/promise';
import { stripHost } from '../lib/parse';
import { sites, modules } from '../lib/constant';

var router = Router();

router.get('/', function(req, res, next) {
  res.render('index');
});

router.get('/test_socket/', function(req, res, next) {
  res.render('test_socket');
});

router.get('/news/', news);
router.get('/news/:site/', news);
router.get('/news/:site/:section/', news);
router.get('/news/:site/:section/:moduleName/', news);

async function news(req, res, next) {
  let siteNames = [for (site of sites) if (site) stripHost(site)];

  let requestedSites = 'site' in req.params ? req.params.site.split(',') : siteNames;
  // let section = req.params.section || 'all';
  let moduleNames = 'moduleName' in req.params ? req.params.moduleName.split(',') : modules;
  let mongoFilter = {};

  // Parse the sites params
  let invalidSites = [];
  _each(requestedSites, (site) => {
    if (siteNames.indexOf(site) == -1) {
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

  mongoFilter.source = { $in: requestedSites };

  // Parse the moduleName param
  let invalidModules = [];
  _each(moduleNames, function(moduleName) {
    if (modules.indexOf(moduleName) == -1) {
      invalidModules.push(moduleName);
    }
  });

  if (invalidModules.length) {
    // unprocessable, throw correct response code
    let invalidModuleNames = invalidModules.join(', ');
    var err = new Error(`Invalid query argument, module '${invalidModuleNames}' not allowed`);
    err.status = 422;
    return next(err);
  }

  mongoFilter.module = { $in: moduleNames };

  let news;
  try {
    news = await Article.find(mongoFilter).sort({ created_at: -1 }).exec();
  } catch(err) {
    var err = new Error(err);
    err.status = 500;
  }

  res.json({ articles: news });
}

module.exports = router;
