'use strict';

import { Catch } from '../lib';
import { Article, Toppages, Quickstats, Topgeo, Referrers, Recent, TrafficSeries,
  BreakingNews } from '../db';

export function articles(socket) {
  socket.on('get_articles', Catch(async function(req, res, next) {
    let filter = req.data || {};
    let articles = await Article.find(req.data).exec();
    socket.emit('got_articles', { articles, filters: req.data });
  }));
}

export function popular(socket) {
  socket.on('get_popular', Catch(async function() {
    let snapshot = await getSnapshot(Toppages).exec();
    socket.emit('got_popular', { snapshot });
  }));
}

export function quickstats(socket) {
  socket.on('get_quickstats', Catch(async function() {
    let snapshot = await getSnapshot(Quickstats).exec();
    socket.emit('got_quickstats', { snapshot })
  }));
}

export function topgeo(socket) {
  socket.on('get_topgeo', Catch(async function() {
    let snapshot = await getSnapshot(Topgeo).exec();
    socket.emit('got_topgeo', { snapshot });
  }));
}

export function referrers(socket) {
  socket.on('get_referrers', Catch(async function() {
    let snapshot = await getSnapshot(Referrers).exec();
    socket.emit('got_referrers', { snapshot });
  }));
}

export function recent(socket) {
  socket.on('get_recent', Catch(async function() {
    let snapshot = await getSnapshot(Recent).exec();
    socket.emit('got_recent', { snapshot });
  }));
}

export function trafficSeries(socket) {
  socket.on('get_traffic_series', Catch(async function() {
    let snapshot = await getSnapshot(TrafficSeries).exec();
    socket.emit('got_traffic_series', { snapshot });
  }));
}

export function breakingNews(socket) {
  socket.on('get_breaking_news', Catch(async function() {
    let snapshot = getSnapshot(BreakingNews).exec();
    socket.emit('got_breaking_news', { snapshot });
  }))
}

function getSnapshot(model) {
  return model.findOne().sort({ _id: -1 });
}
