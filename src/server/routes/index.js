'use strict';

import { Router } from 'express';

import v1 from './v1';
import { Article, Toppages, Quickstats, Topgeo } from '../db';
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
  let snapshot = await getPopular().exec();
  req.io.emit('got_popular', { snapshot });
  res.json({ success: true });
}));

router.get('/quickstats/', Catch(async function(req, res, next) {
  let snapshot = await getQuickstats().exec();
  req.io.emit('got_quickstats', { snapshot });
  res.json({ success: true });
}))

router.get('/topgeo/', Catch(async function(req, res, next) {
  let snapshot = await getTopgeo().exec();
  req.io.emit('got_topgeo', { snapshot });
  res.json({ success: true });
}))

function articles(socket) {
  socket.on('get_articles', Catch(async function(req, res, next) {
    let filter = req.data || {};
    let articles = await Article.find(req.data).exec();
    socket.emit('got_articles', { articles, filters: req.data });
  }));
}

function popular(socket) {
  socket.on('get_popular', Catch(async function() {
    let snapshot = await getPopular().exec();
    socket.emit('got_popular', { snapshot });
  }));
}

function quickstats(socket) {
  socket.on('get_quickstats', Catch(async function() {
    let snapshot = await getQuickstats().exec();
    socket.emit('got_quickstats', { snapshot })
  }));
}

function topgeo(socket) {
  socket.on('get_topgeo', Catch(async function() {
    let snapshot = await getTopgeo().exec();
    socket.emit('got_topgeo', { snapshot });
  }));
}

function getPopular() {
  return Toppages.findOne().sort({ _id: -1 });
}

function getQuickstats() {
  return Quickstats.findOne().sort({ _id: -1 });
}

function getTopgeo() {
  return Topgeo.findOne().sort({ _id: -1 });
}

module.exports = { index: router, v1, popular, articles, quickstats, topgeo };
