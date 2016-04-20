'use strict';

import { Router } from 'express';

import v1 from './v1';
import { Toppages, Quickstats, Topgeo, Referrers, Recent, TrafficSeries } from '../db';
import { Catch } from '../lib/index';
import debug from 'debug';
var logger = debug('app:route');

var router = Router();
export { router as router };
export { v1 as v1 };

router.get('/', function(req, res, next) {
  res.render('index');
});
