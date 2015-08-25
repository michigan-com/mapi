'use strict';

module.exports = {
  db: 'mongodb://localhost:27017/mapi',
  //optional
  smtp: {
    service: 'gmail',
    auth: {
      user: 'gmail@gmail.com',
      pass: 'somepass312'
    }
  }
}
