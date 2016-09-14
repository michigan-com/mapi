/* eslint-disable new-cap, no-loop-func */
'use strict';

import { Catch } from '../lib';
import { Article, Toppages, Quickstats, Topgeo, Referrers, Recent, TrafficSeries,
  BreakingNews } from '../db';

import * as analytics from './v1/analytics';

function getSnapshot(model) {
  return model.findOne().sort({ _id: -1 });
}

function registerArticleEvent(socket) {
  socket.on('get-articles', Catch(async (req) => {
    const articles = await Article.find(req.data).exec();
    socket.emit('got-articles', { articles, filters: req.data });
  }));
}

function registerPopularEvent(socket) {
  socket.on('get-popular', Catch(async () => {
    const snapshot = await getSnapshot(Toppages).exec();
    socket.emit('got-popular', { snapshot });
  }));
}

function registerQuickstatsEvent(socket) {
  socket.on('get-quickstats', Catch(async () => {
    const snapshot = await getSnapshot(Quickstats).exec();
    socket.emit('got-quickstats', { snapshot });
  }));
}

function registerTopGeoEvent(socket) {
  socket.on('get-topgeo', Catch(async () => {
    const snapshot = await getSnapshot(Topgeo).exec();
    socket.emit('got-topgeo', { snapshot });
  }));
}

function registerReferrerEvent(socket) {
  socket.on('get-referrers', Catch(async () => {
    const snapshot = await getSnapshot(Referrers).exec();
    socket.emit('got-referrers', { snapshot });
  }));
}

function registerRecentEvent(socket) {
  socket.on('get-recent', Catch(async () => {
    const snapshot = await getSnapshot(Recent).exec();
    socket.emit('got-recent', { snapshot });
  }));
}

function registerTrafficSeriesEvent(socket) {
  socket.on('get-traffic-series', Catch(async () => {
    const snapshot = await getSnapshot(TrafficSeries).exec();
    socket.emit('got-traffic-series', { snapshot });
  }));
}

function registerBreakingNewsEvent(socket) {
  socket.on('get-breaking-news', Catch(async () => {
    const snapshot = await getSnapshot(BreakingNews).exec();
    socket.emit('got-breaking-news', { snapshot });
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
