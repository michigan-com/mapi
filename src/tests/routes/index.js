import request from 'supertest';
import { assert } from 'chai';
import mocha from 'mocha';
import sinon from 'sinon';
import indexBy from 'lodash/collection/indexBy';

import { Article } from '../../db';
import news from '../../get/news';
import helpers from '../helpers';
import logger from '../../logger';
import app from '../../app';

sinon.stub(news, 'init', async function() {
  return;
});

function verifyArticles(res, articles) {
  /**
   * Given a response from an mapi request, verify that the articles in the response
   * body match up with the articles in the articles array.
   *
   * @param {Object} [res] Express response object
   * @param {Array} [articles] Array of articles from Mongo. Will be compared to
   *  [res].body.articles
   */
  assert.property(res.body, 'articles', '\'Articles\' not found in response body');
  assert.equal(articles.length, res.body.articles.length, 'Incorrect number of articles returned');;

  if (!articles.length) return;

  // Iterate over all the expected articles [articles], and make sure they're
  // all in the res.body
  let articleMap = indexBy(res.body.articles, function(obj) {
    return obj.url;
  });

  for (let i = 0; i < articles.length; i++) {
    // Parse to and from JSON to match the response
    let dbArticle = JSON.parse(JSON.stringify(articles[i]));
    assert.property(articleMap, dbArticle.url, 'Article URL not found');

    // Iterate over all values in the Schema, make sure the values match
    let resArticle = articleMap[dbArticle.url];
    for (let prop in Article.schema.paths) {
      assert.deepProperty(dbArticle, prop, 'Property doesn\'t exist in DB Schema');
    }

    assert.deepEqual(resArticle, dbArticle);
  }
}

function testValidRoute(route, articlesFilter={}, done) {
  request(app)
    .get(route)
    .expect('Content-Type', /json/)
    .end(async function(err, res) {
      if (err) throw done(err);

      let articles = await Article.find(articlesFilter).exec();
      verifyArticles(res, articles);

      done();
    });
}

describe('Routes tests', function() {
  before(async function(done) {
    logger.info('Removing all articles from mongodb ...');
    try {
      await Article.remove().exec();
    } catch (err) {
      logger.error(err);
    }

    let articles = helpers.generateArticles();

    for (let i = 0; i < articles.length; i++) {
      let articleData = articles[i];
      let article = new Article(articleData);

      try {
        await article.save()
      } catch(err) {
        logger.error(err);
      }
    }

    logger.info('Saved new batch of news articles!');
    done();
  });

  after(function() {
    app.close();
  });

  it('Tests basic /v1/news/ route, no filters', function(done) {
    testValidRoute('/v1/news/', {}, done);
  });

  it('Tests basic site filter: /v1/news/freep/', function(done) {
    testValidRoute('/v1/news/freep/', { source: 'freep' }, done);
  });

  it('Tests more complex site filter: /v1/news/freep,detroitnews/', function(done) {
    testValidRoute('/v1/news/freep,detroitnews/', {
      source: { $in: ['freep', 'detroitnews'] }
    }, done);
  });

  it('Tests a basic module filter: /v1/news/freep/sports/hero/', function(done) {
    testValidRoute('/v1/news/freep/sports/hero/', {
      source: 'freep',
      module: 'hero'
    }, done);
  });

  it('Tests a complex moudule filter: /v1/news/freep/sports/hero,headline-grid/', function(done) {
    testValidRoute('/v1/news/freep/sports/hero,headline-grid/', {
      source: 'freep',
      module: { $in: ['hero', 'headline-grid'] }
    }, done);
  });

  it('Tests a complex site and module filter: /v1/news/freep,detroitnews/sports/hero,headline-grid/', function(done) {
    testValidRoute('/v1/news/freep,detroitnews/sports/hero,headline-grid/', {
      source: { $in: ['freep', 'detroitnews'] },
      module: { $in: ['hero', 'headline-grid'] }
    }, done);
  });

  it('Tests invalid site filters', function(done) {
    request(app)
      .get('/v1/news/asdfasdf/')
      .expect(422, done);
  });

  it('Tests invalid module filter', function(done) {
    request(app)
      .get('/v1/news/freep/sports/asdasdfasdf/')
      .expect(422, done);
  });
});
