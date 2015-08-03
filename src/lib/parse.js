'use strict';

import url from 'url';

function stripHost(testUrl) {
  /**
   * Given a url name (e.g. freep.com), strip out all the extra and just use
   * the domain name (e.g http://www.freep.com/sports -> freep)
   *
   * @param {String} testUrl - url that will be stripped
   * @returns {String} Host name, or '' if anything goes wrong
   */

  if (typeof testUrl != 'string') return '';

  // Looks like the url module doesn't correctly parse the url unless it's
  // prepended with 'http://'
  let regex = new RegExp('^http://');
  if (!(regex.exec(testUrl))) {
    testUrl = 'http://' + testUrl;
  }
  let parsed = url.parse(testUrl);
  let hostname = parsed.hostname;

  if (hostname) {
    // Remove the domain from the end of the url
    return hostname.replace(/\.[\w]+$/, '').replace(/^www\./, '');
  }
}

function removeExtraSpace(arr) {
  let space = arr.indexOf(' ');
  let empty = arr.indexOf('');

  if (space > -1) {
    arr.splice(space, 1);
  }

  if (empty > -1) {
    arr.splice(empty, 1);
  }

  return arr;
}

module.exports = {
  stripHost,
  removeExtraSpace
};
