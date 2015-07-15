'use strict';

import { Router } from 'express';

import v1 from './v1';

var router = Router();

router.get('/', function(req, res, next) {
  res.render('index');
});

router.get('/test_socket/', function(req, res, next) {
  res.render('test_socket');
});

module.exports = { index: router, v1 };
