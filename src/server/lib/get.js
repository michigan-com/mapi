'use strict';

import debug from 'debug';
var logger = debug('app:promise');
import request from 'request';

export default function Get(url, options) {
  return new Promise(function(resolve, reject) {
    logger(`Grabbing: ${url}`);
    request.get(url, options, function(err, response, body) {
      if (err) reject(err);
      let resp = {
        response: response,
        body: body
      };
      resolve(resp);
    });
  });
}
