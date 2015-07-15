import mocha from 'mocha';
import { assert } from 'chai';

import app from '../../app';
import { getNewsArticles } from '../../get/news';
import { Article, connect, disconnect } from '../../db';
import { testDb } from '../../../config';
import logger from '../../logger';

describe('News fetching and saving', function() {
  this.timeout(0);
  before(async function(done) {
    try {
      await connect(testDb);
    } catch (err) {
      logger.error(err);
      done(err);
    }

    getNewsArticles(app).catch(function(err) { throw Error(err); }).then(function() {
      done();
    }).catch(function(err) {
      logger.error(err);
      done(err);
    });
  });

  after(async function(done) {
    try {
      await Article.remove().exec();
    } catch (err) {
      logger.error(err);
      done(err);
    }
    await disconnect();
    done();
  });

  it('Fetches articles and verifies the return values', function(done) {
    done();
  });
});
