/* eslint-disable new-cap, no-loop-func */
'use strict';

import { Catch } from '../lib';
import * as db from '../db';
import debug from 'debug';

const logger = debug('app:socket');

import * as analytics from './v1/analytics';

function getSnapshot(model, data) {
  return new Promise(async (resolve, reject) => {
    const domains = data.domains.split(',') || [];
    logger(`querying for ${domains.length} domains`);
    setTimeout(() => { reject('Query took longer than 10 seconds, rejecting'); }, 10000);

    try {
      var result = await Promise.all(
        domains.map((d) => (
          model.find({ d })
            .maxTime(5000)
            .sort({ tm: -1 })
            .limit(1)
            .exec()
        ))
      );

      var time = new Date();
      const snapshotData = result.filter((r) => (!!r[0])).map(r => r[0].toObject())
        .reduce((a, v) => {
          a[v.d] = v.v;
          time = v.tm;
          return a;
        }, {});
      resolve({ data: snapshotData, time, domains });
    } catch (e) {
      console.error(e);
      reject(e);
    }
  });
}

function registerArticleEvent(socket) {
  socket.on('get-articles', Catch(async (req) => {
    const articles = await Article.find(req.data).exec();
    socket.emit('got-articles', { articles, filters: req.data });
  }));
}

function registerSocketEvent(socket, socketEvent, model) {
  socket.on(`get-${socketEvent}`, Catch(async(data) => {
    logger(`get-${socketEvent} for ${data.domains.split(',').length} domains`);
    const startTime = new Date();
    try {
      const snapshot = await getSnapshot(model, data);
      socket.emit(`got-${socketEvent}`, snapshot);

      logger(`emitting got-${socketEvent} for ${data.domains.split(',').length} domains, took ${(new Date()) - startTime}`);
    } catch (e) {
      console.error(e);
      logger(`error-${socketEvent} for ${data.domains.split(',').length} domains, took ${(new Date()) - startTime}`);
      socket.emit(`error-${socketEvent}`, { error: e });
    }
  }));
}

function registerBreakingNewsEvent(socket) {
  socket.on('get-breaking-news', Catch(async (data) => {
    const snapshot = await getSnapshot(db.BreakingNews, data);
    socket.emit('got-breaking-news', snapshot);
  }));
}

function registerAnalyticsSockets(socket) {
  const statsSocketEvents = [{
    eventName: 'stats-domains',
    analyticsObj: analytics.loadDomainStats,
  }, {
    eventName: 'stats-referrers',
    analyticsObj: analytics.loadReferrers,
  }, {
    eventName: 'stats-articles',
    analyticsObj: analytics.loadArticleStats,
  }, {
    eventName: 'stats-authors',
    analyticsObj: analytics.loadAuthorStats,
  }, {
    eventName: 'totals-domain',
    analyticsObj: analytics.loadDomainTotals,
  }, {
    eventName: 'totals-articles',
    analyticsObj: analytics.loadArticleStats,
  }, {
    eventName: 'totals-authors',
    analyticsObj: analytics.loadAuthorTotals,
  }];

  for (const event of statsSocketEvents) {
    socket.on(`get-${event.eventName}`, async (data) => {
      try {
        const response = await event.analyticsObj.runQuery(data);
        response.eventKey = data.eventKey || event.eventName;
        socket.emit(`got-${event.eventName}`, response);
      } catch (e) {
        socket.emit(`error-${event.eventName}`, { error: e });
      }
    });
  }
}
export function newSocketConnection(socket) {
  // Older stuff
  registerArticleEvent(socket);

  registerSocketEvent(socket, 'popular', db.TopPagesV3);
  registerSocketEvent(socket, 'quickstats', db.QuickStatsV3);
  registerSocketEvent(socket, 'topgeo', db.TopGeoV3);
  registerSocketEvent(socket, 'referrers', db.ReferrersV3);
  registerSocketEvent(socket, 'recent', db.RecentV3);
  registerSocketEvent(socket, 'traffic-series', db.TrafficSeriesDailyV3);
  // registerBreakingNewsEvent(socket);

  // newer stuff
  registerAnalyticsSockets(socket);
}
