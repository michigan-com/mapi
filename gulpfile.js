'use strict';

var fs = require('fs');
var path = require('path');

var gulp = require('gulp');
var sass = require('gulp-sass');
var gutil = require('gulp-util');
var babel = require('gulp-babel');
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');
var mocha = require('gulp-mocha');

var babelify = require("babelify");
var browserify = require('browserify');
var buffer = require('vinyl-buffer');
var source = require('vinyl-source-stream');
var each = require('lodash/collection/forEach');
var browserifyShim = require('browserify-shim');

var config = require('./config');

var jsSrc = './public/js/src/';
var jsBundle = ['test_socket.js'];

var testFiles = './dist/tests/**/*.js';

gulp.task('sass', function() {
  var cssSrc = './public/scss/';
  var cssDist = './public/css/';
  var cssFiles = cssSrc + '**/*.scss';

  gutil.log('Compiling SASS files ...');

  return gulp.src(cssFiles)
    .pipe(sass().on('error', gutil.log))
    .pipe(gulp.dest(cssDist));
});

gulp.task('browserify', function(cb) {
  var bcb = (function() {
    var counter = 0;
    return function() {
      counter++;
      if (counter == jsBundle.length) return cb();
    };
  })();
  each(jsBundle, function(fname) {
    bundlejs(fname, bcb);
  });
});

gulp.task('watch', function() {
  each(jsBundle, function(fname) {
    gutil.log('Watching ' + fname + ' ...');
    gulp.watch(jsSrc + fname, function() {
      return bundlejs(fname);
    });
  });

  gutil.log('Watching node modules ...');
  gulp.watch('./src/**/*.js', ['babel']);

  gutil.log('Watching scss files ...');
  gulp.watch('./public/scss/**/*.scss', ['sass']);
});

gulp.task('babel', function() {
  var src = './src/**/*.js';
  var dist = './dist';

  gutil.log('Babel is generating ' + src + ' files to ' + dist + ' ...');

  return gulp.src(src)
    .pipe(babel({ stage: 0, optional: ['runtime'] }))
    .pipe(gulp.dest(dist));
});

gulp.task('mocha', function(done) {
  return gulp.src(testFiles, { read: false })
    .pipe(mocha());

    done();
    //.on('error', function() { process.exit(1); })
    //.on('end', function() { process.exit(); });;
});

gulp.task('default', ['sass', 'babel', 'browserify']);

gulp.task('test', ['babel'], function() {
  process.env.NODE_ENV = 'testing';
  gulp.start('mocha');
});

function bundlejs(file, bcb, src, dist) {
  if (typeof src === 'undefined') src = jsSrc;
  if (typeof dist === 'undefined') dist = './public/js/dist/';

  var srcFull = src + file;
  var distFull = dist + file;

  if (!fs.existsSync(srcFull)) {
    gutil.log('Could not find ' + srcFull + ', ignoring')
    return;
  }

  gutil.log('Browserify is compiling ' + distFull + ' from ' + srcFull);

  var b = browserify(srcFull, { debug: true });
  return b
    .transform(babelify.configure({ stage: 0, optional: ['runtime'] }))
    .transform(browserifyShim, { global: true })
    .bundle()
    .pipe(source(file))
    .pipe(buffer())
    .pipe(sourcemaps.init({loadMaps: true}))
      .on('error', gutil.log)
    //  .pipe(uglify())
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest(dist))
    .on('end', function() {
      gutil.log('Browserify finished creating: ' + distFull);
      if (typeof bcb === 'function') bcb();
    });
}
