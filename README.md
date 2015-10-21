# Michigan API - Node [![Build Status](http://ci.renvy.com/job/mapi/badge/icon)](http://ci.renvy.com/job/mapi/)

## Dependencies
* [Nodejs](http://nodejs.org) (> 0.11.2, for harmony support)
* [Gulp](http://gulpjs.com/)
* [MongoDB](http://www.mongodb.org/)

### Optional
* [Nodemon](http://nodemon.io/)

## Install
### Node stuff
```bash
npm install -g gulp
npm install
```

### [MongoDB (OSX)](http://docs.mongodb.org/manual/tutorial/install-mongodb-on-os-x/)
#### [Install](http://docs.mongodb.org/manual/tutorial/install-mongodb-on-os-x/)
```bash
brew install mongodb
```

#### [Launch](http://docs.mongodb.org/manual/tutorial/install-mongodb-on-os-x/#run-mongodb)
```bash
# Might need 'sudo' here
mkdir -p /data/db

# Sets up as default
# Also might need a 'sudo' here
mongod
```

#### (Optional) Launch mongodb on startup
```bash
ln -sfv /usr/local/opt/mongodb/*.plist ~/Library/LaunchAgent
```

## Setup
* Create a config.js, copy the example file which is located `./config_default.js`

## Run
You must build the JS and CSS on every update
```bash
gulp
```

```bash
DEBUG=* npm start
# or
DEBUG=* node ./dist/app.js
```

## Environmental Variables
* MONGO_URI, mongodb uri
* NODE_ENV, 'production' or 'development', default development
* NODE_PORT, the port number to run the server over, default 3000
* LOG_REQUEST, will log all HTTP requests regardless of NODE_ENV

```bash
NODE_ENV='production' npm start
NODE_PORT=1337 LOG_REQUEST=true npm start
```

#### Docker (optional)
```bash
docker build -t mapi/app .
docker run -d -p 5000:5000 -v /Users/dev/mapi:/srv --name mapi mapi/app
```

Open at `http://localhost:3000`

## Credits
* Eric Bower [https://github.com/neurosnap](https://github.com/neurosnap)
* Mike Varano [https://github.com/migreva](https://github.com/migreva)
