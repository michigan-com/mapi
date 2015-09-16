'use strict';

import { Router } from 'express';

import v1 from './v1';
import { Article, Toppages } from '../db';
import { Catch } from '../lib/index';
import debug from 'debug';
var logger = debug('app:db');

var router = Router();

router.get('/', function(req, res, next) {
  res.render('index');
});

router.get('/test_socket/', function(req, res, next) {
  res.render('test_socket');
});

router.get('/popular/', Catch(async function(req, res, next) {
  let snapshot = await Toppages.findOne().sort({ _id: 1 }).exec();
  req.io.broadcast('got_popular', { snapshot });
  res.json({ success: true });
}));

var socket = {
  articles: function(app) {
    return app.io.route('get_articles', Catch(async function(req, res, next) {
      let articles = await Article.find(req.data).exec();
      req.io.emit('got_articles', { articles, filters: req.data });
    }));
  },
  popular: function(app) {
    return app.io.route('get_popular', Catch(async function(req, res, next) {
      let snapshot = await Toppages.findOne().sort({ _id: 1 }).exec();
      req.io.emit('got_popular', { snapshot });
    }));
  }
};

function getPopular() {
  return Toppage.find().sort({ _id: 1 }).limit(1);
}

module.exports = { index: router, v1, socket };
