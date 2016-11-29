'use strict';

import url from 'url';
import { Sites, Sections } from './constant';

/**
 * Given a url name (e.g. freep.com), strip out all the extra and just use
 * the domain name (e.g http://www.freep.com/sports -> freep)
 *
 * @param {String} testUrl - url that will be stripped
 * @returns {String} Host name, or '' if anything goes wrong
 */
function StripHost(testUrl) {

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

function RemoveExtraSpace(arr) {
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

/**
 * Given an array of sites and sections, return a mongo filter for the Articles
 * collection.
 *
 * @memberof parse.js
 * @param {Array} sites - Sites to filter on
 * @param {Array} sections - Sections to filter on
 * @param {Boolean} hasPhoto - if true, only get articles with photos in them. if false, grab all articles
 * @return {Object/undefined} - Filter for mongoose's Articles.find() function, or
 *  undefined on a failure
 *
 */
function v1NewsMongoFilter(sites=[], sections=[], hasPhoto=false, next=()=> {}) {
  let mongoFilter = {};

  RemoveExtraSpace(sites);
  RemoveExtraSpace(sections);

  let isUsingDomains = sites.some(isDomain)
  if (isUsingDomains) {
    if (!sites.every(isDomain)) {
      var err = new Error(`Cannot mix domains and legacy site names`);
      err.status = 422;
      err.type = 'json';
      next(err);
      return;
    }

    if (sites.length) {
      mongoFilter['domain'] = { $in: sites };
    }
  } else {
    let siteNames = [for (site of Sites) if (site) StripHost(site)];

    // Parse the sites params
    let invalidSites = [];
    for (let i = 0; i < sites.length; i++) {
      let site = sites[i];
      if (siteNames.indexOf(site) == -1 && site != 'all') {
        invalidSites.push(site)
      }
    }

    if (invalidSites.length) {
      // unprocessable, throw correct response code
      let sites = invalidSites.join(', ');
      var err = new Error(`Invalid query argument, site '${sites}' not allowed`);
      err.status = 422;
      err.type = 'json';
      next(err);
      return;
    }

    if (sites.length && sites.indexOf('all') == -1) {
      mongoFilter['source'] = { $in: sites };
    }
  }

  // Parse the section params
  let invalidSections = [];
  for (let i = 0; i < sections.length; i++) {
    let section = sections[i];
    if (Sections.indexOf(section) == -1) {
      invalidSections.push(section);
    }
  }

  if (invalidSections.length) {
    // unprocessable, throw correct response code
    let sections = invalidSections.join(', ');
    var err = new Error(`Invalid query argument, section '${sections}' not allowed`);
    err.status = 422;
    err.type = 'json';
    next(err);
    return;
  }

  if (sections.length) {
    mongoFilter['section'] = { $in: sections };
  }

  if (hasPhoto) {
    mongoFilter['photo'] = {
      $ne: {}
    }
  }

  return mongoFilter
}

function isDomain(site) {
  return site.indexOf('.') >= 0
}

module.exports = {
  StripHost,
  RemoveExtraSpace,

  // v1 stuff
  v1NewsMongoFilter
};
