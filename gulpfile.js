'use strict';

var gulp = require('gulp');
var mocha = require('gulp-mocha');
var requireDir = require('require-dir');

var dir = requireDir('./tasks', { recurse: true });

// Default task
gulp.task('default', ['babel', 'browserify']);

gulp.task('mocha', function(done) {
  var testFiles = './dist/tests/**/*.js';
  return gulp.src(testFiles, { read: false, reporter: 'nyan' })
    .pipe(mocha());
});

gulp.task('test', ['babel'], function() {
  process.env.NODE_ENV = 'testing';
  gulp.start('mocha');
});

gulp.task('watch', function() {
  dir['server-js'].watchFunction()
  dir['public-js'].watchFunction()
});
