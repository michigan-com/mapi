'use strict';

var gulp = require('gulp');
var requireDir = require('require-dir');

requireDir('./tasks', { recurse: true });

// Default task
gulp.task('default', ['sass', 'babel', 'browserify']);

