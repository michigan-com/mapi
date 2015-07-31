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

  it('should only contain articles with specific non-empty keys', function(done) {
    Article.find(function(err, articles) {
      if (err) done(err);

      for (let i = 0; i < articles.length; i++) {
        let article = articles[i];
        assert.notTypeOf(article.id, 'null', 'id should not be null');
        assert.notTypeOf(article.id, 'undefined', 'id should not be undefined');

        assert.notTypeOf(article.url, 'null', 'url should not be null');
        assert.notTypeOf(article.url, 'undefined', 'url should not be undefined');

        assert.notTypeOf(article.headline, 'null', 'headline should not be null');
        assert.notTypeOf(article.headline, 'undefined', 'headline should not be undefined');

        assert.notTypeOf(article.photo.full.url, 'null', 'photo should not be null');
        assert.notTypeOf(article.photo.full.url, 'undefined', 'photo should not be undefined');

        assert.notTypeOf(article.timestamp, 'null', 'timestamp should not be null');
        assert.notTypeOf(article.timestamp, 'undefined', 'timestamp should not be undefined');

        assert.notTypeOf(article.source, 'null', 'source should not be null');
        assert.notTypeOf(article.source, 'undefined', 'source should not be undefined');
      }

      done();
    });
  });

  it('Should not store duplicate articles', function(done) {
    Article.find(function(err, articles) {
      if (err) done(err);

      let result = new Set();
      for (let i = 0; i < articles.length; i++) {
        let article = articles[i];
        assert.equal(result.has(article.url), false);
        result.add(article.url);
      }

      done();
    });
  });

  it('Should not store an empty timestamp', function(done) {
    Article.find({ timestamp: new Date('0001-01-01T00:00:00.0000000') }, function(err, articles) {
      if (err) done(err);

      assert.equal(articles.length, 0);
      done();
    });
  });
});
