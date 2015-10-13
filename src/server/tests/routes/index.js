'use strict';

import mongoose from 'mongoose';
import request from 'supertest';
import assert from 'assert';
import mocha from 'mocha';

import { app } from '../../app';
import { v1NewsMongoFilter } from '../../lib/';

describe('API Routes', function() {

  describe('Tests valid mongo filters: ', function() {
    it('/v1/news/', function() {
      let mongoFilter = v1NewsMongoFilter();

      assert.equal(Object.keys(mongoFilter).length, 0, 'Should not be filtering anything for /v1/news/')
    });

    it('/v1/news/freep/', function() {
      let sites = ['freep'];
      let mongoFilter = v1NewsMongoFilter(sites);

      assert.equal(Object.keys(mongoFilter).length, 1, 'Should only be one key in mongoFilter');
      assert('source' in mongoFilter, '"source" not in mongo filter');
      assert.deepEqual(mongoFilter['source'], { $in: sites }, 'mongofilter["source"] is invalid');
    });

    it('/v1/news/freep,detroitnews,lansingstatejournal/', function() {
      let sites = ['freep', 'detroitnews', 'lansingstatejournal'];
      let mongoFilter = v1NewsMongoFilter(sites);

      assert.equal(Object.keys(mongoFilter).length, 1, 'Shoudl only be one key in mongoFilter');
      assert('source' in mongoFilter, '"source" not in mongo filter');
      assert.deepEqual(mongoFilter['source'], { $in: sites }, 'mongoFilter["source"] is invalid')
    });

    it('/v1/news/freep,detroitnews,lansingstatejournal/sports/', function() {
      let sites = ['freep', 'detroitnews', 'lansingstatejournal'];
      let sections = ['sports'];
      let mongoFilter = v1NewsMongoFilter(sites, sections);

      assert.equal(Object.keys(mongoFilter).length, 2, 'SHould be two keys in the mongoFilter');
      assert('source' in mongoFilter && 'section' in mongoFilter, '"source" and "section" shoudl be in mongoFilter');
      assert.deepEqual(mongoFilter['source'], { $in: sites }, 'mongoFilter["source"] is invalid');
      assert.deepEqual(mongoFilter['section'], { $in:sections }, 'mongoFilter["sections"] is invalid')
    });

    it('/v1/news/freep,detroitnews,lansingstatejournal/sports,life/', function() {
      let sites = ['freep', 'detroitnews', 'lansingstatejournal'];
      let sections = ['sports', 'life'];
      let mongoFilter = v1NewsMongoFilter(sites, sections);

      assert.equal(Object.keys(mongoFilter).length, 2, 'SHould be two keys in the mongoFilter');
      assert('source' in mongoFilter && 'section' in mongoFilter, '"source" and "section" shoudl be in mongoFilter');
      assert.deepEqual(mongoFilter['source'], { $in: sites }, 'mongoFilter["source"] is invalid');
      assert.deepEqual(mongoFilter['section'], { $in:sections }, 'mongoFilter["sections"] is invalid')
    });

    it('/v1/news/freep,detroitnews,langingstatejounral/sports,life/?hasPhoto=true', function() {
      let sites = ['freep', 'detroitnews', 'lansingstatejournal'];
      let sections = ['sports', 'life'];
      let mongoFilter = v1NewsMongoFilter(sites, sections, true);

      assert.equal(Object.keys(mongoFilter).length, 3, 'SHould be two keys in the mongoFilter');
      assert('source' in mongoFilter && 'section' in mongoFilter && 'photo' in mongoFilter, '"source", "section", and "photo" shoudl be in mongoFilter');
      assert.deepEqual(mongoFilter['source'], { $in: sites }, 'mongoFilter["source"] is invalid');
      assert.deepEqual(mongoFilter['section'], { $in:sections }, 'mongoFilter["sections"] is invalid')
      assert.deepEqual(mongoFilter['photo'], {$ne: {}}, 'mongoFilter["photo"] is invalid')
    });
  });

  describe('Tests invalid mongo filters:', function() {
    function mongoFail(sites=[], sections=[], done) {
      let mongoFilter = v1NewsMongoFilter(sites, sections, false, function(err) {
        assert(err.status, 422, 'Should throw 422 error');
        done();
      });
      assert(typeof mongoFilter === 'undefined', 'mongofilter shoudl be undefined');
    }

    it('/v1/news/asdfasdf/', function(done) {
      mongoFail(['asdfasdf'], [], done);
    });

    it('/v1/news/freep,asdfasdf/', function(done) {
      mongoFail(['freep', 'asdfasdf'], [], done);
      assert(typeof mongoFilter === 'undefined', 'mongofilter should be undefined');
    });

    it('/v1/news/freep/asdfasdf/', function(done) {
      mongoFail(['freep'], ['asdfasdf'], done);
    });

    it('/v1/news/freep/sports,asdfasdf/', function(done) {
      mongoFail(['freep'], ['sports', 'asdfasdf'], done);
    });

  });
});

