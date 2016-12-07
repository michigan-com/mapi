
import debug from 'debug';

import * as db from './db';
import publications from './publications';

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

function querySnapshots(io) {
  // This returned function is run every interval
  return () => {
    const srvSockets = io.sockets.sockets;
    if (!Object.keys(srvSockets).length) {
      logger('Theres no one here! Im going back to sleep');
      return;
    }

    logger(`Staring new interval at ${new Date()}`);
    Object.keys(publications).forEach(async (hostname) => {
      const { baseUrl } = publications[hostname];
      const room = io.sockets.adapter.rooms[baseUrl] || [];
      if (!room.length) return;

      logger(`Fetching data for ${baseUrl}`);

      try {
        const domainData = await fetchSnapshotData(baseUrl);
        logger(`Emitting data for ${baseUrl}`);
        io.to(baseUrl).emit('got-data', { domain: baseUrl, data: domainData });
      } catch (e) {
        logger(`Error fetching data for domain ${baseUrl}`);
        logger(e);
      }
    });

    logger('Done with interval');
  };
}

export function initSocketLoop(io) {
  setInterval(querySnapshots(io), 10000);
}
