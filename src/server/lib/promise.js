'use strict';

import request from 'request';
import logger from '../logger';

export default function getAsync(url, options) {
  return new Promise(function(resolve, reject) {
    logger.debug(`Grabbing: ${url}`);
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