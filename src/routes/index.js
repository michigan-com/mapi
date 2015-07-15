'use strict';

import { Router } from 'express';

import v1 from './v1';
import { Article } from '../db';

var router = Router();

router.get('/', function(req, res, next) {
  res.render('index');
});

router.get('/test_socket/', function(req, res, next) {
  res.render('test_socket');
});

var socket = {
  articles: function(app) {
    return app.io.route('get_articles', async function(req) {
      let articles;
      try {
        articles = await Article.find(req.data).exec();
      } catch (err) {
        logger.error(err);
      }
      req.io.emit('got_articles', { articles, filters: req.data });
    });
  }
};
module.exports = { index: router, v1, socket };
