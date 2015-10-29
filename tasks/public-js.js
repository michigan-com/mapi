var fs = require('fs');

var gulp = require('gulp');
var gutil = require('gulp-util');
var plumber = require('gulp-plumber');
var tap = require('gulp-tap');
var sourcemaps = require('gulp-sourcemaps');

var babelify = require("babelify");
var buffer = require('vinyl-buffer');
var browserify = require('browserify');
var source = require('vinyl-source-stream');

var jsSrc = './src/client/';
var jsDist = './public/js/';
var jsFiles = jsSrc + '**/*.js';

/**
 * DEFINE ALL CLIENT JS FILES HERE BY FILENAME
 */
var jsBundle = ['api.js', 'testSocket.js'];

/**
 * Gulp task
 * Bundle all the JS files specified in the jsBundle array
 */
gulp.task('browserify', function() {
  for (var i = 0; i < jsBundle.length; i++) {
    (function(i) {
      var fname = jsBundle[i];
      var filePath = jsSrc + fname;
      gulp.src(filePath)
          .pipe(plumber(gutil.log))
          .pipe(tap(bundleJs))
          .pipe(gulp.dest(jsDist))
          .on('end', function() {
            gutil.log('Browserify finished creating: ' + filePath);
          });
    })(i);
  }
});

/**
 * Exported bundling functions. Given a file, will run it through the
 * browserify task
 * From:  https://gist.github.com/RnbWd/2456ef5ce71a106addee
 *
 * @memberof build/public-js.js
 */
function bundleJs(file) {

  if (!fs.existsSync(file.path)) {
    gutil.log('Could not find ' + file.path + ', ignoring')
    return;
  }

  gutil.log('Browserify is compiling ' + file.path);
  var b = browserify(file.path, { debug: true })
    .transform(babelify.configure({ stage: 0, optional: ['runtime'] }))

  // Do the necessary thing for tap/plumber
  var stream = b.bundle();
  file.contents = stream;

  // Source map
  stream
    .pipe(source(file.path))
    .pipe(buffer())
    .pipe(sourcemaps.init({loadMaps: true}))
      .on('error', gutil.log)
    //  .pipe(uglify())
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest(jsDist));
}

/**
 * Called in the gulp.task('watch'). Watches the bundle-ed files and compiles
 * them on save
 */
function watchFunction() {
  for (var i = 0; i < jsBundle.length; i++) {
    var fname = jsBundle[i];
    var filePath = jsSrc + fname;
    gutil.log('Watching ' + filePath);
    gulp.watch(filePath, function() {
      gulp.src(filePath)
        .pipe(plumber(gutil.log))
        .pipe(tap(bundleJs))
        .pipe(gulp.dest(jsDist))
        .on('end', function() {
          gutil.log('Browserify finished creating: ' + filePath);
        });
    });
  }
}

module.exports = {
  jsSrc: jsSrc,
  jsDist: jsDist,
  jsBundle: jsBundle,

  bundleJs: bundleJs,
  watchFunction: watchFunction
}
