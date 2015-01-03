var gulp = require('gulp'),
    watch = require('gulp-watch'),
    prefix = require('gulp-autoprefixer'),
    minifyCSS = require('gulp-minify-css'),
    less = require('gulp-less'),
    watch = require('gulp-watch'),
    gutil = require('gulp-util'),
    csso = require('gulp-csso'),
    coffee = require('gulp-coffee'),
    uglify = require('gulp-uglify')

gulp.task('css', function() {
    return gulp.src('bower_components/less/web.less')
        .pipe(watch())
        .pipe(less())
        .pipe(prefix(
            'Android 2.3',
            'Android >= 4',
            'Chrome >= 20',
            'Firefox >= 24', // Firefox 24 is the latest ESR
            'Explorer >= 8',
            'iOS >= 6',
            'Opera >= 12',
            'Safari >= 6'
        ))
        .pipe(minifyCSS())
        .pipe(csso())
        .on('error', gutil.log)
        .pipe(gulp.dest('public/css/'))
})

gulp.task('javascript', function() {
    return gulp.src('bower_components/coffee/web.coffee')
        .pipe(watch())
        .pipe(coffee())
        .on('error', gutil.log)
        .pipe(gulp.dest('public/js'))
})

gulp.task('default', function() {
    gulp.start('css', 'javascript')
})