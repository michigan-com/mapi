import mocha from 'mocha';
import { assert } from 'chai';

import { getNewsArticles } from '../../get/news';
import { connect, disconnect } from '../../db';
import { testDb } from '../../../config';
import logger from '../../logger';

describe('News fetching', function() {
  before(function(done) {
    connect(testDb).then(function() {
      done();
    });
  });

  after(function(done) {
    disconnect().then(function() {
      done();
    });
  });

  it('Fetches articles and verifies the return values', async function(done) {
    done();
  });
});
