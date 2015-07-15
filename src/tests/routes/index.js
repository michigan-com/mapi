'use strict';

import mongoose from 'mongoose';
import request from 'supertest';
import { assert } from 'chai';
import mocha from 'mocha';
//import sinon from 'sinon';
import indexBy from 'lodash/collection/indexBy';

import { Article } from '../../db';
//import news from '../../get/news';
import helpers from '../helpers';
import logger from '../../logger';
import app from '../../app';

/*sinon.stub(news, 'scheduleTask', async function() {
  return;
});*/

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
  assert.equal(articles.length, res.body.articles.length, 'Incorrect number of articles returned');

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

function testValidRoute(route, articlesFilter, done) {
  request(app)
    .get(route)
    .expect(200)
    .expect('Content-Type', /json/)
    .end(async function(err, res) {
      if (err) throw done(err);

      let articles = await Article.find(articlesFilter).exec();
      verifyArticles(res, articles);

      done();
    });
}

describe('API Routes', function() {
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
    mongoose.disconnect();
  });

  describe('/v1/news/', function() {
    it('should return all articles', function(done) {
      testValidRoute('/v1/news/', {}, done);
    });

    it('freep/ with should return all articles for freep', function(done) {
      testValidRoute('/v1/news/freep/', { source: 'freep' }, done);
    });

    it('freep,detroitnews/ should return all articles for freep and detroitnews', function(done) {
      testValidRoute('/v1/news/freep,detroitnews/', { source: { $in: ['freep', 'detroitnews'] } }, done);
    });

    it('freep/sports/ should return all articles for freep in sports section', function(done) {
      testValidRoute('/v1/news/freep/sports/', { source: 'freep' }, done);
    });

    it('freep/sports/hero/ should return all articles for freep in sports section and hero module', function(done) {
      testValidRoute('/v1/news/freep/sports/hero/', { source: 'freep', module: 'hero' }, done);
    });

    it('freep/sports/hero,headline-grid/  should return all articles for freep in sports section, hero and headline-grid modules', function(done) {
      testValidRoute('/v1/news/freep/sports/hero,headline-grid', {
        source: 'freep',
        module: { $in: ['hero', 'headline-grid'] }
      }, done);
    });

    it('asdfasdf/ should return error response', function(done) {
      request(app)
        .get('/v1/news/asdfasdf/')
        .expect(422, done);
    });

    it('freep/sports/asdfasdf/ should return an error response', function(done) {
      request(app)
        .get('/v1/news/freep/sports/asdasdfasdf/')
        .expect(422, done);
    });
  });
});
