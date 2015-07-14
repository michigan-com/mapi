import chance from 'chance';
import { sites, modules } from '../lib/constant';
import { stripHost } from '../lib/parse';

let Chance = chance();

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

function getRandomSite() {
  return stripHost(sites[getRandomInt(0, sites.length)]);
}

function getRandomModule() {
  return modules[getRandomInt(0, modules.length)];
}

function generateArticles(opts={}, numArticles=50) {
  let articles = [];
  for (let i = 0; i < numArticles; i++) {
    articles.push({
      brief: Chance.sentence(),
      photo: {
        caption: Chance.sentence(),
        credit: `${Chance.first()} ${Chance.last()}`,
        full: {
          url: Chance.url(),
          width: Chance.integer(),
          height: Chance.integer()
        },
        thumbnail: {
          url: Chance.url(),
          width: Chance.integer(),
          height: Chance.integer()
        }
      },
      module: getRandomModule(),
      section: Chance.string(),
      subsection: Chance.string(),
      source: getRandomSite(),
      summary: Chance.sentence(),
      headline: Chance.string(),
      subheadline: Chance.sentence(),
      url: Chance.url()
    });
  }

  return articles;
}

module.exports = {
  getRandomInt,
  getRandomSite,
  getRandomModule,
  generateArticles
}
