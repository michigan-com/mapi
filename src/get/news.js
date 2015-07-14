'use strict';

import logger from  '../logger';
import getAsync from '../lib/promise';
import { Article } from '../db';
import { sites, modules } from '../lib/constant';
import { stripHost } from '../lib/parse';

var default_timeout = 20 * 60 * 1000;

/**
  * Initializes an infinite loop that will continue to download new news articles
  * which will repeat based on the timeout
  *
  * @param {Object} [app] The express app instance
  * @param {Number} [timeout] Time between downloading new articles in milliseconds
  */
function init(app, timeout=default_timeout) {
  getNewsArticles(app);
  createSocketRoute(app);
  setTimeout(function() { getNewsArticles(app) }, timeout);
}

/**
  * Creates a socket route that clients can `emit` to get news articles
  *
  * @param {Object} [app] The express app instance
  */
function createSocketRoute(app) {
  app.io.route('get_articles', async function(req) {
    let articles;
    try {
      articles = await Article.find(req.data).exec();
    } catch (err) {
      logger.error(err);
    }
    req.io.emit('got_articles', { articles, filters: req.data });
  });
}

/**
 * Downloads all news articles from our news sites, removes old articles,
 * parses, and then saves the data
 *
 * @param {Object} [app] The express app instance
 */
async function getNewsArticles(app) {
  let resp;
  try {
    resp = await Promise.all([for (site of sites) getAsync(`http://${site}/sports/json`)]);
  } catch (err) {
    logger.error(err);
    return;
  }

  logger.info('Removing all articles from mongodb ...');
  try {
    await Article.remove().exec();
  } catch (err) {
    logger.error(err);
  }

  var articles = [];
  for (let i = 0; i < resp.length; i++) {
    let site = stripHost(resp[i].response.request.host);
    let data = JSON.parse(resp[i].body);

    for (let i = 0; i < data.primary_modules.length; i++) {
      let module = data.primary_modules[i];
      module.name = module.name.replace(`${site}-`, '');

      if (modules.indexOf(module.name) == -1) {
        logger.debug(`Found '${module.name}' which is not in the list of modules we want, skipping ...`);
        continue;
      }

      if (!('contents' in module)) {
        logger.debug('Could not find contents list in module ${module.name}, skipping ...');
        continue;
      }

      for (let i = 0; i < module.contents.length; i++) {
        let content = module.contents[i];
        if (!content.hasOwnProperty('photo') || !content.photo.hasOwnProperty('attrs')) {
          continue;
        }
        let photo_attrs = content.photo.attrs;
        let photo_url = `${photo_attrs.publishurl}${photo_attrs.basename}`;
        let thumbnail_url = `${photo_attrs.publishurl}${photo_attrs.smallbasename}`;

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
              url: photo_attrs.thumbnail || null,
              width: photo_attrs.simagewidth || null,
              height: photo_attrs.simageheight || null
            }
          },
          module: module.name,
          section: content.taxonomy.section || null,
          subsection: content.taxonomy.subsection || null,
          source: site,
          summary: content.summary,
          headline: content.headline,
          subheadline: content.subheadline || null,
          url: content.pageurl.shortUrl || null
        });
        articles.push(article);

        try {
          await article.save();
        } catch (err) {
          logger.error(err);
        }
      }
    }
  }
  app.io.broadcast('new_articles', { articles });
  logger.info('Saved new batch of news articles!');
}

module.exports = {
  init,
  getNewsArticles,
  createSocketRoute
};
