'use strict';
import decamelize from 'decamelize';
import * as models from '../db'
import debug from 'debug';
var logger = debug('app:v1');

const socketCollections = [
  'Toppages',
  'Quickstats',
  'Topgeo',
  'Referrers',
  'Recent',
  'TrafficSeries'
];

export function subscribeToCollections(socket){
  let streams = [];
  socketCollections.forEach((collection) => {
    let lowercaseCollection = decamelize(collection);
    socket.on(`get_${lowercaseCollection}`, () => {
      // // migration helper
      // console.log(models[collection].db.executeDbCommand.isCapped(collection))
      // if(!models[collection].db.executeDbCommand.isCapped(collection)){
      //   models[collection].db.executeDbCommand({'convertToCapped': collection, size: 500*1024}, function(e,d){});
      // }
      let stream = models[collection].find()
        .tailable(true, { awaitData: true, numberOfRetries: -1 })
        .stream()
      streams.push(stream)
      stream.on('data', (data) => {
        console.log('Socket emit %s', collection)
        socket.emit(`got_${lowercaseCollection}`, {snapshot: data} )
      }).on('error', (err) => {
        logger(`Error streaming ${collection}: ${err}`)
      })
    })
  });
  socket.on('disconnect', () => {
    streams.forEach(stream => stream.destroy())
  })
};
