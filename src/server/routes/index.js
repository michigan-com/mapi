'use strict';

import { Router } from 'express';

import v1 from './v1';
import { Article, Toppages } from '../db';
import { Catch } from '../lib/index';
import debug from 'debug';
var logger = debug('app:route');

var router = Router();

router.get('/', function(req, res, next) {
  res.render('index');
});

router.get('/test_socket/', function(req, res, next) {
  res.render('test_socket');
});

router.get('/popular/', Catch(async function(req, res, next) {
  let snapshot = await Toppages.findOne().sort({ _id: 1 }).exec();
  req.io.emit('got_popular', { snapshot });
  res.json({ success: true });

  // Remove all not new snapshots
  logger("Removing past snapshots");
  let result = await Toppages.find().remove({ _id: { $ne: snapshot._id }});
  logger("removed");
}));

function articles(socket) {
  socket.on('get_articles', Catch(async function(req, res, next) {
    let articles = await Article.find(req.data).exec();
    socket.emit('got_articles', { articles, filters: req.data });
  }));
}

function popular(socket) {
  socket.on('get_popular', Catch(async function() {
    let snapshot = await Toppages.findOne().sort({ _id: 1 }).exec();
    socket.emit('got_popular', { snapshot });
  }));
}

function getPopular() {
  return Toppage.find().sort({ _id: 1 }).limit(1);
}

module.exports = { index: router, v1, popular, articles };
