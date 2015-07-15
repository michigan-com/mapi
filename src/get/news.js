'use strict';

import logger from  '../logger';
import getAsync from '../lib/promise';
import { Article } from '../db';
import { sites, sections, modules } from '../lib/constant';
import { stripHost } from '../lib/parse';

// 20 minutes
let default_timeout = 20 * 60 * 1000;

/**
  * Initializes an infinite loop that will continue to download new news articles
  * which will repeat based on the timeout
  *
  * @param {Object} app - The express app instance
  * @param {Number} timeout - Time between downloading new articles in milliseconds
  */
function scheduleTask(app, timeout=default_timeout) {
  getNewsArticles(app).catch(function(err) { logger.error(err); });
  setTimeout(function() { scheduleTask(app, timeout) }, timeout);
}

/**
 * Downloads all news articles from our news sites, removes old articles,
 * parses, and then saves the data
 *
 * @param {Object} app - The express app instance
 */
async function getNewsArticles(app) {
  let resp;
  let urls = generateUrls(sites, sections);
  resp = await Promise.all([for (url of urls) fetchSection(url)]);

  logger.info('Removing all articles from mongodb ...');
  try {
    await Article.remove().exec();
  } catch (err) {
    logger.error(err);
    throw new Error(err);
  }

  let articles = [];
  for (let i = 0; i < resp.length; i++) {
    if (!resp[i]) continue;
    let site = stripHost(resp[i].response.request.host);
    let data = JSON.parse(resp[i].body);

    logger.debug(`Processing ${site} data ...`);
    if (!('content' in data)) {
      logger.debug(`Could not find content list for ${site}, skipping ...`);
      continue;
    }

    for (let i = 0; i < data.content.length; i++) {
      let content = data.content[i];
      if (!content.photo || !content.photo.attrs) {
        logger.debug(`Could not find photo object in content object for ${content.headline}, skipping ...`);
        continue;
      }
      let photo_attrs = content.photo.attrs;
      if (typeof photo_attrs.publishurl !== 'string') {
        logger.debug(`Publish URL not found: ${content.headline}, skipping ...`);
        continue;
      }
      let photo_url = photo_attrs.publishurl + photo_attrs.basename;

      let thumbnail_url = null;
      if (typeof photo_attrs.smallbasename === 'string') {
        thumbnail_url = photo_attrs.publishurl + photo_attrs.smallbasename;
      } else if (typeof photo_attrs.thumbnailPath === 'string' ) {
        thumbnail_url = photo_attrs.publishurl + photo_attrs.thumbnailPath;
      }

      if (site === 'detnews' && content.attrs.section === 'life-home') {
        content.attrs.section = 'life';
      }

      let article = new Article({
        photo: {
          caption: photo_attrs.caption || null,
          credit: photo_attrs.credit || null,
          full: {
            url: photo_url,
            width: photo_attrs.oimagewidth || null,
            height: photo_attrs.oimageheight || null
          },
          thumbnail: {
            url: thumbnail_url || null,
            width: photo_attrs.simagewidth || null,
            height: photo_attrs.simageheight || null
          }
        },
        module: null, // TODO fix maybe?
        section: content.ssts.section || null,
        subsection: content.ssts.subsection || null,
        source: site,
        summary: content.summary,
        headline: content.headline,
        subheadline: content.attrs.brief || null,
        url: `http://${site}.com${content.url}` || null
      });

      articles.push(article);

      try {
        await article.save();
      } catch (err) {
        logger.error(err);
      }
    }
  }
  app.io.broadcast('new_articles', { articles });
  logger.info('Saved new batch of news articles!');
}

/**
 * Fetch url (a section front for a news site) using the getAsync function.
 * Returns a promise that never rejects
 *
 * @param {String} url - URL to be fetched
 * @return {Object} Promise that never rejects. Either resolves with response from
 *    getAsync call or resolves with undefined
 */
function fetchSection(url) {
  return new Promise(function(resolve, reject) {
    try {
      let resp = getAsync(url);
      resolve(resp);
    }
    catch(e) {
      logger.info(`Failed to fetch ${url}`);
      resolve(undefined);
    }
  });
}

/**
 * Given a list of sites and sections, construct the urls
 *
 * @param {Array} sites - The array of site hosts
 * @param {Array} sections - The sections to fetch for each site
 */
function generateUrls(sites, sections) {
  let returnUrls = [];
  for (let i = 0; i < sites.length; i++) {
    let site = sites[i];
    for (let j = 0; j < sections.length; j++) {
      let section = sections[j];
      if (site.indexOf('detroitnews') != -1 && section === 'life') {
        section += '-home'
      }

      returnUrls.push(`http://${site}/feeds/live/${section}/json`);
    }
  }
  return returnUrls;
}

module.exports = {
  scheduleTask,
  getNewsArticles
};
