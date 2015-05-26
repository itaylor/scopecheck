var gulp = require('gulp');
var mocha = require('gulp-mocha');
var gutil = require('gulp-util');
var path = require('path');


gulp.task('test', function() {
  var timeout = gutil.env.timeout ? parseInt(gutil.env.timeout, 10) : 2000;
  return gulp.src(['test/*.js'], { read: false })
    .pipe(mocha({ ui:'qunit-mocha-ui', reporter: 'list', timeout:timeout}))
//    .on('error', gutil.log);
});

gulp.task('test-debug', function () {
  var spawn = require('child_process').spawn;
  spawn('node', [
    '--debug-brk',
    path.join(__dirname, 'node_modules/gulp/bin/gulp.js'),
    'test', 
    '--timeout ' + (1000 * 60 * 60)  //set timeout to 60 mins while you've got a debugger attached. 
  ], { stdio: 'inherit' });
});