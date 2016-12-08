var gulp = require('gulp')
var babelify = require('babelify');
var browserify = require('browserify');
var buffer = require('vinyl-buffer');
var source = require('vinyl-source-stream');
var uglify = require('gulp-uglify');
var reactify = require('reactify')

gulp.task('default', function () {
    var bundler = browserify('./app.js').transform(reactify, {stripTypes: true, es6: true});

    bundler.bundle()
        .on('error', function (err) { console.error(err); })
        .pipe(source('app.js'))
        .pipe(buffer())
        .pipe(uglify()) // Use any gulp plugins you want now
        .pipe(gulp.dest('build.js'));
});