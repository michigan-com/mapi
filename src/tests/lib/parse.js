import parse from '../../lib/parse';
import { assert } from 'chai';
import mocha from 'mocha';

describe('stripHost', function() {
  it('should return freep', function() {
    var expected = 'freep';
    assert.equal(parse.stripHost('freep.com'), expected);
    assert.equal(parse.stripHost('http://freep.com'), expected);
    assert.equal(parse.stripHost('http://www.freep.com'), expected);
    assert.equal(parse.stripHost('www.freep.com'), expected);
  });

  it('should should return test.freep', function() {
    assert.equal(parse.stripHost('http://www.test.freep.com'), 'test.freep');
  });

  it('should return asdfasdf', function() {
    assert.equal(parse.stripHost('http://asdfasdf'), 'asdfasdf');
  });

  it('should return empty string', function() {
    assert.equal(parse.stripHost([]), '');
    assert.equal(parse.stripHost({}), '');
    assert.equal(parse.stripHost(123123), '');
  });
});
