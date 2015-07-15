'use strict';

import logger from  '../logger';
import getAsync from '../lib/promise';
import { Article } from '../db';
import { sites, modules } from '../lib/constant';
import { stripHost } from '../lib/parse';

// 20 minutes
var default_timeout = 20 * 60 * 1000;

/**
  * Initializes an infinite loop that will continue to download new news articles
  * which will repeat based on the timeout
  *
  * @param {Object} [app] The express app instance
  * @param {Number} [timeout] Time between downloading new articles in milliseconds
  */
function scheduleTask(app, timeout=default_timeout) {
  getNewsArticles(app).catch(function(err) { logger.error(err); });
  setTimeout(function() { init(app, timeout) }, timeout);
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
    throw new Error(err);
  }

  logger.info('Removing all articles from mongodb ...');
  try {
    await Article.remove().exec();
  } catch (err) {
    logger.error(err);
    throw new Error(err);
  }

  var articles = [];
  for (let i = 0; i < resp.length; i++) {
    let site = stripHost(resp[i].response.request.host);
    let data = JSON.parse(resp[i].body);

    logger.debug(`Processing ${site} data ...`);
    for (let i = 0; i < data.primary_modules.length; i++) {
      let module = data.primary_modules[i];
      module.name = module.name.replace(`${site}-`, '');
      if (modules.indexOf(module.name) == -1) {
        logger.debug(`Found '${module.name}' which is not in the list of modules we want, skipping ...`);
        continue;
      }

      if (!('contents' in module)) {
        logger.debug(`Could not find contents list in module ${module.name}, skipping ...`);
        continue;
      }

      for (let i = 0; i < module.contents.length; i++) {
        let content = module.contents[i];
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
          module: module.name,
          section: content.taxonomy.section || null,
          subsection: content.taxonomy.subsection || null,
          source: site,
          summary: content.summary,
          headline: content.headline,
          subheadline: content.attrs.brief || null,
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
  scheduleTask,
  getNewsArticles
};
