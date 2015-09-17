'use strict';

import io from 'socket.io-client';
var socket = io();

socket.emit('get_popular');
socket.on('got_popular', function(data) {
  console.log(data);
});

/*socket.emit('get_articles', { 'module': 'hero' });
socket.emit('get_articles', { 'source': 'freep' });

socket.on('got_articles', function(data) {
  console.log('Got articles!');
  console.log(data);
});

socket.on('new_articles', function(data) {
  console.log('New articles!');
  console.log(data);
});*/
