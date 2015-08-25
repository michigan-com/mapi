'use strict';

import mongoose from 'mongoose';
import request from 'supertest';
import { assert } from 'chai';
import mocha from 'mocha';

import { Article } from '../../db';
import app from '../../app';
import { connect, disconnect } from '../../db';
import { testDb } from '../../../config';

describe('API Routes', function() {
  before(async function(done) {
    try {
      await connect(testDb);
    } catch (err) {
      done(err);
    }

    done();
  });

  after(function(done) {
    disconnect().then(function() {
      done();
    });
  });

  describe('/v1/news/', function() {
    it('should return all articles', function(done) {
      testValidRoute('/v1/news/?limit=0', {}, done);
    });

    it('freep/ with should return all articles for freep', function(done) {
      testValidRoute('/v1/news/freep/?limit=0', { source: 'freep' }, done);
    });

    it('freep,detroitnews/ should return all articles for freep and detroitnews', function(done) {
      testValidRoute('/v1/news/freep,detroitnews/?limit=0', { source: { $in: ['freep', 'detroitnews'] } }, done);
    });

    it('freep/sports/ should return all articles for freep in sports section', function(done) {
      testValidRoute('/v1/news/freep/sports/?limit=0', { source: 'freep', section: 'sports' }, done);
    });

    it('asdfasdf/ should return error response', function(done) {
      request(app)
        .get('/v1/news/asdfasdf/')
        .expect(422, done);
    });

    it('should return 20 articles when limit query parameter is present', function(done) {
      request(app)
        .get('/v1/news/?limit=20')
        .expect(200)
        .end(function(err, res) {
          if (err) throw done(err);

          assert.equal(20, res.body.articles.length);
          done();
        });
    });
  });
});

function testValidRoute(route, articlesFilter, done) {
  request(app)
    .get(route)
    .expect(200)
    .expect('Content-Type', /json/)
    .end(function(err, res) {
      if (err) throw done(err);

      assert.equal('body' in res, true);
      assert.equal('articles' in res.body, true);

      let actual = res.body.articles
      assert.equal(actual.length > 0, true);

      Article.find(articlesFilter).exec(function(err, expected) {
        if (err) throw done(err);

        assert.equal(actual.length, expected.length, 'Incorrect number of articles returned');
        done();
      });
    });
}
