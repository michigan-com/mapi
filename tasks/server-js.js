var gulp = require('gulp');
var gutil = require('gulp-util');

var plumber = require('gulp-plumber');
var tap = require('gulp-tap');
var babel = require('gulp-babel');

var src = './src/server/**/*.js';
var dist = './dist';

/**
 * Gulp task
 */
gulp.task('babel', function() {
  babelBundle();
});

/**
 * Exported function. Used to babelify all JS files in src/server
 *
 * @memberof build/server-js.js
 */
function babelBundle() {

  gutil.log('Babel is generating ' + src + ' files to ' + dist + ' ...');

  return gulp.src(src)
    .pipe(plumber(gutil.log))
    .pipe(babel({ stage: 0, optional: ['runtime'] }))
    .pipe(gulp.dest(dist))
    .on('end', function() {
      gutil.log('Done babelifying');
    });
}

/**
 * Called in the gulp.task('watch'). Watches files and babelify's them
 *
 * @memberof build/server-js.js
 */
function watchFunction() {
  gutil.log('Watching node modules ...');
  gulp.watch(src, ['babel']);
}

module.exports = {
  src: src,
  dist: dist,

  babelBundle: babelBundle,
  watchFunction: watchFunction
}
