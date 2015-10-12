'use strict';

import io from 'socket.io-client';
var socket = io();

socket.emit('get_popular');
socket.on('got_popular', function(data) {
  console.log('Got popular');
  console.log(data);
});

socket.emit('get_articles');
socket.on('got_articles', function(data) {
  console.log('Got articles');
  console.log(data);
});

socket.emit('get_quickstats');
socket.on('got_quickstats', function(data) {
  console.log('Got quickstats');
  console.log(data);
});

socket.emit('get_topgeo');
socket.on('got_topgeo', function(data) {
  console.log('Got Topgeo');
  console.log(data);
});
