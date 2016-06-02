'use strict';

import { Router } from 'express';

import v1 from './v1';
import { Toppages, Quickstats, Topgeo, Referrers, Recent, TrafficSeries, BreakingNews } from '../db';
import { Catch } from '../lib/index';
import debug from 'debug';
var logger = debug('app:route');

var router = Router();
export { router as router };
export { v1 as v1 };

router.get('/', function(req, res, next) {
  res.render('index');
});

router.get('/popular/', Catch(async function(req, res, next) {
  let snapshot = await getSnapshot(Toppages).exec();
  req.io.emit('got_popular', { snapshot });
  res.json({ success: true });
}));

router.get('/quickstats/', Catch(async function(req, res, next) {
  let snapshot = await getSnapshot(Quickstats).exec();
  req.io.emit('got_quickstats', { snapshot });
  res.json({ success: true });
}));

router.get('/topgeo/', Catch(async function(req, res, next) {
  let snapshot = await getSnapshot(Topgeo).exec();
  req.io.emit('got_topgeo', { snapshot });
  res.json({ success: true });
}));

router.get('/referrers/', Catch(async function(req, res, next) {
  let snapshot = await getSnapshot(Referrers).exec();
  req.io.emit('got_referrers', { snapshot });
  res.json({ success: true });
}));

router.get('/recent/', Catch(async function(req, res, next) {
  let snapshot = await getSnapshot(Recent).exec();
  req.io.emit('got_recent', { snapshot });
  res.json({ success: true });
}));

router.get('/traffic-series/', Catch(async function(req, res, next) {
  let snapshot = await getSnapshot(TrafficSeries).exec();
  req.io.emit('got_traffic_series', { snapshot });
  res.json({ success: true });
}));

router.get('/breaking-news/', Catch(async function(req, res, next) {
  let snapshot = await getSnapshot(BreakingNews).exec();
  req.io.emit('got_breaking_news', { snapshot });
  res.json({ success: true });
}));


// Getter functions for Chartbeat snapshots
function getSnapshot(model) {
  return model.findOne().sort({ _id: -1 })
}
