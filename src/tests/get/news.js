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

    try {
      await getNewsArticles(app);
    } catch (err) {
      logger.error(err);
      done(err);
    }

    done();
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

  /*it('Fetches articles and verifies the return values', function(done) {
    done();
  });*/

  it('Should not store duplicate articles', function(done) {
    Article.find(function(err, articles) {
      if (err) done(err);

      let result = new Set();
      for (let i = 0; i < articles.length; i++) {
        let article = articles[i];
        assert.equal(result.has(article.headline), false);
        result.add(article.headline);
      }

      done();
    });
  });
});
