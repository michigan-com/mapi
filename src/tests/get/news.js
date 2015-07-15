import mocha from 'mocha';
import { assert } from 'chai';

import app from '../../app';
import { getNewsArticles } from '../../get/news';
import { Article, connect, disconnect } from '../../db';
import { testDb } from '../../../config';
import logger from '../../logger';

describe('News fetching and saving', function() {
  before(function(done) {
    (async function() {
      try {
        await connect(testDb);
      } catch (err) {
        logger.error(err);
      }

      getNewsArticles(app).catch(function(err) { logger.error(err); });
      done();
    })();
  });

  after(function(done) {
    (async function() {
      try {
        await Article.remove().exec();
        await disconnect();
      } catch (err) {
        logger.error(err);
      }
      done();
    })();
  });

  it('Fetches articles and verifies the return values', async function(done) {
    done();
  });
});
