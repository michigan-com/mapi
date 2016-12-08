
import debug from 'debug';

import * as db from './db';
import { publicationList, regionsOffsets, EST_OFFSET } from './publications';
import { loadDomainStats } from './routes/v1/analytics';

const logger = debug('app:sockets');

const SNAPSHOTS = {
  popular: db.TopPagesV3,
  quickstats: db.QuickStatsV3,
  topgeo: db.TopGeoV3,
  referrers: db.ReferrersV3,
  recent: db.RecentV3,
  'traffic-series': db.TrafficSeriesDailyV3,
};

function fetchSnapshotData(domain) {
  return new Promise(async (resolve, reject) => {
    const domainData = {};
    const defaultData = { d: domain, v: null };
    for (const snapshot of Object.keys(SNAPSHOTS)) {
      const model = SNAPSHOTS[snapshot];
      try {
        const result = await model.findOne({ d: domain })
          .sort({ tm: -1 })
          .exec();

        domainData[snapshot] = result || { ...defaultData };
        logger(snapshot);
      } catch (e) {
        logger(`Error fetching ${snapshot} for ${domain}`);
        logger(e);
        domainData[snapshot] = { ...defaultData };
      }
    }
    resolve(domainData);
  });
}

function fetchSeriesData(domain, utcOffsetValue) {
  return new Promise(async (resolve, reject) => {
    // TODO we're guaranteed this is going to be EST because our AWS server is
    // in Virginia. We should put logic to guarantee that this is the current
    // time in the Eastern Time Zone
    const now = new Date();

    // start of the day realtive to this domain's time zone
    const queryStart = new Date(Date.UTC(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      utcOffsetValue,
      0,
      0,
      0,
    ));

    const keysToQuery = {
      platform: 'pf',
      recirculation: 'recirc,article',
    };
    const platformSeriesQueryData = {
      start: queryStart.getTime(),
      sort: '+tm',
      limit: 300,
      domains: domain,
    };

    const seriesData = {};
    for (const keyName of Object.keys(keysToQuery)) {
      const keys = keysToQuery[keyName];
      const queryData = { ...platformSeriesQueryData, keys };
      try {
        const data = await loadDomainStats.runQuery(queryData);
        seriesData[keyName] = data;
      } catch (e) {
        logger(`ERror fetching ${keyName} series for ${domain}`);
        seriesData[keyName] = {};
      }
    }

    resolve(seriesData);
  });
}

function querySnapshots(io) {
  // This returned function is run every interval
  return () => {
    const srvSockets = io.sockets.sockets;
    if (!Object.keys(srvSockets).length) {
      logger('Theres no one here! Im going back to sleep');
      return;
    }

    logger(`Staring new snapshot loop at  ${new Date()}`);
    Object.keys(publicationList).forEach(async (hostname) => {
      const { baseUrl } = publicationList[hostname];
      const room = io.sockets.adapter.rooms[baseUrl] || [];
      if (!room.length) return;

      logger(`Fetching data for ${baseUrl}`);

      try {
        const domainData = await fetchSnapshotData(baseUrl);
        logger(`Emitting data for ${baseUrl}`);
        io.to(baseUrl).emit('got-snapshot-data', { domain: baseUrl, data: domainData });
      } catch (e) {
        logger(`Error fetching data for domain ${baseUrl}`);
        logger(e);
      }
    });

    logger('Done with snapshot interval');
  };
}

function queryTimeSeries(io) {
  return () => {
    const srvSockets = io.sockets.sockets;
    if (!Object.keys(srvSockets).length) {
      logger('Theres no one here! Im going back to sleep');
      return;
    }

    logger(`Staring new time series interval at ${new Date()}`);
    Object.keys(publicationList).forEach(async (hostname) => {
      const { baseUrl, region } = publicationList[hostname];
      const room = io.sockets.adapter.rooms[baseUrl] || [];
      if (!room.length) return;

      const utcOffsetValue = regionsOffsets[region] || EST_OFFSET;
      try {
        const data = await fetchSeriesData(baseUrl, utcOffsetValue);
        io.to(baseUrl).emit('got-series-data', { domain: baseUrl, data });
      } catch (e) {
        logger(`Error fetching series data for domain ${baseUrl}`);
        logger(e);
      }
    });

    logger('Done with series interval');
  };
}

export function initSocketLoop(io) {
  setInterval(querySnapshots(io), 5000);
  setInterval(queryTimeSeries(io), 5000);
}
