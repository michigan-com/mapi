'use strict';

import { Router } from 'express';

var router = Router();

router.get('/', function(req, res, next) {
  res.render('index');
});

router.get('/test_socket/', function(req, res, next) {
  res.render('test_socket');
});

module.exports = router;
