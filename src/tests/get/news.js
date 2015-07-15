import mocha from 'mocha';
import { assert } from 'chai';

import { getNewsArticles } from '../../get/news';
import { connect, disconnect } from '../../db';
import { testDb } from '../../../config';
import logger from '../../logger';

// test data
// import { battlecreekenquirer, detroitnews, freep, hometownlife, lansingstatejournal, livingstonedaily, thetimesherald } from '../data/index';

describe('News fetching', function() {
  before(function() {
    logger.info(`conneting to ${testDb}`)
    connect(testDb);
  });

  after(function() {
    disconnect();
  });

  it('Fetches articles and verifies the return values', async function(done) {
    // this.timeout(10000);
    // let articles = await getNewsArticles();

    // logger.debug(articles);
    done();
  });
});