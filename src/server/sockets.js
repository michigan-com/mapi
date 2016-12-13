
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

function snapshotLoopPerDomain(io, domain) {
  // This returned function is run every interval
  async function snapshotLoop() {
    const room = io.sockets.adapter.rooms[domain] || [];
    if (room.length) {
      logger(`Fetching snapshot data for ${domain}`);

      try {
        const domainData = await fetchSnapshotData(domain);
        logger(`Emitting snapshot data for ${domain}`);
        io.to(domain).emit('got-snapshot-data', { domain, data: domainData });
      } catch (e) {
        logger(`Error fetching snapshot data for domain ${domain}`);
        logger(e);
      }
    }

    setTimeout(snapshotLoop, 5000);
  }

  snapshotLoop();
}

function timeSeriesLoopPerDomain(io, domain, region) {
  async function timeSeriesLoop() {
    const room = io.sockets.adapter.rooms[domain] || [];
    if (room.length) {
      logger(`Fetching series data for ${domain}`);

      const utcOffsetValue = regionsOffsets[region] || EST_OFFSET;
      try {
        const data = await fetchSeriesData(domain, utcOffsetValue);
        logger(`Emitting series data for ${domain}`);
        io.to(domain).emit('got-series-data', { domain, data });
      } catch (e) {
        logger(`Error fetching series data for domain ${domain}`);
        logger(e);
      }
    }

    setTimeout(timeSeriesLoop, 5000);
  }

  timeSeriesLoop();
}

export function initSocketLoop(io) {
  Object.keys(publicationList).forEach((hostname) => {
    const { baseUrl, region } = publicationList[hostname];
    snapshotLoopPerDomain(io, baseUrl);
    timeSeriesLoopPerDomain(io, baseUrl, region);
  });
}
