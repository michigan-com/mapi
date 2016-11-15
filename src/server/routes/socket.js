/* eslint-disable new-cap, no-loop-func */
'use strict';

import { Catch } from '../lib';
import * as db from '../db';

import * as analytics from './v1/analytics';

function getSnapshot(model, data) {
  return new Promise(async (resolve, reject) => {
    const domains = data.domains.split(',') || [];
    try {
      var result = await Promise.all(
        domains.map((d) => (
          model.find({ d })
            .sort({ tm: -1 })
            .limit(1)
            .exec()
        ))
      );

      var time = new Date();
      const snapshotData = result.map(r => r[0].toObject()).reduce((a, v) => {
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

function registerPopularEvent(socket) {
  socket.on('get-popular', Catch(async (data) => {
    try {
      const snapshot = await getSnapshot(db.TopPagesV3, data);
      socket.emit('got-popular', snapshot);
    } catch (e) {
      console.error(e);
      socket.emti('got-popular', { snapshot: {} });
    }
  }));
}

function registerQuickstatsEvent(socket) {
  socket.on('get-quickstats', Catch(async (data) => {
    const snapshot = await getSnapshot(db.QuickStatsV3, data);
    socket.emit('got-quickstats', snapshot);
  }));
}

function registerTopGeoEvent(socket) {
  socket.on('get-topgeo', Catch(async (data) => {
    const snapshot = await getSnapshot(db.TopGeoV3, data);
    socket.emit('got-topgeo', snapshot);
  }));
}

function registerReferrerEvent(socket) {
  socket.on('get-referrers', Catch(async (data) => {
    const snapshot = await getSnapshot(db.ReferrersV3, data);
    socket.emit('got-referrers', snapshot);
  }));
}

function registerRecentEvent(socket) {
  socket.on('get-recent', Catch(async (data) => {
    const snapshot = await getSnapshot(db.RecentV3, data);
    socket.emit('got-recent', snapshot);
  }));
}

function registerTrafficSeriesEvent(socket) {
  socket.on('get-traffic-series', Catch(async (data) => {
    const snapshot = await getSnapshot(db.TrafficSeriesDailyV3, data);
    socket.emit('got-traffic-series', snapshot);
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
  registerPopularEvent(socket);
  registerQuickstatsEvent(socket);
  registerTopGeoEvent(socket);
  registerReferrerEvent(socket);
  registerRecentEvent(socket);
  registerTrafficSeriesEvent(socket);
  registerBreakingNewsEvent(socket);

  // newer stuff
  registerAnalyticsSockets(socket);
}
