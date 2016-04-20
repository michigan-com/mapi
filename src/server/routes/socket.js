'use strict';
import decamelize from 'decamelize';
import Mongoose from 'mongoose';
import * as models from '../db'

const socketCollections = [
  'Article',
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
      let stream = models[collection].find({  }).setOptions({ tailable: true, awaitData: true, numberOfRetries: -1 }).stream()
      streams.push(stream)
      stream.on('data', (snapshot) => {
        console.log(snapshot)
        socket.emit(`got_${lowercaseCollection}`, snapshot)
      })
    })
  });
  socket.on('disconnect', () => {
    streams.forEach(stream => stream.destroy())
  })
};
